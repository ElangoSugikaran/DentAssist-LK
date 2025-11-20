"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

// Manual sync - called from dashboard, not needed anymore with webhooks but kept as fallback
export async function syncUser() {
  try {
    const user = await currentUser();
    if (!user) return;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    // If user exists, update their info
    if (existingUser) {
      return await prisma.user.update({
        where: { clerkId: user.id },
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.emailAddresses[0].emailAddress,
          phone: user.phoneNumbers[0]?.phoneNumber || null,
        },
      });
    }

    // If user doesn't exist, create them (webhook should have done this)
    const dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0].emailAddress,
        phone: user.phoneNumbers[0]?.phoneNumber || null,
      },
    });

    return dbUser;
  } catch (error) {
    console.error("Error in syncUser server action", error);
  }
}

// Get user from database by clerkId
export async function getUserByClerkId(clerkId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}