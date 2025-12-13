

"use client"

import React from 'react';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import {
    MoreVertical,
    Eye,
    Download,
    RefreshCw,
    Trash2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ExternalLink
} from "lucide-react";
import { Badge } from './ui/badge';
import { AnyDocument, DocumentType } from '@/types/document';

interface DocumentTableProps {
    documents: AnyDocument[];
    type: DocumentType;
    sortField: string;
    sortDirection: 'asc' | 'desc';
    onSort: (field: string, direction: 'asc' | 'desc') => void;
    onView?: (doc: AnyDocument) => void;
    onDownload?: (doc: AnyDocument) => void;
    onRegenerate?: (doc: AnyDocument) => void;
    onDelete?: (doc: AnyDocument) => void;
    isLoading?: boolean;
}

const statusConfig = {
    processed: { label: 'Processed', variant: 'success' as const },
    processing: { label: 'Processing', variant: 'warning' as const },
    failed: { label: 'Failed', variant: 'destructive' as const }, // 'error' is often 'destructive' in shadcn/ui
    pending: { label: 'Pending', variant: 'outline' as const }, // 'default' mapped to outline or secondary often
};

const SortIcon = ({
    field,
    currentSortField,
    sortDirection
}: {
    field: string;
    currentSortField: string;
    sortDirection: 'asc' | 'desc';
}) => {
    if (currentSortField !== field) return <ArrowUpDown className="h-4 w-4 text-slate-400" />;
    return sortDirection === 'asc'
        ? <ArrowUp className="h-4 w-4 text-primary" />
        : <ArrowDown className="h-4 w-4 text-primary" />;
};

export default function DocumentTable({
    documents,
    type,
    sortField,
    sortDirection,
    onSort,
    onView,
    onDownload,
    onRegenerate,
    onDelete,
    isLoading = false
}: DocumentTableProps) {
    const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

    const handleSort = (field: string) => {
        if (sortField === field) {
            onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            onSort(field, 'asc');
        }
    };



    const formatCurrency = (amount: number, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getVendorOrCustomer = (doc: AnyDocument) => {
        if ('customer' in doc) return doc.customer;
        if ('vendor' in doc) return doc.vendor;
        return 'Unknown';
    };

    const getDetailUrl = (doc: AnyDocument) => {
        return `/document?type=${type}&id=${doc.id}`;
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="animate-pulse">
                    <div className="h-12 bg-slate-100" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 border-t border-slate-100 flex items-center px-6 gap-6">
                            <div className="h-4 w-24 bg-slate-200 rounded" />
                            <div className="h-4 w-32 bg-slate-200 rounded" />
                            <div className="h-4 w-20 bg-slate-200 rounded" />
                            <div className="h-6 w-20 bg-slate-200 rounded-full" />
                            <div className="h-4 w-16 bg-slate-200 rounded ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-6 py-3">
                                    <button
                                        onClick={() => handleSort('date')}
                                        className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
                                    >
                                        Date
                                        <SortIcon
                                            field="date"
                                            currentSortField={sortField}
                                            sortDirection={sortDirection}
                                        />
                                    </button>
                                </th>
                                <th className="text-left px-6 py-3">
                                    <button
                                        onClick={() => handleSort(type === 'invoice' ? 'customer' : 'vendor')}
                                        className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
                                    >
                                        {type === 'invoice' ? 'Customer' : 'Vendor'}
                                        <SortIcon
                                            field={type === 'invoice' ? 'customer' : 'vendor'}
                                            currentSortField={sortField}
                                            sortDirection={sortDirection}
                                        />
                                    </button>
                                </th>
                                <th className="text-left px-6 py-3">
                                    <button
                                        onClick={() => handleSort('amount')}
                                        className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
                                    >
                                        Amount
                                        <SortIcon
                                            field="amount"
                                            currentSortField={sortField}
                                            sortDirection={sortDirection}
                                        />
                                    </button>
                                </th>
                                <th className="text-left px-6 py-3">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Status
                                    </span>
                                </th>
                                <th className="text-right px-6 py-3">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {documents.map((doc) => {
                                const status = statusConfig[doc.status as keyof typeof statusConfig] || statusConfig.pending;
                                const mainEntity = getVendorOrCustomer(doc);

                                return (
                                    <tr
                                        key={doc.id}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900 font-medium">
                                                {formatDate(doc.date)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{mainEntity}</p>
                                                {doc.documentNumber && (
                                                    <p className="text-xs text-slate-500 mt-0.5">#{doc.documentNumber}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-900">
                                                {formatCurrency(doc.amount, doc.currency)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={status.variant}>
                                                {status.label}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={getDetailUrl(doc)}
                                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => onDownload?.(doc)}
                                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>

                                                {/* More Menu */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>

                                                    {openMenuId === doc.id && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={() => setOpenMenuId(null)}
                                                            />
                                                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20">
                                                                <Link
                                                                    href={getDetailUrl(doc)}
                                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                                <button
                                                                    onClick={() => {
                                                                        onDownload?.(doc);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                    Download Excel
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        onRegenerate?.(doc);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                                >
                                                                    <RefreshCw className="h-4 w-4" />
                                                                    Regenerate
                                                                </button>
                                                                <hr className="my-1 border-slate-100" />
                                                                <button
                                                                    onClick={() => {
                                                                        onDelete?.(doc);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {documents.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No documents found</p>
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {documents.map((doc) => {
                    const status = statusConfig[doc.status as keyof typeof statusConfig] || statusConfig.pending;
                    return (
                        <div
                            key={doc.id}
                            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900">
                                        {getVendorOrCustomer(doc)}
                                    </p>
                                    {doc.documentNumber && (
                                        <p className="text-xs text-slate-500 mt-0.5">#{doc.documentNumber}</p>
                                    )}
                                </div>
                                <Badge variant={status.variant}>
                                    {status.label}
                                </Badge>
                            </div>

                            <div className="space-y-2 mb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Amount</span>
                                    <span className="text-sm font-semibold text-slate-900">
                                        {formatCurrency(doc.amount, doc.currency)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Date</span>
                                    <span className="text-sm text-slate-600">
                                        {formatDate(doc.date)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                <Link
                                    href={getDetailUrl(doc)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    View
                                </Link>
                                <button
                                    onClick={() => onDownload?.(doc)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Download
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </button>

                                    {openMenuId === doc.id && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setOpenMenuId(null)}
                                            />
                                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20">
                                                <button
                                                    onClick={() => {
                                                        onRegenerate?.(doc);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                    Regenerate
                                                </button>
                                                <hr className="my-1 border-slate-100" />
                                                <button
                                                    onClick={() => {
                                                        onDelete?.(doc);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {documents.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-500">No documents found</p>
                    </div>
                )}
            </div>
        </>
    );
}