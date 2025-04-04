"use client";

import Link from "next/link";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isToday,
    parseISO,
} from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

interface Employee {
    id: string;
    fullName: string;
    avatar: string | null;
    birthday: Date | string;
}

interface BirthdayCalendarProps {
    employees: Employee[];
}

export function BirthdayCalendar({ employees }: BirthdayCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Helper to get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    // Navigate to previous month
    const prevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    // Navigate to next month
    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    // Navigate to current month
    const goToToday = () => {
        setCurrentMonth(new Date());
    };

    // Get days in month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Get employees with birthdays on a specific day
    const getBirthdaysOnDay = (day: Date) => {
        return employees.filter((employee) => {
            const birthday =
                typeof employee.birthday === "string"
                    ? parseISO(employee.birthday)
                    : new Date(employee.birthday);

            // Check if the month and day match, ignoring the year
            return (
                birthday.getDate() === day.getDate() &&
                birthday.getMonth() === day.getMonth()
            );
        });
    };

    // Day names
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                    {format(currentMonth, "MMMM yyyy")}
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                        <Select
                            value={format(currentMonth, "MMMM")}
                            onValueChange={(value) => {
                                const newMonth = new Date(currentMonth);
                                const monthIndex = [
                                    "January",
                                    "February",
                                    "March",
                                    "April",
                                    "May",
                                    "June",
                                    "July",
                                    "August",
                                    "September",
                                    "October",
                                    "November",
                                    "December",
                                ].findIndex((m) => m === value);
                                newMonth.setMonth(monthIndex);
                                setCurrentMonth(newMonth);
                            }}
                        >
                            <SelectTrigger className="w-[130px]">
                                <SelectValue
                                    placeholder={format(currentMonth, "MMMM")}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    "January",
                                    "February",
                                    "March",
                                    "April",
                                    "May",
                                    "June",
                                    "July",
                                    "August",
                                    "September",
                                    "October",
                                    "November",
                                    "December",
                                ].map((month) => (
                                    <SelectItem key={month} value={month}>
                                        {month}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={format(currentMonth, "yyyy")}
                            onValueChange={(value) => {
                                const newMonth = new Date(currentMonth);
                                newMonth.setFullYear(Number.parseInt(value));
                                setCurrentMonth(newMonth);
                            }}
                        >
                            <SelectTrigger className="w-[90px]">
                                <SelectValue
                                    placeholder={format(currentMonth, "yyyy")}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from(
                                    { length: 10 },
                                    (_, i) => new Date().getFullYear() - i
                                ).map((year) => (
                                    <SelectItem
                                        key={year}
                                        value={year.toString()}
                                    >
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={goToToday}>
                        Today
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {/* Day names */}
                {dayNames.map((day) => (
                    <div
                        key={day}
                        className="text-center py-2 font-medium text-sm"
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {days.map((day, i) => {
                    const birthdaysOnDay = getBirthdaysOnDay(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    return (
                        <div
                            key={i}
                            className={`min-h-[100px] p-2 border rounded-md ${
                                isCurrentMonth ? "bg-card" : "bg-muted/30"
                            } ${
                                isToday(day)
                                    ? "border-primary"
                                    : "border-border"
                            }`}
                        >
                            <div
                                className={`text-right text-sm mb-1 ${
                                    isCurrentMonth
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {format(day, "d")}
                            </div>

                            <div className="space-y-1">
                                {birthdaysOnDay.map((employee) => (
                                    <Link
                                        key={employee.id}
                                        href={`/employees/view/${employee.id}`}
                                        className="flex items-center gap-2 text-xs p-1 rounded-md hover:bg-muted transition-colors"
                                    >
                                        <Avatar className="h-6 w-6">
                                            {employee.avatar ? (
                                                <AvatarImage
                                                    src={employee.avatar}
                                                    alt={employee.fullName}
                                                />
                                            ) : null}
                                            <AvatarFallback className="text-[10px]">
                                                {getInitials(employee.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate">
                                            {employee.fullName}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
