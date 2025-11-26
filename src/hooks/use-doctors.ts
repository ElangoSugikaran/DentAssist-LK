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
            queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
            queryClient.invalidateQueries({ queryKey: ["getAvailableDoctors"] });
        },
        onError: (error: unknown) => {
            // Error handling is managed by the UI or global handler
        },
    });

    return result;
}

export function useRegenerateDoctorAvatars() {
    const queryClient = useQueryClient();

    const result = useMutation({
        mutationFn: regenerateDoctorAvatars,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
        },
        onError: (error: unknown) => {
            // Error handling is managed by the UI or global handler
        },
    });

    return result;
}

export function useUpdateDoctor() {
    const queryClient = useQueryClient();

    const result = useMutation({
        mutationFn: updateDoctor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
        },
        onError: (error: unknown) => {
            // Error handling is managed by the UI or global handler
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


