import { getAllEmployees } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cake } from "lucide-react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BirthdayCalendar } from "@/components/employee/birthday-calendar";
import { UpcomingBirthdays } from "@/components/employee/upcoming-birthdays";
import { TodaysBirthdays } from "@/components/employee/todays-birthday";

export default async function EmployeeBirthdaysPage() {
    // Fetch all employees with their birthdays using Drizzle
    const employees = await getAllEmployees();

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Link href="/employees">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                Back to Employees
                            </span>
                            <span className="sm:hidden">Back</span>
                        </Button>
                    </Link>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold">
                    Employee Birthdays
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Birthday Calendar */}
                <div className="lg:col-span-3 order-1 lg:order-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">
                                Birthday Calendar
                            </CardTitle>
                            <CardDescription>
                                View all employee birthdays
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BirthdayCalendar employees={employees} />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar with Today's and Upcoming Birthdays */}
                <div className="lg:col-span-1 order-2 lg:order-1 space-y-6">
                    {/* Today's Birthdays - only shows if there are birthdays today */}
                    <TodaysBirthdays employees={employees} />

                    {/* Upcoming Birthdays */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Cake className="h-5 w-5" />
                                Upcoming Birthdays
                            </CardTitle>
                            <CardDescription>
                                Birthdays in the next 30 days
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UpcomingBirthdays employees={employees} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
