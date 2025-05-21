import { getAllEmployees } from "@/lib/db";
import { EmployeesTable } from "@/components/employee/employees-table";
import { EmployeeStats } from "@/components/employee/employee-stats";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    UserPlus,
    Users,
    Briefcase,
    School,
    UserCog,
    Cake,
    User2,
    UserCheck2,
} from "lucide-react";

export default async function EmployeesPage() {
    // Fetch employees using Drizzle
    const employees = await getAllEmployees();

    // Get unique positions (academic ranks)
    const positions = Array.from(new Set(employees.map((emp) => emp.position)));

    // Calculate statistics

    const teachingEmployees = employees.filter(
        (emp) => emp.employeeType === "Teaching"
    ).length;
    const nonTeachingEmployees = employees.filter(
        (emp) => emp.employeeType === "NonTeaching"
    ).length;
    const cosTeachingEmployees = employees.filter(
        (emp) => emp.employeeType === "cosTeaching"
    ).length;
    const cosNonTeachingEmployees = employees.filter(
        (emp) => emp.employeeType === "cosNonTeaching"
    ).length;

    return (
        <div className="container mx-auto py-6 space-y-6 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Employees</h1>
                <div className="flex gap-2">
                    <Link href="/employees/birthdays">
                        <Button variant="outline" className="gap-2">
                            <Cake className="h-4 w-4" />
                            Birthdays
                        </Button>
                    </Link>
                    <Link href="/employees/add">
                        <Button className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Add Employee
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <EmployeeStats
                    title="Teaching Staff"
                    value={teachingEmployees}
                    icon={<User2 className="h-5 w-5 text-green-500" />}
                />
                <EmployeeStats
                    title="Non-Teaching Staff"
                    value={nonTeachingEmployees}
                    icon={<User2 className="h-5 w-5 text-blue-500" />}
                />
                <EmployeeStats
                    title="COS Non-Teaching Staff"
                    value={cosNonTeachingEmployees}
                    icon={<User2 className="h-5 w-5 text-purple-500" />}
                />
                <EmployeeStats
                    title="COS Teaching Staff"
                    value={cosTeachingEmployees}
                    icon={<User2 className="h-5 w-5 text-yellow-500" />}
                />
            </div>

            <EmployeesTable employees={employees} />
        </div>
    );
}
