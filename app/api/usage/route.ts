import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getApiLimitCount } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { MAX_FREE_COUNTS } from "@/constants";

export const dynamic = "force-dynamic";

/**
 * Returns live usage data for the free-tier counter.
 * The FreeCounter component fetches this on mount and whenever historyVersion
 * changes in useChatSyncStore, so the displayed count stays fresh after each
 * generation without a full page reload.
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [count, isPro] = await Promise.all([
      getApiLimitCount(),
      checkSubscription(),
    ]);

    return NextResponse.json({
      count,
      max: MAX_FREE_COUNTS,
      isPro,
    });
  } catch (error) {
    console.error("[USAGE_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
