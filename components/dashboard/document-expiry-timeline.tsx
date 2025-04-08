"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addDays, isBefore, isAfter, differenceInDays } from "date-fns";
import { AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";
import type { DocumentWithAuthor } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DocumentExpiryTimelineProps {
    documents: DocumentWithAuthor[];
}

export function DocumentExpiryTimeline({
    documents,
}: DocumentExpiryTimelineProps) {
    const [timeRange, setTimeRange] = useState<"week" | "month" | "all">(
        "month"
    );

    // Filter documents with expiration dates
    const documentsWithExpiry = documents.filter((doc) => doc.expirationDate);

    // Sort by expiration date
    const sortedDocuments = [...documentsWithExpiry].sort((a, b) => {
        const dateA = new Date(a.expirationDate!);
        const dateB = new Date(b.expirationDate!);
        return dateA.getTime() - dateB.getTime();
    });

    // Filter based on time range
    const today = new Date();
    const filteredDocuments = sortedDocuments.filter((doc) => {
        const expiryDate = new Date(doc.expirationDate!);

        if (timeRange === "week") {
            return (
                isBefore(expiryDate, addDays(today, 7)) &&
                isAfter(expiryDate, addDays(today, -7))
            );
        } else if (timeRange === "month") {
            return (
                isBefore(expiryDate, addDays(today, 30)) &&
                isAfter(expiryDate, addDays(today, -7))
            );
        }

        return true;
    });

    // Get status and icon for document
    const getStatusInfo = (doc: DocumentWithAuthor) => {
        const expiryDate = new Date(doc.expirationDate!);
        const today = new Date();
        const daysUntilExpiry = differenceInDays(expiryDate, today);

        if (daysUntilExpiry < 0) {
            return {
                status: "Expired",
                icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
                badge: <Badge variant="destructive">Expired</Badge>,
                daysText: `Expired ${Math.abs(daysUntilExpiry)} days ago`,
            };
        } else if (daysUntilExpiry <= 30) {
            return {
                status: "Expiring Soon",
                icon: <Clock className="h-5 w-5 text-yellow-500" />,
                badge: <Badge className="bg-yellow-500">Expiring Soon</Badge>,
                daysText:
                    daysUntilExpiry === 0
                        ? "Expires today"
                        : `Expires in ${daysUntilExpiry} days`,
            };
        } else {
            return {
                status: "Active",
                icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                badge: <Badge className="bg-green-500">Active</Badge>,
                daysText: `Expires in ${daysUntilExpiry} days`,
            };
        }
    };

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    if (filteredDocuments.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex justify-end space-x-2">
                    <Button
                        variant={timeRange === "week" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("week")}
                    >
                        This Week
                    </Button>
                    <Button
                        variant={timeRange === "month" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("month")}
                    >
                        This Month
                    </Button>
                    <Button
                        variant={timeRange === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("all")}
                    >
                        All Time
                    </Button>
                </div>
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No documents with expiration dates found in the selected
                    time range.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end space-x-2">
                <Button
                    variant={timeRange === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange("week")}
                >
                    This Week
                </Button>
                <Button
                    variant={timeRange === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange("month")}
                >
                    This Month
                </Button>
                <Button
                    variant={timeRange === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange("all")}
                >
                    All Time
                </Button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
                {filteredDocuments.map((doc) => {
                    const statusInfo = getStatusInfo(doc);

                    return (
                        <Card key={doc.id} className="relative overflow-hidden">
                            <div
                                className={`absolute left-0 top-0 bottom-0 w-1 ${
                                    statusInfo.status === "Expired"
                                        ? "bg-red-500"
                                        : statusInfo.status === "Expiring Soon"
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                }`}
                            />
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-muted p-2 rounded-full">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">
                                                {doc.title}
                                            </h4>
                                            {statusInfo.badge}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {doc.category
                                                .replace(/([A-Z])/g, " $1")
                                                .trim()}{" "}
                                            • {doc.documentType}
                                        </p>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                {doc.author && (
                                                    <>
                                                        <Avatar className="h-6 w-6">
                                                            {doc.author
                                                                .avatar ? (
                                                                <AvatarImage
                                                                    src={
                                                                        doc
                                                                            .author
                                                                            .avatar
                                                                    }
                                                                    alt={
                                                                        doc
                                                                            .author
                                                                            .fullName
                                                                    }
                                                                />
                                                            ) : null}
                                                            <AvatarFallback className="text-xs">
                                                                {getInitials(
                                                                    doc.author
                                                                        .fullName
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>
                                                            {
                                                                doc.author
                                                                    .fullName
                                                            }
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {statusInfo.icon}
                                                <span
                                                    className={`${
                                                        statusInfo.status ===
                                                        "Expired"
                                                            ? "text-red-500"
                                                            : statusInfo.status ===
                                                              "Expiring Soon"
                                                            ? "text-yellow-500"
                                                            : "text-green-500"
                                                    }`}
                                                >
                                                    {statusInfo.daysText}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
