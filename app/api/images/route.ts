import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Replicate from "replicate";

import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, num_outputs = "1", height = "256", width = "256" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!num_outputs) {
      return new NextResponse("num_outputs is required", { status: 400 });
    }

    if (!height) {
      return new NextResponse("Height is required", { status: 400 });
    }

    if (!width) {
      return new NextResponse("width is required", { status: 400 });
    }
    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse(
        "Free trial has expired. Please upgrade to pro.",
        { status: 403 }
      );
    }

    const input = {
      width: Number(width),
      height: Number(height),
      prompt: String(prompt),
      num_outputs: Number(num_outputs),
      scheduler: "K_EULER",
    };

    const output = await replicate.run(
      "fofr/latent-consistency-model:a83d4056c205f4f62ae2d19f73b04881db59ce8b81154d314dd34ab7babaa0f1",
      { input }
    );

    if (!isPro) {
      await incrementApiLimit();
    }

    return NextResponse.json(output);
  } catch (error) {
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
