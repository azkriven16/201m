"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Salary } from "@/db/schema";

// Types matching our drizzle schema
interface User {
    id: string;
    name: string;
}

interface SalaryHistoryProps {
    employeeId: string;
    salaries: any;
    currentUser: User;
}

export function SalaryHistory({
    employeeId,
    salaries,
    currentUser,
}: SalaryHistoryProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(
        new Date()
    );
    const [reason, setReason] = useState<Salary["reason"]>("Annual");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    // Sort salaries by effective date (most recent first)
    const sortedSalaries = [...salaries].sort(
        (a, b) =>
            new Date(b.effectiveDate).getTime() -
            new Date(a.effectiveDate).getTime()
    );

    // Get current salary (most recent)
    const currentSalary = sortedSalaries.length > 0 ? sortedSalaries[0] : null;

    // Calculate salary increase percentage
    const calculateIncrease = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    // Reset form
    const resetForm = () => {
        setAmount("");
        setEffectiveDate(new Date());
        setReason("Annual");
        setNotes("");
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || !effectiveDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);

        try {
            // Convert amount to number
            const amountNumber = parseFloat(amount);

            const response = await fetch("/api/salaries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    employeeId,
                    amount: amountNumber,
                    effectiveDate,
                    reason,
                    notes: notes || null,
                    createdById: currentUser.id,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to add salary record");
            }

            toast.success("Salary record added successfully");
            resetForm();
            setIsDialogOpen(false);

            // In a real app, you would update the salaries list or refetch data
            // For this example, we'll reload the page
            window.location.reload();
        } catch (error) {
            console.error("Error adding salary record:", error);
            toast.error(
                error instanceof Error ? error.message : "An error occurred"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Salary History</CardTitle>
                    <CardDescription>
                        Track and manage employee compensation
                    </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Salary Record
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Add New Salary Record</DialogTitle>
                                <DialogDescription>
                                    Enter the details of the salary adjustment.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="amount"
                                        className="text-right"
                                    >
                                        Amount (₱)
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g. 30000.00"
                                        className="col-span-3"
                                        value={amount}
                                        onChange={(e) =>
                                            setAmount(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="effectiveDate"
                                        className="text-right"
                                    >
                                        Effective Date
                                    </Label>
                                    <div className="col-span-3">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !effectiveDate &&
                                                            "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {effectiveDate ? (
                                                        format(
                                                            effectiveDate,
                                                            "PPP"
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={effectiveDate}
                                                    onSelect={setEffectiveDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="reason"
                                        className="text-right"
                                    >
                                        Reason
                                    </Label>
                                    <Select
                                        value={reason}
                                        onValueChange={(value) =>
                                            setReason(value as Salary["reason"])
                                        }
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Initial">
                                                Initial Salary
                                            </SelectItem>
                                            <SelectItem value="Annual">
                                                Annual Increase
                                            </SelectItem>
                                            <SelectItem value="Promotion">
                                                Promotion
                                            </SelectItem>
                                            <SelectItem value="Performance">
                                                Performance-based
                                            </SelectItem>
                                            <SelectItem value="Adjustment">
                                                Market Adjustment
                                            </SelectItem>
                                            <SelectItem value="Other">
                                                Other
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="notes"
                                        className="text-right align-top mt-2"
                                    >
                                        Notes
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Additional information"
                                        className="col-span-3"
                                        value={notes}
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting
                                        ? "Saving..."
                                        : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {currentSalary && (
                    <div className="bg-primary/10 p-4 mb-6 rounded-md">
                        <h3 className="font-medium text-lg mb-1">
                            Current Salary
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="text-3xl font-bold text-primary">
                                {formatCurrency(Number(currentSalary.amount))}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Effective since{" "}
                                {format(
                                    new Date(currentSalary.effectiveDate),
                                    "MMMM d, yyyy"
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {sortedSalaries.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Effective Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Increase</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedSalaries.map((salary, index) => {
                                const previousSalary =
                                    index < sortedSalaries.length - 1
                                        ? sortedSalaries[index + 1].amount
                                        : 0;
                                const increase = calculateIncrease(
                                    Number(salary.amount),
                                    Number(previousSalary)
                                );

                                return (
                                    <TableRow key={salary.id}>
                                        <TableCell>
                                            {format(
                                                new Date(salary.effectiveDate),
                                                "MMM d, yyyy"
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(
                                                Number(salary.amount)
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {index <
                                            sortedSalaries.length - 1 ? (
                                                <span
                                                    className={
                                                        increase > 0
                                                            ? "text-green-600"
                                                            : ""
                                                    }
                                                >
                                                    {increase > 0 ? "+" : ""}
                                                    {increase.toFixed(2)}%
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{salary.reason}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {salary.notes || "—"}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        No salary records found. Click "Add Salary Record" to
                        create the first entry.
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <p className="text-xs text-muted-foreground">
                    Salary records are stored securely and can only be accessed
                    by authorized personnel.
                </p>
            </CardFooter>
        </Card>
    );
}
