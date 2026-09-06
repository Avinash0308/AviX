import { auth } from "@clerk/nextjs/server";
import { checkSubscription } from "@/lib/subscription";
import { getApiLimitCount } from "@/lib/api-limit";
import { MAX_FREE_COUNTS } from "@/constants";
import { SettingsClient } from "@/components/settings-client";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

interface SettingsPageProps {
  searchParams?: {
    session_id?: string;
  };
}

const SettingsPage = async ({ searchParams }: SettingsPageProps) => {
  const sessionId = searchParams?.session_id;

  // Auto-sync subscription if returning from a successful Stripe checkout
  if (sessionId) {
    try {
      const { userId } = await auth();
      if (userId) {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (
          session &&
          session.subscription &&
          (session.status === "complete" || session.payment_status === "paid")
        ) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await prismadb.userSubscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
            update: {
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          });
        }
      }
    } catch (error) {
      console.error("[SETTINGS_STRIPE_SYNC_ERROR]", error);
    }
  }

  const isPro = await checkSubscription();
  const apiLimitCount = await getApiLimitCount();

  let subscriptionExpiryDate: string | null = null;
  let isCanceled = false;

  if (isPro) {
    try {
      const { userId } = await auth();
      if (userId) {
        const userSubscription = await prismadb.userSubscription.findUnique({
          where: { userId },
          select: {
            stripeSubscriptionId: true,
            stripeCurrentPeriodEnd: true,
          },
        });

        if (userSubscription?.stripeSubscriptionId) {
          try {
            const stripeSub = await stripe.subscriptions.retrieve(
              userSubscription.stripeSubscriptionId
            );
            if (stripeSub) {
              isCanceled = !!stripeSub.cancel_at_period_end;
              if (stripeSub.current_period_end) {
                subscriptionExpiryDate = new Date(
                  stripeSub.current_period_end * 1000
                ).toISOString();
              }
            }
          } catch (error) {
            console.error("[SETTINGS_STRIPE_RETRIEVE_ERROR]", error);
          }
        }

        if (!subscriptionExpiryDate && userSubscription?.stripeCurrentPeriodEnd) {
          subscriptionExpiryDate =
            userSubscription.stripeCurrentPeriodEnd.toISOString();
        }

        if (
          !subscriptionExpiryDate &&
          (process.env.DEV_FORCE_PRO === "true" ||
            process.env.NEXT_PUBLIC_DEV_FORCE_PRO === "true")
        ) {
          subscriptionExpiryDate = new Date(
            Date.now() + 30 * 86_400_000
          ).toISOString();
        }
      }
    } catch (error) {
      console.error("[SETTINGS_EXPIRY_FETCH_ERROR]", error);
    }
  }

  return (
    <SettingsClient
      isPro={isPro}
      apiLimitCount={apiLimitCount}
      maxFreeCounts={MAX_FREE_COUNTS}
      subscriptionExpiryDate={subscriptionExpiryDate}
      isCanceled={isCanceled}
    />
  );
};

export default SettingsPage;

