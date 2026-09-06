import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { generateMusicWithFallback } from "@/lib/media";

export async function POST(
  req: Request
) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    const musicResult = await generateMusicWithFallback(prompt);

    if (!isPro) {
      await incrementApiLimit();
    }

    return NextResponse.json({
      audio: musicResult.url,
      modelUsed: musicResult.modelUsed,
      duration: musicResult.duration,
    });
  } catch (error) {
    console.log('[MUSIC_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
