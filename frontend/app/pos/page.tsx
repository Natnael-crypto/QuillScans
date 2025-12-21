'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, FileSpreadsheet } from 'lucide-react';
import DocumentTable from '@/components/DocumentTable';
import Filters, { FilterValue } from '@/components/Filters';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PurchaseOrder as UiPOS, AnyDocument } from '@/types/document';
import { POSTransaction as ApiPOS } from '@/types/pos';
import axios from '@/lib/axios';

interface POSFilters {
    [key: string]: FilterValue;
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}

export default function POSTransactions() {
    const [filters, setFilters] = useState<POSFilters>({});
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [posTransactions, setPosTransactions] = useState<UiPOS[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 10;

    const fetchPOSTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = {
                page: currentPage,
                limit: itemsPerPage,
                sortField,
                sortDirection,
            };

            if (filters.search) params.transactionId = filters.search;
            if (filters.status && filters.status !== 'all') params.status = filters.status;
            if (filters.dateFrom) params.timestampFrom = filters.dateFrom;
            if (filters.dateTo) params.timestampTo = filters.dateTo;

            const response = await axios.get('/api/pos', { params });

            const apiPOS: ApiPOS[] = response.data.data;
            const meta = response.data.meta;

            // Map ApiPOS to UiPOS (AnyDocument compatible)
            const mappedPOS: UiPOS[] = apiPOS.map(pos => ({
                id: pos.id,
                date: (typeof pos.timestamp === 'string' ? pos.timestamp : pos.timestamp.toISOString()),
                amount: pos.grandTotal,
                currency: pos.currency,
                status: pos.status as UiPOS['status'],
                documentNumber: pos.transactionId,
                vendor: `Store ${pos.storeId} - Terminal ${pos.terminalId}`,
            }));

            setPosTransactions(mappedPOS);
            setTotalCount(meta.total);

        } catch (error) {
            console.error("Failed to fetch POS transactions", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters, sortField, sortDirection]);

    useEffect(() => {
        fetchPOSTransactions();
    }, [fetchPOSTransactions]);

    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortDirection(direction);
    };

    const handleFilterChange = (newFilters: POSFilters) => {
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
                    <h1 className="text-2xl font-bold text-slate-900">POS Transactions</h1>
                    <p className="text-slate-500 mt-1">Manage your point of sale transaction documents</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export All
                    </Button>
                    <Link href="/upload">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Upload POS
                        </Button>
                    </Link>
                </div>
            </div>

            <Filters onFilterChange={handleFilterChange} filters={filters} />

            <DocumentTable
                documents={posTransactions}
                type="pos"
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
