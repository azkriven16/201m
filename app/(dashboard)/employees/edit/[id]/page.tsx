import { getEmployeeById } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmployeeForm } from "@/components/employee/employee-form";
import { auth } from "@/auth";

export default async function EditEmployeePage({
    params,
}: {
    params: Promise<any>;
}) {
    // Fetch the employee to edit using Drizzle
    const { id } = await params;

    const employee = await getEmployeeById(id);

    // If employee not found, return 404
    if (!employee) {
        notFound();
    }

    const session = await auth();

    if (session?.user?.email !== employee.email) return notFound();

    return (
        <div className="container mx-auto py-6 p-4">
            <div className="mb-6">
                <Link href="/employees">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Employees
                    </Button>
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold mb-6">Edit Employee</h1>
                <EmployeeForm employee={employee} />
            </div>
        </div>
    );
}
