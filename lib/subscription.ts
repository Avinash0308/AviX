import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

const DAY_IN_MS = 86_400_000;

// Development-only Pro toggle — strictly disabled in production
const isDevForceProActive = () => {
  return (
    process.env.NODE_ENV === "development" &&
    (process.env.DEV_FORCE_PRO === "true" ||
      process.env.NEXT_PUBLIC_DEV_FORCE_PRO === "true")
  );
};

export const checkSubscription = async () => {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  // Development toggle to test Pro features without active Stripe webhook
  if (isDevForceProActive()) {
    return true;
  }

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  if (!userSubscription) {
    return false;
  }

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd &&
    userSubscription.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now();

  return Boolean(isValid);
};

export const getSubscriptionExpiry = async () => {
  const { userId } = await auth();

  if (!userId) {
    return {
      isPro: false,
      stripeCurrentPeriodEnd: null,
      stripeSubscriptionId: null,
    };
  }

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: { userId },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  const isDevPro = isDevForceProActive();

  if (!userSubscription) {
    return {
      isPro: isDevPro,
      stripeCurrentPeriodEnd: isDevPro
        ? new Date(Date.now() + 30 * DAY_IN_MS)
        : null,
      stripeSubscriptionId: null,
    };
  }

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return {
    isPro: !!isValid || isDevPro,
    stripeCurrentPeriodEnd:
      userSubscription.stripeCurrentPeriodEnd ||
      (isDevPro ? new Date(Date.now() + 30 * DAY_IN_MS) : null),
    stripeSubscriptionId: userSubscription.stripeSubscriptionId,
  };
};

