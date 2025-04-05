"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Cake } from "lucide-react";
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
} from "@/components/ui/select";

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
            {/* Calendar Header with Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <h2 className="text-xl font-semibold">
                        {format(currentMonth, "MMMM yyyy")}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={prevMonth}
                        className="h-8 w-8"
                    >
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
                            <SelectTrigger className="w-[130px] h-8">
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
                            <SelectTrigger className="w-[90px] h-8">
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
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={nextMonth}
                        className="h-8 w-8"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={goToToday}
                        className="h-8 text-xs px-2 sm:text-sm sm:px-3"
                    >
                        Today
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Day names */}
                {dayNames.map((day) => (
                    <div
                        key={day}
                        className="text-center py-2 font-medium text-xs sm:text-sm"
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {days.map((day, i) => {
                    const birthdaysOnDay = getBirthdaysOnDay(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isTodayDate = isToday(day);

                    return (
                        <div
                            key={i}
                            className={`min-h-[60px] sm:min-h-[80px] p-1 border rounded-md ${
                                isCurrentMonth ? "bg-card" : "bg-muted/30"
                            } ${
                                isTodayDate ? "border-primary" : "border-border"
                            } 
                ${
                    birthdaysOnDay.length > 0 && isCurrentMonth
                        ? "bg-primary/5"
                        : ""
                }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <div
                                    className={`text-xs ${
                                        isCurrentMonth
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    } ${
                                        isTodayDate
                                            ? "font-bold text-primary"
                                            : ""
                                    }`}
                                >
                                    {format(day, "d")}
                                </div>
                                {birthdaysOnDay.length > 0 &&
                                    isCurrentMonth && (
                                        <Cake className="h-3 w-3 text-primary" />
                                    )}
                            </div>

                            <div className="space-y-1 overflow-y-auto max-h-[40px] sm:max-h-[60px]">
                                {birthdaysOnDay.map((employee) => (
                                    <Link
                                        key={employee.id}
                                        href={`/employees/view/${employee.id}`}
                                        className="flex items-center gap-1 text-xs p-1 rounded-md hover:bg-muted transition-colors"
                                    >
                                        <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                                            {employee.avatar ? (
                                                <AvatarImage
                                                    src={employee.avatar}
                                                    alt={employee.fullName}
                                                />
                                            ) : null}
                                            <AvatarFallback className="text-[8px] sm:text-[10px]">
                                                {getInitials(employee.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate hidden xs:inline">
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
