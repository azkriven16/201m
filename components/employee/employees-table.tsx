"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Update the Employee interface to include employeeType
interface Employee {
    id: string;
    fullName: string;
    position: string;
    education: string;
    avatar: string | null;
    createdAt: Date;
    employeeType?:
        | "Teaching"
        | "NonTeaching"
        | "cosTeaching"
        | "cosNonTeaching";
    biometricId?: string | null;
    designation?: string | null;
    email?: string | null;
    employmentDate?: string | null;
}

// Define type for the filter
type EmployeeTypeFilter =
    | "All"
    | "Teaching"
    | "NonTeaching"
    | "cosTeaching"
    | "cosNonTeaching";

interface EmployeesTableProps {
    employees: Employee[];
}

export function EmployeesTable({ employees }: EmployeesTableProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const [typeFilter, setTypeFilter] = useState<EmployeeTypeFilter>("All");

    // Generate email from name
    const getEmailFromName = (name: string) => {
        return `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
    };

    // Filter employees based on search query and type filter
    const filteredEmployees = employees.filter((emp) => {
        // Type filter
        if (typeFilter !== "All" && emp.employeeType !== typeFilter) {
            return false;
        }

        // Search filter
        return (
            emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.education.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (emp.biometricId &&
                emp.biometricId
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())) ||
            (emp.designation &&
                emp.designation
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())) ||
            (emp.email &&
                emp.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (emp.employmentDate &&
                emp.employmentDate
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())) ||
            getEmailFromName(emp.fullName).includes(searchQuery.toLowerCase())
        );
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEmployees = filteredEmployees.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    // View employee
    const viewEmployee = (id: string) => {
        router.push(`/employees/view/${id}`);
    };

    // Edit employee
    const editEmployee = (id: string) => {
        router.push(`/employees/edit/${id}`);
    };

    // Delete employee
    const deleteEmployee = async (id: string) => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/employees/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete employee");
            }

            // Show success toast
            toast.success("Employee deleted successfully", {
                description: `${employeeToDelete?.fullName} has been removed from the system.`,
                duration: 5000,
            });

            // Refresh the page to update the employee list
            router.refresh();
        } catch (error) {
            console.error("Error deleting employee:", error);

            // Show error toast
            toast.error("Failed to delete employee", {
                description:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred",
            });
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setEmployeeToDelete(null);
        }
    };

    // Confirm delete
    const confirmDelete = (emp: Employee) => {
        setEmployeeToDelete(emp);
        setDeleteDialogOpen(true);
    };

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    // Generate employee ID
    const getEmployeeId = (index: number) => {
        return `EMP${String(index + 1).padStart(3, "0")}`;
    };

    // Get badge variant and label based on employee type
    const getEmployeeBadge = (type?: string) => {
        switch (type) {
            case "Teaching":
                return { variant: "default", label: "Faculty" };
            case "NonTeaching":
                return { variant: "secondary", label: "Staff" };
            case "cosTeaching":
                return { variant: "outline", label: "COS Faculty" };
            case "cosNonTeaching":
                return { variant: "outline", label: "COS Staff" };
            default:
                return { variant: "secondary", label: "Unknown" };
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search employees..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Select
                        value={typeFilter}
                        onValueChange={(value: EmployeeTypeFilter) => {
                            setTypeFilter(value);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Types</SelectItem>
                            <SelectItem value="Teaching">Teaching</SelectItem>
                            <SelectItem value="NonTeaching">
                                Non-Teaching
                            </SelectItem>
                            <SelectItem value="cosTeaching">
                                COS Teaching
                            </SelectItem>
                            <SelectItem value="cosNonTeaching">
                                COS Non-Teaching
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                            setItemsPerPage(Number.parseInt(value));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="5 per page" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5 per page</SelectItem>
                            <SelectItem value="10">10 per page</SelectItem>
                            <SelectItem value="20">20 per page</SelectItem>
                            <SelectItem value="50">50 per page</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Educational Attainment</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Employment Date</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedEmployees.length > 0 ? (
                            paginatedEmployees.map((emp, index) => (
                                <TableRow key={emp.id}>
                                    <TableCell className="font-medium">
                                        {emp.biometricId ||
                                            getEmployeeId(startIndex + index)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    viewEmployee(emp.id)
                                                }
                                            >
                                                {emp.avatar ? (
                                                    <AvatarImage
                                                        src={emp.avatar}
                                                        alt={emp.fullName}
                                                    />
                                                ) : null}
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {getInitials(emp.fullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">
                                                    {emp.fullName}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                getEmployeeBadge(
                                                    emp.employeeType
                                                ).variant as any
                                            }
                                        >
                                            {
                                                getEmployeeBadge(
                                                    emp.employeeType
                                                ).label
                                            }
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{emp.position}</TableCell>
                                    <TableCell>{emp.education}</TableCell>
                                    <TableCell>
                                        {emp.designation || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {emp.email ||
                                            getEmailFromName(emp.fullName)}
                                    </TableCell>
                                    <TableCell>
                                        {emp.employmentDate || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Open menu
                                                    </span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        viewEmployee(emp.id)
                                                    }
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    <span>View</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        editEmployee(emp.id)
                                                    }
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() =>
                                                        confirmDelete(emp)
                                                    }
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    className="h-24 text-center"
                                >
                                    No employees found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {filteredEmployees.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-
                        {Math.min(
                            startIndex + itemsPerPage,
                            filteredEmployees.length
                        )}{" "}
                        of {filteredEmployees.length} employees
                    </p>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1)
                                        )
                                    }
                                    className={
                                        currentPage === 1
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>

                            {Array.from({
                                length: Math.min(totalPages, 5),
                            }).map((_, i) => {
                                const pageNumber = i + 1;
                                return (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                            isActive={
                                                currentPage === pageNumber
                                            }
                                            onClick={() =>
                                                setCurrentPage(pageNumber)
                                            }
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}

                            {totalPages > 5 && (
                                <>
                                    <PaginationItem>
                                        <PaginationLink>...</PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink
                                            onClick={() =>
                                                setCurrentPage(totalPages)
                                            }
                                        >
                                            {totalPages}
                                        </PaginationLink>
                                    </PaginationItem>
                                </>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, totalPages)
                                        )
                                    }
                                    className={
                                        currentPage === totalPages
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the employee record for
                            "{employeeToDelete?.fullName}". This action cannot
                            be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                employeeToDelete &&
                                deleteEmployee(employeeToDelete.id)
                            }
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}