"use client"

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import {
    Filter,
    Calendar,
    X,
    ChevronDown,
    Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type FilterValue = string | number | undefined;

interface FiltersProps {
    onFilterChange?: (filters: Record<string, FilterValue>) => void;
    filters?: Record<string, FilterValue>;
    showVendor?: boolean;
    showStatus?: boolean;
    showAmount?: boolean;
    showDate?: boolean;
}

export default function Filters({
    onFilterChange,
    filters = {},
    showVendor = true,
    showStatus = true,
    showAmount = true,
    showDate = true
}: FiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<Record<string, FilterValue>>(filters);

    const handleChange = (key: string, value: FilterValue) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        onFilterChange?.(localFilters);
        setIsOpen(false);
    };

    const clearFilters = () => {
        const emptyFilters = {};
        setLocalFilters(emptyFilters);
        onFilterChange?.(emptyFilters);
    };

    const activeFilterCount = Object.values(localFilters).filter(v => v && v !== '').length;

    return (
        <div className="flex items-center gap-3 flex-wrap">
            {/* Quick Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search documents..."
                    value={localFilters.search || ''}
                    onChange={(e) => {
                        handleChange('search', e.target.value);
                        onFilterChange?.({ ...localFilters, search: e.target.value });
                    }}
                    className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
            </div>

            {/* Filter Button */}
            <div className="relative">
                <Button
                    variant="outline"
                    size="default"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ml-1.5 h-5 w-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>

                {/* Filter Dropdown */}
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-20">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-900">Filters</h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-slate-500 hover:text-slate-700"
                                >
                                    Clear all
                                </button>
                            </div>

                            <div className="p-4 space-y-4">
                                {showDate && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Date Range</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="date"
                                                value={localFilters.dateFrom || ''}
                                                onChange={(e) => handleChange('dateFrom', e.target.value)}
                                                className="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                                            />
                                            <input
                                                type="date"
                                                value={localFilters.dateTo || ''}
                                                onChange={(e) => handleChange('dateTo', e.target.value)}
                                                className="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                                            />
                                        </div>
                                    </div>
                                )}

                                {showAmount && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Amount Range</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={localFilters.amountMin || ''}
                                                onChange={(e) => handleChange('amountMin', e.target.value)}
                                                className="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={localFilters.amountMax || ''}
                                                onChange={(e) => handleChange('amountMax', e.target.value)}
                                                className="h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                                            />
                                        </div>
                                    </div>
                                )}

                                {showVendor && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Vendor/Customer</label>
                                        <input
                                            type="text"
                                            placeholder="Enter name..."
                                            value={localFilters.vendor || ''}
                                            onChange={(e) => handleChange('vendor', e.target.value)}
                                            className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                                        />
                                    </div>
                                )}

                                {showStatus && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Status</label>
                                        <select
                                            value={localFilters.status || ''}
                                            onChange={(e) => handleChange('status', e.target.value)}
                                            className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
                                        >
                                            <option value="">All statuses</option>
                                            <option value="processed">Processed</option>
                                            <option value="processing">Processing</option>
                                            <option value="pending">Pending</option>
                                            <option value="failed">Failed</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={applyFilters}>
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}