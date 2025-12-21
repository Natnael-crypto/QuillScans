export type ReceiptStatus = 'completed' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash' | 'paypal' | 'digital_wallet';

export interface Receipt {
    // Identification
    id: string;
    receiptNumber: string;
    userID: string;

    // Reference
    invoiceReferenceID?: string;

    // Date
    transactionDate: Date | string;

    // Parties
    merchant: ContactInfo & { address: Address };
    customer: ContactInfo & { address: Address };

    // Content
    items: ReceiptItem[];

    // Financials
    subtotal: number;
    taxTotal: number;
    tip: number;
    grandTotal: number;
    currency: string;

    // Status
    status: ReceiptStatus;

    // Additional
    barcodeUrl?: string;
    metadata?: Record<string, unknown>;
    payment?: ReceiptPayment;

    // Timestamps
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface ReceiptItem {
    id: string;
    receiptID: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    amount: number;
    createdAt: Date | string;
    [key: string]: unknown;
}

export interface ReceiptPayment {
    id: string;
    receiptID: string;
    method: PaymentMethod;
    provider?: string;
    transactionReference: string;
    last4?: string;
    authCode?: string;
    createdAt: Date | string;
}

export interface ContactInfo {
    id: string;
    invoiceID: string;
    userID: string;
    name: string;
    email: string;
    phone?: string;
    taxId?: string;
}

export interface Address {
    id: string;
    invoiceID: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
}

