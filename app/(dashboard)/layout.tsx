import { checkSubscription } from "@/lib/subscription";
import { getApiLimitCount } from "@/lib/api-limit";
import { DashboardLayoutClient } from "@/components/dashboard-layout-client";

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apiLimitCount = await getApiLimitCount();
  const isPro = await checkSubscription();

  return (
    <DashboardLayoutClient isPro={isPro} apiLimitCount={apiLimitCount}>
      {children}
    </DashboardLayoutClient>
  );
};

export default DashboardLayout;
