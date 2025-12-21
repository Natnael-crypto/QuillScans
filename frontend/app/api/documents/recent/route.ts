import { NextRequest, NextResponse } from 'next/server';
import { getUserAndSupabase } from '@/lib/supabaseServer';
import { getAuthCookies } from '@/lib/auth/cookies';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { accessToken } = await getAuthCookies();
        if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { supabase, user } = await getUserAndSupabase(accessToken);

        // Fetch recent Invoices
        const { data: invoices, error: invError } = await supabase
            .from('invoices')
            .select('id, invoice_number, issued_at, status, created_at, totals:invoice_totals!inner(grand_total, currency)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (invError) throw invError;

        // Fetch recent Receipts
        const { data: receipts, error: recError } = await supabase
            .from('receipts')
            .select('id, receipt_number, transaction_date, status, created_at, grand_total, currency')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (recError) throw recError;

        // Fetch recent POS Transactions
        const { data: posTransactions, error: posError } = await supabase
            .from('pos_transactions')
            .select('id, transaction_id, timestamp, status, created_at, grand_total, currency, store_id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (posError) throw posError;

        // Combine and normalize
        const normalizedInvoices = (invoices || []).map(inv => ({
            id: inv.id,
            displayId: inv.invoice_number || 'N/A',
            type: 'invoice',
            date: inv.issued_at || inv.created_at,
            createdAt: inv.created_at,
            status: inv.status,
            amount: (inv.totals as unknown as { grand_total: number }[])?.[0]?.grand_total,
            currency: (inv.totals as unknown as { currency: string }[])?.[0]?.currency,
        }));

        const normalizedReceipts = (receipts || []).map(rec => ({
            id: rec.id,
            displayId: rec.receipt_number || 'N/A',
            type: 'receipt',
            vendor: 'N/A',
            date: rec.transaction_date || rec.created_at,
            createdAt: rec.created_at,
            status: rec.status,
            amount: rec.grand_total,
            currency: rec.currency,
        }));

        const normalizedPos = (posTransactions || []).map(pos => ({
            id: pos.id,
            displayId: pos.transaction_id || 'N/A',
            type: 'pos',
            vendor: pos.store_id || 'Store',
            date: pos.timestamp || pos.created_at,
            createdAt: pos.created_at,
            status: pos.status,
            amount: pos.grand_total,
            currency: pos.currency,
        }));

        // Merge and sort by created_at desc
        const allDocs = [...normalizedInvoices, ...normalizedReceipts, ...normalizedPos].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // Limit to top 10 total
        const recentDocs = allDocs.slice(0, 10);

        return NextResponse.json({ data: recentDocs });

    } catch (error: unknown) {
        console.error('Error fetching recent documents:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
