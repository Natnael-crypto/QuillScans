'use client';

import React, { useState } from 'react';
import { Plus, FileSpreadsheet } from 'lucide-react';
import DocumentTable from '@/components/DocumentTable';
import Filters from '@/components/Filters';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PurchaseOrder } from '@/types/document';

interface POFilters {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}

const mockPOs: PurchaseOrder[] = [
    { id: '1', date: '2024-01-15', vendor: 'Office Depot', documentNumber: 'PO-2024-001', amount: 3450.00, currency: 'USD', status: 'processed' },
    { id: '2', date: '2024-01-12', vendor: 'Dell Technologies', documentNumber: 'PO-2024-002', amount: 12500.00, currency: 'USD', status: 'processed' },
    { id: '3', date: '2024-01-10', vendor: 'Cisco Systems', documentNumber: 'PO-2024-003', amount: 8900.00, currency: 'USD', status: 'processing' },
    { id: '4', date: '2024-01-08', vendor: 'HP Inc', documentNumber: 'PO-2024-004', amount: 5600.00, currency: 'USD', status: 'pending' },
];

export default function PurchaseOrders() {
    const [filters, setFilters] = useState<POFilters>({});
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortDirection(direction);
    };

    const handleFilterChange = (newFilters: POFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    let filteredData = [...mockPOs];

    if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredData = filteredData.filter(d =>
            d.vendor?.toLowerCase().includes(search) ||
            d.documentNumber?.toLowerCase().includes(search)
        );
    }

    filteredData.sort((a, b) => {
        let aVal = a[sortField as keyof PurchaseOrder];
        let bVal = b[sortField as keyof PurchaseOrder];

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
                    <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
                    <p className="text-slate-500 mt-1">Manage your purchase order documents</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export All
                    </Button>
                    <Link href="/upload">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Upload PO
                        </Button>
                    </Link>
                </div>
            </div>

            <Filters onFilterChange={handleFilterChange} filters={filters} />

            <DocumentTable
                documents={paginatedData}
                type="purchase_order"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
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