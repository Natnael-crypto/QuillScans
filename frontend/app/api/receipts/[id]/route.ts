import { NextRequest, NextResponse } from 'next/server';
import { getUserAndSupabase } from '@/lib/supabaseServer';
import { Receipt, ReceiptItem, ReceiptStatus, ContactInfo, Address, ReceiptPayment } from '@/types/receipt';
import { DbReceipt, DbReceiptItem, DbInvoiceContact, DbInvoiceAddress, DbReceiptPayment } from '@/types/supabase';
import { getAuthCookies } from '@/lib/auth/cookies';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { accessToken } = await getAuthCookies();
        if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { supabase, user } = await getUserAndSupabase(accessToken);
        const { id } = await params;

        const { data, error } = await supabase
            .from('receipts')
            .select(`
                *,
                items:receipt_items(*),
                payment:receipt_payments(*),
                merchant:contacts!receipts_merchant_contact_id_fkey(*, invoice_addresses:addresses(*)),
                customer:contacts!receipts_customer_contact_id_fkey(*, invoice_addresses:addresses(*))
            `)
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('Error fetching receipt:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Receipt not found ' + id }, { status: 404 });
        }

        const receipt = data as unknown as DbReceipt;

        // Map to Frontend Interface
        const formattedReceipt: Receipt = {
            id: receipt.id,
            receiptNumber: receipt.receipt_number,
            userID: receipt.user_id,
            invoiceReferenceID: receipt.invoice_reference_id,
            transactionDate: receipt.transaction_date,
            merchant: mapContact(receipt.merchant)!,
            customer: mapContact(receipt.customer)!,
            items: (receipt.items || []).map(mapItem),
            subtotal: receipt.subtotal,
            taxTotal: receipt.tax_total,
            tip: receipt.tip,
            grandTotal: receipt.grand_total,
            currency: receipt.currency,
            status: receipt.status as ReceiptStatus,
            barcodeUrl: receipt.barcode_url,
            metadata: receipt.metadata,
            payment: mapPayment(receipt.payments),
            createdAt: receipt.created_at,
            updatedAt: receipt.updated_at,
        };

        return NextResponse.json(formattedReceipt);

    } catch (error) {
        console.error('Internal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Helpers
function mapPayment(paymentData: DbReceiptPayment | DbReceiptPayment[] | undefined | null): ReceiptPayment | undefined {
    const payment = Array.isArray(paymentData) ? paymentData[0] : paymentData;
    if (!payment) return undefined;

    return {
        id: payment.id,
        receiptID: payment.receipt_id,
        method: payment.method as PaymentMethod, // Use proper type
        provider: payment.provider,
        transactionReference: payment.transaction_reference,
        last4: payment.last4,
        authCode: payment.auth_code,
        createdAt: payment.created_at,
    };
}
function mapContact(contactData: DbInvoiceContact | DbInvoiceContact[] | undefined | null): (ContactInfo & { address: Address }) | null {
    const contact = Array.isArray(contactData) ? contactData[0] : contactData;
    if (!contact) return null;

    return {
        id: contact.id,
        invoiceID: contact.invoice_id,
        userID: contact.user_id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        taxId: contact.tax_id,
        address: mapAddress(contact.invoice_addresses)
    };
}

function mapAddress(addrData: DbInvoiceAddress | DbInvoiceAddress[] | undefined | null): Address {
    const addr = Array.isArray(addrData) ? addrData[0] : addrData;
    if (!addr) return {
        id: '',
        invoiceID: '',
        line1: '',
        city: '',
        postalCode: '',
        country: ''
    };
    return {
        id: addr.id,
        invoiceID: addr.invoice_id,
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postal_code,
        country: addr.country
    };
}

function mapItem(item: DbReceiptItem): ReceiptItem {
    return {
        id: item.id,
        receiptID: item.receipt_id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        discount: item.discount,
        taxRate: item.tax_rate,
        amount: item.amount,
        createdAt: item.created_at,
    };
}
