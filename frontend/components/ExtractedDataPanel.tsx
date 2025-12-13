
import { ExtractedData, LineItem, DocumentType } from "@/types/document";


import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import {
    Edit2,
    Save,
    X,
    CheckCircle2,
    AlertCircle,
    Plus,
    Trash2,
    Loader2
} from "lucide-react";
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';




interface ExtractedDataPanelProps {
    data: ExtractedData;
    documentType?: DocumentType;

    onSave?: (data: ExtractedData) => Promise<void>;
    onRegenerate?: () => void;
    isLoading?: boolean;
    isSaving?: boolean;
}

export default function ExtractedDataPanel({
    data,
    documentType = 'invoice',
    onSave,
    onRegenerate,
    isLoading = false,
    isSaving = false
}: ExtractedDataPanelProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<ExtractedData>(data);

    const handleEdit = () => {
        setEditedData(data);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditedData(data);
        setIsEditing(false);
    };

    const handleSave = async () => {
        await onSave?.(editedData);
        setIsEditing(false);
    };

    const handleFieldChange = (field: string, value: string | number) => {
        setEditedData((prev) => ({ ...prev, [field]: value }));
    };

    const handleLineItemChange = (index: number, field: string, value: string | number) => {
        setEditedData((prev) => ({
            ...prev,
            lineItems: prev.lineItems?.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ) || []
        }));
    };

    const addLineItem = () => {
        setEditedData((prev) => ({
            ...prev,
            lineItems: [...(prev.lineItems || []), { description: '', quantity: 1, unitPrice: 0, total: 0 }]
        }));
    };

    const removeLineItem = (index: number) => {
        setEditedData((prev) => ({
            ...prev,
            lineItems: prev.lineItems?.filter((_, i) => i !== index) || []
        }));
    };

    const fieldConfig: Record<string, { key: string; label: string; type: string }[]> = {
        invoice: [
            { key: 'invoiceNumber', label: 'Invoice Number', type: 'text' },
            { key: 'date', label: 'Invoice Date', type: 'date' },
            { key: 'dueDate', label: 'Due Date', type: 'date' },
            { key: 'customer', label: 'Customer', type: 'text' },
            { key: 'subtotal', label: 'Subtotal', type: 'currency' },
            { key: 'tax', label: 'Tax', type: 'currency' },
            { key: 'total', label: 'Total', type: 'currency' },
        ],
        receipt: [
            { key: 'receiptNumber', label: 'Receipt Number', type: 'text' },
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'vendor', label: 'Vendor', type: 'text' },
            { key: 'category', label: 'Category', type: 'text' },
            { key: 'paymentMethod', label: 'Payment Method', type: 'text' },
            { key: 'total', label: 'Total', type: 'currency' },
        ],
        bankStatement: [
            { key: 'accountNumber', label: 'Account Number', type: 'text' },
            { key: 'statementDate', label: 'Statement Date', type: 'date' },
            { key: 'periodStart', label: 'Period Start', type: 'date' },
            { key: 'periodEnd', label: 'Period End', type: 'date' },
            { key: 'openingBalance', label: 'Opening Balance', type: 'currency' },
            { key: 'closingBalance', label: 'Closing Balance', type: 'currency' },
        ],
        purchaseOrder: [
            { key: 'poNumber', label: 'PO Number', type: 'text' },
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'vendor', label: 'Vendor', type: 'text' },
            { key: 'deliveryDate', label: 'Delivery Date', type: 'date' },
            { key: 'total', label: 'Total', type: 'currency' },
        ],
    };

    // Normalize snake_case to camelCase for config lookup
    const configKey = documentType === 'purchase_order' ? 'purchaseOrder' :
        documentType === 'bank_statement' ? 'bankStatement' :
            documentType;

    const fields = fieldConfig[configKey] || fieldConfig.invoice;
    const currentData = isEditing ? editedData : data;

    const formatCurrency = (value: number | undefined) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: data?.currency || 'USD',
        }).format(value || 0);
    };

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
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">Extracted Data</h3>
                    {data?.confidence && (
                        <Badge
                            variant={data.confidence > 90 ? 'success' : data.confidence > 70 ? 'warning' : 'destructive'}
                        >
                            {data.confidence}% confidence
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={onRegenerate}>
                                Regenerate
                            </Button>
                            <Button size="sm" onClick={handleEdit}>
                                <Edit2 className="h-4 w-4 mr-1" />
                                Edit
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Fields */}
            <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                    {fields.map(({ key, label, type }) => (
                        <div key={key} className={cn(type === 'currency' && 'col-span-1')}>
                            <label className="block text-sm font-medium text-slate-500 mb-1">
                                {label}
                            </label>
                            {isEditing ? (
                                <input
                                    type={type === 'date' ? 'date' : type === 'currency' ? 'number' : 'text'}
                                    value={currentData?.[key] || ''}
                                    onChange={(e) => handleFieldChange(key, e.target.value)}
                                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                                    step={type === 'currency' ? '0.01' : undefined}
                                />
                            ) : (
                                <p className="text-sm font-medium text-slate-900">
                                    {type === 'currency'
                                        ? formatCurrency(currentData?.[key])
                                        : type === 'date'
                                            ? currentData?.[key] ? new Date(currentData[key]).toLocaleDateString() : '-'
                                            : currentData?.[key] || '-'
                                    }
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Line Items */}
                {(documentType === 'invoice' || documentType === 'purchaseOrder') && currentData?.lineItems && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-slate-700">Line Items</h4>
                            {isEditing && (
                                <button
                                    onClick={addLineItem}
                                    className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Item
                                </button>
                            )}
                        </div>
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left px-4 py-2 font-medium text-slate-500">Description</th>
                                        <th className="text-right px-4 py-2 font-medium text-slate-500">Qty</th>
                                        <th className="text-right px-4 py-2 font-medium text-slate-500">Unit Price</th>
                                        <th className="text-right px-4 py-2 font-medium text-slate-500">Total</th>
                                        {isEditing && <th className="w-10"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentData.lineItems.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={item.description || ''}
                                                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                                                        className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
                                                    />
                                                ) : (
                                                    item.description
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={item.quantity || ''}
                                                        onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                                                        className="w-16 px-2 py-1 border border-slate-200 rounded text-sm text-right"
                                                    />
                                                ) : (
                                                    item.quantity
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.unitPrice || ''}
                                                        onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                                                        className="w-24 px-2 py-1 border border-slate-200 rounded text-sm text-right"
                                                    />
                                                ) : (
                                                    formatCurrency(item.unitPrice)
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right font-medium">
                                                {formatCurrency(item.total || (item.quantity || 0) * (item.unitPrice || 0))}
                                            </td>
                                            {isEditing && (
                                                <td className="px-2">
                                                    <button
                                                        onClick={() => removeLineItem(index)}
                                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}