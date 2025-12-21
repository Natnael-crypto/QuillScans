import { useMutation, useQuery } from '@tanstack/react-query';
import { generateReport, getRecentDocuments, ReportPayload } from '@/services/reports';

export function useGenerateReport() {
    return useMutation({
        mutationFn: (payload: ReportPayload) => generateReport(payload),
    });
}

export function useRecentDocuments() {
    return useQuery({
        queryKey: ['recentDocuments'],
        queryFn: getRecentDocuments,
    });
}
