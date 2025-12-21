import { NextResponse } from "next/server";
import { getAuthCookies } from "@/lib/auth/cookies";
import { getProducer } from "@/lib/kafka";
import { getUserAndSupabase } from "@/lib/supabaseServer";

export async function POST(req: Request) {
    const { accessToken } = await getAuthCookies();

    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { supabase, user } = await getUserAndSupabase(accessToken);

    const formData = await req.formData();

    // 1️⃣ Call Edge Function
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upload-documents`,
        {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: formData,
        }
    );

    const data = await res.json();
    console.log(data)

    if (!res.ok) return NextResponse.json(data, { status: res.status });

    // 2️⃣ Publish Kafka events
    try {
        const producer = await getProducer();

        for (const doc of data.documents) {
            await producer.send({
                topic: process.env.KAFKA_TOPIC!,
                messages: [
                    {
                        key: doc.document_id,
                        value: JSON.stringify({
                            event: "DOCUMENT_UPLOADED",
                            document_id: doc.document_id,
                            document_type: doc.document_type,
                            files: doc.files,
                            created_at: new Date().toISOString(),
                        }),
                    },
                ],
            });

            await supabase.from("usage").insert({
                user_id: user.id,
                type: doc.document_type,
                document_file: doc.document_id,
            });
        }
    } catch (error) {
        console.error("Failed to publish to Kafka:", error);
        throw error;
    }

    return NextResponse.json({ success: true }, { status: 201 });
}
