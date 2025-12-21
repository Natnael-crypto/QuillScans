'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentTable from '@/components/DocumentTable';
import Filters, { FilterValue } from '@/components/Filters';
import Pagination from '@/components/Pagination';
import { Receipt as UiReceipt, AnyDocument } from '@/types/document';
import { Receipt as ApiReceipt } from '@/types/receipt';
import axios from '@/lib/axios';

interface ReceiptFilters {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    [key: string]: FilterValue;
}

export default function Receipts() {
    const [filters, setFilters] = useState<ReceiptFilters>({});
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [receipts, setReceipts] = useState<UiReceipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 10;

    const fetchReceipts = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = {
                page: currentPage,
                limit: itemsPerPage,
                sortField,
                sortDirection,
            };

            if (filters.search) params.receiptNumber = filters.search;
            if (filters.status && filters.status !== 'all') params.status = filters.status;
            if (filters.dateFrom) params.transactionDateFrom = filters.dateFrom;
            if (filters.dateTo) params.transactionDateTo = filters.dateTo;

            const response = await axios.get('/api/receipts', { params });

            const apiReceipts: ApiReceipt[] = response.data.data;
            const meta = response.data.meta;

            // Map ApiReceipt to UiReceipt (AnyDocument compatible)
            const mappedReceipts: UiReceipt[] = apiReceipts.map(rec => ({
                id: rec.id,
                date: (typeof rec.transactionDate === 'string' ? rec.transactionDate : rec.transactionDate.toISOString()),
                amount: rec.grandTotal,
                currency: rec.currency,
                status: rec.status as UiReceipt['status'],
                documentNumber: rec.receiptNumber,
                vendor: rec.merchant?.name || 'Unknown',
            }));

            setReceipts(mappedReceipts);
            setTotalCount(meta.total);

        } catch (error) {
            console.error("Failed to fetch receipts", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters, sortField, sortDirection]);

    useEffect(() => {
        fetchReceipts();
    }, [fetchReceipts]);

    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortDirection(direction);
    };

    const handleFilterChange = (newFilters: ReceiptFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleDownload = (doc: AnyDocument) => console.log('Download:', doc);
    const handleRegenerate = (doc: AnyDocument) => console.log('Regenerate:', doc);
    const handleDelete = (doc: AnyDocument) => console.log('Delete:', doc);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Receipts</h1>
                    <p className="text-slate-500 mt-1">Manage and view all your expense receipts</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export All
                    </Button>
                    <Link href="/upload">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Upload Receipt
                        </Button>
                    </Link>
                </div>
            </div>

            <Filters onFilterChange={handleFilterChange} filters={filters} />

            <DocumentTable
                documents={receipts}
                type="receipt"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onDownload={handleDownload}
                onRegenerate={handleRegenerate}
                onDelete={handleDelete}
                isLoading={loading}
            />

            {totalCount > itemsPerPage && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalCount / itemsPerPage)}
                    totalItems={totalCount}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
}
