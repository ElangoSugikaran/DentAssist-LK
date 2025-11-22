"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

// Manual sync - called from dashboard, not needed anymore with webhooks but kept as fallback
export async function syncUser() {
  try {
    const user = await currentUser();
    console.log("📝 syncUser: Retrieved currentUser:", user?.id);
    
    if (!user) {
      console.log("⚠️ syncUser: No user found in currentUser()");
      return null;
    }

    // Get email safely
    const email = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress || "no-email@temp.com";
    const phone = user.phoneNumbers?.[0]?.phoneNumber || null;

    console.log("📧 syncUser: User email:", email, "Phone:", phone);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    console.log("🔍 syncUser: Found existing user:", existingUser?.id);

    // If user exists, update their info
    if (existingUser) {
      console.log("📌 syncUser: Updating existing user...");
      return await prisma.user.update({
        where: { clerkId: user.id },
        data: {
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          email: email,
          phone: phone,
        },
      });
    }

    // If user doesn't exist, create them (webhook should have done this)
    console.log("✨ syncUser: Creating new user because webhook didn't trigger...");
    const dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        email: email,
        phone: phone,
      },
    });

    console.log("✅ syncUser: User created successfully:", dbUser.id);
    return dbUser;
  } catch (error) {
    console.error("❌ syncUser: Error in syncUser server action", error);
    throw error;
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