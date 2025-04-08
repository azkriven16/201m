"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface Employee {
    id: string;
    fullName: string;
    position: string;
    education: string;
    avatar: string | null;
    createdAt: Date;
}

interface EmployeePositionChartProps {
    employees: Employee[];
}

export function EmployeePositionChart({
    employees,
}: EmployeePositionChartProps) {
    // Count employees by position
    const positionCounts = employees.reduce((acc, employee) => {
        const position = employee.position || "Unspecified";
        acc[position] = (acc[position] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Convert to array for chart
    const data = Object.entries(positionCounts).map(([position, count]) => ({
        position,
        count,
    }));

    // Sort by count (descending)
    data.sort((a, b) => b.count - a.count);

    // If no data, show a message
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No employee data available
            </div>
        );
    }

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="position" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                        formatter={(value) => [`${value} employees`, "Count"]}
                    />
                    <Bar dataKey="count" fill="#3b82f6" name="Employees" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
