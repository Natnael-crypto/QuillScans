import { NextRequest, NextResponse } from 'next/server';
import { getUserAndSupabase } from '@/lib/supabaseServer';
import { Receipt, ReceiptItem, ReceiptStatus, ContactInfo, Address } from '@/types/receipt';
import { DbReceipt, DbReceiptItem, DbInvoiceContact, DbInvoiceAddress } from '@/types/supabase';
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
        const transactionDateFrom = searchParams.get('transactionDateFrom');
        const transactionDateTo = searchParams.get('transactionDateTo');

        const grandTotalMin = searchParams.get('grandTotalMin');
        const grandTotalMax = searchParams.get('grandTotalMax');

        const receiptNumber = searchParams.get('receiptNumber');

        const merchantName = searchParams.get('merchantName');
        const merchantEmail = searchParams.get('merchantEmail');
        const customerName = searchParams.get('customerName');
        const customerEmail = searchParams.get('customerEmail');

        const status = searchParams.get('status');
        const sortField = searchParams.get('sortField');
        const sortDirection = searchParams.get('sortDirection') === 'asc' ? true : false;

        // Logic for !inner vs left join
        const useMerchantFilter = merchantName || merchantEmail;
        const useCustomerFilter = customerName || customerEmail;

        const merchantPart = useMerchantFilter
            ? 'merchant:contacts!receipts_merchant_contact_id_fkey!inner(*, invoice_addresses:addresses(*))'
            : 'merchant:contacts!receipts_merchant_contact_id_fkey(*, invoice_addresses:addresses(*))';
        const customerPart = useCustomerFilter
            ? 'customer:contacts!receipts_customer_contact_id_fkey!inner(*, invoice_addresses:addresses(*))'
            : 'customer:contacts!receipts_customer_contact_id_fkey(*, invoice_addresses:addresses(*))';

        let query = supabase
            .from('receipts')
            .select(`
                *,
                items:receipt_items(*),
                payment:receipt_payments(*),
                ${merchantPart},
                ${customerPart}
            `, { count: 'exact' })
            .eq('user_id', user.id);

        // Date Filters
        if (transactionDateFrom) query = query.gte('transaction_date', transactionDateFrom);
        if (transactionDateTo) query = query.lte('transaction_date', transactionDateTo);

        if (status && status !== 'all') query = query.eq('status', status);

        // Receipt Search
        if (receiptNumber) query = query.ilike('receipt_number', `%${receiptNumber}%`);

        // Grand Total Filter
        if (grandTotalMin) query = query.gte('grand_total', grandTotalMin);
        if (grandTotalMax) query = query.lte('grand_total', grandTotalMax);

        // Contact Filters
        if (merchantName) query = query.ilike('merchant.name', `%${merchantName}%`);
        if (merchantEmail) query = query.ilike('merchant.email', `%${merchantEmail}%`);

        if (customerName) query = query.ilike('customer.name', `%${customerName}%`);
        if (customerEmail) query = query.ilike('customer.email', `%${customerEmail}%`);

        // Pagination
        query = query.range(offset, offset + limit - 1);

        // Order
        let dbSortField = 'created_at';
        if (sortField === 'date') dbSortField = 'transaction_date';
        if (sortField === 'receiptNumber') dbSortField = 'receipt_number';
        if (sortField === 'status') dbSortField = 'status';

        query = query.order(dbSortField, { ascending: sortDirection });

        const { data: receipts, error, count } = await query;

        if (error) {
            console.error('Error fetching receipts:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Map to Frontend Interface
        const formattedReceipts: Receipt[] = ((receipts as unknown) as DbReceipt[] || []).map(rec => ({
            id: rec.id,
            receiptNumber: rec.receipt_number,
            userID: rec.user_id,
            invoiceReferenceID: rec.invoice_reference_id,
            transactionDate: rec.transaction_date,
            merchant: mapContact(rec.merchant)!,
            customer: mapContact(rec.customer)!,
            items: (rec.items || []).map(mapItem),
            subtotal: rec.subtotal,
            taxTotal: rec.tax_total,
            tip: rec.tip,
            grandTotal: rec.grand_total,
            currency: rec.currency,
            status: rec.status as ReceiptStatus,
            barcodeUrl: rec.barcode_url,
            metadata: rec.metadata,
            createdAt: rec.created_at,
            updatedAt: rec.updated_at,
        }));

        return NextResponse.json({
            data: formattedReceipts,
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
function mapContact(contactData: DbInvoiceContact | DbInvoiceContact[] | undefined | null): (ContactInfo & { address: Address }) | null {
    const contact = Array.isArray(contactData) ? contactData[0] : contactData;
    if (!contact) return null;

    return {
        id: contact.id || '',
        invoiceID: contact.invoice_id || '',
        userID: contact.user_id || '',
        name: contact.name || '',
        email: contact.email || '',
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
