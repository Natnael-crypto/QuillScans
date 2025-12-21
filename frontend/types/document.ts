
export type DocumentStatus = 'processed' | 'processing' | 'failed' | 'pending';


export interface BaseDocument {
    id: string;
    date: string;
    amount: number;
    currency: string;
    status: DocumentStatus;
    documentNumber?: string;
    fileUrl?: string;
}

export interface Invoice extends BaseDocument {
    customer: string;
    dueDate?: string;
}

export interface PurchaseOrder extends BaseDocument {
    vendor: string;
}

export interface Receipt extends BaseDocument {
    vendor: string;
    category?: string;
    paymentMethod?: string;
}

export interface BankStatement extends BaseDocument {
    vendor: string; // usually the bank name
    periodStart?: string;
    periodEnd?: string;
}

export type AnyDocument = Invoice | PurchaseOrder | Receipt | BankStatement;

export interface LineItem {
    description?: string;
    quantity?: number;
    unitPrice?: number;
    total?: number;
    [key: string]: unknown;
}

export interface ExtractedData {
    // Common fields
    invoiceNumber?: string;
    receiptNumber?: string;
    date?: string;
    dueDate?: string;
    customer?: string;
    vendor?: string;
    category?: string;
    paymentMethod?: string;
    subtotal?: number;
    tax?: number;
    total?: number;
    currency?: string;
    confidence?: number;
    lineItems?: LineItem[];

    // Bank Statement / Other fields
    id?: string;
    accountNumber?: string;
    statementDate?: string;
    periodStart?: string;
    periodEnd?: string;
    openingBalance?: number;
    closingBalance?: number;
    poNumber?: string;
    deliveryDate?: string;

    // Index signature for flexibility
    [key: string]: unknown;
}

export type DocumentType = 'invoice' | 'purchase_order' | 'receipt' | 'bank_statement' | 'purchaseOrder' | 'pos';
