import { supabase } from "@/lib/supabaseClient";

export async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
            queryParams: {
                access_type: "offline",
            },
        },
    });

    if (error) {
        throw new Error(error.message);
    }
}
