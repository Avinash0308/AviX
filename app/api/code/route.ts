import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";


type messageType = {
  content: string,
}
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

const instructionMessage: messageType = {
  content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations."
};

export async function POST(
  req: Request
) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { messages  } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // if (!configuration.apiKey) {
    //   return new NextResponse("OpenAI API Key not configured.", { status: 500 });
    // }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // const response = await openai.createChatCompletion({
    //   model: "gpt-3.5-turbo",
    //   messages: [instructionMessage, ...messages]
    // });
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});
    const result = await model.generateContent(instructionMessage + " " +  messages);
    const response = result.response;
    const text = response.text();
    if (!isPro) {
      await incrementApiLimit();
    }

    return NextResponse.json(text);
  } catch (error) {
    console.log('[CODE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
