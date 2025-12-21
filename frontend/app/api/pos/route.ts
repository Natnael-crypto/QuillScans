import { NextRequest, NextResponse } from 'next/server';
import { getUserAndSupabase } from '@/lib/supabaseServer';
import { POSTransaction, POSItem, POSTaxLine, POSPayment, Address, ContactInfo, POSStatus, PaymentMethod } from '@/types/pos';
import { DbPOSTransaction, DbPOSItem, DbPOSTaxLine, DbPOSPayment, DbInvoiceAddress, DbInvoiceContact } from '@/types/supabase';
import { getAuthCookies } from '@/lib/auth/cookies';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { accessToken } = await getAuthCookies();
        if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { supabase, user } = await getUserAndSupabase(accessToken);

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // Filters
        const timestampFrom = searchParams.get('timestampFrom');
        const timestampTo = searchParams.get('timestampTo');

        const grandTotalMin = searchParams.get('grandTotalMin');
        const grandTotalMax = searchParams.get('grandTotalMax');

        const transactionId = searchParams.get('transactionId');
        const terminalId = searchParams.get('terminalId');
        const storeId = searchParams.get('storeId');
        const cashierId = searchParams.get('cashierId');

        const customerName = searchParams.get('customerName');
        const customerEmail = searchParams.get('customerEmail');

        const status = searchParams.get('status');
        const sortField = searchParams.get('sortField');
        const sortDirection = searchParams.get('sortDirection') === 'asc' ? true : false;

        // Logic for !inner vs left join for customer
        const useCustomerFilter = customerName || customerEmail;
        const customerPart = useCustomerFilter ? 'customer:contacts!inner(*)' : 'customer:contacts(*)';

        let query = supabase.from('pos_transactions').select(`
        *,
        items:pos_items(*),
        taxLines:pos_tax_lines(*),
        payments:pos_payments(*),
        storeAddress:addresses!pos_transactions_store_address_id_fkey(*),
        ${customerPart}
      `, { count: 'exact' });

        // User Filter
        query = query.eq('user_id', user.id);

        // Date Filters
        if (timestampFrom) query = query.gte('timestamp', timestampFrom);
        if (timestampTo) query = query.lte('timestamp', timestampTo);

        if (status && status !== 'all') query = query.eq('status', status);

        // Transaction Search
        if (transactionId) query = query.ilike('transaction_id', `%${transactionId}%`);
        if (terminalId) query = query.ilike('terminal_id', `%${terminalId}%`);
        if (storeId) query = query.ilike('store_id', `%${storeId}%`);
        if (cashierId) query = query.ilike('cashier_id', `%${cashierId}%`);

        // Grand Total Filter
        if (grandTotalMin) query = query.gte('grand_total', grandTotalMin);
        if (grandTotalMax) query = query.lte('grand_total', grandTotalMax);

        // Customer Filters
        if (customerName) query = query.ilike('customer.name', `%${customerName}%`);
        if (customerEmail) query = query.ilike('customer.email', `%${customerEmail}%`);

        // Pagination
        query = query.range(offset, offset + limit - 1);

        // Order
        let dbSortField = 'created_at';
        if (sortField === 'date') dbSortField = 'timestamp';
        if (sortField === 'transactionId') dbSortField = 'transaction_id';
        if (sortField === 'status') dbSortField = 'status';

        query = query.order(dbSortField, { ascending: sortDirection });

        const { data: posTransactions, error, count } = await query;

        if (error) {
            console.error('Error fetching POS transactions:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Map to Frontend Interface
        const formattedTransactions: POSTransaction[] = ((posTransactions as unknown) as DbPOSTransaction[] || []).map(pos => ({
            id: pos.id,
            transactionId: pos.transaction_id,
            userID: pos.user_id,
            timestamp: pos.timestamp,
            terminalId: pos.terminal_id,
            storeId: pos.store_id,
            cashierId: pos.cashier_id,
            cashierName: pos.cashier_name,
            shiftId: pos.shift_id,
            storeAddress: mapAddress(pos.store_address),
            subtotal: pos.subtotal,
            discountsTotal: pos.discounts_total,
            grandTotal: pos.grand_total,
            currency: pos.currency,
            changeDue: pos.change_due,
            customer: mapContact(pos.customer) || undefined,
            customerLoyaltyId: pos.customer_loyalty_id,
            items: (pos.items || []).map(mapItem),
            taxLines: (pos.tax_lines || []).map(mapTaxLine),
            payments: (pos.payments || []).map(mapPayment),
            status: pos.status as POSStatus,
            createdAt: pos.created_at,
        }));

        return NextResponse.json({
            data: formattedTransactions,
            meta: {
                page,
                limit,
                total: count
            }
        });

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
        id: contact.id || '',
        invoiceID: contact.invoice_id || '',
        userID: contact.user_id || '',
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone,
        taxId: contact.tax_id,
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
        contactID: addr.contact_id || '',
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
