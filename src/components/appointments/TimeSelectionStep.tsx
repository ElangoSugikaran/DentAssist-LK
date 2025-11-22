/**
 * TIME SELECTION STEP - REFACTORED TO USE ZUSTAND
 * ================================================
 * 
 * WHAT CHANGED?
 * -------------
 * Before: We received all state (selectedDentistId, selectedDate, etc.) as props.
 * After: We read state from Zustand store directly.
 * 
 * WHY?
 * - No prop drilling (state is global)
 * - Component is more independent
 * - Easier to maintain
 * 
 * ZUSTAND USAGE:
 * -------------
 * We use useAppointmentStore to:
 * 1. Read state (selectedDentistId, selectedDate, selectedTime, selectedType)
 * 2. Get actions (setSelectedDate, setSelectedTime, setSelectedType)
 * 
 * TANSTACK QUERY:
 * --------------
 * We still use TanStack Query for server data:
 * - useBookedTimeSlots() - fetches booked times from database
 * 
 * NOTE:
 * We still receive callbacks (onBack, onContinue) as props because
 * they handle step navigation which is specific to the parent component.
 */

"use client";

import { useBookedTimeSlots } from "@/hooks/use-appointments";
import { APPOINTMENT_TYPES, getAvailableTimeSlots, getNext5Days } from "@/lib/utils";
import { Button } from "../ui/button";
import { ChevronLeftIcon, ClockIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { useAppointmentStore } from "@/store/appointment-store"; // ✅ Import Zustand store

interface TimeSelectionStepProps {
  // We no longer need state as props - they come from Zustand
  onBack: () => void;
  onContinue: () => void;
  onDateChange: (date: string) => void; // Still needed for parent callback
  onTimeChange: (time: string) => void;
  onTypeChange: (type: string) => void;
}

function TimeSelectionStep({
  onBack,
  onContinue,
  onDateChange,
  onTimeChange,
  onTypeChange,
}: TimeSelectionStepProps) {
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
  
  // Get Zustand actions to update state
  const setSelectedDate = useAppointmentStore((state) => state.setSelectedDate);
  const setSelectedTime = useAppointmentStore((state) => state.setSelectedTime);
  const setSelectedType = useAppointmentStore((state) => state.setSelectedType);
  
  /**
   * TANSTACK QUERY - SERVER STATE
   * ------------------------------
   * Fetch booked time slots from database.
   * This uses selectedDentistId and selectedDate from Zustand.
   * 
   * Note: We need selectedDentistId and selectedDate to fetch booked slots.
   * If they're not available, the query won't run (enabled: !!selectedDentistId && !!selectedDate).
   */
  const { data: bookedTimeSlots = [] } = useBookedTimeSlots(
    selectedDentistId || "",
    selectedDate || ""
  );

  const availableDates = getNext5Days();
  const availableTimeSlots = getAvailableTimeSlots();

  /**
   * HANDLE DATE SELECT
   * ------------------
   * When user selects a date:
   * 1. Update date in Zustand store
   * 2. Reset time (because date changed)
   * 3. Call parent callback (for step navigation if needed)
   * 
   * Note: We update Zustand state AND call parent callback.
   * The parent callback is for step navigation, but state is in Zustand.
   */
  const handleDateSelect = (date: string) => {
    // Update Zustand store (global state)
    setSelectedDate(date);
    setSelectedTime(""); // Reset time when date changes
    
    // Also call parent callback (for step navigation if needed)
    onDateChange(date);
    onTimeChange(""); // Notify parent that time was reset
  };

  return (
    <div className="space-y-6">
      {/* header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h2 className="text-2xl font-semibold">Select Date & Time</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* appointment type selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Appointment Type</h3>
          <div className="space-y-3">
            {APPOINTMENT_TYPES.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-sm ${
                  selectedType === type.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => {
                  // Update Zustand store (global state)
                  setSelectedType(type.id);
                  // Also call parent callback (for step navigation if needed)
                  onTypeChange(type.id);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{type.name}</h4>
                      <p className="text-sm text-muted-foreground">{type.duration}</p>
                    </div>
                    <span className="font-semibold text-primary">{type.price}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* date & time selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Available Dates</h3>

          {/* date Selection */}
          <div className="grid grid-cols-2 gap-3">
            {availableDates.map((date) => (
              <Button
                key={date}
                variant={selectedDate === date ? "default" : "outline"}
                onClick={() => handleDateSelect(date)}
                className="h-auto p-3"
              >
                <div className="text-center">
                  <div className="font-medium">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* time Selection (only show when date is selected) */}
          {selectedDate && (
            <div className="space-y-3">
              <h4 className="font-medium">Available Times</h4>
              <div className="grid grid-cols-3 gap-2">
                {availableTimeSlots.map((time) => {
                  const isBooked = bookedTimeSlots.includes(time);
                  return (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => {
                        if (!isBooked) {
                          // Update Zustand store (global state)
                          setSelectedTime(time);
                          // Also call parent callback (for step navigation if needed)
                          onTimeChange(time);
                        }
                      }}
                      size="sm"
                      disabled={isBooked}
                      className={isBooked ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {time}
                      {isBooked && " (Booked)"}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* continue button (only show when all selections are made) */}
      {selectedType && selectedDate && selectedTime && (
        <div className="flex justify-end">
          <Button onClick={onContinue}>Review Booking</Button>
        </div>
      )}
    </div>
  );
}

export default TimeSelectionStep;