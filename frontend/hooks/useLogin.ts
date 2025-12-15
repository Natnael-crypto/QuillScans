"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser } from "@/services/auth";
import { LoginPayload } from "@/types/auth";

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: LoginPayload) => loginUser(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
    });
}