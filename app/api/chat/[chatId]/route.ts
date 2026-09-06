import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.chatId) {
      return new NextResponse("Chat ID required", { status: 400 });
    }

    const conversation = await prismadb.conversation.findUnique({
      where: {
        id: params.chatId,
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("[CHAT_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.chatId) {
      return new NextResponse("Chat ID required", { status: 400 });
    }

    const conversation = await prismadb.conversation.findUnique({
      where: {
        id: params.chatId,
        userId,
      },
    });

    if (!conversation) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    await prismadb.conversation.delete({
      where: {
        id: params.chatId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CHAT_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { title } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.chatId || !title || !title.trim()) {
      return new NextResponse("Chat ID and Title required", { status: 400 });
    }

    const conversation = await prismadb.conversation.findUnique({
      where: {
        id: params.chatId,
        userId,
      },
    });

    if (!conversation) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    const updated = await prismadb.conversation.update({
      where: {
        id: params.chatId,
        userId,
      },
      data: {
        title: title.trim(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[CHAT_PATCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
