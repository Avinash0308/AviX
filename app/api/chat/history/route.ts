import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const conversations = await prismadb.conversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("[CHAT_HISTORY_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
