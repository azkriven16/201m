"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function DashboardFilter() {
    const [date, setDate] = useState<Date>();
    const [documentType, setDocumentType] = useState<string>();
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        if (selectedDate && !activeFilters.includes("Date")) {
            setActiveFilters([...activeFilters, "Date"]);
        } else if (!selectedDate && activeFilters.includes("Date")) {
            setActiveFilters(activeFilters.filter((f) => f !== "Date"));
        }
    };

    const handleDocumentTypeChange = (value: string) => {
        setDocumentType(value);
        if (value && !activeFilters.includes("Document Type")) {
            setActiveFilters([...activeFilters, "Document Type"]);
        } else if (!value && activeFilters.includes("Document Type")) {
            setActiveFilters(
                activeFilters.filter((f) => f !== "Document Type")
            );
        }
    };

    const clearFilters = () => {
        setDate(undefined);
        setDocumentType(undefined);
        setActiveFilters([]);
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {date ? format(date, "PPP") : "Date Range"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            <Select
                value={documentType}
                onValueChange={handleDocumentTypeChange}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="license">License/Eligibility</SelectItem>
                    <SelectItem value="pds">Personal Data Sheet</SelectItem>
                    <SelectItem value="service">Service Record</SelectItem>
                </SelectContent>
            </Select>

            {activeFilters.length > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 gap-1"
                >
                    <Filter className="h-3 w-3" />
                    Clear Filters
                    <Badge variant="secondary" className="ml-1">
                        {activeFilters.length}
                    </Badge>
                </Button>
            )}
        </div>
    );
}
