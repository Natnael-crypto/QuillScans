'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FileText,
    Receipt,
    TrendingUp,
    Clock,
    Upload,
    ArrowRight,
    Plus,
    Loader2,
    LucideIcon
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ChartLine from '@/components/charts/ChartLine';
import ChartPie from '@/components/charts/ChartPie';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline", className?: string }> = {
    processed: { label: 'Processed', variant: 'secondary', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-transparent' },
    processing: { label: 'Processing', variant: 'secondary', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100/80 border-transparent' },
    pending: { label: 'Pending', variant: 'outline', className: 'text-slate-600' },
    failed: { label: 'Failed', variant: 'destructive' },
};

export default function Dashboard() {
    const [stats, setStats] = useState<{ title: string; value: string; change: string; changeType: 'increase' | 'decrease'; icon: LucideIcon; iconColor: string }[]>([]);
    const [monthlyData, setMonthlyData] = useState<{ name: string; value: number }[]>([]);
    const [documentTypes, setDocumentTypes] = useState<{ name: string; value: number }[]>([]);
    const [recentDocuments, setRecentDocuments] = useState<{ id: string; displayId: string; type: string; amount: number; status: string; date: string }[]>([]);
    const [loading, setLoading] = useState(true);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true);
            try {
                const [statsRes, usageRes, recentRes] = await Promise.all([
                    fetch('/api/dashboard/stats'),
                    fetch('/api/usage'),
                    fetch('/api/documents/recent')
                ]);

                const statsData = await statsRes.json();
                const usageData = await usageRes.json();
                const recentData = await recentRes.json();

                // Format Stats
                setStats([
                    {
                        title: 'Total Documents',
                        value: statsData.totalDocs?.toLocaleString() || '0',
                        change: '',
                        changeType: 'increase' as const,
                        icon: FileText,
                        iconColor: 'bg-blue-100 text-blue-600'
                    },
                    {
                        title: 'Monthly Quota',
                        value: `${usageData.quotaUsed || 0}/${usageData.quotaLimit || 200}`,
                        change: `${usageData.remainingDays || 0} days left`,
                        changeType: 'increase' as const,
                        icon: Clock,
                        iconColor: 'bg-purple-100 text-purple-600'
                    }
                ]);

                setMonthlyData(statsData.monthlyTrend || []);
                setDocumentTypes(statsData.documentTypes || []);
                setRecentDocuments(recentData.data || []);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-slate-500 animate-pulse">Loading dashboard summary...</p>
            </div>
        );
    }

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
                <AnimatePresence>
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <StatCard {...stat} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Monthly Trend */}
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Monthly Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {monthlyData.length > 0 ? (
                            <ChartLine
                                data={monthlyData}
                                height={280}
                                color="#635BFF"
                                gradientColor="#818CF8"
                            />
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-slate-400">
                                No data available for this period
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Document Distribution */}
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Document Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {documentTypes.length > 0 ? (
                            <ChartPie
                                data={documentTypes}
                                height={280}
                            />
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-slate-400">
                                No documents yet
                            </div>
                        )}
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
                    {recentDocuments.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left px-3 md:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                Document
                                            </th>
                                            <th className="text-left px-3 md:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                                                Type
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
                                            const status = statusConfig[doc.status as keyof typeof statusConfig] || statusConfig.pending;
                                            return (
                                                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-medium text-slate-900">{doc.displayId}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className="capitalize">
                                                            {doc.type}
                                                        </Badge>
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
                                    const status = statusConfig[doc.status as keyof typeof statusConfig] || statusConfig.pending;
                                    return (
                                        <div key={doc.id} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 truncate">{doc.displayId}</p>
                                                    <Badge variant="outline" className="mt-1 text-[10px] h-4 capitalize">
                                                        {doc.type}
                                                    </Badge>
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
                        </>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                            <FileText className="h-12 w-12 text-slate-200 mb-4" />
                            <p>No recent documents found</p>
                            <Link href="/upload" className="mt-4">
                                <Button variant="outline" size="sm">Upload your first document</Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
