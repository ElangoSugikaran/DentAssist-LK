import { create } from 'zustand';
import { persist } from 'zustand/middleware';


interface AppointmentBookingState {
 
  selectedDentistId: string | null;
 
  selectedDate: string;      // Format: "YYYY-MM-DD"
  selectedTime: string;      // Format: "HH:MM AM/PM"
  selectedType: string;      // Appointment type ID (e.g., "checkup", "cleaning")
  
 
  currentStep: number;       // 1 = select doctor, 2 = select time, 3 = confirm
  
  // Modal state
  showConfirmationModal: boolean;
  
  // Store the booked appointment data (shown in confirmation modal)
  bookedAppointment: {
    id: string;
    doctorName: string;
    date: string;
    time: string;
    patientEmail: string;
    doctorImageUrl: string;
    reason: string | null;
  } | null;
}


interface AppointmentBookingActions {
  // Actions for updating state
  setSelectedDentist: (dentistId: string | null) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTime: (time: string) => void;
  setSelectedType: (type: string) => void;
  setCurrentStep: (step: number) => void;
  setShowConfirmationModal: (show: boolean) => void;
  setBookedAppointment: (appointment: AppointmentBookingState['bookedAppointment']) => void;
  
  // Combined actions (business logic)
  handleSelectDentist: (dentistId: string) => void;  // When user selects a doctor
  goToNextStep: () => void;                           // Move to next step
  goToPreviousStep: () => void;                       // Move to previous step
  resetBooking: () => void;                           // Reset all booking data
}


type AppointmentBookingStore = AppointmentBookingState & AppointmentBookingActions;


const initialState: AppointmentBookingState = {
  selectedDentistId: null,
  selectedDate: "",
  selectedTime: "",
  selectedType: "",
  currentStep: 1,
  showConfirmationModal: false,
  bookedAppointment: null,
};


export const useAppointmentStore = create<AppointmentBookingStore>()(
  persist(
    (set, get) => ({
 
      ...initialState,

      setSelectedDentist: (dentistId) => {
        set({ selectedDentistId: dentistId });
      },

      
      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },

      setSelectedTime: (time) => {
        set({ selectedTime: time });
      },

   
      setSelectedType: (type) => {
        set({ selectedType: type });
      },

   
      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

    
      setShowConfirmationModal: (show) => {
        set({ showConfirmationModal: show });
      },

 
      setBookedAppointment: (appointment) => {
        set({ bookedAppointment: appointment });
      },

      // ========================================
      // BUSINESS LOGIC ACTIONS: Combined operations
      // ========================================

      handleSelectDentist: (dentistId) => {
        set({
          selectedDentistId: dentistId,
          // Reset other selections when doctor changes
          selectedDate: "",
          selectedTime: "",
          selectedType: "",
        });
      },


      goToNextStep: () => {
        const { currentStep } = get();
        if (currentStep < 3) {
          set({ currentStep: currentStep + 1 });
        }
      },


      goToPreviousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

  
      resetBooking: () => {
        set(initialState);
      },
    }),
    {
      name: 'appointment-booking-storage',
      // ✅ ADD THIS: Skip hydration on server
      skipHydration: true,
    }
  )
);



