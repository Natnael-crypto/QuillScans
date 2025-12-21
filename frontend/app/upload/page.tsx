"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    FileText,
    Receipt,
    Building2,
    ShoppingCart,
    Upload as UploadIcon,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Calendar
} from 'lucide-react';

import UploadDropzone from '@/components/UploadDropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUploadDocuments } from '@/hooks/useUploadDocuments';

interface UploadedFile {
    file: File;
}

const documentTypes = [
    { value: 'invoice', label: 'Invoice', icon: FileText, description: 'Sales invoices, bills' },
    { value: 'receipt', label: 'Receipt', icon: Receipt, description: 'Expense receipts' },
    { value: 'purchase_order', label: 'Purchase Order', icon: ShoppingCart, description: 'PO documents' },
];

export default function Upload() {
    const { mutateAsync: uploadDocuments } = useUploadDocuments();
    const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
    const [documentType, setDocumentType] = useState('');
    const [metadata, setMetadata] = useState({
        vendor: '',
        date: '',
        amount: ''
    });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [uploadComplete, setUploadComplete] = useState(false);

    const quotaUsed = 142;
    const quotaLimit = 200;
    const remainingQuota = quotaLimit - quotaUsed;

    const handleFilesSelected = (files: UploadedFile[]) => {
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0 || !documentType) return;

        if (selectedFiles.length > remainingQuota) {
            alert(`You can only upload ${remainingQuota} more documents this month.`);
            return;
        }

        setIsUploading(true);

        try {
            await uploadDocuments({
                documentType,
                files: selectedFiles.map(file => file.file),
            });
        } catch (error) {
            console.error('Upload failed:', error);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        setIsUploading(false);
        setUploadComplete(true);
    };

    const resetUpload = () => {
        setSelectedFiles([]);
        setDocumentType('');
        setMetadata({ vendor: '', date: '', amount: '' });
        setUploadProgress({});
        setUploadComplete(false);
    };

    if (uploadComplete) {
        return (
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card>
                        <CardContent className="py-12 text-center">
                            <div className="inline-flex items-center justify-center h-16 w-16 bg-emerald-100 rounded-full mb-6">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                Upload Complete!
                            </h2>
                            <p className="text-slate-500 mb-6">
                                {selectedFiles.length} document{selectedFiles.length > 1 ? 's' : ''} uploaded successfully.
                                Processing will begin shortly.
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <Button variant="outline" onClick={resetUpload}>
                                    Upload More
                                </Button>
                                <Link href="/dashboard">
                                    <Button>
                                        Go to Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Upload Documents</h1>
                <p className="text-slate-500 mt-1">
                    Upload your documents for AI-powered data extraction
                </p>
            </div>

            {/* Quota Warning */}
            {remainingQuota < 20 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"
                >
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-800">
                            Low quota remaining
                        </p>
                        <p className="text-sm text-amber-700 mt-0.5">
                            You have {remainingQuota} documents remaining this month.
                            <Link href="/billing" className="underline ml-1">
                                Upgrade your plan
                            </Link> for more.
                        </p>
                    </div>
                </motion.div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Upload Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Document Type Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Select Document Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {documentTypes.map((type) => {
                                    const Icon = type.icon;
                                    const isSelected = documentType === type.value;
                                    return (
                                        <button
                                            key={type.value}
                                            onClick={() => setDocumentType(type.value)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                                ? 'border-primary bg-primary/5'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                                            <p className={`font-medium ${isSelected ? 'text-primary' : 'text-slate-900'}`}>
                                                {type.label}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">{type.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* File Upload */}
                    <Card>
                        <CardHeader>
                            <CardTitle>2. Upload Files</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <UploadDropzone
                                onFilesSelected={handleFilesSelected}
                                disabled={!documentType}
                                maxFiles={Math.min(10, remainingQuota)}
                            />
                        </CardContent>
                    </Card>


                </div>

                {/* Summary Sidebar */}
                <div>
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Upload Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Document Type</span>
                                <span className="text-sm font-medium text-slate-900">
                                    {documentType ? documentTypes.find(t => t.value === documentType)?.label : '-'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Files Selected</span>
                                <span className="text-sm font-medium text-slate-900">
                                    {selectedFiles.length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Quota Usage</span>
                                <span className="text-sm font-medium text-slate-900">
                                    {quotaUsed + selectedFiles.length}/{quotaLimit}
                                </span>
                            </div>

                            {/* Progress */}
                            {isUploading && (
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-sm font-medium text-slate-700 mb-3">Uploading...</p>
                                    <div className="space-y-2">
                                        {selectedFiles.map((file) => (
                                            <div key={file.file.name} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-600 truncate">{file.file.name}</span>
                                                    <span className="text-slate-500">{uploadProgress[file.file.name] || 0}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-accent rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress[file.file.name] || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={handleUpload}
                                disabled={selectedFiles.length === 0 || !documentType || isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <UploadIcon className="h-4 w-4 mr-2" />
                                        Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}