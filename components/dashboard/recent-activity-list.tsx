"use client";

import { format } from "date-fns";
import { FileText, User } from "lucide-react";
import type { DocumentWithAuthor } from "@/lib/db";

interface RecentActivityListProps {
    activities: DocumentWithAuthor[];
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
    if (activities.length === 0) {
        return (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No recent activity
            </div>
        );
    }

    return (
        <div className="space-y-4 max-h-[250px] overflow-auto pr-2">
            {activities.map((activity) => (
                <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                >
                    <div className="bg-primary/10 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{activity.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {activity.author?.fullName || "Unknown"}
                            </span>
                            <span>•</span>
                            <span>
                                {format(
                                    new Date(activity.createdAt),
                                    "MMM d, yyyy"
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                {activity.category
                                    .replace(/([A-Z])/g, " $1")
                                    .trim()}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                {activity.documentType}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
