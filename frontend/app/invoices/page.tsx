'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, FileSpreadsheet } from 'lucide-react';
import DocumentTable from '@/components/DocumentTable';
import Filters from '@/components/Filters';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Invoice as UiInvoice, AnyDocument } from '@/types/document';
import { Invoice as ApiInvoice } from '@/types/invoice'; // Alias specifically for API response
import { FilterValue } from '@/components/Filters';
import axios from '@/lib/axios';

interface InvoiceFilters {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    [key: string]: FilterValue;
}

export default function Invoices() {
    const [filters, setFilters] = useState<InvoiceFilters>({});
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [invoices, setInvoices] = useState<UiInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 10;

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = {
                page: currentPage,
                limit: itemsPerPage,
                sortField,
                sortDirection,
            };

            if (filters.search) params.invoiceNumber = filters.search;
            if (filters.status && filters.status !== 'all') params.status = filters.status;
            if (filters.dateFrom) params.issuedAtFrom = filters.dateFrom;
            if (filters.dateTo) params.issuedAtTo = filters.dateTo;

            const response = await axios.get('/api/invoices', { params });

            const apiInvoices: ApiInvoice[] = response.data.data;
            const meta = response.data.meta;

            // Map ApiInvoice to UiInvoice (AnyDocument compatible)
            const mappedInvoices: UiInvoice[] = apiInvoices.map(inv => ({
                id: inv.id,
                date: (typeof inv.issuedAt === 'string' ? inv.issuedAt : inv.issuedAt.toISOString()),
                // Use grandTotal for amount. If null (shouldn't be for valid invoice), default 0
                amount: inv.totals?.grandTotal ?? 0,
                currency: inv.totals?.currency ?? 'USD',
                status: inv.status as UiInvoice['status'],
                documentNumber: inv.invoiceNumber,
                customer: inv.recipient?.name || 'Unknown', // Showing recipient as customer for outgoing invoices
                dueDate: (typeof inv.dueDate === 'string' ? inv.dueDate : inv.dueDate?.toISOString()),
            }));

            setInvoices(mappedInvoices);
            setTotalCount(meta.total);

        } catch (error) {
            console.error("Failed to fetch invoices", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters, sortField, sortDirection]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortDirection(direction);
    };

    const handleFilterChange = (newFilters: InvoiceFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleDownload = (doc: AnyDocument) => {
        console.log('Download:', doc);
    };

    const handleRegenerate = (doc: AnyDocument) => {
        console.log('Regenerate:', doc);
    };

    const handleDelete = (doc: AnyDocument) => {
        // Implement delete call
        console.log('Delete not implemented yet for', doc.id);
    };

    const handleExportAll = () => {
        console.log('Export all invoices');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
                    <p className="text-slate-500 mt-1">Manage and view all your extracted invoices</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleExportAll}
                    >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export All
                    </Button>
                    <Link href="/upload">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Upload Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <Filters
                onFilterChange={handleFilterChange}
                filters={filters}
                showVendor={false}
            />

            {/* Table */}
            <DocumentTable
                documents={invoices}
                type="invoice"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onDownload={handleDownload}
                onRegenerate={handleRegenerate}
                onDelete={handleDelete}
                isLoading={loading}
            />

            {/* Pagination */}
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