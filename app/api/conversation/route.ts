import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {marked} from 'marked'
// const OpenAI = require('openai').OpenAI
import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAI();
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");
export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages  } = body;
    console.log(messages)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // if (!openai.apiKey) {
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

    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages
    // });

  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  // const prompt = "Write a story about a magic backpack."

  const result = await model.generateContent(messages);
  const response = result.response;
  
  const text = response.text();
  const formattedResponse = marked(text)
    if (!isPro) {
      await incrementApiLimit();
    }
    // console.log(response.choices[0].message.content)
    // return NextResponse.json(response.choices[0].message.content);
    console.log(text)
    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.log('[CONVERSATION_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
