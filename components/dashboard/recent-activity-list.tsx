"use client";

import { format } from "date-fns";
import { FileText, User, Calendar, Clock } from "lucide-react";
import type { DocumentWithAuthor } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface RecentActivityListProps {
    activities: DocumentWithAuthor[];
    extended?: boolean;
}

export function RecentActivityList({
    activities,
    extended = false,
}: RecentActivityListProps) {
    if (activities.length === 0) {
        return (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No recent activity
            </div>
        );
    }

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Active":
                return <Badge className="bg-green-500">Active</Badge>;
            case "Expired":
                return <Badge variant="destructive">Expired</Badge>;
            case "AboutToExpire":
                return <Badge className="bg-yellow-500">Expiring Soon</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
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
                                <Calendar className="h-3 w-3" />
                                {format(
                                    new Date(activity.createdAt),
                                    "MMM d, yyyy"
                                )}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {activity.author?.fullName || "Unknown"}
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
                            {extended && getStatusBadge(activity.status)}
                        </div>

                        {extended && activity.author && (
                            <div className="mt-2 flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    {activity.author.avatar ? (
                                        <AvatarImage
                                            src={activity.author.avatar}
                                            alt={activity.author.fullName}
                                        />
                                    ) : null}
                                    <AvatarFallback className="text-xs">
                                        {getInitials(activity.author.fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                    <span className="font-medium">
                                        {activity.author.fullName}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {" "}
                                        • {activity.author.position}
                                    </span>
                                </div>
                            </div>
                        )}

                        {extended && activity.expirationDate && (
                            <div className="mt-1 text-xs flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                    {activity.status === "Expired"
                                        ? `Expired on ${format(
                                              new Date(activity.expirationDate),
                                              "MMM d, yyyy"
                                          )}`
                                        : activity.status === "AboutToExpire"
                                        ? `Expires on ${format(
                                              new Date(activity.expirationDate),
                                              "MMM d, yyyy"
                                          )}`
                                        : `Valid until ${format(
                                              new Date(activity.expirationDate),
                                              "MMM d, yyyy"
                                          )}`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
