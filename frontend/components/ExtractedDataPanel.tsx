
import React from 'react';
import {
    Loader2,
    CreditCard,
    Receipt as ReceiptIcon,
    Building2,
    User
} from "lucide-react";
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ExtractedData, DocumentType } from "@/types/document";
import { Invoice, Address } from "@/types/invoice";
import { Receipt } from "@/types/receipt";
import { POSTransaction } from "@/types/pos";

interface ExtractedDataPanelProps {
    data: ExtractedData | Invoice | Receipt | POSTransaction;
    documentType?: DocumentType | 'pos';
    onSave?: (data: Invoice | Receipt | POSTransaction) => Promise<void>;
    onRegenerate?: () => void;
    isLoading?: boolean;
    isSaving?: boolean;
}

const FormatCurrency = ({ value, currency = 'USD' }: { value: number | undefined, currency?: string }) => {
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(value || 0);
    return <span className="font-mono font-medium">{formatted}</span>;
};

const AddressDisplay = ({ address }: { address?: Address }) => {
    if (!address) return <span className="text-slate-400 italic">No address</span>;
    return (
        <div className="text-sm text-slate-600">
            <div>{address.line1}</div>
            {address.line2 && <div>{address.line2}</div>}
            <div>{address.city}, {address.state} {address.postalCode}</div>
            <div>{address.country}</div>
        </div>
    );
};

// --- INVOICE COMPONENT ---
const InvoicePanel = ({ data }: { data: Invoice }) => {
    return (
        <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-3 text-slate-500">
                        <Building2 className="h-4 w-4" />
                        <h4 className="text-sm font-semibold uppercase tracking-wider">From (Sender)</h4>
                    </div>
                    <div className="font-medium text-slate-900">{data.sender?.name}</div>
                    <div className="text-sm text-slate-500 mb-2">{data.sender?.email}</div>
                    <AddressDisplay address={data.sender?.address} />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-3 text-slate-500">
                        <User className="h-4 w-4" />
                        <h4 className="text-sm font-semibold uppercase tracking-wider">To (Recipient)</h4>
                    </div>
                    <div className="font-medium text-slate-900">{data.recipient?.name}</div>
                    <div className="text-sm text-slate-500 mb-2">{data.recipient?.email}</div>
                    <AddressDisplay address={data.recipient?.address} />
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-slate-100 rounded-xl">
                <div>
                    <label className="text-xs text-slate-500 uppercase">Invoice #</label>
                    <div className="font-medium">{data.invoiceNumber}</div>
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase">Issued Date</label>
                    <div className="font-medium">{new Date(data.issuedAt).toLocaleDateString()}</div>
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase">Due Date</label>
                    <div className="font-medium">{new Date(data.dueDate).toLocaleDateString()}</div>
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase">Status</label>
                    <div className="capitalize">{data.status}</div>
                </div>
            </div>

            {/* Line Items */}
            <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Line Items</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Description</th>
                                <th className="px-4 py-2 text-right font-medium">Qty</th>
                                <th className="px-4 py-2 text-right font-medium">Price</th>
                                <th className="px-4 py-2 text-right font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.items?.map((item, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2">{item.description}</td>
                                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                                    <td className="px-4 py-2 text-right"><FormatCurrency value={item.unitPrice} currency={data.totals?.currency} /></td>
                                    <td className="px-4 py-2 text-right font-medium"><FormatCurrency value={item.amount} currency={data.totals?.currency} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <FormatCurrency value={data.totals?.subtotal} currency={data.totals?.currency} />
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Tax</span>
                        <FormatCurrency value={data.totals?.taxTotal} currency={data.totals?.currency} />
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Discount</span>
                        <span className="text-green-600">-<FormatCurrency value={data.totals?.discountTotal} currency={data.totals?.currency} /></span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2">
                        <span>Total</span>
                        <FormatCurrency value={data.totals?.grandTotal} currency={data.totals?.currency} />
                    </div>
                </div>
            </div>

            {data.memo && (
                <div className="bg-amber-50 text-amber-900 p-3 rounded-lg text-sm border border-amber-100">
                    <strong>Memo:</strong> {data.memo}
                </div>
            )}
        </div>
    );
};

