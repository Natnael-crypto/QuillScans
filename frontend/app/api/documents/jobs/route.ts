import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: {
                    Authorization: req.headers.get("authorization")!,
                },
            },
        }
    );

    const { data } = await supabase
        .from("document_processing_jobs")
        .select("*")
        .order("created_at", { ascending: false });

    return NextResponse.json(data);
}
