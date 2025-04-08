"use client";

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "recharts";

interface DocumentStatusChartProps {
    active: number;
    expiringSoon: number;
    expired: number;
}

export function DocumentStatusChart({
    active,
    expiringSoon,
    expired,
}: DocumentStatusChartProps) {
    const data = [
        { name: "Active", value: active, color: "#10b981" },
        { name: "Expiring Soon", value: expiringSoon, color: "#f59e0b" },
        { name: "Expired", value: expired, color: "#ef4444" },
    ].filter((item) => item.value > 0);

    // If no data, show a message
    if (
        data.length === 0 ||
        (active === 0 && expiringSoon === 0 && expired === 0)
    ) {
        return (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No document data available
            </div>
        );
    }

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => [`${value} documents`, "Count"]}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
