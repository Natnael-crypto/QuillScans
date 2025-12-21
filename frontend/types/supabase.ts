export interface DbInvoiceAddress {
    id: string;
    invoice_id: string;
    contact_id?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
}

export interface DbInvoiceContact {
    id: string;
    invoice_id: string;
    user_id: string;
    type: 'sender' | 'recipient';
    name: string;
    email: string;
    phone?: string;
    tax_id?: string;
    invoice_addresses?: DbInvoiceAddress | DbInvoiceAddress[];
}

export interface DbInvoiceTotals {
    id: string;
    invoice_id: string;
    subtotal: number;
    tax_total: number;
    discount_total?: number;
    grand_total: number;
    currency: string;
}

export interface DbInvoiceItem {
    id: string;
    invoice_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    discount?: number;
    tax_rate?: number;
    amount: number;
}

export type DbInvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface DbInvoice {
    id: string;
    user_id: string;
    invoice_number: string;
    issued_at: string;
    due_date: string;
    paid_at?: string;
    status: DbInvoiceStatus;
    memo?: string;
    internal_note?: string;
    external_id?: string;
    metadata?: Record<string, unknown>;
    sender?: DbInvoiceContact | DbInvoiceContact[];
    recipient?: DbInvoiceContact | DbInvoiceContact[];
    contacts?: DbInvoiceContact[];
    totals?: DbInvoiceTotals | DbInvoiceTotals[];
    items?: DbInvoiceItem[];
}

export type DbPOSStatus = 'completed' | 'voided' | 'returned';

export interface DbPOSTransaction {
    id: string;
    user_id: string;
    transaction_id: string;
    timestamp: string;
    terminal_id: string;
    store_id: string;
    cashier_id: string;
    cashier_name: string;
    shift_id?: string;
    subtotal: number;
    discounts_total: number;
    grand_total: number;
    currency: string;
    change_due: number;
    customer_loyalty_id?: string;
    status: DbPOSStatus;
    metadata?: Record<string, unknown>;
    created_at: string;
    store_address?: DbInvoiceAddress | DbInvoiceAddress[];
    customer?: DbInvoiceContact | DbInvoiceContact[];
    items?: DbPOSItem[];
    tax_lines?: DbPOSTaxLine[];
    payments?: DbPOSPayment[];
}

export interface DbPOSItem {
    id: string;
    pos_transaction_id: string;
    description: string;
    sku?: string;
    barcode?: string;
    quantity: number;
    unit_price: number;
    discount: number;
    tax_rate: number;
    amount: number;
    created_at: string;
}

export interface DbPOSTaxLine {
    id: string;
    pos_transaction_id: string;
    label: string;
    rate: number;
    amount: number;
}

export interface DbPOSPayment {
    id: string;
    pos_transaction_id: string;
    method: string;
    provider?: string;
    transaction_reference: string;
    last4?: string;
    auth_code?: string;
    amount_paid: number;
    created_at: string;
}

export type DbReceiptStatus = 'completed' | 'refunded' | 'partially_refunded';

export interface DbReceipt {
    id: string;
    user_id: string;
    receipt_number: string;
    invoice_reference_id?: string;
    transaction_date: string;
    subtotal: number;
    tax_total: number;
    tip: number;
    grand_total: number;
    currency: string;
    status: DbReceiptStatus;
    barcode_url?: string;
    metadata?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    merchant?: DbInvoiceContact | DbInvoiceContact[];
    customer?: DbInvoiceContact | DbInvoiceContact[];
    items?: DbReceiptItem[];
    payments?: DbReceiptPayment[];
}

export interface DbReceiptItem {
    id: string;
    receipt_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    discount: number;
    tax_rate: number;
    amount: number;
    created_at: string;
}

export interface DbReceiptPayment {
    id: string;
    receipt_id: string;
    method: string;
    provider?: string;
    transaction_reference: string;
    last4?: string;
    auth_code?: string;
    created_at: string;
}


