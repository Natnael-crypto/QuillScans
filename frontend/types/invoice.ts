export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface Invoice {
    // Identification
    id: string;               // Unique internal ID
    invoiceNumber: string;
    userID: string;    // Human-readable (e.g., "INV-2024-001")

    // Dates
    issuedAt: Date | string;
    dueDate: Date | string;
    paidAt?: Date | string;

    // Parties
    sender: ContactInfo & { address: Address };
    recipient: ContactInfo & { address: Address };

    // Content
    items: InvoiceItem[];
    totals: InvoiceTotals | null;

    // Status & Notes
    status: InvoiceStatus;
    memo?: string;            // Notes visible to the customer
    internalNote?: string;    // Private notes

    // Metadata for Integrations
    externalId?: string;      // ID from Stripe/QuickBooks
    metadata?: Record<string, unknown>;
}

export interface ContactInfo {
    id: string;               // Unique internal ID
    invoiceID: string;
    userID: string;
    name: string;
    email: string;
    phone?: string;
    taxId?: string; // VAT, GST, EIN, etc.
}

export interface Address {
    id: string;               // Unique internal ID
    invoiceID: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string; // ISO 3166-1 alpha-2 code recommended
}

export interface InvoiceItem {
    id: string;
    invoiceID: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number; // Represented as a percentage (e.g., 15 for 15%)
    amount: number;   // quantity * unitPrice - discount
}

export interface InvoiceTotals {
    id: string;
    invoiceID: string;
    subtotal: number;
    taxTotal: number;
    discountTotal?: number;
    grandTotal: number;
    currency: string; // e.g., 'USD', 'EUR'
}
