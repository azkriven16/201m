import { getEmployeeById, getDocumentsByEmployeeId,getSalaryHistoryByEmployeeId } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Mail,
    GraduationCap,
    Briefcase,
    Calendar,
    FileText,
    Cake,
    Phone,
    BadgeIcon as IdCard,
    Award,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { format, isSameDay } from "date-fns";
import { EmployeeDocumentsTable } from "@/components/employee/employee-documents-table";
import { SalaryHistory } from "@/components/salary/employee-salary";
import { auth } from "@/auth";

export default async function ViewEmployeePage({
    params,
}: {
    params: Promise<any>;
}) {
    // Fetch the employee with Drizzle
    const { id } = await params;
    const employee = await getEmployeeById(id);

    // If employee not found, return 404
    if (!employee) {
        notFound();
    }

    // Get employee documents with Drizzle
    const documents = await getDocumentsByEmployeeId(employee.id);

    // Get employee salary records
    const salaryHistory = await getSalaryHistoryByEmployeeId(employee.id);

    // Get current user session
    const session = await auth();
    const user = session?.user;

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    // Generate email from name if not provided
    const getEmailDisplay = () => {
        if (employee.email) return employee.email;
        return `${employee.fullName
            .toLowerCase()
            .replace(/\s+/g, ".")}@example.com`;
    };

    // Check if today is employee's birthday
    const today = new Date();
    const birthday = new Date(employee.birthday);
    const isBirthday = isSameDay(
        new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate()),
        today
    );

    return (
        <div className="container mx-auto py-6 max-w-5xl">
            <div className="mb-6">
                <Link href="/employees">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Employees
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Employee Profile Card */}
                <Card
                    className={`md:col-span-1 ${
                        isBirthday ? "border-primary/50 bg-primary/5" : ""
                    }`}
                >
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Avatar
                                className={`h-24 w-24 ${
                                    isBirthday ? "border-2 border-primary" : ""
                                }`}
                            >
                                {employee.avatar ? (
                                    <AvatarImage
                                        src={employee.avatar}
                                        alt={employee.fullName}
                                    />
                                ) : null}
                                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                    {getInitials(employee.fullName)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle>{employee.fullName}</CardTitle>
                        <CardDescription>{employee.position}</CardDescription>
                        {isBirthday && (
                            <div className="mt-2 flex items-center justify-center gap-2 text-primary font-medium">
                                <Cake className="h-4 w-4" />
                                <span>Birthday Today! 🎉</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{getEmailDisplay()}</span>
                            </div>
                            {employee.mobileNumber && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{employee.mobileNumber}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span>{employee.position}</span>
                            </div>
                            {employee.designation && (
                                <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4 text-muted-foreground" />
                                    <span>{employee.designation}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                <span>{employee.education}</span>
                            </div>
                            {employee.biometricId && (
                                <div className="flex items-center gap-2">
                                    <IdCard className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        Biometric ID: {employee.biometricId}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Cake className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    Birthday:{" "}
                                    {format(
                                        new Date(employee.birthday),
                                        "MMMM d, yyyy"
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    Joined{" "}
                                    {format(
                                        new Date(employee.createdAt),
                                        "MMMM d, yyyy"
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>{documents.length} Documents</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Employee Documents and Salary History */}
                <div className="md:col-span-2 space-y-6">
                    {/* Documents Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Documents
                            </CardTitle>
                            <CardDescription>
                                All documents associated with{" "}
                                {employee.fullName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {documents.length > 0 ? (
                                <EmployeeDocumentsTable documents={documents} />
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No documents found for this employee.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Salary History Card */}
                    <SalaryHistory
                        employeeId={employee.id}
                        salaries={salaryHistory}
                        currentUser={{
                            id: user?.id || "",
                            name: user?.name || "System User",
                        }}
                    />

                    <div className="flex justify-end gap-4">
                        <Link href={`/employees/edit/${employee.id}`}>
                            <Button variant="outline">Edit Employee</Button>
                        </Link>
                        <Link
                            href={`/documents/upload?employeeId=${employee.id}`}
                        >
                            <Button>
                                <FileText className="mr-2 h-4 w-4" />
                                Upload Document
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
