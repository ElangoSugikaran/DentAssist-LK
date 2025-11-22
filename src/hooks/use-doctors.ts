"use client";

import { createDoctor, getDoctors, updateDoctor, regenerateDoctorAvatars, getAvailableDoctors } from "@/lib/actions/doctors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export function useGetDoctors() {
    const result = useQuery({
        queryKey: ["getDoctors"],
        queryFn: getDoctors,
    });

    return result;
}

export function useCreateDoctor() {
    const queryClient = useQueryClient();
    
    const result = useMutation({
        mutationFn: createDoctor,
        onSuccess: () => {
            console.log("Doctor created successfully");
            queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
            queryClient.invalidateQueries({ queryKey: ["getAvailableDoctors"] });
        },
        onError: (error: Error | unknown) => {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.log("Error creating doctor:", message);
        },
    });
    
    return result;
}

export function useRegenerateDoctorAvatars() {
    const queryClient = useQueryClient();
    
    const result = useMutation({
        mutationFn: regenerateDoctorAvatars,
        onSuccess: () => {
            console.log("Doctor avatars regenerated successfully");
            queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
        },
        onError: (error: Error | unknown) => {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.log("Error regenerating avatars:", message);
        },
    });
    
    return result;
}

export function useUpdateDoctor() {
    const queryClient = useQueryClient();
    
    const result = useMutation({
        mutationFn: updateDoctor,
        onSuccess: () => {
            console.log("Doctor updated successfully");
            queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
        },
        onError: (error: Error | unknown) => {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.log("Error updating doctor:", message);
        },
    });
    
    return result;
}

// get available doctors for appointments
export function useAvailableDoctors() {
  const result = useQuery({
    queryKey: ["getAvailableDoctors"],
    queryFn: getAvailableDoctors,
  });

  return result;
}


