"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerUser } from "@/services/auth";
import { RegisterPayload } from "@/types/auth";

export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RegisterPayload) => registerUser(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
    });
}
