"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getMe, updateProfile } from "@/services/auth";

export function useMe() {
    return useQuery({
        queryKey: ["me"],
        queryFn: getMe,
        retry: false,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });
}

export function useUpdateProfile() {
    return useMutation({
        mutationFn: updateProfile,
    });
}
