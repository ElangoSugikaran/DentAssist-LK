"use client";

/**
 * APPOINTMENTS PAGE - REFACTORED TO USE ZUSTAND
 * ==============================================
 * 
 * WHAT CHANGED?
 * -------------
 * Before: We used useState for all booking state and passed it through props (prop drilling).
 * After: We use Zustand store for all booking state. Components read directly from the store.
 * 
 * WHY?
 * - Cleaner code (no prop drilling)
 * - State persists across page refreshes (with persist middleware)
 * - Easier to access state from anywhere
 * - Better separation of concerns
 * 
 * ZUSTAND STORE USAGE:
 * -------------------
 * We import useAppointmentStore and use it to:
 * 1. Read state (selectedDentistId, selectedDate, etc.)
 * 2. Get actions (handleSelectDentist, setCurrentStep, etc.)
 * 3. Update state (through actions)
 * 
 * TANSTACK QUERY:
 * --------------
 * We still use TanStack Query for server data:
 * - useBookAppointment() - mutation to save appointment to database
 * - useUserAppointments() - query to fetch user's appointments
 * 
 * This is the correct pattern:
 * - Zustand = Client state (UI state, user selections)
 * - TanStack Query = Server state (database data, API calls)
 */

import { AppointmentConfirmationModal } from "@/components/appointments/AppointmentConfirmationModal";
import BookingConfirmationStep from "@/components/appointments/BookingConfirmationStep";
import DoctorSelectionStep from "@/components/appointments/DoctorSelectionStep";
import ProgressSteps from "@/components/appointments/ProgressSteps";
import TimeSelectionStep from "@/components/appointments/TimeSelectionStep";
import Navbar from "@/components/Navbar";
import { useBookAppointment, useUserAppointments } from "@/hooks/use-appointments";
import { APPOINTMENT_TYPES } from "@/lib/utils";
import { useAppointmentStore } from "@/store/appointment-store"; // ✅ Import Zustand store
import { useShallow } from "zustand/react/shallow";
import { format } from "date-fns";
import { toast } from "sonner";

