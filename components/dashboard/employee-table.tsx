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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Employee } from "@/db/schema";

interface EmployeeTableProps {
    employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    // Filter employees based on search query
    const filteredEmployees = employees.filter((emp) => {
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
            (emp.mobileNumber &&
                emp.mobileNumber
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())) ||
            `${emp.fullName
                .toLowerCase()
                .replace(/\s+/g, ".")}@example.com`.includes(
                searchQuery.toLowerCase()
            )
        );
    });

    // View employee
    const viewEmployee = (id: string) => {
        router.push(`/employees/view/${id}`);
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

    return (
        <div className="space-y-4">
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search employees..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Biometric ID</TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead>Academic Rank</TableHead>
                            <TableHead>Educational Attainment</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Mobile Number</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((emp, index) => (
                                <TableRow key={emp.id}>
                                    <TableCell className="font-medium">
                                        {emp.biometricId ||
                                            `BIO${String(index + 1).padStart(
                                                3,
                                                "0"
                                            )}`}
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
                                    <TableCell>{emp.position}</TableCell>
                                    <TableCell>{emp.education}</TableCell>
                                    <TableCell>
                                        {emp.designation || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {emp.email ||
                                            `${emp.fullName
                                                .toLowerCase()
                                                .replace(
                                                    /\s+/g,
                                                    "."
                                                )}@example.com`}
                                    </TableCell>
                                    <TableCell>
                                        {emp.mobileNumber || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => viewEmployee(emp.id)}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center"
                                >
                                    No employees found.
                                </TableCell>
                            </TableRow>
                        )}
                </TableBody>
                </Table>
            </div>
        </div>
    );
}
