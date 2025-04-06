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
import type { DocumentWithAuthor } from "@/lib/db";

interface DocumentCategoryChartProps {
    documents: DocumentWithAuthor[];
}

export function DocumentCategoryChart({
    documents,
}: DocumentCategoryChartProps) {
    // Count documents by category
    const categoryCounts = documents.reduce((acc, document) => {
        // Format category name (e.g., "LicenseEligibility" -> "License Eligibility")
        const formattedCategory = document.category
            .replace(/([A-Z])/g, " $1")
            .trim();

        acc[formattedCategory] = (acc[formattedCategory] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Convert to array for chart
    const data = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
    }));

    // Sort by count (descending)
    data.sort((a, b) => b.count - a.count);

    // If no data, show a message
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No document data available
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
                    layout="vertical"
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="category" width={120} />
                    <Tooltip
                        formatter={(value) => [`${value} documents`, "Count"]}
                    />
                    <Bar dataKey="count" fill="#8884d8" name="Documents" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
