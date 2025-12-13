'use client';

import React, { useState } from 'react';
import { Plus, FileSpreadsheet } from 'lucide-react';
import DocumentTable from '@/components/DocumentTable';
import Filters from '@/components/Filters';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Invoice, AnyDocument } from '@/types/document';

interface InvoiceFilters {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}

// Mock data
const mockInvoices: Invoice[] = [
    { id: '1', date: '2024-01-15', customer: 'Acme Corporation', documentNumber: 'INV-2024-001', amount: 2450.00, currency: 'USD', status: 'processed' },
    { id: '2', date: '2024-01-14', customer: 'Tech Solutions Inc', documentNumber: 'INV-2024-002', amount: 8900.00, currency: 'USD', status: 'processed' },
    { id: '3', date: '2024-01-13', customer: 'Global Enterprises', documentNumber: 'INV-2024-003', amount: 1250.50, currency: 'USD', status: 'processing' },
    { id: '4', date: '2024-01-12', customer: 'StartUp Labs', documentNumber: 'INV-2024-004', amount: 5600.00, currency: 'USD', status: 'pending' },
    { id: '5', date: '2024-01-11', customer: 'Digital Agency', documentNumber: 'INV-2024-005', amount: 3200.00, currency: 'USD', status: 'processed' },
    { id: '6', date: '2024-01-10', customer: 'Cloud Services Co', documentNumber: 'INV-2024-006', amount: 15800.00, currency: 'USD', status: 'processed' },
    { id: '7', date: '2024-01-09', customer: 'Marketing Pro', documentNumber: 'INV-2024-007', amount: 780.00, currency: 'USD', status: 'failed' },
    { id: '8', date: '2024-01-08', customer: 'Design Studio', documentNumber: 'INV-2024-008', amount: 4500.00, currency: 'USD', status: 'processed' },
];

export default function Invoices() {
    const [filters, setFilters] = useState<InvoiceFilters>({});
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
        // In real app, this would call the export API
    };

    const handleRegenerate = (doc: AnyDocument) => {
        console.log('Regenerate:', doc);
    };

    const handleDelete = (doc: AnyDocument) => {
        console.log('Delete:', doc);
    };

    const handleExportAll = () => {
        console.log('Export all invoices');
    };

    // Filter and sort data
    let filteredData = [...mockInvoices];

    if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredData = filteredData.filter(d =>
            d.customer?.toLowerCase().includes(search) ||
            d.documentNumber?.toLowerCase().includes(search)
        );
    }

    if (filters.status) {
        filteredData = filteredData.filter(d => d.status === filters.status);
    }

    // Sort
    filteredData.sort((a, b) => {
        let aVal = a[sortField as keyof Invoice];
        let bVal = b[sortField as keyof Invoice];

        if (sortField === 'date') {
            aVal = new Date(aVal as string).getTime();
            bVal = new Date(bVal as string).getTime();
        }

        // Handle undefined just in case
        if (aVal === undefined) return 1;
        if (bVal === undefined) return -1;

        if (sortDirection === 'asc') {
            return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
    });

    // Paginate
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                documents={paginatedData}
                type="invoice"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onDownload={handleDownload}
                onRegenerate={handleRegenerate}
                onDelete={handleDelete}
            />

            {/* Pagination */}
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