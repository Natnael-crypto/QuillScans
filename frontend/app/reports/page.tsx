"use client";

import React, { useState } from 'react';
import {
    FileSpreadsheet,
    FileText,
    Download,
    Calendar,
    Loader2,
    CheckCircle2,
    Clock,
    FileCheck
} from 'lucide-react';

import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useGenerateReport, useRecentDocuments } from '@/hooks/useReports';
import { RecentDocument } from '@/services/reports';

const reportTypes = [
    { value: 'invoices', label: 'Invoices Only' },
    { value: 'receipts', label: 'Receipts Only' },
    { value: 'pos', label: 'POS Only' },
];

const formatOptions = [
    { value: 'xlsx', label: 'Excel (.xlsx)' },
    { value: 'csv', label: 'CSV (.csv)' },
];

export default function Reports() {
    const [reportType, setReportType] = useState('');
    const [format, setFormat] = useState('csv');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [generationComplete, setGenerationComplete] = useState(false);

    const { mutate: generate, isPending: isGenerating } = useGenerateReport();
    const { data: recentDocs, isLoading: isLoadingRecent } = useRecentDocuments();

    const handleGenerate = () => {
        if (!reportType) return;
        setGenerationComplete(false);

        generate({ type: reportType, from: dateFrom, to: dateTo, format }, {
            onSuccess: (data) => {
                // Determine file extension
                const extension = format === 'xlsx' ? 'csv' : 'csv'; // Force CSV for now as backend returns CSV stream

                // Create download link
                const url = window.URL.createObjectURL(new Blob([data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `report-${reportType}-${new Date().toISOString().split('T')[0]}.${extension}`);
                document.body.appendChild(link);
                link.click();
                link.remove();

                setGenerationComplete(true);
            },
            onError: (error) => {
                console.error("Failed to generate report", error);
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'approved':
                return 'bg-emerald-100 text-emerald-700';
            case 'pending':
            case 'processing':
                return 'bg-amber-100 text-amber-700';
            case 'overdue':
            case 'rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                <p className="text-slate-500 mt-1">Generate and download custom reports</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Report Builder */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Generate New Report</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Report Type */}
                            <div>
                                <Label htmlFor="reportType">Report Type</Label>
                                <Select
                                    value={reportType}
                                    onValueChange={setReportType}
                                >
                                    <SelectTrigger className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent mt-2">
                                        <SelectValue placeholder="Select report type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reportTypes.map((type) => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date Range */}
                            <div>
                                <Label htmlFor="dateRange">Date Range (Optional)</Label>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">From</label>
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">To</label>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Format */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Export Format
                                </label>
                                <div className="flex gap-3">
                                    {formatOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setFormat(option.value)}
                                            className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${format === option.value
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Generation Status */}
                            {isGenerating && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-800">Generating report...</p>
                                            <p className="text-sm text-blue-600">This may take a few moments</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {generationComplete && !isGenerating && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            <div>
                                                <p className="text-sm font-medium text-emerald-800">Report ready!</p>
                                                <p className="text-sm text-emerald-600">Your report has been downloaded</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={handleGenerate}
                                disabled={!reportType || isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                                        Generate Report
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Recent Reports / Processed Documents */}
                <div>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Recently Processed</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoadingRecent ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
                                </div>
                            ) : recentDocs && recentDocs.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {recentDocs.map((doc: RecentDocument) => (
                                        <div
                                            key={`${doc.type}-${doc.id}`}
                                            className="px-6 py-4 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="capitalize text-[10px] h-5 px-1.5">
                                                            {doc.type}
                                                        </Badge>
                                                        <span className="text-xs text-slate-400">
                                                            {new Date(doc.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-900 truncate">
                                                        #{doc.displayId}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-sm font-semibold text-slate-700">
                                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: doc.currency || 'USD' }).format(doc.amount || 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge className={`${getStatusColor(doc.status)} border-transparent capitalized`}>
                                                        {doc.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <FileCheck className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                                    <p>No recent documents</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
}