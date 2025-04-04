"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, differenceInDays, parseISO, setYear } from "date-fns";
import Link from "next/link";

interface Employee {
    id: string;
    fullName: string;
    avatar: string | null;
    birthday: Date | string;
}

interface UpcomingBirthdaysProps {
    employees: Employee[];
}

export function UpcomingBirthdays({ employees }: UpcomingBirthdaysProps) {
    // Helper to get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    // Get upcoming birthdays in the next 30 days
    const today = new Date();
    const currentYear = today.getFullYear();

    const upcomingBirthdays = employees
        .map((employee) => {
            const birthday =
                typeof employee.birthday === "string"
                    ? parseISO(employee.birthday)
                    : new Date(employee.birthday);

            // Set the birthday to this year
            let thisYearBirthday = setYear(birthday, currentYear);

            // If the birthday has already passed this year, use next year's date
            if (thisYearBirthday < today) {
                thisYearBirthday = setYear(birthday, currentYear + 1);
            }

            const daysUntilBirthday = differenceInDays(thisYearBirthday, today);

            return {
                ...employee,
                nextBirthday: thisYearBirthday,
                daysUntil: daysUntilBirthday,
            };
        })
        .filter((employee) => employee.daysUntil <= 30)
        .sort((a, b) => a.daysUntil - b.daysUntil);

    if (upcomingBirthdays.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No upcoming birthdays in the next 30 days
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {upcomingBirthdays.map((employee) => (
                <Link
                    key={employee.id}
                    href={`/employees/view/${employee.id}`}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                >
                    <Avatar>
                        {employee.avatar ? (
                            <AvatarImage
                                src={employee.avatar}
                                alt={employee.fullName}
                            />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(employee.fullName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                            {employee.fullName}
                        </p>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>
                                {format(employee.nextBirthday, "MMM d")}
                            </span>
                            <span>
                                {employee.daysUntil === 0
                                    ? "Today!"
                                    : employee.daysUntil === 1
                                    ? "Tomorrow"
                                    : `in ${employee.daysUntil} days`}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
