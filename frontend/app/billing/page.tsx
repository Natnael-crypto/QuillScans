"use client"

import React, { useState } from 'react';
import {
    CreditCard,
    Check,
    X,
    Zap,
    FileText,
    Calendar,
    Download,
    ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const plans = [
    {
        id: 'starter',
        name: 'Starter',
        price: 5,
        documents: 200,
        features: [
            { included: true, text: '200 documents/month' },
            { included: true, text: 'All document types' },
            { included: true, text: 'Excel export' },
            { included: true, text: 'Email support' },
            { included: false, text: 'API access' },
            { included: false, text: 'Custom integrations' },
        ],
        current: true,
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 29,
        documents: 1000,
        features: [
            { included: true, text: '1,000 documents/month' },
            { included: true, text: 'All document types' },
            { included: true, text: 'Excel & PDF export' },
            { included: true, text: 'Priority support' },
            { included: true, text: 'API access' },
            { included: false, text: 'Custom integrations' },
        ],
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: null,
        documents: 'Unlimited',
        features: [
            { included: true, text: 'Unlimited documents' },
            { included: true, text: 'All document types' },
            { included: true, text: 'All export formats' },
            { included: true, text: 'Dedicated support' },
            { included: true, text: 'Full API access' },
            { included: true, text: 'Custom integrations' },
        ],
    },
];

const invoices = [
    { id: 'INV-001', date: '2024-01-01', amount: 5.00, status: 'paid' },
    { id: 'INV-002', date: '2023-12-01', amount: 5.00, status: 'paid' },
    { id: 'INV-003', date: '2023-11-01', amount: 5.00, status: 'paid' },
];

export default function Billing() {
    const [selectedPlan, setSelectedPlan] = useState('starter');
    const [isUpgrading, setIsUpgrading] = useState(false);

    const currentPlan = plans.find(p => p.current);

    const handleUpgrade = async (planId: string) => {
        setIsUpgrading(true);
        // Simulate Stripe checkout
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsUpgrading(false);
        console.log('Upgrading to:', planId);
    };

    const handleManageBilling = () => {
        console.log('Opening Stripe billing portal');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
                <p className="text-slate-500 mt-1">Manage your subscription and payment methods</p>
            </div>

            {/* Current Plan */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-slate-400" />
                        Current Plan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-accent/20 rounded-xl">
                                <Zap className="h-6 w-6 text-slate-900" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-lg text-slate-900">{currentPlan?.name} Plan</p>
                                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                                </div>
                                <p className="text-sm text-slate-500">
                                    {currentPlan?.documents} documents per month
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-2xl font-bold text-slate-900">${currentPlan?.price}</p>
                                <p className="text-sm text-slate-500">per month</p>
                            </div>
                            <Button variant="outline" onClick={handleManageBilling}>
                                Manage Billing
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span>Next billing date: February 1, 2024</span>
                    </div>
                </CardContent>
            </Card>

            {/* Plans */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Plans</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={`relative h-full ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <Badge variant="default" className="bg-primary text-white">
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}
                                <CardContent className="pt-6">
                                    <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        {plan.price ? (
                                            <>
                                                <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                                                <span className="text-slate-500">/month</span>
                                            </>
                                        ) : (
                                            <span className="text-3xl font-bold text-slate-900">Custom</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {typeof plan.documents === 'number' ? `${plan.documents} documents/mo` : plan.documents}
                                    </p>

                                    <div className="mt-6 space-y-3">
                                        {plan.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                {feature.included ? (
                                                    <Check className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <X className="h-4 w-4 text-slate-300" />
                                                )}
                                                <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                                                    {feature.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6">
                                        {plan.current ? (
                                            <Button variant="outline" className="w-full" disabled>
                                                Current Plan
                                            </Button>
                                        ) : plan.price ? (
                                            <Button
                                                className="w-full"
                                                variant={plan.popular ? 'default' : 'outline'}
                                                onClick={() => handleUpgrade(plan.id)}
                                                isLoading={isUpgrading}
                                            >
                                                Upgrade to {plan.name}
                                            </Button>
                                        ) : (
                                            <Button variant="outline" className="w-full">
                                                Contact Sales
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Billing History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-slate-400" />
                        Billing History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        Invoice
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        Date
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        Amount
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        Status
                                    </th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            {invoice.id}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(invoice.date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            ${invoice.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Paid</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                                <Download className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}