import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Debug endpoint to manually sync user data from Clerk to database
 * 
 * WARNING: This endpoint is for DEVELOPMENT ONLY
 * - Should NOT be accessible in production
 * - Allows manual user creation/update without proper authorization flow
 * - Use this only for testing and debugging during development
 * 
 * @route GET /api/debug/sync-user (or wherever this is mounted)
 * @returns JSON response with user data or error message
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: Request) {
  // ============================================================
  // SECURITY: Restrict to development environment only
  // ============================================================
  // This prevents the debug endpoint from being exploited in production
  // to create or modify user records without proper authorization
  if (process.env.NODE_ENV !== "development") {
    return new Response(
      JSON.stringify({ error: "Not available in production" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // ============================================================
    // STEP 1: Get current authenticated user from Clerk
    // ============================================================
    const user = await currentUser();

    // Check if user is authenticated via Clerk
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ============================================================
    // STEP 2: Validate required user data from Clerk
    // ============================================================
    // Email is required for user creation/update
    // Check if emailAddresses array exists and has at least one entry
    const primaryEmail = user.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      return new Response(
        JSON.stringify({
          error: "User email not found",
          details: "User must have at least one email address configured in Clerk",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ============================================================
    // STEP 3: Check if user already exists in database
    // ============================================================
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    // ============================================================
    // STEP 4: Update existing user OR create new user
    // ============================================================
    if (existingUser) {
      // User exists - update their information

      const updatedUser = await prisma.user.update({
        where: { clerkId: user.id },
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: primaryEmail, // Already validated above
          phone: user.phoneNumbers[0]?.phoneNumber || null, // Optional field
        },
      });

      return new Response(
        JSON.stringify({
          message: "User updated successfully",
          user: updatedUser,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // User doesn't exist - create new user record

    const newUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: primaryEmail, // Already validated above
        phone: user.phoneNumbers[0]?.phoneNumber || null, // Optional field
      },
    });

    return new Response(
      JSON.stringify({
        message: "User created successfully",
        user: newUser,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // ============================================================
    // ERROR HANDLING: Log and return error details
    // ============================================================

    return new Response(
      JSON.stringify({
        error: "Failed to sync user",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}