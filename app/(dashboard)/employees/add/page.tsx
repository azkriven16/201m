import { EmployeeForm } from "@/components/employee/employee-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddEmployeePage() {
    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <div className="mb-6">
                <Link href="/employees">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Employees
                    </Button>
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold mb-6">Add New Employee</h1>
                <EmployeeForm />
            </div>
        </div>
    );
}
