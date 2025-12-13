'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const stats = [
    { label: 'Documents Processed', value: '2M+' },
    { label: 'Time Saved Monthly', value: '10k hrs' },
    { label: 'Accuracy Rate', value: '99.2%' },
];

const trustedBy = [
    'Stripe', 'Shopify', 'Notion', 'Webflow', 'Linear', 'Figma'
];

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-slate-900 to-primary" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Rating Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 text-accent fill-accent" />
                                ))}
                            </div>
                            <span className="text-white/80 text-sm">2,000+ reviews</span>
                        </div>

                        <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6">
                            Time is money.
                            <br />
                            <span className="text-accent">Save both.</span>
                        </h1>

                        <p className="text-xl text-white/70 mb-8 max-w-lg">
                            Easy-to-use document automation, data extraction, and accounting workflows. All in one place.
                        </p>

                        {/* CTA Section */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="flex-1 max-w-md">
                                <div className="flex bg-white rounded-xl p-1.5">
                                    <input
                                        type="email"
                                        placeholder="What's your work email?"
                                        className="flex-1 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                                    />
                                    <Link href="/dashboard">
                                        <Button>
                                            Get started for free
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="#features"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                        >
                            Explore product
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Right Content - Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative">
                            {/* Main Dashboard Card */}
                            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                <div className="h-8 bg-slate-100 flex items-center gap-2 px-4">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="p-6">
                                    <div className="h-8 bg-slate-200 rounded-lg w-32 mb-4" />
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="h-20 bg-slate-100 rounded-xl" />
                                        ))}
                                    </div>
                                    <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl" />
                                </div>
                            </div>

                            {/* Floating Stats Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="absolute -left-8 top-20 bg-white rounded-xl shadow-lg p-4 transform -rotate-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Documents Today</p>
                                        <p className="text-lg font-bold text-slate-900">127</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Chart Card */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="absolute -right-4 bottom-10 bg-white rounded-xl shadow-lg p-4 transform rotate-2"
                            >
                                <div className="text-xs text-slate-500 mb-2">Monthly Trend</div>
                                <div className="flex items-end gap-1 h-12">
                                    {[40, 60, 45, 80, 65, 90, 75].map((h, i) => (
                                        <div
                                            key={i}
                                            className="w-3 bg-accent rounded-t"
                                            style={{ height: `${h}%` }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Trusted By Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-20 text-center"
                >
                    <p className="text-white/50 text-sm mb-6">
                        45,000+ finance teams have saved millions of hours
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                        {trustedBy.map((company) => (
                            <span
                                key={company}
                                className="text-white/40 font-semibold text-lg hover:text-white/60 transition-colors"
                            >
                                {company}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
