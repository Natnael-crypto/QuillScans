"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/services/auth";

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
    });
}