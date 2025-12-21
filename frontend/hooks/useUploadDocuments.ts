"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    uploadDocuments,
    UploadDocumentsPayload,
} from "@/services/document";

export function useUploadDocuments() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UploadDocumentsPayload) =>
            uploadDocuments(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["documents"],
            });
        },
    });
}
