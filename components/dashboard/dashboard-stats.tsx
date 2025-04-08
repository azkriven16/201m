import { Card, CardContent } from "@/components/ui/card";
import type { ReactNode } from "react";

interface DashboardStatsProps {
    title: string;
    value: number;
    icon: ReactNode;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export function DashboardStats({
    title,
    value,
    icon,
    description,
    trend,
}: DashboardStatsProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <h2 className="text-3xl font-bold mt-1">{value}</h2>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {description}
                            </p>
                        )}
                        {trend && (
                            <div
                                className={`flex items-center mt-2 text-xs ${
                                    trend.isPositive
                                        ? "text-green-500"
                                        : "text-red-500"
                                }`}
                            >
                                <span>
                                    {trend.isPositive ? "↑" : "↓"} {trend.value}
                                    %
                                </span>
                                <span className="ml-1">
                                    {trend.isPositive ? "increase" : "decrease"}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}
