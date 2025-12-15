import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Session:", body);

        const { access_token, refresh_token, expires_in } = body;

        if (!access_token || !refresh_token || !expires_in) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        await setAuthCookies(access_token, refresh_token, expires_in);

        // Sync profile
        await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/oauth-profile-sync`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Set session error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
