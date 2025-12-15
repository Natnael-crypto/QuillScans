"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
    const router = useRouter();
    const [message, setMessage] = useState("Processing login...");

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (data.session) {
                    // Send session to server to set cookies
                    const res = await fetch("/api/auth/set-session", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            access_token: data.session.access_token,
                            refresh_token: data.session.refresh_token,
                            expires_in: data.session.expires_in,
                        }),
                    });

                    if (!res.ok) {
                        throw new Error("Failed to set session on server");
                    }

                    router.push("/dashboard");
                } else {
                    // No session found, redirect to auth page
                    // Wait a bit for the implicit flow to complete if it's slow
                    setTimeout(() => {
                        supabase.auth.onAuthStateChange(async (event, session) => {
                            if (event === 'SIGNED_IN' && session) {
                                // Send session to server to set cookies
                                const res = await fetch("/api/auth/set-session", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        access_token: session.access_token,
                                        refresh_token: session.refresh_token,
                                        expires_in: session.expires_in,
                                    }),
                                });

                                if (!res.ok) {
                                    throw new Error("Failed to set session on server");
                                }

                                router.push("/dashboard");
                            }
                        });
                    }, 1000)
                }
            } catch (err: any) {
                console.error("Auth callback error:", err);
                setMessage("Authentication failed. Redirecting...");
                setTimeout(() => router.push("/auth?error=oauth"), 2000);
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-slate-500">{message}</p>
        </div>
    );
}
