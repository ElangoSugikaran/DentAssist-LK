import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Handle Clerk webhook events for user sync
export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  // Get headers for signature verification
  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  // If headers are missing, reject the request
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get the body
  const body = await req.text();

  // Create a new Svix instance with your secret
  const wh = new Webhook(SIGNING_SECRET);

  let evt: WebhookEvent;
  try {
    // Verify the webhook signature
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Unauthorized", {
      status: 401,
    });
  }

  // Process the webhook event
  const eventType = evt.type;

  try {
    if (eventType === "user.created") {
      // User just signed up - create record in database
      const { id, email_addresses, first_name, last_name, phone_numbers } =
        evt.data;

      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0]?.email_address || "",
          firstName: first_name || null,
          lastName: last_name || null,
          phone: phone_numbers[0]?.phone_number || null,
        },
      });

      console.log(`✅ User created in database: ${id}`);
    }

    if (eventType === "user.updated") {
      // User updated their profile - update database record
      const { id, email_addresses, first_name, last_name, phone_numbers } =
        evt.data;

      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0]?.email_address || "",
          firstName: first_name || null,
          lastName: last_name || null,
          phone: phone_numbers[0]?.phone_number || null,
        },
      });

      console.log(`✅ User updated in database: ${id}`);
    }

    if (eventType === "user.deleted") {
      // User deleted their account - remove from database
      const { id } = evt.data;

      await prisma.user.delete({
        where: { clerkId: id },
      });

      console.log(`✅ User deleted from database: ${id}`);
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Error: Webhook processing failed", {
      status: 500,
    });
  }

  return new Response("Webhook received", { status: 200 });
}