// --- RECEIPT COMPONENT ---
const ReceiptPanel = ({ data }: { data: Receipt }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-3 text-slate-500">
                        <Building2 className="h-4 w-4" />
                        <h4 className="text-sm font-semibold uppercase tracking-wider">Merchant</h4>
                    </div>
                    <div className="font-medium text-slate-900">{data.merchant?.name}</div>
                    <div className="text-sm text-slate-500 mb-2">{data.merchant?.email}</div>
                    <AddressDisplay address={data.merchant?.address} />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-3 text-slate-500">
                        <User className="h-4 w-4" />
                        <h4 className="text-sm font-semibold uppercase tracking-wider">Customer</h4>
                    </div>
                    <div className="font-medium text-slate-900">{data.customer?.name}</div>
                    <div className="text-sm text-slate-500 mb-2">{data.customer?.email}</div>
                    <AddressDisplay address={data.customer?.address} />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-slate-100 rounded-xl">
                <div>
                    <label className="text-xs text-slate-500 uppercase">Receipt #</label>
                    <div className="font-medium">{data.receiptNumber}</div>
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase">Date</label>
                    <div className="font-medium">{new Date(data.transactionDate).toLocaleDateString()}</div>
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase">Time</label>
                    <div className="font-medium">{new Date(data.transactionDate).toLocaleTimeString()}</div>
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase">Status</label>
                    <div className="capitalize">{data.status}</div>
                </div>
            </div>

            {/* Line Items */}
            <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Items</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Description</th>
                                <th className="px-4 py-2 text-right font-medium">Qty</th>
                                <th className="px-4 py-2 text-right font-medium">Price</th>
                                <th className="px-4 py-2 text-right font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.items?.map((item, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2">{item.description}</td>
                                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                                    <td className="px-4 py-2 text-right"><FormatCurrency value={item.unitPrice} currency={data.currency} /></td>
                                    <td className="px-4 py-2 text-right font-medium"><FormatCurrency value={item.amount} currency={data.currency} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Totals & Payment */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    {data.payment && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> Payment Info
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-slate-500">Method:</span>
                                <span>{data.payment.method}</span>
                                <span className="text-slate-500">Card:</span>
                                <span>{data.payment.provider} •••• {data.payment.last4}</span>
                                <span className="text-slate-500">Auth Code:</span>
                                <span className="font-mono">{data.payment.authCode}</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <FormatCurrency value={data.subtotal} currency={data.currency} />
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Tax</span>
                        <FormatCurrency value={data.taxTotal} currency={data.currency} />
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Tip</span>
                        <FormatCurrency value={data.tip} currency={data.currency} />
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2">
                        <span>Total</span>
                        <FormatCurrency value={data.grandTotal} currency={data.currency} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- POS COMPONENT ---
const POSPanel = ({ data }: { data: POSTransaction }) => {
    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <div>
                    <label className="text-xs text-slate-500 uppercase">Transaction ID</label>
                    <div className="font-mono text-sm">{data.transactionId}</div>
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase">Terminal / Store</label>
                    <div className="text-sm">{data.terminalId} / {data.storeId}</div>
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase">Cashier</label>
                    <div className="text-sm">{data.cashierName} ({data.cashierId})</div>
                </div>
                <div>
                    <label className="text-xs text-slate-500 uppercase">Time</label>
                    <div className="text-sm">{new Date(data.timestamp).toLocaleString()}</div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Store Address */}
                <div className="p-4 border border-slate-100 rounded-xl">
                    <h4 className="font-semibold text-sm mb-2 text-slate-700">Store Location</h4>
                    <AddressDisplay address={data.storeAddress} />
                </div>
                {/* Customer */}
                <div className="p-4 border border-slate-100 rounded-xl gap-6">
                    <h4 className="font-semibold text-sm mb-2 text-slate-700">Customer</h4>
                    {data.customer ? (
                        <>
                            <div>{data.customer.name}</div>
                            <div className="text-sm text-slate-500">{data.customer.email}</div>
                            {data.customerLoyaltyId && (
                                <div className="mt-2 text-xs bg-purple-50 text-purple-700 inline-block px-2 py-1 rounded">
                                    Loyalty ID: {data.customerLoyaltyId}
                                </div>
                            )}
                        </>
                    ) : (
                        <span className="italic text-slate-400">Walk-in Customer</span>
                    )}
                </div>
            </div>

            {/* Items */}
            <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Purchased Items</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Item</th>
                                <th className="px-4 py-2 text-left font-medium">SKU</th>
                                <th className="px-4 py-2 text-right font-medium">Qty</th>
                                <th className="px-4 py-2 text-right font-medium">Price</th>
                                <th className="px-4 py-2 text-right font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.items?.map((item, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-2 max-w-[200px] truncate" title={item.description}>{item.description}</td>
                                    <td className="px-4 py-2 font-mono text-xs text-slate-500">{item.sku}</td>
                                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                                    <td className="px-4 py-2 text-right"><FormatCurrency value={item.unitPrice} currency={data.currency} /></td>
                                    <td className="px-4 py-2 text-right font-medium"><FormatCurrency value={item.amount} currency={data.currency} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Financials Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Detailed Tax Breakdown</h4>
                    <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                        {data.taxLines?.map((tax, i) => (
                            <div key={i} className="flex justify-between">
                                <span className="text-slate-600">{tax.label} ({tax.rate}%)</span>
                                <FormatCurrency value={tax.amount} currency={data.currency} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <FormatCurrency value={data.subtotal} currency={data.currency} />
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Discounts</span>
                        <span className="text-green-600">-<FormatCurrency value={data.discountsTotal} currency={data.currency} /></span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2">
                        <span>Grand Total</span>
                        <FormatCurrency value={data.grandTotal} currency={data.currency} />
                    </div>
                    <div className="flex justify-between text-sm text-slate-500 pt-1">
                        <span>Change Due</span>
                        <FormatCurrency value={data.changeDue} currency={data.currency} />
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function ExtractedDataPanel({
    data,
    documentType = 'invoice',
    onRegenerate,
    isLoading = false
}: {
    data: ExtractedData | Invoice | Receipt | POSTransaction;
    documentType?: DocumentType | 'pos';
    onRegenerate?: () => void;
    isLoading?: boolean;
}) {

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-accent animate-spin mb-4" />
                    <p className="text-slate-500">Extracting data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        {documentType === 'invoice' && <ReceiptIcon className="h-5 w-5" />}
                        {documentType === 'receipt' && <ReceiptIcon className="h-5 w-5" />}
                        {documentType === 'pos' && <CreditCard className="h-5 w-5" />}
                        Extracted Data
                    </h3>
                    <Badge variant={'secondary'} className="capitalize">
                        {documentType?.replace('_', ' ')}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onRegenerate}>
                        Regenerate
                    </Button>
                </div>
            </div>

            {/* Content Switcher */}
            <div className="p-6">
                {documentType === 'invoice' && <InvoicePanel data={data as Invoice} />}
                {documentType === 'receipt' && <ReceiptPanel data={data as Receipt} />}
                {(documentType === 'pos' || (documentType as string) === 'pos_transaction') && <POSPanel data={data as POSTransaction} />}
                {/* Fallback for others currently just dumping generic view or standard invoice view if compatible */}
                {!['invoice', 'receipt', 'pos'].includes(documentType) && (
                    <div className="text-center py-12 text-slate-500">
                        Generic view not yet implemented for {documentType}
                    </div>
                )}
            </div>
        </div>
    );
}
