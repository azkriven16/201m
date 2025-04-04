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
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Define the employee type
interface Employee {
    id: string;
    fullName: string;
    position: string;
    education: string;
    avatar: string | null;
    createdAt: Date;
}

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

    // Filter employees based on search query
    const filteredEmployees = employees.filter((emp) => {
        return (
            emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.education.toLowerCase().includes(searchQuery.toLowerCase())
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

    // Generate email from name
    const getEmailFromName = (name: string) => {
        return `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
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
                            <TableHead>Academic Rank</TableHead>
                            <TableHead>Educational Attainment</TableHead>
                            <TableHead>Join Date</TableHead>
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
                                        {getEmployeeId(startIndex + index)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
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
                                                <div className="text-sm text-muted-foreground">
                                                    {getEmailFromName(
                                                        emp.fullName
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{emp.position}</TableCell>
                                    <TableCell>{emp.education}</TableCell>
                                    <TableCell>
                                        {format(
                                            new Date(emp.createdAt),
                                            "MMM d, yyyy"
                                        )}
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
                                    colSpan={6}
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
