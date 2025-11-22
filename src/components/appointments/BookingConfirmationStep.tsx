/**
 * BOOKING CONFIRMATION STEP - REFACTORED TO USE ZUSTAND
 * ======================================================
 * 
 * WHAT CHANGED?
 * -------------
 * Before: We received all state (selectedDentistId, selectedDate, etc.) as props.
 * After: We read state from Zustand store directly.
 * 
 * WHY?
 * - No prop drilling (state is global)
 * - Component is more independent
 * - Cleaner code
 * 
 * ZUSTAND USAGE:
 * -------------
 * We use useAppointmentStore to:
 * 1. Read state (selectedDentistId, selectedDate, selectedTime, selectedType)
 * 
 * NOTE:
 * We still receive callbacks (onBack, onConfirm, onModify) as props because
 * they handle booking submission and step navigation.
 */

"use client";

import { APPOINTMENT_TYPES } from "@/lib/utils";
import { Button } from "../ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import DoctorInfo from "./DoctorInfo";
import { useAppointmentStore } from "@/store/appointment-store"; // ✅ Import Zustand store


interface BookingConfirmationStepProps {
  // We no longer need state as props - they come from Zustand
  isBooking: boolean; // Still needed from parent (mutation status)
  onBack: () => void;
  onConfirm: () => void;
  onModify: () => void;
}

function BookingConfirmationStep({
  isBooking,
  onBack,
  onConfirm,
  onModify,
}: BookingConfirmationStepProps) {
  /**
   * ZUSTAND STORE - CLIENT STATE
   * ----------------------------
   * Read all selection state from Zustand store instead of props.
   * This is global state, accessible from anywhere.
   */
  const selectedDentistId = useAppointmentStore((state) => state.selectedDentistId);
  const selectedDate = useAppointmentStore((state) => state.selectedDate);
  const selectedTime = useAppointmentStore((state) => state.selectedTime);
  const selectedType = useAppointmentStore((state) => state.selectedType);
  
  // Find appointment type using selectedType from Zustand
  const appointmentType = APPOINTMENT_TYPES.find((t) => t.id === selectedType);

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold">Confirm Your Appointment</h2>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Appointment Summary</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* doctor info */}
          {selectedDentistId && <DoctorInfo doctorId={selectedDentistId} />}

          {/* appointment details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Appointment Type</p>
              <p className="font-medium">{appointmentType?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{appointmentType?.duration}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium">{selectedTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">Dental Center</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cost</p>
              <p className="font-medium text-primary">{appointmentType?.price}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* action buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onModify}>
          Modify Appointment
        </Button>
        <Button onClick={onConfirm} className="bg-primary" disabled={isBooking}>
          {isBooking ? "Booking..." : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );
}

export default BookingConfirmationStep;