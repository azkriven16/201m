"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Employee } from "@/db/schema";

// Define the schema for client-side validation only
const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    // Use any for file input and validate it in the onSubmit function
    file: z.any(),
    category: z.enum(
        [
            "Appointment",
            "Diploma",
            "LicenseEligibility",
            "PersonalDataSheet",
            "ServiceRecord",
        ],
        {
            message: "Please select a document category.",
        }
    ),
    expirationDate: z.date().optional(),
    authorId: z.string().uuid({
        message: "Please select an employee.",
    }),
});

export function DocumentForm({ employees }: { employees: Employee[] }) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            category: undefined,
            expirationDate: undefined,
            authorId: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Client-side validation for file
        if (!values.file || !values.file[0]) {
            form.setError("file", {
                type: "custom",
                message: "Please select a file.",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("file", values.file[0]);
            formData.append("category", values.category);

            if (values.expirationDate) {
                formData.append(
                    "expirationDate",
                    values.expirationDate.toISOString()
                );
            }

            formData.append("authorId", values.authorId);

            const response = await fetch("/api/documents", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to upload document");
            }

            const data = await response.json();
            toast.success("Document uploaded successfully", {
                description: `${values.title} has been uploaded.`,
            });

            form.reset();
        } catch (error) {
            console.error("Error uploading document:", error);
            toast.error("Failed to upload document", {
                description:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
                encType="multipart/form-data"
            >
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Document Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Resume" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter a descriptive title for the document.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Document Category</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Appointment">
                                        Appointment
                                    </SelectItem>
                                    <SelectItem value="Diploma">
                                        Diploma
                                    </SelectItem>
                                    <SelectItem value="LicenseEligibility">
                                        License/Eligibility
                                    </SelectItem>
                                    <SelectItem value="PersonalDataSheet">
                                        Personal Data Sheet
                                    </SelectItem>
                                    <SelectItem value="ServiceRecord">
                                        Service Record
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Select the category that best describes this
                                document.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { onChange, value, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Document File</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    onChange={(e) => onChange(e.target.files)}
                                    {...fieldProps}
                                />
                            </FormControl>
                            <FormDescription>
                                Select the document file to upload. File type
                                and size will be automatically detected.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="expirationDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Expiration Date (Optional)</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className="w-full pl-3 text-left font-normal"
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                        // Removed the disabled prop to allow selecting past dates
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription>
                                Set an expiration date for the document. You can
                                select past dates for expired documents.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="authorId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Document Author</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((employee) => (
                                            <SelectItem
                                                key={employee.id}
                                                value={employee.id}
                                            >
                                                {employee.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormDescription>
                                Select the employee who owns this document.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Uploading..." : "Upload Document"}
                </Button>
            </form>
        </Form>
    );
}
