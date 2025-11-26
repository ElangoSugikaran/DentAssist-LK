import AppointmentConfirmationEmail from "@/components/emails/AppointmentConfirmationEmail";
import resend from "@/lib/resend";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const {
            userEmail,
            doctorName,
            appointmentDate,
            appointmentTime,
            appointmentType,
            duration,
            price,
        } = body;

        // validate required fields
        if (!userEmail || !doctorName || !appointmentDate || !appointmentTime) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Get the app URL from environment
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // send the email
        // do not use this in prod, only for testing purposes
        const { data, error } = await resend.emails.send({
            from: "DentAssist-LK <no-reply@resend.dev>",
            to: [userEmail],
            subject: "Appointment Confirmation - DentAssist-LK",
            react: AppointmentConfirmationEmail({
                doctorName,
                appointmentDate,
                appointmentTime,
                appointmentType,
                duration,
                price,
                appUrl,
            }),
        });

        if (error) {
            console.error("Resend error:", error);
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Email sent successfully", emailId: data?.id },
            { status: 200 }
        );

    } catch (error) {
        console.error("Email sending error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}