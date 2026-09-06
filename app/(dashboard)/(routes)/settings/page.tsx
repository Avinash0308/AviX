import { checkSubscription } from "@/lib/subscription";
import { getApiLimitCount } from "@/lib/api-limit";
import { MAX_FREE_COUNTS } from "@/constants";
import { SettingsClient } from "@/components/settings-client";

const SettingsPage = async () => {
  const isPro = await checkSubscription();
  const apiLimitCount = await getApiLimitCount();

  return (
    <SettingsClient
      isPro={isPro}
      apiLimitCount={apiLimitCount}
      maxFreeCounts={MAX_FREE_COUNTS}
    />
  );
};

export default SettingsPage;

