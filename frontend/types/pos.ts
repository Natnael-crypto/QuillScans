export type POSStatus = 'completed' | 'voided' | 'returned';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash' | 'paypal' | 'digital_wallet';

export interface POSTransaction {
    // Identification
    id: string;
    transactionId: string;
    userID: string;

    // Date
    timestamp: Date | string;

    // POS Metadata
    terminalId: string;
    storeId: string;
    cashierId: string;
    cashierName: string;
    shiftId?: string;

    // Store Address
    storeAddress: Address;

    // Financials
    subtotal: number;
    discountsTotal: number;
    grandTotal: number;
    currency: string;
    changeDue: number;

    // Customer (optional)
    customer?: ContactInfo;
    customerLoyaltyId?: string;

    // Content
    items: POSItem[];
    taxLines: POSTaxLine[];
    payments: POSPayment[];

    // Status
    status: POSStatus;
    metadata?: Record<string, string | number | boolean>;

    // Timestamps
    createdAt: Date | string;
}

export interface POSItem {
    id: string;
    posTransactionID: string;
    description: string;
    sku?: string;
    barcode?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    amount: number;
    createdAt: Date | string;
}

export interface POSTaxLine {
    id: string;
    posTransactionID: string;
    label: string;
    rate: number;
    amount: number;
}

export interface POSPayment {
    id: string;
    posTransactionID: string;
    method: PaymentMethod;
    provider?: string;
    transactionReference: string;
    last4?: string;
    authCode?: string;
    amountPaid: number;
    createdAt: Date | string;
}

export interface Address {
    id: string;
    invoiceID: string;
    contactID: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
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
