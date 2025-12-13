'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentTable from '@/components/DocumentTable';
import Filters from '@/components/Filters';
import Pagination from '@/components/Pagination';
import { Receipt, AnyDocument } from '@/types/document';

interface ReceiptFilters {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}

// Mock data
const mockReceipts: Receipt[] = [
    { id: '1', date: '2024-01-15', vendor: 'Staples', documentNumber: 'RCP-001', amount: 156.99, currency: 'USD', status: 'processed' },
    { id: '2', date: '2024-01-14', vendor: 'Delta Airlines', documentNumber: 'RCP-002', amount: 425.50, currency: 'USD', status: 'processed' },
    { id: '3', date: '2024-01-13', vendor: 'Uber', documentNumber: 'RCP-003', amount: 32.40, currency: 'USD', status: 'processed' },
    { id: '4', date: '2024-01-12', vendor: 'Amazon AWS', documentNumber: 'RCP-004', amount: 892.00, currency: 'USD', status: 'processing' },
    { id: '5', date: '2024-01-11', vendor: 'WeWork', documentNumber: 'RCP-005', amount: 1200.00, currency: 'USD', status: 'processed' },
    { id: '6', date: '2024-01-10', vendor: 'Zoom', documentNumber: 'RCP-006', amount: 149.90, currency: 'USD', status: 'processed' },
    { id: '7', date: '2024-01-09', vendor: 'FedEx', documentNumber: 'RCP-007', amount: 78.50, currency: 'USD', status: 'pending' },
];

export default function Receipts() {
    const [filters, setFilters] = useState<ReceiptFilters>({});
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    let filteredData = [...mockReceipts];

    if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredData = filteredData.filter(d =>
            d.vendor?.toLowerCase().includes(search) ||
            d.documentNumber?.toLowerCase().includes(search)
        );
    }

    if (filters.status) {
        filteredData = filteredData.filter(d => d.status === filters.status);
    }

    filteredData.sort((a, b) => {
        let aVal = a[sortField as keyof Receipt];
        let bVal = b[sortField as keyof Receipt];

        if (sortField === 'date') {
            aVal = new Date(aVal as string).getTime();
            bVal = new Date(bVal as string).getTime();
        }

        if (aVal === undefined) return 1;
        if (bVal === undefined) return -1;

        if (sortDirection === 'asc') return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                documents={paginatedData}
                type="receipt"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onDownload={handleDownload}
                onRegenerate={handleRegenerate}
                onDelete={handleDelete}
            />

            {filteredData.length > itemsPerPage && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
}