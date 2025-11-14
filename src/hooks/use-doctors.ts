"use client";

import { createDoctor, getDoctors, updateDoctor, regenerateDoctorAvatars } from "@/lib/actions/doctors";
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
        },
        onError: (error: any) => console.log("Error creating doctor:", error.message),
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
        onError: (error: any) => console.log("Error regenerating avatars:", error.message),
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
        onError: (error: any) => console.log("Error updating doctor:", error.message),
    });
    
    return result;
}


