/**
 * DOCTOR SELECTION STEP - REFACTORED TO USE ZUSTAND
 * ==================================================
 * 
 * WHAT CHANGED?
 * -------------
 * Before: We received selectedDentistId and onSelectDentist as props.
 * After: We read selectedDentistId from Zustand store directly.
 * 
 * WHY?
 * - No prop drilling (state is global)
 * - Component is more independent
 * - Easier to access state from anywhere
 * 
 * ZUSTAND USAGE:
 * -------------
 * We use useAppointmentStore to:
 * 1. Read selectedDentistId (from global state)
 * 2. Get handleSelectDentist action (to update state)
 * 
 * TANSTACK QUERY:
 * --------------
 * We still use TanStack Query for server data:
 * - useAvailableDoctors() - fetches doctors from database
 */

"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { MapPinIcon, PhoneIcon, StarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useAvailableDoctors } from "@/hooks/use-doctors";
import { DoctorCardsLoading } from "./DoctorCardsLoading";
import { useAppointmentStore } from "@/store/appointment-store"; // ✅ Import Zustand store


interface DoctorSelectionStepProps {
  // We no longer need selectedDentistId as prop - it comes from Zustand
  onSelectDentist: (dentistId: string) => void; // Still needed for callback
  onContinue: () => void;
}

function DoctorSelectionStep({ onContinue, onSelectDentist }: DoctorSelectionStepProps) {
  /**
   * ZUSTAND STORE - CLIENT STATE
   * ----------------------------
   * Read selectedDentistId from Zustand store instead of props.
   * This is global state, so any component can access it.
   */
  const selectedDentistId = useAppointmentStore((state) => state.selectedDentistId);
  
  /**
   * TANSTACK QUERY - SERVER STATE
   * ------------------------------
   * Fetch doctors from database using TanStack Query.
   * This is server data, so we use TanStack Query (not Zustand).
   */
  const { data: dentists = [], isLoading } = useAvailableDoctors();

  if (isLoading)
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Choose Your Dentist</h2>
        <DoctorCardsLoading />
      </div>
    );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Choose Your Dentist</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dentists.map((dentist) => (
          <Card
            key={dentist.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedDentistId === dentist.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onSelectDentist(dentist.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <Image
                  src={dentist.imageUrl!}
                  alt={dentist.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <CardTitle className="text-lg">{dentist.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {dentist.specialty || "General Dentistry"}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">
                      ({dentist.appointmentCount} appointments)
                    </span>
                  </div>                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPinIcon className="w-4 h-4" />
                <span>DentAssist-LK</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <PhoneIcon className="w-4 h-4" />
                <span>{dentist.phone}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {dentist.bio || "Experienced dental professional providing quality care."}
              </p>
              <Badge variant="secondary">Licensed Professional</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDentistId && (
        <div className="flex justify-end">
          <Button onClick={onContinue}>Continue to Time Selection</Button>
        </div>
      )}
    </div>
  )
}

export default DoctorSelectionStep
