import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();

    console.log(body);
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/register-user`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify(body),
        }
    );


    const data = await res.json();
    console.log(data);
    return NextResponse.json(data, { status: res.status });
}
