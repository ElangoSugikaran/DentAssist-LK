"use server";

import { Gender } from "@prisma/client";
import { prisma } from "../prisma";
import { generateAvatar } from "../utils";
import { revalidatePath } from "next/cache";

// Fetch all doctors from database with appointment count
export async function getDoctors() {
    try {
        // Query database for all doctors
        const doctors = await prisma.doctor.findMany({
            include: {
                _count: {
                    select: { appointments: true }  // Count total appointments per doctor
                }
            },
            orderBy: { createdAt: "desc" }              // Show newest doctors first
        })

        // Map to add appointmentCount to each doctor object
        return doctors.map(doctor => ({
            ...doctor,
            appointmentCount: doctor._count.appointments // Add appointment count field
        }));

    } catch (error) {
        throw new Error("Failed to fetch doctors");
    }
};

// Interface for creating a new doctor - defines all required fields
interface CreateDoctorInput {
    name: string;           // Doctor's full name
    email: string;          // Unique email address  
    phone: string;          // Contact phone number
    specialty: string;      // Medical specialty (e.g., "Pediatrics", "Orthodontics") - FIXED: was "speciality"
    gender: Gender;         // MALE or FEMALE
    isActive: boolean;      // Whether doctor is available for appointments
}

// Create a new doctor in the database
export async function createDoctor(input: CreateDoctorInput) {
    try {
        // Validate required fields
        if (!input.name || !input.email) throw new Error("Name and Email are required");

        // Create doctor record with auto-generated avatar image
        const doctor = await prisma.doctor.create({
            data: {
                ...input,                                  // Spread all input fields (name, email, phone, specialty, gender, isActive)
                imageUrl: generateAvatar(input.name, input.gender) // Generate avatar based on name and gender
            }
        })

        // Revalidate admin page to show new doctor
        revalidatePath("/admin");

        return doctor;

    } catch (error: unknown) {

        // Handle duplicate email error
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
            throw new Error("A doctor with this email already exists.");
        }

        throw new Error("Failed to create doctor");
    }
};

interface UpdateDoctorInput extends Partial<CreateDoctorInput> {
    id: string;
}

export async function updateDoctor(input: UpdateDoctorInput) {
    try {
        // Validate required fields are provided
        if (!input.name || !input.email) throw new Error("Name and Email are required");

        // Check if doctor exists before updating
        const currentDoctor = await prisma.doctor.findUnique({
            where: { id: input.id },
            select: { email: true },
        });

        if (!currentDoctor) {
            throw new Error("Doctor not found");
        }

        // If email is changing, check if the new email is already used by another doctor
        if (input.email !== currentDoctor.email) {
            const existingDoctor = await prisma.doctor.findUnique({
                where: { email: input.email! },
            });

            if (existingDoctor) {
                throw new Error("A doctor with this email already exists.");
            }
        }

        // Update doctor record with new information
        const doctor = await prisma.doctor.update({
            where: { id: input.id },                        // Find doctor by ID
            data: {
                name: input.name,                           // Update doctor name
                email: input.email,                         // Update email address
                phone: input.phone,                         // Update phone number
                specialty: input.specialty,                 // Update specialty (FIXED: was speciality - match schema)
                gender: input.gender,                       // Update gender (MALE/FEMALE)
                isActive: input.isActive,                   // Update active/inactive status
            }
        });

        // Revalidate admin page to show updated doctor
        revalidatePath("/admin");

        return doctor;
    } catch (error: unknown) {
        throw new Error("Failed to update doctor");
    }
}

export async function regenerateDoctorAvatars() {
    try {
        // Fetch all doctors from the database
        const doctors = await prisma.doctor.findMany();

        // Loop through each doctor and regenerate their avatar image
        for (const doctor of doctors) {
            const newImageUrl = generateAvatar(doctor.name, doctor.gender); // Create new avatar URL based on name and gender

            // Update each doctor with the new avatar URL
            await prisma.doctor.update({
                where: { id: doctor.id },  // Find doctor by ID
                data: { imageUrl: newImageUrl } // Update with new avatar
            });
        }

        // Revalidate admin page to show updated avatars
        revalidatePath("/admin");

        // Return success message with count of doctors updated
        return { success: true, count: doctors.length };
    } catch (error: unknown) {
        throw new Error("Failed to regenerate avatars");
    }
}

export async function getAvailableDoctors() {
    try {
        // Fetch only active doctors (isActive: true) from the database
        const doctors = await prisma.doctor.findMany({
            where: { isActive: true },                     // Filter: only active doctors
            include: {
                _count: {
                    select: { appointments: true },        // Count total appointments per doctor
                },
            },
            orderBy: { name: "asc" },                       // Sort doctors alphabetically by name
        });

        // Map doctors to include appointment count as a field
        return doctors.map((doctor) => ({
            ...doctor,
            appointmentCount: doctor._count.appointments,  // Add appointment count for easy access
        }));
    } catch (error: unknown) {
        throw new Error("Failed to fetch available doctors");
    }
}