"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { Cake, PartyPopper } from "lucide-react";
import { toast } from "sonner";

interface Employee {
    id: string;
    fullName: string;
    avatar: string | null;
    birthday: Date | string;
}

interface TodaysBirthdaysProps {
    employees: Employee[];
}

export function TodaysBirthdays({ employees }: TodaysBirthdaysProps) {
    const [toastsShown, setToastsShown] = useState(false);

    // Helper to get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    // Get today's birthdays
    const today = new Date();
    const todaysBirthdays = employees.filter((employee) => {
        const birthday =
            typeof employee.birthday === "string"
                ? parseISO(employee.birthday)
                : new Date(employee.birthday);

        // Check if the month and day match, ignoring the year
        return (
            birthday.getDate() === today.getDate() &&
            birthday.getMonth() === today.getMonth()
        );
    });

    // Show toast notifications when component mounts
    useEffect(() => {
        if (todaysBirthdays.length > 0 && !toastsShown) {
            // Show toast for each birthday person
            todaysBirthdays.forEach((employee) => {
                toast(`🎉 Happy Birthday, ${employee.fullName}! 🎂`, {
                    description: `Wishing you a fantastic day filled with joy and celebration!`,
                    duration: 6000,
                });
            });

            setToastsShown(true);
        }
    }, [todaysBirthdays, toastsShown]);

    if (todaysBirthdays.length === 0) {
        return null;
    }

    return (
        <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <PartyPopper className="h-5 w-5 text-primary" />
                    Today's Birthdays
                </CardTitle>
                <CardDescription>
                    Celebrate with your colleagues!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {todaysBirthdays.map((employee) => (
                        <Link
                            key={employee.id}
                            href={`/employees/view/${employee.id}`}
                            className="flex items-center gap-3 p-3 rounded-md bg-background hover:bg-muted transition-colors"
                        >
                            <Avatar className="h-12 w-12 border-2 border-primary">
                                {employee.avatar ? (
                                    <AvatarImage
                                        src={employee.avatar}
                                        alt={employee.fullName}
                                    />
                                ) : null}
                                <AvatarFallback className="bg-primary/20 text-primary">
                                    {getInitials(employee.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">
                                        {employee.fullName}
                                    </p>
                                    <Cake className="h-4 w-4 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Birthday today, {format(today, "MMMM d")}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
