import { NextRequest, NextResponse } from 'next/server';
import { getUserAndSupabase } from '@/lib/supabaseServer';
import { Invoice, InvoiceItem, InvoiceStatus, ContactInfo, Address, InvoiceTotals } from '@/types/invoice';
import { DbInvoice, DbInvoiceContact, DbInvoiceAddress, DbInvoiceTotals, DbInvoiceItem } from '@/types/supabase';
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
        const issuedAtFrom = searchParams.get('issuedAtFrom');
        const issuedAtTo = searchParams.get('issuedAtTo');
        const dueDateFrom = searchParams.get('dueDateFrom');
        const dueDateTo = searchParams.get('dueDateTo');
        const paidAtFrom = searchParams.get('paidAtFrom');
        const paidAtTo = searchParams.get('paidAtTo');

        const grandTotalMin = searchParams.get('grandTotalMin');
        const grandTotalMax = searchParams.get('grandTotalMax');

        const invoiceNumber = searchParams.get('invoiceNumber');

        const senderName = searchParams.get('senderName');
        const senderEmail = searchParams.get('senderEmail');
        const recipientName = searchParams.get('recipientName');
        const recipientEmail = searchParams.get('recipientEmail');

        const status = searchParams.get('status');
        const sortField = searchParams.get('sortField');
        const sortDirection = searchParams.get('sortDirection') === 'asc' ? true : false;

        // Logic for !inner vs left join
        const useSenderFilter = senderName || senderEmail;
        const useRecipientFilter = recipientName || recipientEmail;

        const senderPart = useSenderFilter ? 'sender:invoice_contacts!inner(*, invoice_addresses(*))' : 'sender:invoice_contacts(*, invoice_addresses(*))';
        const recipientPart = useRecipientFilter ? 'recipient:invoice_contacts!inner(*, invoice_addresses(*))' : 'recipient:invoice_contacts(*, invoice_addresses(*))';

        let query = supabase.from('invoices').select(`
        *,
        totals:invoice_totals!inner(*),
        items:invoice_items(*),
        ${senderPart},
        ${recipientPart}
      `, { count: 'exact' });

        // User Filter
        query = query.eq('user_id', user.id);

        // Date Filters
        if (issuedAtFrom) query = query.gte('issued_at', issuedAtFrom);
        if (issuedAtTo) query = query.lte('issued_at', issuedAtTo);
        if (dueDateFrom) query = query.gte('due_date', dueDateFrom);
        if (dueDateTo) query = query.lte('due_date', dueDateTo);
        if (paidAtFrom) query = query.gte('paid_at', paidAtFrom);
        if (paidAtFrom) query = query.gte('paid_at', paidAtFrom);
        if (paidAtTo) query = query.lte('paid_at', paidAtTo);

        if (status && status !== 'all') query = query.eq('status', status);

        // Invoice Search
        if (invoiceNumber) query = query.ilike('invoice_number', `%${invoiceNumber}%`);

        // Grand Total Filter
        if (grandTotalMin) query = query.gte('totals.grand_total', grandTotalMin);
        if (grandTotalMax) query = query.lte('totals.grand_total', grandTotalMax);

        // Contact Filters (applied to the aliases)
        query = query.eq('sender.type', 'sender');
        query = query.eq('recipient.type', 'recipient');

        if (senderName) query = query.ilike('sender.name', `%${senderName}%`);
        if (senderEmail) query = query.ilike('sender.email', `%${senderEmail}%`);

        if (recipientName) query = query.ilike('recipient.name', `%${recipientName}%`);
        if (recipientEmail) query = query.ilike('recipient.email', `%${recipientEmail}%`);

        // Pagination
        query = query.range(offset, offset + limit - 1);

        // Order
        // Order
        let dbSortField = 'created_at';
        if (sortField === 'date') dbSortField = 'issued_at';
        if (sortField === 'invoiceNumber') dbSortField = 'invoice_number';
        if (sortField === 'status') dbSortField = 'status';

        query = query.order(dbSortField, { ascending: sortDirection });

        const { data: invoices, error, count } = await query;

        if (error) {
            console.error('Error fetching invoices:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Map to Frontend Interface
        const formattedInvoices: Invoice[] = ((invoices as unknown) as DbInvoice[] || []).map(inv => ({
            id: inv.id,
            invoiceNumber: inv.invoice_number,
            userID: inv.user_id,
            issuedAt: inv.issued_at,
            dueDate: inv.due_date,
            paidAt: inv.paid_at,
            sender: mapContact(inv.sender)!,
            recipient: mapContact(inv.recipient)!,
            items: (inv.items || []).map(mapItem),
            totals: mapTotals(inv.totals),
            status: (inv.status as string) as InvoiceStatus,
            memo: inv.memo,
            internalNote: inv.internal_note,
            externalId: inv.external_id,
            metadata: inv.metadata,
        }));

        return NextResponse.json({
            data: formattedInvoices,
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
    // Relationships return arrays
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

function mapTotals(totalsData: DbInvoiceTotals | DbInvoiceTotals[] | undefined | null): InvoiceTotals | null {
    const t = Array.isArray(totalsData) ? totalsData[0] : totalsData;
    if (!t) return null;
    return {
        id: t.id,
        invoiceID: t.invoice_id,
        subtotal: t.subtotal,
        taxTotal: t.tax_total,
        discountTotal: t.discount_total,
        grandTotal: t.grand_total,
        currency: t.currency
    };
}

function mapItem(item: DbInvoiceItem): InvoiceItem {
    return {
        id: item.id,
        invoiceID: item.invoice_id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        discount: item.discount,
        taxRate: item.tax_rate,
        amount: item.amount
    };
}
