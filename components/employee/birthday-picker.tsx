"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface BirthdayPickerProps {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    disabled?: boolean;
}

export function BirthdayPicker({
    value,
    onChange,
    disabled,
}: BirthdayPickerProps) {
    // Initialize with current value or defaults
    const [year, setYear] = React.useState<number | undefined>(
        value ? value.getFullYear() : undefined
    );
    const [month, setMonth] = React.useState<number | undefined>(
        value ? value.getMonth() : undefined
    );
    const [day, setDay] = React.useState<number | undefined>(
        value ? value.getDate() : undefined
    );
    const [monthDayOpen, setMonthDayOpen] = React.useState(false);

    // Update internal state when value changes externally
    React.useEffect(() => {
        if (value) {
            setYear(value.getFullYear());
            setMonth(value.getMonth());
            setDay(value.getDate());
        } else {
            setYear(undefined);
            setMonth(undefined);
            setDay(undefined);
        }
    }, [value]);

    // Generate years for selection (100 years back from current year)
    const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 100 }, (_, i) => currentYear - i);
    }, []);

    // Month names
    const months = [
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
    ];

    // Generate days for the selected month and year
    const daysInMonth = React.useMemo(() => {
        if (year === undefined || month === undefined) return 31;
        return new Date(year, month + 1, 0).getDate();
    }, [year, month]);

    const days = React.useMemo(() => {
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }, [daysInMonth]);

    // Update the date when any part changes
    React.useEffect(() => {
        if (year !== undefined && month !== undefined && day !== undefined) {
            // Make sure day is valid for the month
            const validDay = Math.min(day, daysInMonth);
            const newDate = new Date(year, month, validDay);
            onChange(newDate);
        }
    }, [year, month, day, daysInMonth, onChange]);

    // Handle year change
    const handleYearChange = (selectedYear: string) => {
        const yearNum = Number.parseInt(selectedYear, 10);
        setYear(yearNum);

        // If we don't have month/day yet, open the month/day picker
        if (month === undefined || day === undefined) {
            setMonthDayOpen(true);
        }
    };

    // Handle month selection
    const handleMonthSelect = (monthIndex: number) => {
        setMonth(monthIndex);
    };

    // Handle day selection
    const handleDaySelect = (selectedDay: number) => {
        setDay(selectedDay);
        setMonthDayOpen(false);
    };

    return (
        <div className="flex gap-2 w-full">
            {/* Year Selection */}
            <Select
                value={year?.toString()}
                onValueChange={handleYearChange}
                disabled={disabled}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                    {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                            {y}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Month and Day Selection */}
            <Popover open={monthDayOpen} onOpenChange={setMonthDayOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !(month !== undefined && day !== undefined) &&
                                "text-muted-foreground"
                        )}
                        disabled={disabled || year === undefined}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {month !== undefined && day !== undefined
                            ? format(new Date(2000, month, day), "MMMM d")
                            : "Month & Day"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 space-y-3">
                        {/* Month selection */}
                        <div className="space-y-1.5">
                            <div className="font-medium text-sm">
                                Select Month
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                {months.map((monthName, index) => (
                                    <Button
                                        key={monthName}
                                        variant={
                                            month === index
                                                ? "default"
                                                : "outline"
                                        }
                                        className="h-9"
                                        onClick={() => handleMonthSelect(index)}
                                    >
                                        {monthName.substring(0, 3)}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Day selection - only show if month is selected */}
                        {month !== undefined && (
                            <div className="space-y-1.5">
                                <div className="font-medium text-sm">
                                    Select Day
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {days.map((d) => (
                                        <Button
                                            key={d}
                                            variant={
                                                day === d
                                                    ? "default"
                                                    : "outline"
                                            }
                                            className="h-9 w-9 p-0"
                                            onClick={() => handleDaySelect(d)}
                                        >
                                            {d}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
