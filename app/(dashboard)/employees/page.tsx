import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus, Users, Briefcase, GraduationCap, Cake } from "lucide-react";
import { EmployeeStats } from "@/components/employee/employee-stats";
import { EmployeesTable } from "@/components/employee/employees-table";
import { getAllEmployees } from "@/lib/db";

export default async function EmployeesPage() {
    // Fetch employees using Drizzle
    const employees = await getAllEmployees();

    // Get unique positions (academic ranks)
    const positions = Array.from(new Set(employees.map((emp) => emp.position)));

    // Calculate statistics
    const totalEmployees = employees.length;
    const totalPositions = positions.length;

    return (
        <div className="container mx-auto py-6 space-y-6 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Employees</h1>
                <div className="flex gap-2">
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
                    title="Total Departments"
                    value={totalPositions}
                    icon={<Briefcase className="h-5 w-5 text-gray-500" />}
                />
                <EmployeeStats
                    title="Active Employees"
                    value={totalEmployees}
                    icon={<Users className="h-5 w-5 text-green-500" />}
                />
                <EmployeeStats
                    title="On Leave"
                    value={0}
                    icon={<Users className="h-5 w-5 text-yellow-500" />}
                />
                <EmployeeStats
                    title="Total Employees"
                    value={totalEmployees}
                    icon={<GraduationCap className="h-5 w-5 text-blue-500" />}
                />
            </div>

            <EmployeesTable employees={employees} />
        </div>
    );
}
