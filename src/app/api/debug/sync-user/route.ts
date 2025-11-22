import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Debug endpoint to manually sync user - only for development
export async function GET(req: Request) {
  try {
    const user = await currentUser();
    console.log("📌 [DEBUG] Current user from Clerk:", user?.id, user?.emailAddresses[0]?.emailAddress);

    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Try to find user in database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    console.log("📌 [DEBUG] Existing user in DB:", existingUser?.id);

    if (existingUser) {
      // Update user
      const updated = await prisma.user.update({
        where: { clerkId: user.id },
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.emailAddresses[0].emailAddress,
          phone: user.phoneNumbers[0]?.phoneNumber || null,
        },
      });

      return new Response(
        JSON.stringify({
          message: "User updated successfully",
          user: updated,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0].emailAddress,
        phone: user.phoneNumbers[0]?.phoneNumber || null,
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
    console.error("❌ [DEBUG] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to sync user",
        details: (error as Error).message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
