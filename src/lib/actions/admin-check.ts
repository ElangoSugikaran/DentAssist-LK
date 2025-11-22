"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function checkAdminAccess() {
  // Get current authenticated user from Clerk
  const user = await currentUser();

  // If not logged in, redirect to home
  if (!user) {
    console.warn("❌ Admin access denied: User not authenticated");
    redirect("/");
  }

  // Method 1: Check Clerk metadata (primary method - most reliable)
  // Check both publicMetadata and unsafeMetadata for flexibility
  interface ClerkMetadata {
    role?: string;
  }
  const isAdminInClerk = 
    (user.publicMetadata as ClerkMetadata | undefined)?.role === "admin" || 
    user.unsafeMetadata?.role === "admin";
  
  if (isAdminInClerk) {
    console.log(`✅ Admin access granted for: ${user.emailAddresses?.[0]?.emailAddress}`);
    
    // Sync admin role to database
    try {
      await syncAdminRoleToDatabase(user.id);
    } catch (error : unknown) {
      console.warn("⚠️ Failed to sync admin role to database:", error);
      // Don't block admin access if sync fails
    }
    
    return user;
  }

  // Method 2: Check database role field
  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true, email: true },
    });

    if (dbUser?.role === "admin") {
      console.log(`✅ Admin access granted (from DB): ${dbUser.email}`);
      return user;
    }
  } catch (error : unknown) {
    console.warn("⚠️ Failed to check database for admin role:", error);
  }

  // Method 3: Fallback to ADMIN_EMAIL env var (backwards compatibility)
  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = user.emailAddresses?.[0]?.emailAddress || "";

  if (adminEmail && userEmail.toLowerCase() === adminEmail.toLowerCase()) {
    console.log(`✅ Admin access granted (legacy ADMIN_EMAIL): ${userEmail}`);
    
    // Sync to database and Clerk metadata for future lookups
    try {
      await Promise.all([
        syncAdminRoleToDatabase(user.id),
        // Optional: could update Clerk metadata here if desired
      ]);
    } catch (error : unknown) {
      console.warn("⚠️ Failed to sync admin role:", error);
    }
    
    return user;
  }

  // Not an admin
  console.warn(
    `❌ Admin access denied: ${userEmail} is not authorized.`
  );
  redirect("/dashboard");
}

/**
 * Sync admin role from Clerk to database
 */
async function syncAdminRoleToDatabase(clerkId: string) {
  try {
    const user = await currentUser();
    if (!user) return;

    // Check both publicMetadata and unsafeMetadata
    interface ClerkMetadata {
      role?: string;
    }
    const isAdmin = 
      (user.publicMetadata as ClerkMetadata | undefined)?.role === "admin" || 
      user.unsafeMetadata?.role === "admin";
    const role = isAdmin ? "admin" : "user";

    await prisma.user.update({
      where: { clerkId },
      data: { role },
    });

    console.log(`✅ Synced role '${role}' to database for user ${clerkId}`);
  } catch (error : unknown) {
    console.error("Failed to sync admin role:", error);
  }
}

/**
 * Utility to check if a given email is an admin (used in API routes)
 */
export async function isAdminEmail(email: string): Promise<boolean> {
  try {
    // Check database first
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    if (user?.role === "admin") return true;

    // Fallback to env var
    const adminEmail = process.env.ADMIN_EMAIL;
    return adminEmail?.toLowerCase() === email.toLowerCase();
  } catch (error : unknown) {
    console.error("Failed to check admin status:", error);
    return false;
  }
}

/**
 * Server action to grant admin role to a user
 * Usage: await setUserAsAdmin(clerkId)
 * 
 * Note: Also update Clerk metadata manually in Clerk Dashboard for best results
 */
export async function setUserAsAdmin(clerkId: string): Promise<boolean> {
  try {
    // Verify caller is already admin (prevent privilege escalation)
    const caller = await currentUser();
    if (!caller) {
      throw new Error("Not authenticated");
    }

    interface ClerkMetadata {
      role?: string;
    }
    const callerIsAdmin = 
      (caller.publicMetadata as ClerkMetadata | undefined)?.role === "admin" || 
      caller.unsafeMetadata?.role === "admin";
    if (!callerIsAdmin) {
      throw new Error("Only admins can grant admin access");
    }

    // Update database
    const updatedUser = await prisma.user.update({
      where: { clerkId },
      data: { role: "admin" },
      select: { email: true },
    });

    console.log(`✅ User ${updatedUser.email} granted admin access`);

    // Note: To complete, also update Clerk metadata:
    // Go to Clerk Dashboard → User → Unsafe Metadata → Add { "role": "admin" }
    
    return true;
  } catch (error : unknown) {
    console.error("Failed to set user as admin:", error);
    return false;
  }
}
