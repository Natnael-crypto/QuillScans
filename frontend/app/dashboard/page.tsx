'use client';

import Link from 'next/link';
import {
    FileText,
    Receipt,
    TrendingUp,
    Clock,
    Upload,
    ArrowRight,
    Plus
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ChartLine from '@/components/charts/ChartLine';
import ChartPie from '@/components/charts/ChartPie';
import { motion } from 'framer-motion';

// Mock data
const stats = [
    {
        title: 'Total Documents',
        value: '1,247',
        change: '+12.5%',
        changeType: 'increase' as const,
        icon: FileText,
        iconColor: 'bg-blue-100 text-blue-600'
    },
    {
        title: 'Monthly Quota',
        value: '142/200',
        change: '58 remaining',
        changeType: 'increase' as const,
        icon: Clock,
        iconColor: 'bg-purple-100 text-purple-600'
    },
    {
        title: 'Total Invoices',
        value: '$45,231',
        change: '+8.2%',
        changeType: 'increase' as const,
        icon: Receipt,
        iconColor: 'bg-emerald-100 text-emerald-600'
    },
    {
        title: 'Total Expenses',
        value: '$12,847',
        change: '-3.1%',
        changeType: 'decrease' as const,
        icon: TrendingUp,
        iconColor: 'bg-orange-100 text-orange-600'
    },
];

const monthlyData = [
    { name: 'Jan', value: 65 },
    { name: 'Feb', value: 78 },
    { name: 'Mar', value: 92 },
    { name: 'Apr', value: 85 },
    { name: 'May', value: 110 },
    { name: 'Jun', value: 125 },
    { name: 'Jul', value: 142 },
];

const documentTypes = [
    { name: 'Invoices', value: 45 },
    { name: 'Receipts', value: 30 },
    { name: 'Bank Statements', value: 15 },
    { name: 'Purchase Orders', value: 10 },
];

const recentDocuments = [
    { id: 1, name: 'Invoice #INV-2024-001', vendor: 'Acme Corp', amount: 2450.00, status: 'processed', date: '2024-01-15' },
    { id: 2, name: 'Receipt - Office Supplies', vendor: 'Staples', amount: 156.99, status: 'processed', date: '2024-01-14' },
    { id: 3, name: 'Bank Statement - Dec 2023', vendor: 'Chase Bank', amount: 0, status: 'processing', date: '2024-01-13' },
    { id: 4, name: 'Invoice #INV-2024-002', vendor: 'Tech Solutions', amount: 8900.00, status: 'pending', date: '2024-01-12' },
    { id: 5, name: 'Receipt - Travel Expense', vendor: 'Delta Airlines', amount: 425.50, status: 'processed', date: '2024-01-11' },
];

const statusConfig: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline", className?: string }> = {
    processed: { label: 'Processed', variant: 'secondary', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-transparent' },
    processing: { label: 'Processing', variant: 'secondary', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100/80 border-transparent' },
    pending: { label: 'Pending', variant: 'outline', className: 'text-slate-600' },
    failed: { label: 'Failed', variant: 'destructive' },
};

export default function Dashboard() {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-sm md:text-base text-slate-500 mt-1">Welcome back! Here&apos;s your document overview.</p>
                </div>
                <Link href="/upload" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Documents
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <StatCard {...stat} />
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Monthly Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartLine
                            data={monthlyData}
                            height={280}
                            color="#635BFF"
                            gradientColor="#818CF8"
                        />
                    </CardContent>
                </Card>

                {/* Document Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Document Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartPie
                            data={documentTypes}
                            height={280}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Documents */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Documents</CardTitle>
                    <Link
                        href="/invoices"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                        View all
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left px-3 md:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Document
                                    </th>
                                    <th className="text-left px-3 md:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                                        Vendor
                                    </th>
                                    <th className="text-left px-3 md:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="text-left px-3 md:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-3 md:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentDocuments.map((doc) => {
                                    const status = statusConfig[doc.status as keyof typeof statusConfig];
                                    return (
                                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600">{doc.vendor}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-slate-900">
                                                    {doc.amount > 0 ? formatCurrency(doc.amount) : '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={status.variant} className={status.className}>
                                                    {status.label}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-500">
                                                    {new Date(doc.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {recentDocuments.map((doc) => {
                            const status = statusConfig[doc.status as keyof typeof statusConfig];
                            return (
                                <div key={doc.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{doc.vendor}</p>
                                        </div>
                                        <Badge variant={status.variant} className={`ml-2 ${status.className || ''}`}>
                                            {status.label}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-sm font-medium text-slate-900">
                                            {doc.amount > 0 ? formatCurrency(doc.amount) : '-'}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(doc.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}