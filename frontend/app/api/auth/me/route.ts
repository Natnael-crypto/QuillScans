import { NextResponse } from "next/server";
import { getAuthCookies } from "@/lib/auth/cookies";

export async function GET() {
    const { accessToken } = await getAuthCookies();

    if (!accessToken) {
        return NextResponse.json(
            { authenticated: false },
            { status: 401 }
        );
    }

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auth-me`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
}
