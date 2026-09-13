import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";
import { MAX_FREE_COUNTS } from "@/constants";

/**
 * Atomically checks and reserves a free trial credit for the user within a database
 * transaction. Prevents check-then-act race conditions where concurrent requests
 * bypass the free limit before the first generation completes.
 *
 * Returns true if a credit was reserved successfully, or false if the user has reached
 * or exceeded MAX_FREE_COUNTS.
 */
export const reserveApiLimit = async (userId: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  return await prismadb.$transaction(async (tx) => {
    const userLimit = await tx.userApiLimit.findUnique({
      where: { userId },
    });

    if (!userLimit) {
      // First generation: initialize count to 1
      await tx.userApiLimit.create({
        data: { userId, count: 1 },
      });
      return true;
    }

    if (userLimit.count >= MAX_FREE_COUNTS) {
      return false;
    }

    // Atomically increment reserved count
    await tx.userApiLimit.update({
      where: { userId },
      data: { count: { increment: 1 } },
    });

    return true;
  });
};

/**
 * Rolls back an atomically reserved free credit if the generation encountered
 * a fatal error before completing (e.g. AI model timeout or network failure).
 */
export const rollbackApiLimit = async (userId: string): Promise<void> => {
  if (!userId) {
    return;
  }

  try {
    const userLimit = await prismadb.userApiLimit.findUnique({
      where: { userId },
    });

    if (userLimit && userLimit.count > 0) {
      await prismadb.userApiLimit.update({
        where: { userId },
        data: { count: { decrement: 1 } },
      });
    }
  } catch (error) {
    console.error("[ROLLBACK_API_LIMIT_ERROR]", error);
  }
};

/**
 * Atomically increments the user API limit counter using Prisma upsert with
 * { increment: 1 } to prevent lost updates under concurrency.
 */
export const incrementApiLimit = async (customUserId?: string): Promise<boolean> => {
  const targetUserId = customUserId || (await auth())?.userId;

  if (!targetUserId) {
    return false;
  }

  await prismadb.userApiLimit.upsert({
    where: { userId: targetUserId },
    update: { count: { increment: 1 } },
    create: { userId: targetUserId, count: 1 },
  });

  return true;
};

export const checkApiLimit = async (customUserId?: string): Promise<boolean> => {
  const targetUserId = customUserId || (await auth())?.userId;

  if (!targetUserId) {
    return false;
  }

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: { userId: targetUserId },
  });

  if (!userApiLimit || userApiLimit.count < MAX_FREE_COUNTS) {
    return true;
  } else {
    return false;
  }
};

export const getApiLimitCount = async (customUserId?: string): Promise<number> => {
  const targetUserId = customUserId || (await auth())?.userId;

  if (!targetUserId) {
    return 0;
  }

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: { userId: targetUserId },
  });

  if (!userApiLimit) {
    return 0;
  }

  return userApiLimit.count;
};
