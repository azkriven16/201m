"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface StepDatePickerProps {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    disabled?: boolean;
    className?: string;
}

type SelectionStep = "year" | "month" | "day";

export function StepDatePicker({
    value,
    onChange,
    disabled,
    className,
}: StepDatePickerProps) {
    const [open, setOpen] = React.useState(false);
    const [step, setStep] = React.useState<SelectionStep>("year");
    const [selectedYear, setSelectedYear] = React.useState<number | null>(
        value ? value.getFullYear() : null
    );
    const [selectedMonth, setSelectedMonth] = React.useState<number | null>(
        value ? value.getMonth() : null
    );
    const [yearPage, setYearPage] = React.useState(
        Math.floor((value?.getFullYear() || new Date().getFullYear()) / 20) * 20
    );

    // Reset step when opening the popover
    React.useEffect(() => {
        if (open) {
            // If we already have a value, start at the appropriate step
            if (value) {
                setSelectedYear(value.getFullYear());
                setSelectedMonth(value.getMonth());
                setStep("day");
            } else {
                setStep("year");
                setSelectedYear(null);
                setSelectedMonth(null);
            }
        }
    }, [open, value]);

    // Generate years for the current page
    const years = React.useMemo(() => {
        return Array.from({ length: 20 }, (_, i) => yearPage + i);
    }, [yearPage]);

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
    const days = React.useMemo(() => {
        if (selectedYear === null || selectedMonth === null) return [];

        const daysInMonth = new Date(
            selectedYear,
            selectedMonth + 1,
            0
        ).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }, [selectedYear, selectedMonth]);

    // Handle year selection
    const handleYearSelect = (year: number) => {
        setSelectedYear(year);
        setStep("month");
    };

    // Handle month selection
    const handleMonthSelect = (monthIndex: number) => {
        setSelectedMonth(monthIndex);
        setStep("day");
    };

    // Handle day selection
    const handleDaySelect = (day: number) => {
        if (selectedYear !== null && selectedMonth !== null) {
            const newDate = new Date(selectedYear, selectedMonth, day);
            onChange(newDate);
            setOpen(false);
        }
    };

    // Navigate to previous year page
    const prevYearPage = () => {
        setYearPage(yearPage - 20);
    };

    // Navigate to next year page
    const nextYearPage = () => {
        setYearPage(yearPage + 20);
    };

    // Go back to previous step
    const goBack = () => {
        if (step === "month") {
            setStep("year");
        } else if (step === "day") {
            setStep("month");
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, "PPP") : "Select date"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="p-2 space-y-4">
                    {/* Header with back button */}
                    <div className="flex items-center justify-between">
                        {step !== "year" ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={goBack}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        ) : (
                            <div className="w-8\" />
                        )}
                        <div className="font-medium text-sm">
                            {step === "year" && "Select Year"}
                            {step === "month" && "Select Month"}
                            {step === "day" && "Select Day"}
                        </div>
                        <div className="w-8" /> {/* Spacer for alignment */}
                    </div>

                    {/* Year selection */}
                    {step === "year" && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center mb-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={prevYearPage}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium">
                                    {yearPage} - {yearPage + 19}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={nextYearPage}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {years.map((year) => (
                                    <Button
                                        key={year}
                                        variant={
                                            selectedYear === year
                                                ? "default"
                                                : "outline"
                                        }
                                        className="h-9"
                                        onClick={() => handleYearSelect(year)}
                                    >
                                        {year}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Month selection */}
                    {step === "month" && selectedYear !== null && (
                        <div className="grid grid-cols-3 gap-2">
                            {months.map((month, index) => (
                                <Button
                                    key={month}
                                    variant={
                                        selectedMonth === index
                                            ? "default"
                                            : "outline"
                                    }
                                    className="h-9"
                                    onClick={() => handleMonthSelect(index)}
                                >
                                    {month.substring(0, 3)}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Day selection */}
                    {step === "day" &&
                        selectedYear !== null &&
                        selectedMonth !== null && (
                            <div>
                                <div className="text-center mb-2 text-sm font-medium">
                                    {months[selectedMonth]} {selectedYear}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {/* Day header */}
                                    {[
                                        "Su",
                                        "Mo",
                                        "Tu",
                                        "We",
                                        "Th",
                                        "Fr",
                                        "Sa",
                                    ].map((day) => (
                                        <div
                                            key={day}
                                            className="text-center text-xs text-muted-foreground py-1"
                                        >
                                            {day}
                                        </div>
                                    ))}

                                    {/* Empty cells for proper day alignment */}
                                    {Array.from({
                                        length: new Date(
                                            selectedYear,
                                            selectedMonth,
                                            1
                                        ).getDay(),
                                    }).map((_, index) => (
                                        <div key={`empty-${index}`} />
                                    ))}

                                    {/* Days */}
                                    {days.map((day) => (
                                        <Button
                                            key={day}
                                            variant="ghost"
                                            className="h-8 w-8 p-0 font-normal"
                                            onClick={() => handleDaySelect(day)}
                                        >
                                            {day}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
