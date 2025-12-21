import axios from 'axios';

export interface ReportPayload {
    type: string;
    from: string;
    to: string;
    format: string;
}

export interface RecentDocument {
    id: string;
    displayId: string;
    type: 'invoice' | 'receipt';
    date: string;
    createdAt: string;
    status: string;
    amount: number;
    currency: string;
}

export const generateReport = async (payload: ReportPayload) => {
    try {
        const response = await axios.post('/api/reports/generate', payload, {
            responseType: 'blob', // Important for file download
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRecentDocuments = async (): Promise<RecentDocument[]> => {
    try {
        const response = await axios.get('/api/documents/recent');
        return response.data.data;
    } catch (error) {
        throw error;
    }
};
