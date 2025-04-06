import { Card, CardContent } from "@/components/ui/card";
import type { ReactNode } from "react";

interface DocumentStatsProps {
    title: string;
    value: number;
    icon: ReactNode;
}

export function DocumentStats({ title, value, icon }: DocumentStatsProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <h2 className="text-3xl font-bold mt-1">{value}</h2>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}
