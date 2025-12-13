'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const COLORS = ['#635BFF', '#818CF8', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'];

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload: {
            [key: string]: unknown;
        };
    }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-900 mb-1">{payload[0].name}</p>
                <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{payload[0].value}</span> documents
                </p>
            </div>
        );
    }
    return null;
};

interface ChartPieProps {
    data: Record<string, string | number>[];
    dataKey?: string;
    nameKey?: string;
    height?: number;
    className?: string;
}

export default function ChartPie({
    data,
    dataKey = 'value',
    nameKey = 'name',
    height = 300,
    className
}: ChartPieProps) {
    return (
        <div className={className} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey={dataKey}
                        nameKey={nameKey}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: '12px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
