'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, CheckCircle2, FileText, Receipt, Clock, Upload, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const stats = [
    { label: 'Documents Processed', value: '2M+' },
    { label: 'Time Saved Monthly', value: '10k hrs' },
    { label: 'Accuracy Rate', value: '99.2%' },
];

const trustedBy = [
    'Stripe', 'Shopify', 'Notion', 'Webflow', 'Linear', 'Figma'
];

export default function Hero() {
    const [view, setView] = useState<'dashboard' | 'upload'>('dashboard');

    useEffect(() => {
        const interval = setInterval(() => {
            setView(prev => prev === 'dashboard' ? 'upload' : 'dashboard');
        }, 5000);
        return () => clearInterval(interval);
    }, []);

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

                        <h2 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6">
                            Time is money.
                            <br />
                            <span className="text-accent">Save both.</span>
                        </h2>

                        <h1 className="text-[1px] text-primary/0 select-none absolute">AI Invoice & Document Scanner</h1>

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
                        <div className="relative group">
                            {/* Browser Mockup Decorative Elements */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-primary/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

                            {/* Main Browser Window */}
                            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm">
                                {/* Browser Header */}
                                <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                        <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-4 w-24 bg-slate-200 rounded-full animate-pulse" />
                                        <div className="h-4 w-4 bg-slate-200 rounded-full" />
                                    </div>
                                </div>

                                {/* Content Area - Cycles between views */}
                                <div className="p-6 h-[480px] overflow-hidden relative">
                                    <AnimatePresence mode="wait">
                                        {view === 'dashboard' ? (
                                            /* Dashboard View Mockup */
                                            <motion.div
                                                key="dashboard"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.5 }}
                                                className="space-y-6"
                                            >
                                                <div className="flex justify-between items-center mb-8">
                                                    <div className="space-y-1">
                                                        <div className="h-6 w-32 bg-slate-900/10 rounded-md" />
                                                        <div className="h-4 w-48 bg-slate-400/10 rounded-md" />
                                                    </div>
                                                    <div className="h-10 w-32 bg-primary rounded-lg shadow-lg shadow-primary/20" />
                                                </div>

                                                {/* Mini Stats */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-xl space-y-2">
                                                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <FileText className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div className="h-4 w-20 bg-blue-200/50 rounded" />
                                                        <div className="h-6 w-12 bg-blue-900/20 rounded" />
                                                    </div>
                                                    <div className="p-4 bg-purple-50/50 border border-purple-100/50 rounded-xl space-y-2">
                                                        <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                            <Clock className="h-4 w-4 text-purple-600" />
                                                        </div>
                                                        <div className="h-4 w-20 bg-purple-200/50 rounded" />
                                                        <div className="h-6 w-12 bg-purple-900/20 rounded" />
                                                    </div>
                                                </div>

                                                {/* Chart Mockup */}
                                                <div className="p-4 bg-white border border-slate-100 rounded-xl space-y-4">
                                                    <div className="h-4 w-32 bg-slate-200 rounded" />
                                                    <div className="flex items-end gap-2 h-24 pt-4">
                                                        {[40, 70, 45, 90, 65, 80, 55, 75].map((h, i) => (
                                                            <motion.div
                                                                key={i}
                                                                initial={{ height: 0 }}
                                                                animate={{ height: `${h}%` }}
                                                                transition={{ delay: 0.5 + (i * 0.1), duration: 0.8 }}
                                                                className="flex-1 bg-accent/20 rounded-t-sm relative group overflow-hidden"
                                                            >
                                                                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Table Mockup */}
                                                <div className="space-y-3">
                                                    {[1, 2].map((i) => (
                                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-100">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 bg-white rounded border border-slate-100 flex items-center justify-center">
                                                                    <Receipt className="h-4 w-4 text-slate-400" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="h-3 w-24 bg-slate-300 rounded" />
                                                                    <div className="h-2 w-16 bg-slate-200 rounded" />
                                                                </div>
                                                            </div>
                                                            <div className="h-5 w-16 bg-emerald-100 text-emerald-700 rounded-full text-[10px] flex items-center justify-center font-medium">
                                                                Processed
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            /* Upload View Mockup */
                                            <motion.div
                                                key="upload"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.5 }}
                                                className="space-y-6"
                                            >
                                                <div className="space-y-1 mb-8">
                                                    <div className="h-6 w-40 bg-slate-900/10 rounded-md" />
                                                    <div className="h-4 w-64 bg-slate-400/10 rounded-md" />
                                                </div>

                                                {/* Upload Dropzone Mockup */}
                                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/50 space-y-4">
                                                    <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                                                        <Upload className="h-8 w-8 text-primary" />
                                                    </div>
                                                    <div className="space-y-2 text-center">
                                                        <div className="h-4 w-32 bg-slate-300 rounded mx-auto" />
                                                        <div className="h-3 w-48 bg-slate-200 rounded mx-auto" />
                                                    </div>
                                                </div>

                                                {/* Document Type Selector Mockup */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[FileText, Receipt, Plus].map((Icon, i) => (
                                                        <div key={i} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${i === 0 ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'}`}>
                                                            <Icon className={`h-6 w-6 ${i === 0 ? 'text-primary' : 'text-slate-400'}`} />
                                                            <div className={`h-2 w-12 rounded ${i === 0 ? 'bg-primary/30' : 'bg-slate-200'}`} />
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Progress Bar Mockup */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <div className="h-3 w-20 bg-slate-300 rounded" />
                                                        <div className="h-3 w-8 bg-slate-300 rounded" />
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: "75%" }}
                                                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                                            className="h-full bg-primary"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Floating Elements for extra "wow" factor */}
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [-3, -1, -3]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute -left-12 top-1/4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/20 hidden xl:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                        <CheckCircle2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-medium">Auto-Extracted</p>
                                        <p className="text-sm font-bold text-slate-900">$2,450.00</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{
                                    y: [0, 10, 0],
                                    rotate: [2, 4, 2]
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                                className="absolute -right-8 bottom-20 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/20 hidden xl:block"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-accent" />
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Processing</p>
                                    </div>
                                    <div className="flex items-end gap-1 h-8">
                                        {[30, 60, 45, 80, 50].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: [`${h}%`, `${h + 20}%`, `${h}%`] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                                className="w-1.5 bg-accent rounded-full"
                                            />
                                        ))}
                                    </div>
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
