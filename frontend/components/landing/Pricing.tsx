'use client';

import React from 'react';
import Link from 'next/link';
import { Check, X, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const plans = [
    {
        name: 'Starter',
        description: 'Perfect for small businesses',
        price: '5',
        period: '/month',
        documents: '200 documents',
        features: [
            { included: true, text: '200 documents/month' },
            { included: true, text: 'All document types' },
            { included: true, text: 'Excel export' },
            { included: true, text: 'Email support' },
            { included: false, text: 'API access' },
            { included: false, text: 'Custom integrations' },
        ],
        cta: 'Start Free Trial',
        popular: false,
    },
    {
        name: 'Professional',
        description: 'For growing teams',
        price: '29',
        period: '/month',
        documents: '1,000 documents',
        features: [
            { included: true, text: '1,000 documents/month' },
            { included: true, text: 'All document types' },
            { included: true, text: 'Excel & PDF export' },
            { included: true, text: 'Priority support' },
            { included: true, text: 'API access' },
            { included: false, text: 'Custom integrations' },
        ],
        cta: 'Start Free Trial',
        popular: true,
    },
    {
        name: 'Enterprise',
        description: 'For large organizations',
        price: 'Custom',
        period: '',
        documents: 'Unlimited',
        features: [
            { included: true, text: 'Unlimited documents' },
            { included: true, text: 'All document types' },
            { included: true, text: 'All export formats' },
            { included: true, text: 'Dedicated support' },
            { included: true, text: 'Full API access' },
            { included: true, text: 'Custom integrations' },
        ],
        cta: 'Contact Sales',
        popular: false,
    },
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-slate-50">
            <div className="container mx-auto px-6">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-primary font-semibold text-sm uppercase tracking-wider"
                    >
                        Pricing
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4"
                    >
                        Simple, transparent pricing
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600"
                    >
                        Start free, upgrade when you need. No hidden fees.
                    </motion.p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative bg-white rounded-2xl ${plan.popular
                                ? 'ring-2 ring-primary shadow-xl scale-105'
                                : 'border border-slate-200 shadow-sm'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary text-white text-sm font-medium px-4 py-1 rounded-full flex items-center gap-1">
                                        <Zap className="h-3 w-3" />
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="p-8">
                                <h3 className="text-xl font-semibold text-slate-900 mb-1">
                                    {plan.name}
                                </h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    {plan.description}
                                </p>

                                <div className="flex items-baseline gap-1 mb-2">
                                    {plan.price !== 'Custom' && (
                                        <span className="text-slate-500">$</span>
                                    )}
                                    <span className="text-4xl font-bold text-slate-900">
                                        {plan.price}
                                    </span>
                                    <span className="text-slate-500">{plan.period}</span>
                                </div>
                                <p className="text-sm text-slate-500 mb-6">
                                    {plan.documents}
                                </p>

                                <Link href="/dashboard" className="block">
                                    <Button
                                        className="w-full"
                                        variant={plan.popular ? 'default' : 'outline'}
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>

                                <div className="mt-8 space-y-4">
                                    {plan.features.map((feature, featureIndex) => (
                                        <div
                                            key={featureIndex}
                                            className="flex items-center gap-3"
                                        >
                                            {feature.included ? (
                                                <Check className="h-5 w-5 text-emerald-500" />
                                            ) : (
                                                <X className="h-5 w-5 text-slate-300" />
                                            )}
                                            <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                                                {feature.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ Link */}
                <div className="text-center mt-12">
                    <p className="text-slate-600">
                        Have questions?{' '}
                        <a href="#" className="text-primary font-medium hover:underline">
                            Check our FAQ
                        </a>
                        {' '}or{' '}
                        <a href="#" className="text-primary font-medium hover:underline">
                            contact us
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
}