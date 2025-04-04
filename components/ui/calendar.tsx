"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = "buttons",
    fromYear,
    toYear,
    ...props
}: CalendarProps & {
    fromYear?: number;
    toYear?: number;
}) {
    const years = React.useMemo(() => {
        if (!fromYear || !toYear) return [];
        return Array.from(
            { length: toYear - fromYear + 1 },
            (_, i) => fromYear + i
        );
    }, [fromYear, toYear]);

    const months = React.useMemo(() => {
        return [
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
    }, []);

    function CustomCaption({
        displayMonth,
        onMonthChange,
    }: {
        displayMonth: Date;
        onMonthChange: (date: Date) => void;
    }) {
        const handleMonthChange = (month: string) => {
            const newDate = new Date(displayMonth);
            newDate.setMonth(months.findIndex((m) => m === month));
            onMonthChange(newDate);
        };

        const handleYearChange = (year: string) => {
            const newDate = new Date(displayMonth);
            newDate.setFullYear(Number.parseInt(year));
            onMonthChange(newDate);
        };

        return (
            <div className="flex justify-center gap-1 px-2">
                <Select
                    value={months[displayMonth.getMonth()]}
                    onValueChange={handleMonthChange}
                >
                    <SelectTrigger className="w-[120px] h-8 text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((month) => (
                            <SelectItem
                                key={month}
                                value={month}
                                className="text-sm"
                            >
                                {month}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={displayMonth.getFullYear().toString()}
                    onValueChange={handleYearChange}
                >
                    <SelectTrigger className="w-[90px] h-8 text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {years.length > 0
                            ? years.map((year) => (
                                  <SelectItem
                                      key={year}
                                      value={year.toString()}
                                      className="text-sm"
                                  >
                                      {year}
                                  </SelectItem>
                              ))
                            : // Fallback if years array is empty
                              Array.from(
                                  { length: 100 },
                                  (_, i) => new Date().getFullYear() - 50 + i
                              ).map((year) => (
                                  <SelectItem
                                      key={year}
                                      value={year.toString()}
                                      className="text-sm"
                                  >
                                      {year}
                                  </SelectItem>
                              ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center gap-1",
                caption_label:
                    captionLayout === "dropdown-buttons"
                        ? "hidden"
                        : "text-sm font-medium",
                caption_dropdowns: "flex justify-center gap-1",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                    "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                IconRight: ({ ...props }) => (
                    <ChevronRight className="h-4 w-4" />
                ),
                // @ts-ignore
                Dropdown:
                    captionLayout === "dropdown-buttons"
                        ? CustomCaption
                        : undefined,
            }}
            {...props}
        />
    );
}
Calendar.displayName = "Calendar";

export { Calendar };
