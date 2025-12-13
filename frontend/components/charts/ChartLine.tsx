'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

export interface ChartLineProps {
    data: Record<string, string | number>[];
    dataKey?: string;
    xAxisKey?: string;
    color?: string;
    gradientColor?: string;
    height?: number;
    showGrid?: boolean;
    showArea?: boolean;
    valueFormatter?: (value: number) => string;
    className?: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; color: string }>;
    label?: string;
    valueFormatter?: (value: number) => string;
}

const CustomTooltip = ({ active, payload, label, valueFormatter }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-900 mb-1">{label}</p>
                {payload.map((entry, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        <span className="font-semibold">
                            {valueFormatter ? valueFormatter(entry.value) : entry.value}
                        </span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function ChartLine({
    data,
    dataKey = 'value',
    xAxisKey = 'name',
    color = '#635BFF',
    gradientColor,
    height = 300,
    showGrid = true,
    showArea = true,
    valueFormatter,
    className
}: ChartLineProps) {
    const gradientId = `gradient-${dataKey}`;
    const fillColor = gradientColor || color;

    return (
        <div className={className} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                {showArea ? (
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={fillColor} stopOpacity={0.1} />
                                <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        {showGrid && (
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#E2E8F0"
                                vertical={false}
                            />
                        )}
                        <XAxis
                            dataKey={xAxisKey}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 12 }}
                            tickFormatter={valueFormatter}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                ) : (
                    <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        {showGrid && (
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#E2E8F0"
                                vertical={false}
                            />
                        )}
                        <XAxis
                            dataKey={xAxisKey}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 12 }}
                            tickFormatter={valueFormatter}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, fill: color }}
                        />
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}