function AppointmentsPage() {
  /**
   * ZUSTAND STORE - CLIENT STATE MANAGEMENT
   * ----------------------------------------
   * Instead of useState, we now use Zustand store for all booking state.
   * 
   * How it works:
   * - useAppointmentStore is a hook that gives us access to the store
   * - We pass a selector function to get specific parts of the state
   * - When state changes, components using it automatically re-render
   * 
   * Benefits:
   * - No prop drilling (state is global)
   * - State persists in localStorage (with persist middleware)
   * - Any component can access this state
   */

  /**
   * OPTIMIZED ZUSTAND STORE USAGE
   * ------------------------------
   * Instead of calling useAppointmentStore multiple times (which causes multiple
   * subscriptions), we use a single selector to get all needed state at once.
   * 
   * This is more performant because:
   * - Only one subscription to the store
   * - Component re-renders only when selected values change
   * - Zustand only re-renders when the selected values change (shallow comparison)
   * 
   * Note: Zustand is already optimized, but using a single selector is a best practice.
   */

  // Read state from Zustand store (optimized - single selector)
  const {
    // State values
    selectedDentistId,
    selectedDate,
    selectedTime,
    selectedType,
    currentStep,
    showConfirmationModal,
    bookedAppointment,
    // Action functions
    handleSelectDentist,
    setCurrentStep,
    setShowConfirmationModal,
    setBookedAppointment,
    setSelectedDate,
    setSelectedTime,
    setSelectedType,
    resetBooking,
  } = useAppointmentStore(
    useShallow((state) => ({
      // State
      selectedDentistId: state.selectedDentistId,
      selectedDate: state.selectedDate,
      selectedTime: state.selectedTime,
      selectedType: state.selectedType,
      currentStep: state.currentStep,
      showConfirmationModal: state.showConfirmationModal,
      bookedAppointment: state.bookedAppointment,
      // Actions
      handleSelectDentist: state.handleSelectDentist,
      setCurrentStep: state.setCurrentStep,
      setShowConfirmationModal: state.setShowConfirmationModal,
      setBookedAppointment: state.setBookedAppointment,
      setSelectedDate: state.setSelectedDate,
      setSelectedTime: state.setSelectedTime,
      setSelectedType: state.setSelectedType,
      resetBooking: state.resetBooking,
    })));

  /**
   * TANSTACK QUERY - SERVER STATE MANAGEMENT
   * ----------------------------------------
   * We still use TanStack Query for server data (data from database/API).
   * This is the correct pattern:
   * - Zustand = Client state (user selections, UI state)
   * - TanStack Query = Server state (database queries, mutations)
   */
  const bookAppointmentMutation = useBookAppointment();
  const { data: userAppointments = [] } = useUserAppointments();

  /**
   * HANDLE BOOK APPOINTMENT
   * -----------------------
   * This function handles the booking submission.
   * 
   * Flow:
   * 1. Validate that all required fields are filled (using Zustand state)
   * 2. Call TanStack Query mutation to save to database (server action)
   * 3. On success:
   *    - Store appointment data in Zustand (for confirmation modal)
   *    - Send confirmation email
   *    - Show confirmation modal
   *    - Reset booking state (using Zustand action)
   * 
   * Note: We read from Zustand (client state) and save to database (server state).
   */
  const handleBookAppointment = () => {
    // Validate using Zustand state
    if (!selectedDentistId || !selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    const appointmentType = APPOINTMENT_TYPES.find((t) => t.id === selectedType);

    // Use TanStack Query mutation to save to database
    // This calls the server action which uses Prisma to save to database
    bookAppointmentMutation.mutate(
      {
        // All these values come from Zustand store (client state)
        doctorId: selectedDentistId,
        date: selectedDate,
        time: selectedTime,
        reason: appointmentType?.name,
      },
      {
        onSuccess: async (appointment) => {
          /**
           * ON SUCCESS - After booking is saved to database
           * ------------------------------------------------
           * 1. Store appointment in Zustand (for confirmation modal)
           * 2. Send confirmation email
           * 3. Show modal
           * 4. Reset booking state
           */

          // Store appointment in Zustand (client state for UI)
          setBookedAppointment(appointment);

          // Send confirmation email using Resend API
          try {
            const emailResponse = await fetch("/api/send-appointment-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userEmail: appointment.patientEmail,
                doctorName: appointment.doctorName,
                appointmentDate: format(new Date(appointment.date), "EEEE, MMMM d, yyyy"),
                appointmentTime: appointment.time,
                appointmentType: appointmentType?.name,
                duration: appointmentType?.duration,
                price: appointmentType?.price,
              }),
            });

            if (!emailResponse.ok) console.error("Failed to send confirmation email");
          } catch (error) {
            console.error("Error sending confirmation email:", error);
          }

          // Show the success modal (update Zustand state)
          setShowConfirmationModal(true);

          // Reset booking state using Zustand action
          // This clears all selections and returns to step 1
          resetBooking();
        },
        onError: (error) => toast.error(`Failed to book appointment: ${error.message}`),
      }
    );
  };

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
          <p className="text-muted-foreground">Find and book with verified dentists in your area</p>
        </div>

        <ProgressSteps currentStep={currentStep} />

        {/**
         * STEP RENDERING - USING ZUSTAND STATE
         * -------------------------------------
         * Before: We passed state and callbacks as props (prop drilling).
         * After: Components read directly from Zustand store.
         * 
         * Benefits:
         * - No prop drilling
         * - Cleaner component code
         * - State is accessible from anywhere
         * 
         * Note: Components still receive callbacks for step navigation,
         * but state is read from Zustand internally.
         */}
        {currentStep === 1 && (
          <DoctorSelectionStep
            onContinue={() => setCurrentStep(2)}
            onSelectDentist={handleSelectDentist}
          />
        )}

        {currentStep === 2 && selectedDentistId && (
          <TimeSelectionStep
            onBack={() => setCurrentStep(1)}
            onContinue={() => setCurrentStep(3)}
            onDateChange={setSelectedDate}
            onTimeChange={setSelectedTime}
            onTypeChange={setSelectedType}
          />
        )}

        {currentStep === 3 && selectedDentistId && (
          <BookingConfirmationStep
            isBooking={bookAppointmentMutation.isPending}
            onBack={() => setCurrentStep(2)}
            onModify={() => setCurrentStep(2)}
            onConfirm={handleBookAppointment}
          />
        )}
      </div>

      {bookedAppointment && (
        <AppointmentConfirmationModal
          open={showConfirmationModal}
          onOpenChange={setShowConfirmationModal}
          appointmentDetails={{
            doctorName: bookedAppointment.doctorName,
            appointmentDate: format(new Date(bookedAppointment.date), "EEEE, MMMM d, yyyy"),
            appointmentTime: bookedAppointment.time,
            userEmail: bookedAppointment.patientEmail,
          }}
        />
      )}

      {/* SHOW EXISTING APPOINTMENTS FOR THE CURRENT USER */}
      {userAppointments.length > 0 && (
        <div className="mb-8 max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-semibold mb-4">Your Upcoming Appointments</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-card border rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={appointment.doctorImageUrl}
                      alt={appointment.doctorName}
                      className="size-10 rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{appointment.doctorName}</p>
                    <p className="text-muted-foreground text-xs">{appointment.reason}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    📅 {format(new Date(appointment.date), "MMM d, yyyy")}
                  </p>
                  <p className="text-muted-foreground">🕐 {appointment.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default AppointmentsPage;
