"use server";

import { prisma } from "../prisma";

/**
 * Waits for a user to be created in the database
 * Used to resolve race condition where dashboard loads before UserSync completes
 * @param clerkId - Clerk user ID to wait for
 * @param timeoutMs - Maximum time to wait in milliseconds (default: 5000ms)
 * @param intervalMs - Interval between checks in milliseconds (default: 100ms)
 * @returns The user object when found, or null if timeout reached
 */
export async function waitForUserInDatabase(
  clerkId: string,
  timeoutMs: number = 5000,
  intervalMs: number = 100
) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (user) {
        return user;
      }
    } catch (error) {
      // Continue retrying
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return null;
  return null;
}
