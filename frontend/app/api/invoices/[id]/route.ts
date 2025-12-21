import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Invoice, InvoiceItem, InvoiceTotals, InvoiceStatus, ContactInfo, Address } from '@/types/invoice';
import { DbInvoiceAddress, DbInvoiceContact, DbInvoiceTotals, DbInvoiceItem } from '@/types/supabase';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getUserAndSupabase } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { accessToken } = await getAuthCookies();
        if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { supabase, user } = await getUserAndSupabase(accessToken);

        const { id } = await params;

        // We reuse the alias logic to easily separate sender and recipient
        const { data: inv, error } = await supabase
            .from('invoices')
            .select(`
        *,
        totals:invoice_totals!inner(*),
        items:invoice_items(*),
        sender:invoice_contacts(*, invoice_addresses(*)),
        recipient:invoice_contacts(*, invoice_addresses(*))
      `)
            .eq('id', id)
            .eq('user_id', user.id)
            .eq('sender.type', 'sender')
            .eq('recipient.type', 'recipient')
            .single();

        if (error) {
            // If no rows found, .single() returns error code PGRST116
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
            }
            console.error('Error fetching invoice:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Map to Frontend Interface
        // Since .single(), inv is object not array
        const formattedInvoice: Invoice = {
            id: inv.id,
            invoiceNumber: inv.invoice_number,
            userID: inv.user_id,
            issuedAt: inv.issued_at,
            dueDate: inv.due_date,
            paidAt: inv.paid_at,
            sender: mapContact(inv.sender)!,
            recipient: mapContact(inv.recipient)!,
            items: (inv.items || []).map(mapItem),
            totals: mapTotals(inv.totals)!,
            status: (inv.status as string) as InvoiceStatus,
            memo: inv.memo,
            internalNote: inv.internal_note,
            externalId: inv.external_id,
            metadata: inv.metadata,
        };

        return NextResponse.json(formattedInvoice);

    } catch (error) {
        console.error('Internal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { accessToken } = await getAuthCookies();
        if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting invoice:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Internal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Helpers (Duplicated for now, ideally in a utils file but acceptable here)
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
