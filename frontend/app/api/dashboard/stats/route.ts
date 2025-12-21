import { NextResponse } from "next/server";
import { getUserAndSupabase } from "@/lib/supabaseServer";
import { getAuthCookies } from "@/lib/auth/cookies";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const { accessToken } = await getAuthCookies();
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { supabase, user } = await getUserAndSupabase(accessToken);

        // 1. Total Documents Count (Usage records represent documents)
        const { count: totalDocs, error: countError } = await supabase
            .from("usage")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        if (countError) throw countError;

        // 2. Monthly Trend (last 7 months)
        const sevenMonthsAgo = new Date();
        sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);
        sevenMonthsAgo.setDate(1);
        sevenMonthsAgo.setHours(0, 0, 0, 0);

        const { data: usageData, error: usageError } = await supabase
            .from("usage")
            .select("created_at")
            .eq("user_id", user.id)
            .gte("created_at", sevenMonthsAgo.toISOString());

        if (usageError) throw usageError;

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const trendMap = new Map<string, number>();

        // Initialize last 7 months with 0
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const label = months[d.getMonth()];
            trendMap.set(label, 0);
        }

        usageData?.forEach((record: { created_at: string }) => {
            const date = new Date(record.created_at);
            const label = months[date.getMonth()];
            if (trendMap.has(label)) {
                trendMap.set(label, (trendMap.get(label) || 0) + 1);
            }
        });

        const monthlyTrend = Array.from(trendMap.entries())
            .map(([name, value]) => ({ name, value }))
            .reverse(); // Chronological order

        // 3. Document Type Distribution
        const { data: typeData, error: typeError } = await supabase
            .from("usage")
            .select("type")
            .eq("user_id", user.id);

        if (typeError) throw typeError;

        const typeMap = new Map<string, number>();
        typeData?.forEach((record: { type: string }) => {
            const type = record.type.charAt(0).toUpperCase() + record.type.slice(1) + "s";
            typeMap.set(type, (typeMap.get(type) || 0) + 1);
        });

        const documentTypes = Array.from(typeMap.entries()).map(([name, value]) => ({
            name,
            value
        }));

        return NextResponse.json({
            totalDocs: totalDocs || 0,
            monthlyTrend,
            documentTypes: documentTypes.length > 0 ? documentTypes : [{ name: "None", value: 0 }]
        });

    } catch (error: unknown) {
        console.error("Error in dashboard stats:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
