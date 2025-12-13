'use client';

import React, { useState } from 'react';
import { Plus, FileSpreadsheet } from 'lucide-react';
import DocumentTable from '@/components/DocumentTable';
import Filters from '@/components/Filters';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BankStatement } from '@/types/document';

import { FilterValue } from '@/components/Filters';

interface BankFilters {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    [key: string]: FilterValue;
}

const mockStatements: BankStatement[] = [
    { id: '1', date: '2024-01-15', vendor: 'Chase Bank', documentNumber: 'STMT-JAN-2024', amount: 45230.50, currency: 'USD', status: 'processed' },
    { id: '2', date: '2023-12-15', vendor: 'Chase Bank', documentNumber: 'STMT-DEC-2023', amount: 52180.25, currency: 'USD', status: 'processed' },
    { id: '3', date: '2023-11-15', vendor: 'Chase Bank', documentNumber: 'STMT-NOV-2023', amount: 38920.00, currency: 'USD', status: 'processed' },
    { id: '4', date: '2023-10-15', vendor: 'Bank of America', documentNumber: 'STMT-OCT-2023', amount: 28450.75, currency: 'USD', status: 'processing' },
];

export default function BankStatements() {
    const [filters, setFilters] = useState<BankFilters>({});
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortDirection(direction);
    };

    const handleFilterChange = (newFilters: BankFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    let filteredData = [...mockStatements];

    if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredData = filteredData.filter(d =>
            d.vendor?.toLowerCase().includes(search) ||
            d.documentNumber?.toLowerCase().includes(search)
        );
    }

    filteredData.sort((a, b) => {
        let aValue = a[sortField as keyof BankStatement];
        let bValue = b[sortField as keyof BankStatement];

        if (sortField === 'date') {
            aValue = new Date(aValue as string).getTime();
            bValue = new Date(bValue as string).getTime();
        }

        if (aValue === undefined || bValue === undefined) return 0;

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
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
                    <h1 className="text-2xl font-bold text-slate-900">Bank Statements</h1>
                    <p className="text-slate-500 mt-1">View and manage your bank statement extractions</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export All
                    </Button>
                    <Link href="/upload?mode=bank">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Upload Statement
                        </Button>
                    </Link>
                </div>
            </div>

            <Filters onFilterChange={handleFilterChange} filters={filters} showAmount={false} />

            <DocumentTable
                documents={paginatedData}
                type="bank_statement"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onView={(doc) => console.log('View', doc)}
                onDownload={(doc) => console.log('Download', doc)}
                onRegenerate={(doc) => console.log('Regenerate', doc)}
                onDelete={(doc) => console.log('Delete', doc)}
                isLoading={false}
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