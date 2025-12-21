import api from "@/lib/axios";

export type UploadDocumentsPayload = {
    documentType: string;
    files: File[];
};

export async function uploadDocuments({
    documentType,
    files,
}: UploadDocumentsPayload) {
    const formData = new FormData();
    formData.append("documentType", documentType);

    files.forEach((file) => {
        formData.append("files", file);
    });

    await api.post("/api/documents/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}
