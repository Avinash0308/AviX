import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { classifyPromptIntent, generateConversation, generateCode } from "@/lib/gemini";
import { generateImageWithFallback, generateMusicWithFallback, generateVideo } from "@/lib/media";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt, conversationId } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", {
        status: 403,
      });
    }

    // Step 1: Manage Conversation Session (Find or Create)
    let currentConversation = null;
    if (conversationId) {
      currentConversation = await prismadb.conversation.findUnique({
        where: { id: conversationId, userId },
      });
    }

    if (!currentConversation) {
      // Derive a clean 4-6 word title from the user prompt
      const words = prompt.trim().split(/\s+/).slice(0, 6).join(" ");
      const title = words.length > 40 ? `${words.slice(0, 40)}...` : words;

      currentConversation = await prismadb.conversation.create({
        data: {
          ...(conversationId ? { id: conversationId } : {}),
          userId,
          title: title || "New Chat",
        },
      });
    }

    // Save User Message to Database
    await prismadb.message.create({
      data: {
        conversationId: currentConversation.id,
        role: "user",
        content: prompt,
        type: "text",
      },
    });

    // Step 2: Classify Prompt Intent via Gemini Fallback Router
    console.log(`[Omnimodal Chat] Classifying prompt: "${prompt.slice(0, 60)}..."`);
    const classification = await classifyPromptIntent(prompt);
    console.log(`[Omnimodal Chat] Intent detected: ${classification.category}`);

    let responseData: {
      type: "text" | "code" | "image" | "audio" | "video";
      content: string;
      mediaUrl?: string | string[];
      modelUsed?: string;
      duration?: number;
    };

    // Step 3: Dispatch to the corresponding specialized model
    switch (classification.category) {
      case "IMAGE": {
        const imageResult = await generateImageWithFallback(classification.extractedPrompt);
        responseData = {
          type: "image",
          content: classification.extractedPrompt,
          mediaUrl: imageResult.url,
          modelUsed: imageResult.modelUsed,
        };
        break;
      }

      case "MUSIC": {
        const musicResult = await generateMusicWithFallback(
          classification.extractedPrompt,
          classification.duration
        );
        responseData = {
          type: "audio",
          content: classification.extractedPrompt,
          mediaUrl: musicResult.url,
          modelUsed: musicResult.modelUsed,
          duration: musicResult.duration,
        };
        break;
      }

      case "VIDEO": {
        const videoResult = await generateVideo(classification.extractedPrompt);
        responseData = {
          type: "video",
          content: classification.extractedPrompt,
          mediaUrl: videoResult.url,
          modelUsed: videoResult.modelUsed,
          duration: videoResult.duration,
        };
        break;
      }

      case "CODE": {
        const codeResult = await generateCode(prompt);
        responseData = {
          type: "code",
          content: codeResult.text,
          modelUsed: codeResult.modelUsed,
        };
        break;
      }

      case "CONVERSATION":
      default: {
        const convResult = await generateConversation(prompt);
        responseData = {
          type: "text",
          content: convResult.text,
          modelUsed: convResult.modelUsed,
        };
        break;
      }
    }

    // Save Assistant Message to Database
    const mediaUrlString = Array.isArray(responseData.mediaUrl)
      ? responseData.mediaUrl[0]
      : responseData.mediaUrl || null;

    await prismadb.message.create({
      data: {
        conversationId: currentConversation.id,
        role: "assistant",
        content: responseData.content || "",
        type: responseData.type,
        mediaUrl: mediaUrlString,
        modelUsed: responseData.modelUsed || null,
        duration: responseData.duration || null,
      },
    });

    // Update conversation timestamp
    await prismadb.conversation.update({
      where: { id: currentConversation.id },
      data: { updatedAt: new Date() },
    });

    // Step 4: Increment API Limit for free users
    if (!isPro) {
      await incrementApiLimit();
    }

    return NextResponse.json({
      conversationId: currentConversation.id,
      title: currentConversation.title,
      ...responseData,
    });
  } catch (error: any) {
    console.error("[OMNIMODAL_CHAT_ERROR]", error);
    return new NextResponse(error?.message || "Internal Server Error", { status: 500 });
  }
}
