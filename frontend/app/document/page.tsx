'use client';

import React, { useState, Suspense } from 'react';
import {
    ArrowLeft,
    Download,
    FileSpreadsheet,
    FileText
} from 'lucide-react';
import DocumentViewer from '@/components/DocumentViewer';
import ExtractedDataPanel from '@/components/ExtractedDataPanel';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

import { ExtractedData, DocumentType } from '@/types/document';

// Types



interface DocumentData {
    id: string;
    fileUrl: string;
    fileType: string;
    fileName: string;
    extractedData: ExtractedData;
}

interface DocumentsMap {
    [key: string]: {
        [key: string]: DocumentData;
    };
}

// Mock document data
const mockDocuments: DocumentsMap = {
    invoice: {
        '1': {
            id: '1',
            fileUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
            fileType: 'image',
            fileName: 'Invoice-INV-2024-001.pdf',
            extractedData: {
                invoiceNumber: 'INV-2024-001',
                date: '2024-01-15',
                dueDate: '2024-02-15',
                customer: 'Acme Corporation',
                subtotal: 2200.00,
                tax: 250.00,
                total: 2450.00,
                currency: 'USD',
                confidence: 95,
                lineItems: [
                    { description: 'Web Development Services', quantity: 40, unitPrice: 50.00, total: 2000.00 },
                    { description: 'Domain Registration', quantity: 1, unitPrice: 200.00, total: 200.00 },
                ]
            }
        }
    },
    receipt: {
        '1': {
            id: '1',
            fileUrl: 'https://images.unsplash.com/photo-1572666341285-c8cb9790ca50?w=800',
            fileType: 'image',
            fileName: 'Receipt-Staples.jpg',
            extractedData: {
                receiptNumber: 'RCP-001',
                date: '2024-01-15',
                vendor: 'Staples',
                category: 'Office Supplies',
                paymentMethod: 'Credit Card',
                total: 156.99,
                currency: 'USD',
                confidence: 92,
            }
        }
    }
};



function DocumentDetailContent() {
    const searchParams = useSearchParams();
    const rawType = searchParams.get('type');

    const getType = (t: string | null): DocumentType => {
        if (t === 'bank_statement') return 'bankStatement';
        if (t === 'purchase_order') return 'purchaseOrder';
        if (t === 'invoice' || t === 'receipt' || t === 'bankStatement' || t === 'purchaseOrder') {
            return t;
        }
        return 'invoice';
    };

    const type = getType(rawType);
    const id = searchParams.get('id') || '1';

    const [isSaving, setIsSaving] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Safe access to mock data
    const document = mockDocuments[type]?.[id] || mockDocuments.invoice['1'];

    // If no document found even with fallback (unlikely with hardcoded fallback), handle gracefully
    if (!document) {
        return <div>Document not found</div>;
    }

    const handleSave = async (updatedData: ExtractedData) => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Saved:', updatedData);
        setIsSaving(false);
    };

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsRegenerating(false);
    };

    const handleDownloadExcel = () => {
        console.log('Downloading Excel...');
    };

    const handleDownloadPDF = () => {
        console.log('Downloading PDF...');
    };

    const getBackUrl = () => {
        const typeMap: Record<DocumentType, string> = {
            invoice: 'Invoices',
            receipt: 'Receipts',
            bankStatement: 'BankStatements',
            purchaseOrder: 'PurchaseOrders',
            bank_statement: 'BankStatements',
            purchase_order: 'PurchaseOrders',
        };
        return typeMap[type] || 'Dashboard';
    };

    const createPageUrl = (pageName: string) => {
        switch (pageName) {
            case 'Invoices': return '/invoices';
            case 'Receipts': return '/receipts';
            case 'BankStatements': return '/bank'; // Assuming mapping based on typical conventions
            case 'PurchaseOrders': return '/orders'; // Assuming mapping
            default: return '/dashboard';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Link
                        href={createPageUrl(getBackUrl())}
                        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to {type === 'invoice' ? 'Invoices' : type === 'receipt' ? 'Receipts' : 'Documents'}
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <FileText className="h-6 w-6 text-slate-400" />
                        {document.fileName}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleDownloadExcel}
                    >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Download Excel
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDownloadPDF}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Document Viewer */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <DocumentViewer
                        fileUrl={document.fileUrl}
                        fileType={document.fileType}
                        fileName={document.fileName}
                        className="h-[600px]"
                    />
                </motion.div>

                {/* Extracted Data */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <ExtractedDataPanel
                        data={document.extractedData}
                        documentType={type}
                        onSave={handleSave}
                        onRegenerate={handleRegenerate}
                        isSaving={isSaving}
                        isLoading={isRegenerating}
                    />
                </motion.div>
            </div>
        </div>
    );
}

export default function DocumentDetail() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DocumentDetailContent />
        </Suspense>
    );
}