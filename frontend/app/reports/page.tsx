"use client";

import React, { useState } from 'react';
import {
    FileSpreadsheet,
    FileText,
    Download,
    Calendar,
    Loader2,
    CheckCircle2,
    Clock
} from 'lucide-react';

import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const reportTypes = [
    { value: 'all_documents', label: 'All Documents' },
    { value: 'invoices', label: 'Invoices Only' },
    { value: 'receipts', label: 'Receipts Only' },
    { value: 'bank_statements', label: 'Bank Statements Only' },
    { value: 'expense_summary', label: 'Expense Summary' },
    { value: 'vendor_summary', label: 'Vendor Summary' },
];

const formatOptions = [
    { value: 'xlsx', label: 'Excel (.xlsx)' },
    { value: 'csv', label: 'CSV (.csv)' },
    { value: 'pdf', label: 'PDF (.pdf)' },
];

const recentReports = [
    { id: '1', name: 'All Documents - January 2024', type: 'all_documents', format: 'xlsx', date: '2024-01-15', status: 'ready' },
    { id: '2', name: 'Expense Summary Q4 2023', type: 'expense_summary', format: 'pdf', date: '2024-01-10', status: 'ready' },
    { id: '3', name: 'Invoices - December 2023', type: 'invoices', format: 'xlsx', date: '2024-01-05', status: 'ready' },
    { id: '4', name: 'Vendor Summary 2023', type: 'vendor_summary', format: 'xlsx', date: '2024-01-01', status: 'processing' },
];

export default function Reports() {
    const [reportType, setReportType] = useState('');
    const [format, setFormat] = useState('xlsx');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationComplete, setGenerationComplete] = useState(false);

    const handleGenerate = async () => {
        if (!reportType) return;

        setIsGenerating(true);
        setGenerationComplete(false);

        // Simulate generation
        await new Promise(resolve => setTimeout(resolve, 3000));

        setIsGenerating(false);
        setGenerationComplete(true);
    };

    const handleDownload = (report: typeof recentReports[0]) => {
        console.log('Downloading report:', report);
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
                                {/* <Select
                                    value={reportType}
                                    onValueChange={setReportType}
                                >
                                    <option value="">Select report type</option>
                                    {reportTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </Select> */}
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
                                <Label htmlFor="dateRange">Date Range</Label>
                                <div className="grid grid-cols-2 gap-4">
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

                            {generationComplete && (
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
                                                <p className="text-sm text-emerald-600">Your report has been generated</p>
                                            </div>
                                        </div>
                                        <Button size="sm">
                                            <Download className="h-4 w-4" />
                                            Download
                                        </Button>
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

                {/* Recent Reports */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Reports</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {recentReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="px-6 py-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {report.name}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(report.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {report.status === 'ready' ? (
                                                    <button
                                                        onClick={() => handleDownload(report)}
                                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100/80 border-transparent">
                                                        Processing
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
}