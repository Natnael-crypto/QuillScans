import React from 'react';
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: number | string;
    change?: string;
    changeType?: "increase" | "decrease";
    icon: LucideIcon;
    iconColor?: string;
    className?: string;
}

export default function StatCard({
    title,
    value,
    change,
    changeType = "increase",
    icon: Icon,
    iconColor = "bg-accent/20 text-slate-900",
    className,
}: StatCardProps) {
    return (
        <div className={cn(
            "bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-300",
            className
        )}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
                </div>
                <div className={cn("p-3 rounded-xl", iconColor)}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            {change && (
                <div className="flex items-center gap-1.5 mt-2">
                    {changeType === "increase" ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={cn(
                        "text-sm font-medium",
                        changeType === "increase" ? "text-emerald-600" : "text-red-600"
                    )}>
                        {change}
                    </span>
                    <span className="text-sm text-slate-400">vs last month</span>
                </div>
            )}
        </div>
    );
}