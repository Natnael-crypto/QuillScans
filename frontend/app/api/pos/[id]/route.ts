import { NextRequest, NextResponse } from 'next/server';
import { getUserAndSupabase } from '@/lib/supabaseServer';
import { POSTransaction, POSItem, POSTaxLine, POSPayment, POSStatus, Address, ContactInfo, PaymentMethod } from '@/types/pos';
import { DbPOSItem, DbPOSTaxLine, DbPOSPayment, DbInvoiceAddress, DbInvoiceContact } from '@/types/supabase';
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

        const { data: pos, error } = await supabase
            .from('pos_transactions')
            .select(`
                *,
                items:pos_items(*),
                taxLines:pos_tax_lines(*),
                payments:pos_payments(*),
                storeAddress:addresses!pos_transactions_store_address_id_fkey(*),
                customer:contacts!pos_transactions_customer_contact_id_fkey(*, addresses(*))
            `)
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('Error fetching POS transaction:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!pos) {
            return NextResponse.json({ error: 'POS transaction not found' }, { status: 404 });
        }

        // Map to Frontend Interface
        const formattedTransaction: POSTransaction = {
            id: pos.id,
            transactionId: pos.transaction_id,
            userID: pos.user_id,
            timestamp: pos.timestamp,
            terminalId: pos.terminal_id,
            storeId: pos.store_id,
            cashierId: pos.cashier_id,
            cashierName: pos.cashier_name,
            shiftId: pos.shift_id,
            storeAddress: mapAddress(pos.storeAddress),
            subtotal: pos.subtotal,
            discountsTotal: pos.discounts_total,
            grandTotal: pos.grand_total,
            currency: pos.currency,
            changeDue: pos.change_due,
            customer: mapContact(pos.customer) || undefined,
            customerLoyaltyId: pos.customer_loyalty_id,
            items: (pos.items || []).map(mapItem),
            taxLines: (pos.taxLines || []).map(mapTaxLine),
            payments: (pos.payments || []).map(mapPayment),
            status: pos.status as POSStatus,
            createdAt: pos.created_at,
        };

        return NextResponse.json(formattedTransaction);

    } catch (error) {
        console.error('Internal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Helpers
function mapContact(contactData: DbInvoiceContact | DbInvoiceContact[] | undefined | null): ContactInfo | undefined {
    const contact = Array.isArray(contactData) ? contactData[0] : contactData;
    if (!contact) return undefined;

    return {
        id: contact.id,
        invoiceID: contact.invoice_id,
        userID: contact.user_id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        taxId: contact.tax_id
    };
}

function mapAddress(addrData: DbInvoiceAddress | DbInvoiceAddress[] | undefined | null): Address {
    const addr = Array.isArray(addrData) ? addrData[0] : addrData;
    if (!addr) return {
        id: '',
        invoiceID: '',
        contactID: '',
        line1: '',
        city: '',
        postalCode: '',
        country: ''
    };
    return {
        id: addr.id,
        invoiceID: addr.invoice_id,
        contactID: addr.contact_id || '', // Now typed in DbInvoiceAddress
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postal_code,
        country: addr.country
    };
}

function mapItem(item: DbPOSItem): POSItem {
    return {
        id: item.id,
        posTransactionID: item.pos_transaction_id,
        description: item.description,
        sku: item.sku,
        barcode: item.barcode,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        discount: item.discount,
        taxRate: item.tax_rate,
        amount: item.amount,
        createdAt: item.created_at,
    };
}

function mapTaxLine(taxLine: DbPOSTaxLine): POSTaxLine {
    return {
        id: taxLine.id,
        posTransactionID: taxLine.pos_transaction_id,
        label: taxLine.label,
        rate: taxLine.rate,
        amount: taxLine.amount,
    };
}

function mapPayment(payment: DbPOSPayment): POSPayment {
    return {
        id: payment.id,
        posTransactionID: payment.pos_transaction_id,
        method: payment.method as PaymentMethod,
        provider: payment.provider,
        transactionReference: payment.transaction_reference,
        last4: payment.last4,
        authCode: payment.auth_code,
        amountPaid: payment.amount_paid,
        createdAt: payment.created_at,
    };
}
