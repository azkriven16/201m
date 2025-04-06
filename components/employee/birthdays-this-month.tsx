"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { format, parseISO, differenceInDays, isBefore } from "date-fns";
import Link from "next/link";
import { CalendarDays, Gift } from "lucide-react";

interface Employee {
    id: string;
    fullName: string;
    avatar: string | null;
    birthday: Date | string;
}

interface BirthdaysThisMonthProps {
    employees: Employee[];
}

export function BirthdaysThisMonth({ employees }: BirthdaysThisMonthProps) {
    // Helper to get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    // Get current date
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Filter employees with birthdays this month
    const birthdaysThisMonth = employees
        .filter((employee) => {
            const birthday =
                typeof employee.birthday === "string"
                    ? parseISO(employee.birthday)
                    : new Date(employee.birthday);

            return birthday.getMonth() === currentMonth;
        })
        .map((employee) => {
            const birthday =
                typeof employee.birthday === "string"
                    ? parseISO(employee.birthday)
                    : new Date(employee.birthday);

            // Create this year's birthday date
            const thisYearBirthday = new Date(
                currentYear,
                birthday.getMonth(),
                birthday.getDate()
            );

            // Calculate days difference
            const daysDifference = differenceInDays(thisYearBirthday, today);

            // Generate relative time description
            let timeDescription = "";
            if (daysDifference === 0) {
                timeDescription = "Today!";
            } else if (daysDifference === -1) {
                timeDescription = "Yesterday";
            } else if (daysDifference === 1) {
                timeDescription = "Tomorrow";
            } else if (daysDifference < -1 && daysDifference >= -7) {
                timeDescription = `${Math.abs(daysDifference)} days ago`;
            } else if (daysDifference < -7 && daysDifference >= -14) {
                timeDescription = "Last week";
            } else if (daysDifference < -14) {
                timeDescription = `${Math.abs(
                    Math.floor(daysDifference / 7)
                )} weeks ago`;
            } else if (daysDifference > 1 && daysDifference <= 7) {
                timeDescription = `In ${daysDifference} days`;
            } else if (daysDifference > 7 && daysDifference <= 14) {
                timeDescription = "Next week";
            } else if (daysDifference > 14) {
                timeDescription = `In ${Math.floor(daysDifference / 7)} weeks`;
            }

            return {
                ...employee,
                thisYearBirthday,
                daysDifference,
                timeDescription,
                isPast: isBefore(thisYearBirthday, today),
            };
        })
        .sort((a, b) => {
            // Sort by past/future first, then by date
            if (a.isPast && !b.isPast) return 1;
            if (!a.isPast && b.isPast) return -1;
            return a.daysDifference - b.daysDifference;
        });

    if (birthdaysThisMonth.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Birthdays This Month
                </CardTitle>
                <CardDescription>
                    Birthdays in {format(today, "MMMM yyyy")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {birthdaysThisMonth.map((employee) => (
                        <Link
                            key={employee.id}
                            href={`/employees/view/${employee.id}`}
                            className={`flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors ${
                                employee.daysDifference === 0
                                    ? "bg-primary/10"
                                    : ""
                            }`}
                        >
                            <Avatar>
                                {employee.avatar ? (
                                    <AvatarImage
                                        src={employee.avatar}
                                        alt={employee.fullName}
                                    />
                                ) : null}
                                <AvatarFallback
                                    className={`${
                                        employee.daysDifference === 0
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-primary/10 text-primary"
                                    }`}
                                >
                                    {getInitials(employee.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                    {employee.fullName}
                                </p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                        {format(
                                            employee.thisYearBirthday,
                                            "MMM d"
                                        )}
                                    </span>
                                    <span
                                        className={`flex items-center gap-1 ${
                                            employee.daysDifference === 0
                                                ? "text-primary font-medium"
                                                : employee.isPast
                                                ? "text-muted-foreground"
                                                : "text-primary"
                                        }`}
                                    >
                                        {employee.daysDifference === 0 && (
                                            <Gift className="h-3 w-3" />
                                        )}
                                        {employee.timeDescription}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
