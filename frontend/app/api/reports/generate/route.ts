import { NextRequest, NextResponse } from 'next/server';
import { getUserAndSupabase } from '@/lib/supabaseServer';
import { getAuthCookies } from '@/lib/auth/cookies';
import {
    DbInvoice,
    DbInvoiceContact,
    DbInvoiceAddress,
    DbInvoiceItem,
    DbInvoiceTotals,
    DbReceipt,
    DbReceiptItem,
    DbReceiptPayment,
    DbPOSTransaction,
    DbPOSItem,
    DbPOSTaxLine,
    DbPOSPayment
} from '@/types/supabase';

export const dynamic = 'force-dynamic';

function escapeCsv(value: string | number | boolean | null | undefined): string {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // Escape quotes and wrap in quotes if contains comma, quote or newline
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

// Helper to format address
const formatAddress = (addr: DbInvoiceAddress | DbInvoiceAddress[] | undefined | null): string => {
    if (!addr) return '';
    const a = Array.isArray(addr) ? addr[0] : addr;
    if (!a) return '';
    const parts = [a.line1, a.line2, a.city, a.state, a.postal_code, a.country].filter(Boolean);
    return parts.join(', ');
};

export async function POST(request: NextRequest) {
    try {
        const { accessToken } = await getAuthCookies();
        if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { supabase, user } = await getUserAndSupabase(accessToken);
        const body = await request.json();
        const { type, from, to } = body;

        if (!type || !['invoices', 'receipts', 'pos'].includes(type)) {
            return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
        }

        let csvContent = '';
        const filename = `report-${type}-${new Date().toISOString().split('T')[0]}.csv`;

        if (type === 'invoices') {
            let query = supabase
                .from('invoices')
                .select(`
                    id,
                    invoice_number,
                    issued_at,
                    due_date,
                    paid_at,
                    status,
                    memo,
                    contacts:invoice_contacts(
                        type, 
                        name, 
                        email, 
                        phone, 
                        tax_id, 
                        invoice_addresses(line1, line2, city, state, postal_code, country)
                    ),
                    totals:invoice_totals(subtotal, tax_total, discount_total, grand_total, currency),
                    items:invoice_items(*)
                `)
                .eq('user_id', user.id);

            if (from) query = query.gte('issued_at', from);
            if (to) query = query.lte('issued_at', to);

            const { data: invoices, error } = await query;
            if (error) throw error;

            // Header
            csvContent += [
                'Invoice Number', 'Issued Date', 'Due Date', 'Paid Date', 'Status', 'Currency',
                'Sender Name', 'Sender Email', 'Sender Phone', 'Sender Tax ID', 'Sender Address',
                'Recipient Name', 'Recipient Email', 'Recipient Phone', 'Recipient Tax ID', 'Recipient Address',
                'Item Description', 'Item Quantity', 'Item Unit Price', 'Item Tax Rate', 'Item Discount', 'Item Amount',
                'Subtotal', 'Tax Total', 'Discount Total', 'Grand Total', 'Memo'
            ].join(',') + '\n';

            // Rows
            for (const inv of ((invoices as unknown) as DbInvoice[] || [])) {
                // Filter contacts
                const contacts = (inv.contacts as DbInvoiceContact[]) || [];
                const sender = contacts.find((c) => c.type === 'sender');
                const recipient = contacts.find((c) => c.type === 'recipient');

                // Format addresses
                const senderAddr = formatAddress(sender?.invoice_addresses);
                const recipientAddr = formatAddress(recipient?.invoice_addresses);

                const totals = (Array.isArray(inv.totals) ? inv.totals[0] : inv.totals) as DbInvoiceTotals | undefined;
                const items = (inv.items && inv.items.length > 0 ? inv.items : [{}]) as DbInvoiceItem[];

                // Fallback currency
                const currency = totals?.currency || 'USD';

                // Aggregate Items
                const itemDescriptions = items.map((i: DbInvoiceItem) => i.description || '').join('; ');
                const itemQuantities = items.map((i: DbInvoiceItem) => i.quantity || 0).join('; ');
                const itemUnitPrices = items.map((i: DbInvoiceItem) => i.unit_price || 0).join('; ');
                const itemTaxRates = items.map((i: DbInvoiceItem) => i.tax_rate || 0).join('; ');
                const itemDiscounts = items.map((i: DbInvoiceItem) => i.discount || 0).join('; ');
                const itemAmounts = items.map((i: DbInvoiceItem) => i.amount || 0).join('; ');

                const row = [
                    inv.invoice_number,
                    inv.issued_at,
                    inv.due_date,
                    inv.paid_at,
                    inv.status,
                    currency,
                    sender?.name,
                    sender?.email,
                    sender?.phone,
                    sender?.tax_id,
                    senderAddr,
                    recipient?.name,
                    recipient?.email,
                    recipient?.phone,
                    recipient?.tax_id,
                    recipientAddr,
                    itemDescriptions,
                    itemQuantities,
                    itemUnitPrices,
                    itemTaxRates,
                    itemDiscounts,
                    itemAmounts,
                    totals?.subtotal,
                    totals?.tax_total,
                    totals?.discount_total,
                    totals?.grand_total,
                    inv.memo
                ].map(escapeCsv).join(',');
                csvContent += row + '\n';
            }

        } else if (type === 'receipts') {
            let query = supabase
                .from('receipts')
                .select(`
                    id,
                    receipt_number,
                    transaction_date,
                    status,
                    currency,
                    subtotal, tax_total, tip, grand_total,
                    barcode_url,
                    merchant:invoice_contacts!receipts_merchant_contact_id_fkey(
                        name, email, phone, tax_id, 
                        invoice_addresses(line1, line2, city, state, postal_code, country)
                    ),
                    customer:invoice_contacts!receipts_customer_contact_id_fkey(
                        name, email, phone, 
                        invoice_addresses(line1, line2, city, state, postal_code, country)
                    ),
                    items:receipt_items(*),
                    payments:receipt_payments(method, provider, last4)
                `)
                .eq('user_id', user.id);

            if (from) query = query.gte('transaction_date', from);
            if (to) query = query.lte('transaction_date', to);

            const { data: receipts, error } = await query;
            if (error) throw error;

            // Header
            csvContent += [
                'Receipt Number', 'Transaction Date', 'Status', 'Currency',
                'Merchant Name', 'Merchant Email', 'Merchant Tax ID', 'Merchant Address',
                'Customer Name', 'Customer Email', 'Customer Address',
                'Payment Methods',
                'Item Description', 'Item Quantity', 'Item Unit Price', 'Item Discount', 'Item Tax Rate', 'Item Amount',
                'Subtotal', 'Tax Total', 'Tip', 'Grand Total', 'Barcode URL'
            ].join(',') + '\n';

            // Rows
            for (const rec of ((receipts as unknown) as DbReceipt[] || [])) {
                const merchant = (Array.isArray(rec.merchant) ? rec.merchant[0] : rec.merchant) as DbInvoiceContact | undefined;
                const customer = (Array.isArray(rec.customer) ? rec.customer[0] : rec.customer) as DbInvoiceContact | undefined;

                const merchantAddr = formatAddress(merchant?.invoice_addresses);
                const customerAddr = formatAddress(customer?.invoice_addresses);

                const items = (rec.items && rec.items.length > 0 ? rec.items : [{}]) as DbReceiptItem[];

                // Format payments - receipt_payments is 1:1 so it returns an object, not array
                let paymentMethods = '';
                if (rec.payments) {
                    const p = (Array.isArray(rec.payments) ? rec.payments[0] : rec.payments) as DbReceiptPayment;
                    if (p) {
                        paymentMethods = `${p.method}${p.last4 ? ` (*${p.last4})` : ''}`;
                    }
                }

                // Aggregate Items
                const itemDescriptions = items.map((i: DbReceiptItem) => i.description || '').join('; ');
                const itemQuantities = items.map((i: DbReceiptItem) => i.quantity || 0).join('; ');
                const itemUnitPrices = items.map((i: DbReceiptItem) => i.unit_price || 0).join('; ');
                const itemDiscounts = items.map((i: DbReceiptItem) => i.discount || 0).join('; ');
                const itemTaxRates = items.map((i: DbReceiptItem) => i.tax_rate || 0).join('; ');
                const itemAmounts = items.map((i: DbReceiptItem) => i.amount || 0).join('; ');

                const row = [
                    rec.receipt_number,
                    rec.transaction_date,
                    rec.status,
                    rec.currency,
                    merchant?.name,
                    merchant?.email,
                    merchant?.tax_id,
                    merchantAddr,
                    customer?.name,
                    customer?.email,
                    customerAddr,
                    paymentMethods,
                    itemDescriptions,
                    itemQuantities,
                    itemUnitPrices,
                    itemDiscounts,
                    itemTaxRates,
                    itemAmounts,
                    rec.subtotal,
                    rec.tax_total,
                    rec.tip,
                    rec.grand_total,
                    rec.barcode_url
                ].map(escapeCsv).join(',');
                csvContent += row + '\n';
            }

        } else if (type === 'pos') {
            let query = supabase
                .from('pos_transactions')
                .select(`
                    id,
                    transaction_id,
                    timestamp,
                    status,
                    currency,
                    store_id,
                    terminal_id,
                    cashier_name,
                    change_due,
                    store_address:invoice_addresses!pos_transactions_store_address_id_fkey(
                        line1, line2, city, state, postal_code, country
                    ),
                    customer:invoice_contacts(name, email, phone),
                    subtotal, discounts_total, grand_total,
                    items:pos_items(*),
                    tax_lines:pos_tax_lines(label, rate, amount),
                    payments:pos_payments(method, amount_paid)
                `)
                .eq('user_id', user.id);

            if (from) query = query.gte('timestamp', from);
            if (to) query = query.lte('timestamp', to);

            const { data: posTransactions, error } = await query;
            if (error) throw error;

            // Header
            csvContent += [
                'Transaction ID', 'Timestamp', 'Status', 'Currency',
                'Store ID', 'Store Address', 'Terminal ID', 'Cashier',
                'Customer Name', 'Customer Email',
                'Payment Methods',
                'Item Description', 'SKU', 'Barcode', 'Item Quantity', 'Item Unit Price', 'Item Discount', 'Item Tax Rate', 'Item Amount',
                'Subtotal', 'Discounts Total', 'Tax Total', 'Grand Total', 'Change Due'
            ].join(',') + '\n';

            // Rows
            for (const pos of ((posTransactions as unknown) as DbPOSTransaction[] || [])) {
                const customer = (Array.isArray(pos.customer) ? pos.customer[0] : pos.customer) as DbInvoiceContact | undefined;
                const storeAddr = formatAddress(pos.store_address);
                const items = (pos.items && pos.items.length > 0 ? pos.items : [{}]) as DbPOSItem[];

                // Calculate tax total from lines if needed, or if stored? 
                // Schema doesn't have tax_total column on pos_transactions directly? 
                // Ah, check schema: 'subtotal numeric...', 'discounts_total...', 'grand_total...'. No explicit 'tax_total' column on parent.
                // We sum tax_lines.
                const taxTotal = pos.tax_lines ? (pos.tax_lines as DbPOSTaxLine[]).reduce((sum: number, line: DbPOSTaxLine) => sum + (line.amount || 0), 0) : 0;

                const payments = Array.isArray(pos.payments) ? (pos.payments as DbPOSPayment[]).map((p: DbPOSPayment) =>
                    `${p.method} (${p.amount_paid})`
                ).join('; ') : (pos.payments ? `${(pos.payments as DbPOSPayment).method} (${(pos.payments as DbPOSPayment).amount_paid})` : '');

                // Aggregate Items
                const itemDescriptions = items.map((i: DbPOSItem) => i.description || '').join('; ');
                const itemSkus = items.map((i: DbPOSItem) => i.sku || '').join('; ');
                const itemBarcodes = items.map((i: DbPOSItem) => i.barcode || '').join('; ');
                const itemQuantities = items.map((i: DbPOSItem) => i.quantity || 0).join('; ');
                const itemUnitPrices = items.map((i: DbPOSItem) => i.unit_price || 0).join('; ');
                const itemDiscounts = items.map((i: DbPOSItem) => i.discount || 0).join('; ');
                const itemTaxRates = items.map((i: DbPOSItem) => i.tax_rate || 0).join('; ');
                const itemAmounts = items.map((i: DbPOSItem) => i.amount || 0).join('; ');

                const row = [
                    pos.transaction_id,
                    pos.timestamp,
                    pos.status,
                    pos.currency,
                    pos.store_id,
                    storeAddr,
                    pos.terminal_id,
                    pos.cashier_name,
                    customer?.name,
                    customer?.email,
                    payments,
                    itemDescriptions,
                    itemSkus,
                    itemBarcodes,
                    itemQuantities,
                    itemUnitPrices,
                    itemDiscounts,
                    itemTaxRates,
                    itemAmounts,
                    pos.subtotal,
                    pos.discounts_total,
                    taxTotal,
                    pos.grand_total,
                    pos.change_due
                ].map(escapeCsv).join(',');
                csvContent += row + '\n';
            }
        }

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error: unknown) {
        console.error('Error generating report:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
