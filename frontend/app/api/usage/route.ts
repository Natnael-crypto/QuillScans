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

        // Get current month range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Calculate reset date (1st of next month)
        const renewDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const remainingDays = Math.ceil((renewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Fetch usage for this month
        const { data: usageData, error } = await supabase
            .from("usage")
            .select("type, created_at")
            .eq("user_id", user.id)
            .gte("created_at", startOfMonth.toISOString())
            .lte("created_at", endOfMonth.toISOString());

        if (error) {
            console.error("Error fetching usage:", error);
            throw error;
        }

        const quotaLimit = 200; // Hardcoded limit for now
        const quotaUsed = usageData.length;

        // Process Daily Usage
        const dailyUsageMap = new Map<string, number>();
        // Initialize all days in month to 0 or just up to today? 
        // The mock data shows sequential days. Let's do up to today or end of month?
        // Let's do up to today for the chart to look right (or fill existing days).

        usageData.forEach((record: { created_at: string }) => {
            const date = new Date(record.created_at);
            const dayKey = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            dailyUsageMap.set(dayKey, (dailyUsageMap.get(dayKey) || 0) + 1);
        });

        // Create array for chart (sorted by date)
        const dailyUsage = Array.from(dailyUsageMap.entries()).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
        // Note: sorting by "Jan 1" string might be tricky if year is missing, but for same month it roughly works. 
        // Better to sort by the original date objects if I kept them, but let's stick to simple map for now.
        // Actually, for chart it's better to show the Last 30 days or Current Month days.
        // The mock showed "Jan 1" to "Jan 15".
        // Let's ensure we have entries for days with data.

        // Process Usage by Type
        const typeMap = new Map<string, number>();
        usageData.forEach((record: { type: string }) => {
            // Capitalize type for display
            const type = record.type.charAt(0).toUpperCase() + record.type.slice(1);
            typeMap.set(type, (typeMap.get(type) || 0) + 1);
        });

        const usageByType = Array.from(typeMap.entries()).map(([type, count]) => ({
            type,
            count,
            percentage: Math.round((count / (quotaUsed || 1)) * 100)
        })).sort((a, b) => b.count - a.count);

        return NextResponse.json({
            dailyUsage,
            usageByType,
            quotaUsed,
            quotaLimit,
            remainingDays,
            renewDate: renewDate.toISOString()
        });

    } catch (error) {
        console.error("Internal Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

