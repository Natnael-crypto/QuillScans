import React from 'react';
import {
    FileText,
    TrendingUp,
    Calendar,
    AlertCircle,
    ArrowRight,
    Zap
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import ChartLine from '@/components/charts/ChartLine';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const dailyUsage = [
    { name: 'Jan 1', value: 12 },
    { name: 'Jan 2', value: 8 },
    { name: 'Jan 3', value: 15 },
    { name: 'Jan 4', value: 10 },
    { name: 'Jan 5', value: 22 },
    { name: 'Jan 6', value: 18 },
    { name: 'Jan 7', value: 5 },
    { name: 'Jan 8', value: 14 },
    { name: 'Jan 9', value: 20 },
    { name: 'Jan 10', value: 16 },
    { name: 'Jan 11', value: 12 },
    { name: 'Jan 12', value: 8 },
    { name: 'Jan 13', value: 6 },
    { name: 'Jan 14', value: 18 },
    { name: 'Jan 15', value: 10 },
];

const usageByType = [
    { type: 'Invoices', count: 65, percentage: 46 },
    { type: 'Receipts', count: 48, percentage: 34 },
    { type: 'Bank Statements', count: 18, percentage: 13 },
    { type: 'Purchase Orders', count: 11, percentage: 7 },
];

export default function Usage() {
    const quotaUsed = 142;
    const quotaLimit = 200;
    const remainingDays = 16;
    const renewDate = '2024-02-01';

    const percentageUsed = Math.round((quotaUsed / quotaLimit) * 100);
    const isLowQuota = quotaLimit - quotaUsed < 20;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Usage & Billing</h1>
                    <p className="text-slate-500 mt-1">Monitor your document usage and quota</p>
                </div>
                <Link href="/billing">
                    <Button>
                        <Zap className="h-4 w-4 mr-2" />
                        Upgrade Plan
                    </Button>
                </Link>
            </div>

            {/* Low Quota Warning */}
            {isLowQuota && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-amber-50 border border-amber-200 rounded-xl"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-800">Running low on documents</p>
                            <p className="text-sm text-amber-700 mt-0.5">
                                You have {quotaLimit - quotaUsed} documents remaining. Consider upgrading your plan to avoid interruptions.
                            </p>
                        </div>
                        <Link href="/billing">
                            <Button size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                                Upgrade
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Documents This Month"
                    value={quotaUsed}
                    icon={FileText}
                    iconColor="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Remaining Quota"
                    value={quotaLimit - quotaUsed}
                    icon={TrendingUp}
                    iconColor="bg-emerald-100 text-emerald-600"
                />
                <StatCard
                    title="Daily Average"
                    value={Math.round(quotaUsed / 15)}
                    icon={Calendar}
                    iconColor="bg-purple-100 text-purple-600"
                />
                <StatCard
                    title="Days Until Renewal"
                    value={remainingDays}
                    icon={Calendar}
                    iconColor="bg-orange-100 text-orange-600"
                />
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Usage Chart */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Document Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartLine
                                data={dailyUsage}
                                height={300}
                                color="#635BFF"
                                gradientColor="#818CF8"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Quota Progress */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Quota</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pt-4">
                                {/* Circular Progress */}
                                <div className="relative w-40 h-40 mx-auto">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            stroke="#E2E8F0"
                                            strokeWidth="12"
                                            fill="none"
                                        />
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            stroke={isLowQuota ? '#F59E0B' : '#635BFF'}
                                            strokeWidth="12"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 70}`}
                                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentageUsed / 100)}`}
                                            className="transition-all duration-500"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-slate-900">{percentageUsed}%</span>
                                        <span className="text-sm text-slate-500">used</span>
                                    </div>
                                </div>

                                <div className="text-center mt-4">
                                    <p className="text-lg font-semibold text-slate-900">
                                        {quotaUsed} / {quotaLimit}
                                    </p>
                                    <p className="text-sm text-slate-500">documents processed</p>
                                </div>

                                <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Renews on</span>
                                        <span className="font-medium text-slate-900">
                                            {new Date(renewDate).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage by Type */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage by Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {usageByType.map((item) => (
                                    <div key={item.type}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-slate-600">{item.type}</span>
                                            <span className="font-medium text-slate-900">{item.count}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-300"
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}