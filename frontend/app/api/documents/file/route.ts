import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, getUserAndSupabase } from "@/lib/supabaseServer";
import { getAuthCookies } from "@/lib/auth/cookies";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const documentId = searchParams.get('id');
    let documentType = searchParams.get('type');

    if (documentType === 'pos') {
        documentType = 'purchase_order';
    }

    if (!documentId || !documentType) {
        return NextResponse.json({ error: "Missing id or type" }, { status: 400 });
    }

    const { accessToken } = await getAuthCookies();
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { supabase, user } = await getUserAndSupabase(accessToken);

    let docID

    console.log(documentId);

    if (documentType === 'invoice') {
        const { data: document, error: dbError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', documentId)
            .eq('user_id', user.id)
            .single();

        if (!document) {
            console.error("DB Error:", dbError);
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }
        docID = document.source_document_id;
    } else if (documentType === 'receipt') {
        const { data: document, error: dbError } = await supabase
            .from('receipts')
            .select('*')
            .eq('id', documentId)
            .eq('user_id', user.id)
            .single();

        if (!document) {
            console.error("DB Error:", dbError);

            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }
        docID = document.source_document_id;
    }
    else if (documentType === 'purchase_order') {
        const { data: document, error: dbError } = await supabase
            .from('pos_transactions')
            .select('*')
            .eq('id', documentId)
            .eq('user_id', user.id)
            .single();

        if (!document || dbError) {
            console.error("DB Error:", dbError);

            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }
        docID = document.source_document_id;
    }

    console.log(docID);

    // 1. Get file record from DB
    const { data: fileRecord, error: dbError } = await supabase
        .from('document_files')
        .select('*')
        .eq('document_id', docID)
        .eq('doucment_type', documentType) // Note: schema has typo 'doucment_type'
        .single();

    if (dbError) {
        console.error("DB Error--:", dbError);
        return NextResponse.json({ error: "File record not found" }, { status: 404 });
    }

    if (!fileRecord) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 2. Generate Signed URL
    const { data: signedUrlData, error: storageError } = await supabase
        .storage
        .from("documents")
        .createSignedUrl(fileRecord.storage_path, 60 * 60); // 1 hour expiry

    if (storageError) {
        console.error("Storage Error:", storageError);
        return NextResponse.json({ error: "Could not generate signed URL" }, { status: 500 });
    }

    return NextResponse.json({
        signedUrl: signedUrlData.signedUrl,
        fileName: fileRecord.file_name,
        fileType: fileRecord.file_type
    });
}
