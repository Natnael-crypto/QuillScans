'use client';

import React from 'react';
import {
    Upload,
    Zap,
    FileSpreadsheet,
    Shield,
    Clock,
    BarChart3,
    ArrowRight
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';



const features = [
    {
        icon: Upload,
        title: 'Upload anything',
        description:
            'Drop invoices, receipts, or statements. PDFs, images, Word, and Excel are all supported.',
    },
    {
        icon: Zap,
        title: 'Structured automatically',
        description:
            'We read your documents and turn messy layouts into clean, usable data.',
    },
    {
        icon: FileSpreadsheet,
        title: 'Export without cleanup',
        description:
            'Download Excel files that are ready for accounting, reporting, or sharing.',
    },
    {
        icon: Clock,
        title: 'Fast by default',
        description:
            'Most documents are processed in seconds — even multi-page files.',
    },
    {
        icon: BarChart3,
        title: 'Understand your data',
        description:
            'See totals, trends, and summaries without building spreadsheets.',
    },
    {
        icon: Shield,
        title: 'Private & secure',
        description:
            'Your files are encrypted and handled with strict access controls.',
    },
];

const steps = [
    {
        number: '01',
        title: 'Upload',
        description: 'Add your documents from your device.',
    },
    {
        number: '02',
        title: 'Review',
        description: 'Check extracted fields and make quick edits if needed.',
    },
    {
        number: '03',
        title: 'Export',
        description: 'Download Excel or connect to your workflow.',
    },
];

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.06, duration: 0.45, ease: 'easeOut' },
    }),
};

export default function Features() {
    return (
        <section id="features" className="py-28 bg-white">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-sm font-medium text-primary mb-3"
                    >
                        Features
                    </motion.p>

                    <motion.h2
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl lg:text-5xl font-semibold text-slate-900 mb-5"
                    >
                        Document processing,
                        <br />
                        without the busy work
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.08 }}
                        className="text-lg text-slate-600"
                    >
                        Upload files, extract data, and export results all in one place.
                    </motion.p>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-28">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            custom={index}
                            viewport={{ once: true }}
                            className="group rounded-2xl border border-slate-200 bg-white p-7 hover:border-slate-300 hover:shadow-md transition"
                        >
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white group-hover:scale-[1.03] transition-transform">
                                <feature.icon className="h-5 w-5" />
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {feature.title}
                            </h3>

                            <p className="text-slate-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* How it works */}
                <div className="rounded-3xl bg-slate-50 px-8 py-14 lg:px-14">
                    <div className="text-center mb-14">
                        <h3 className="text-3xl font-semibold text-slate-900 mb-3">
                            How it works
                        </h3>
                        <p className="text-slate-600">
                            A simple flow that fits into your day
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                custom={index}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                {index < steps.length - 1 && (
                                    <ArrowRight className="hidden md:block absolute top-6 -right-6 h-6 w-6 text-slate-300" />
                                )}

                                <div className="bg-white rounded-2xl p-7 shadow-sm">
                                    <span className="text-sm font-medium text-primary mb-3 block">
                                        {step.number}
                                    </span>

                                    <h4 className="text-lg font-semibold text-slate-900 mb-2">
                                        {step.title}
                                    </h4>

                                    <p className="text-slate-600">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
