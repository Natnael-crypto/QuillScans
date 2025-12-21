import { NextResponse } from "next/server";
import { getAuthCookies } from "@/lib/auth/cookies";

export async function PATCH(req: Request) {
    const { accessToken } = await getAuthCookies();

    if (!accessToken) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const body = await req.json();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-profile`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        }
    );

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
}
