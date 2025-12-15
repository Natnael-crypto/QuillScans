import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function GET(req: Request) {
    const { searchParams, origin } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=oauth`);
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
        console.log(error);
        return NextResponse.redirect(`${origin}/login?error=oauth`);
    }

    const session = data.session;

    console.log(session);

    setAuthCookies(
        session.access_token,
        session.refresh_token,
        session.expires_in
    );

    await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/oauth-profile-sync`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        }
    );

    return NextResponse.redirect(`${origin}/dashboard`);
}
