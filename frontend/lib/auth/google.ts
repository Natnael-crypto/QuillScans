import { supabase } from "@/lib/supabaseClient";

export async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${window.location.origin}/api/auth/callback`,
        },
    });

    if (error) {
        throw new Error(error.message);
    }
}
