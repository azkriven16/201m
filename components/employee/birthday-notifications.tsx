"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Cake } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Employee {
    id: string;
    fullName: string;
    avatar: string | null;
    birthday: Date | string;
}

export default function BirthdayNotifications() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [todaysBirthdays, setTodaysBirthdays] = useState<Employee[]>([]);
    const [notificationsViewed, setNotificationsViewed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch employees data
    useEffect(() => {
        async function fetchEmployees() {
            setIsLoading(true);
            try {
                const response = await fetch("/api/employees");
                if (response.ok) {
                    const data = await response.json();
                    setEmployees(data);
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchEmployees();
    }, []);

    // Check for birthdays today
    useEffect(() => {
        if (employees.length > 0) {
            const today = new Date();
            const birthdays = employees.filter((employee) => {
                const birthday =
                    typeof employee.birthday === "string"
                        ? parseISO(employee.birthday)
                        : new Date(employee.birthday);

                return (
                    birthday.getDate() === today.getDate() &&
                    birthday.getMonth() === today.getMonth()
                );
            });

            setTodaysBirthdays(birthdays);

            // Reset viewed status when birthdays change
            if (birthdays.length > 0) {
                setNotificationsViewed(false);
            }
        }
    }, [employees]);

    // Helper to get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    // Handle notification click
    const handleNotificationClick = () => {
        setNotificationsViewed(true);

        if (todaysBirthdays.length > 0) {
            // Show toast for first birthday if not already viewed
            if (!notificationsViewed) {
                toast(
                    `🎂 Today is ${todaysBirthdays[0].fullName}'s birthday!`,
                    {
                        description:
                            todaysBirthdays.length > 1
                                ? `And ${
                                      todaysBirthdays.length - 1
                                  } other colleague${
                                      todaysBirthdays.length > 2 ? "s" : ""
                                  }. Check the birthday page for details.`
                                : "Wish them a happy birthday!",
                        action: {
                            label: "View",
                            onClick: () => router.push("/employees/birthdays"),
                        },
                    }
                );
            }
        }
    };

    if (isLoading || todaysBirthdays.length === 0) {
        return null;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className="relative p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
                    onClick={handleNotificationClick}
                >
                    <Bell className="h-5 w-5" />
                    {!notificationsViewed && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-80 p-0 border border-slate-200 shadow-md rounded-md"
            >
                <div className="p-3 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-slate-900">
                            Birthday Notifications
                        </h4>
                        <Cake className="h-4 w-4 text-red-500" />
                    </div>
                </div>
                <div className="max-h-[300px] overflow-auto">
                    {todaysBirthdays.map((employee) => (
                        <Link
                            key={employee.id}
                            href={`/employees/view/${employee.id}`}
                            className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-200 last:border-b-0"
                        >
                            <Avatar className="h-10 w-10 border-2 border-red-100">
                                {employee.avatar ? (
                                    <AvatarImage
                                        src={employee.avatar}
                                        alt={employee.fullName}
                                    />
                                ) : null}
                                <AvatarFallback className="bg-red-50 text-red-500">
                                    {getInitials(employee.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900">
                                    {employee.fullName}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Birthday today,{" "}
                                    {format(new Date(), "MMMM d")}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="p-2 border-t border-slate-200 bg-slate-50">
                    <Link
                        href="/employees/birthdays"
                        className="block w-full text-center text-sm text-red-500 hover:text-red-600 hover:underline"
                    >
                        View all birthdays
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
