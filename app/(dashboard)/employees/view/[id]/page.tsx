import { getEmployeeById, getDocumentsByEmployeeId } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Mail,
    GraduationCap,
    Briefcase,
    Calendar,
    FileText,
    Cake,
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
import { format } from "date-fns";
import { EmployeeDocumentsTable } from "@/components/employee/employee-documents-table";
    
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

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    // Generate email from name
    const getEmailFromName = (name: string) => {
        return `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
    };

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
                <Card className="md:col-span-1">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Avatar className="h-24 w-24">
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
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    {getEmailFromName(employee.fullName)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span>{employee.position}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                <span>{employee.education}</span>
                            </div>
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

                {/* Employee Documents */}
                <div className="md:col-span-2 space-y-6">
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

                    <div className="flex justify-end gap-4">
                        <Link href={`/employees/edit/${employee.id}`}>
                            <Button variant="outline">Edit Employee</Button>
                        </Link>
                        <Link href="/documents/upload">
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
