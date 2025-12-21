'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
    ArrowLeft,
    Download,
    FileSpreadsheet,
    FileText,
    Loader2
} from 'lucide-react';
import DocumentViewer from '@/components/DocumentViewer';
import ExtractedDataPanel from '@/components/ExtractedDataPanel';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { DocumentType, ExtractedData } from '@/types/document';
import { Invoice } from '@/types/invoice';
import { Receipt } from '@/types/receipt';
import { POSTransaction } from '@/types/pos';
import { toast } from 'sonner';

interface SignedFile {
    signedUrl: string;
    fileName: string;
    fileType: string;
}

function DocumentDetailContent() {
    const searchParams = useSearchParams();
    const rawType = searchParams.get('type');
    const id = searchParams.get('id');

    const [documentData, setDocumentData] = useState<Invoice | Receipt | POSTransaction | null>(null);
    const [fileData, setFileData] = useState<SignedFile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getType = (t: string | null): DocumentType => {
        if (t === 'purchase_order') return 'purchaseOrder';
        if (t === 'invoice' || t === 'receipt' || t === 'pos') {
            return t;
        }
        return 'invoice';
    };

    const type = getType(rawType);

    useEffect(() => {
        if (!id || !type) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 1. Fetch Document Details
                let endpoint = '';
                switch (type) {
                    case 'invoice': endpoint = `/api/invoices/${id}`; break;
                    case 'receipt': endpoint = `/api/receipts/${id}`; break;
                    case 'pos': endpoint = `/api/pos/${id}`; break; // Handle custom 'pos' type
                    default:
                        // Fallback for POS if it comes as 'pos' type which might not be in DocumentType enum yet
                        if (rawType === 'pos') endpoint = `/api/pos/${id}`;
                        else throw new Error(`Unsupported document type: ${type}`);
                }

                const docRes = await fetch(endpoint);
                if (!docRes.ok) throw new Error('Failed to fetch document details');
                const doc = await docRes.json();
                setDocumentData(doc);

                // 2. Fetch File URL
                const fileRes = await fetch(`/api/documents/file?id=${id}&type=${type}`);

                if (fileRes.ok) {
                    const file = await fileRes.json();
                    setFileData(file);
                } else {
                    console.warn("Could not fetch file for document");
                }

            } catch (err: unknown) {
                console.error(err);
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, type, rawType]);

    const handleSave = async () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1000)),
            {
                loading: 'Saving...',
                success: 'Document updated',
                error: 'Failed to update'
            }
        );
    };

    const handleRegenerate = async () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 2000)),
            {
                loading: 'Regenerating...',
                success: 'Data regenerated',
                error: 'Failed to regenerate'
            }
        );
    };

    const handleDownloadExcel = () => {
        if (!documentData) return;

        const csvRows = [];
        const headers = [
            'Document ID', 'Type', 'Date', 'Number', 'Total', 'Currency',
            'Item Description', 'Item Quantity', 'Item Unit Price', 'Item Total', 'Item Tax',
            'Merchant/Sender', 'Customer/Recipient', 'Payment Method'
        ];
        csvRows.push(headers.join(','));

        const items = documentData.items || [];

        let date = '';
        let number = '';
        let grandTotal = 0;
        let currency = 'USD';
        let sender = '';
        let recipient = '';

        if ('invoiceNumber' in documentData) {
            // Invoice
            date = String(documentData.issuedAt);
            number = documentData.invoiceNumber;
            grandTotal = documentData.totals?.grandTotal || 0;
            currency = documentData.totals?.currency || 'USD';
            sender = documentData.sender.name;
            recipient = documentData.recipient.name;
        } else if ('receiptNumber' in documentData) {
            // Receipt
            date = String(documentData.transactionDate);
            number = documentData.receiptNumber;
            grandTotal = documentData.grandTotal;
            currency = documentData.currency;
            sender = documentData.merchant.name;
            recipient = documentData.customer.name;
        } else if ('transactionId' in documentData) {
            // POSTransaction
            date = String(documentData.timestamp);
            number = documentData.transactionId;
            grandTotal = documentData.grandTotal;
            currency = documentData.currency;
            sender = documentData.storeId;
            recipient = documentData.customer?.name || '';
        }

        const baseInfo = [
            documentData.id,
            type,
            date,
            number,
            grandTotal,
            currency
        ];

        // Payment
        let paymentMethod = '';
        if ('payments' in documentData && documentData.payments && documentData.payments.length > 0) {
            paymentMethod = documentData.payments.map((p) => p.method).join('; ');
        }

        if (items.length === 0) {
            csvRows.push([...baseInfo, '', '', '', '', '', sender, recipient, paymentMethod].map(v => `"${v}"`).join(','));
        } else {
            items.forEach((item) => {
                const row = [
                    ...baseInfo,
                    item.description,
                    item.quantity,
                    item.unitPrice,
                    item.amount,
                    item.taxRate || 0,
                    sender,
                    recipient,
                    paymentMethod
                ];
                csvRows.push(row.map(v => `"${v}"`).join(','));
            });
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document_${documentData.id || 'export'}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("CSV Downloaded");
    };

    const handleDownloadPDF = () => {
        if (fileData?.signedUrl) {
            window.open(fileData.signedUrl, '_blank');
        } else {
            toast.error("No file available to download");
        }
    };

    const getBackUrl = () => {
        if (rawType === 'pos') return 'POS';
        const typeMap: Record<string, string> = {
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
            case 'POS': return '/pos';
            case 'BankStatements': return '/bank';
            case 'PurchaseOrders': return '/orders';
            default: return '/dashboard';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !documentData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
                <p className="text-destructive font-medium">{error || "Document not found"}</p>
                <Link href={createPageUrl(getBackUrl())}>
                    <Button variant="outline">Go Back</Button>
                </Link>
            </div>
        );
    }

    // Normalize data for ExtractedDataPanel
    const getNormalizedData = (): ExtractedData => {
        if ('invoiceNumber' in documentData) {
            return {
                ...documentData,
                invoiceNumber: documentData.invoiceNumber,
                date: String(documentData.issuedAt),
                total: documentData.totals?.grandTotal,
                currency: documentData.totals?.currency,
                lineItems: documentData.items,
                vendor: documentData.sender.name,
                customer: documentData.recipient.name
            };
        } else if ('receiptNumber' in documentData) {
            return {
                ...documentData,
                receiptNumber: documentData.receiptNumber,
                date: String(documentData.transactionDate),
                total: documentData.grandTotal,
                currency: documentData.currency,
                lineItems: documentData.items,
                vendor: documentData.merchant.name,
                customer: documentData.customer.name
            };
        } else {
            return {
                ...documentData,
                date: String(documentData.timestamp),
                total: documentData.grandTotal,
                currency: documentData.currency,
                lineItems: documentData.items,
                vendor: documentData.storeId,
                customer: documentData.customer?.name
            };
        }
    };

    const extractedData = getNormalizedData();

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
                        Back to {getBackUrl()}
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <FileText className="h-6 w-6 text-slate-400" />
                        {fileData?.fileName || `${type.toUpperCase()} #${id?.slice(0, 8)}`}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleDownloadExcel}
                    >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Download CSV
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
                        fileUrl={fileData?.signedUrl || ''}
                        fileType={fileData?.fileType || 'application/pdf'}
                        fileName={fileData?.fileName || 'document'}
                        className="h-[800px]"
                    />
                </motion.div>

                {/* Data Panel & Details */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <ExtractedDataPanel
                        data={extractedData}
                        documentType={type}
                        onSave={handleSave}
                        onRegenerate={handleRegenerate}
                        isSaving={false}
                        isLoading={false}
                    />

                    {/* Detailed Information Section */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3">Detailed Information</h3>

                        {/* Validated Sections based on Type */}

                        {/* Addresses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {('sender' in documentData || 'merchant' in documentData || 'storeAddress' in documentData) && (
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">From</h4>
                                    <div className="text-sm text-slate-700">
                                        <p className="font-medium">
                                            {'sender' in documentData ? documentData.sender.name :
                                                'merchant' in documentData ? documentData.merchant.name :
                                                    documentData.storeId}
                                        </p>
                                        {formatAddress(
                                            'sender' in documentData ? documentData.sender.address :
                                                'merchant' in documentData ? documentData.merchant.address :
                                                    documentData.storeAddress
                                        )}
                                    </div>
                                </div>
                            )}

                            {('recipient' in documentData || 'customer' in documentData) && (
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">To</h4>
                                    <div className="text-sm text-slate-700">
                                        <p className="font-medium">
                                            {'recipient' in documentData ? documentData.recipient.name :
                                                documentData.customer?.name}
                                        </p>
                                        {formatAddress(
                                            'recipient' in documentData ? documentData.recipient.address :
                                                documentData.customer?.address
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payments (for Receipts and POS) */}
                        {'currency' in documentData && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-slate-700">Payment Details</h4>
                                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                                    {'payments' in documentData ? (
                                        documentData.payments.map((p, i: number) => (
                                            <div key={i} className="flex justify-between border-b last:border-0 border-slate-200 py-1">
                                                <span>{p.method} ({p.provider})</span>
                                                <span className="font-mono">{p.amountPaid} {documentData.currency}</span>
                                            </div>
                                        ))
                                    ) : 'grandTotal' in documentData ? (
                                        // Simple display for documents without explicit payments array if needed,
                                        // but usually we check for existence of payment field in Receipt if it had one
                                        null
                                    ) : null}
                                </div>
                            </div>
                        )}

                        {/* Tax Lines (POS) */}
                        {'taxLines' in documentData && documentData.taxLines.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-slate-700">Tax Breakdown</h4>
                                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                                    {documentData.taxLines.map((tax, i: number) => (
                                        <div key={i} className="flex justify-between py-1">
                                            <span>{tax.label} ({tax.rate}%)</span>
                                            <span className="font-mono">{tax.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Other Metadata */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {'terminalId' in documentData && (
                                <>
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 text-xs">Terminal ID</span>
                                        <span>{documentData.terminalId}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 text-xs">Cashier</span>
                                        <span>{documentData.cashierName} ({documentData.cashierId})</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 text-xs">Shift ID</span>
                                        <span>{documentData.shiftId}</span>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function formatAddress(addr: { line1: string; line2?: string; city: string; state?: string | null; postalCode: string; country: string } | null | undefined) {
    if (!addr) return null;
    return (
        <>
            <p>{addr.line1}</p>
            {addr.line2 && <p>{addr.line2}</p>}
            <p>{addr.city}, {addr.state} {addr.postalCode}</p>
            <p>{addr.country}</p>
        </>
    );
}

export default function DocumentDetail() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DocumentDetailContent />
        </Suspense>
    );
}
