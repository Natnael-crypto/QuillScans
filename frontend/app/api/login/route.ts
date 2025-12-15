import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(req: Request) {
    const body = await req.json();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/login-user`,
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
    if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
    }

    const { session } = data;

    await setAuthCookies(
        session.access_token,
        session.refresh_token,
        session.expires_in
    );

    return NextResponse.json({ success: true });
}