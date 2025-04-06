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
import { CalendarIcon, FileIcon, Loader2 } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/lib/uploadthing";

// Define the schema for client-side validation
const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
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
    // We'll handle file validation separately with UploadThing
});

export function DocumentForm({ employees }: { employees: Employee[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{
        url: string;
        key: string;
        name: string;
        size: number;
        type: string;
    } | null>(null);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            category: undefined,
            expirationDate: undefined,
            authorId: "",
        },
    });

    // Format file size for display
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        else if (bytes < 1024 * 1024 * 1024)
            return (bytes / (1024 * 1024)).toFixed(1) + " MB";
        else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
    };

    // Get file type display name
    const getFileType = (type: string): string => {
        if (type.includes("pdf")) return "PDF";
        if (type.includes("word") || type.includes("msword")) return "DOCX";
        if (type.includes("excel") || type.includes("spreadsheet"))
            return "XLSX";
        return type.split("/")[1]?.toUpperCase() || "UNKNOWN";
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Validate that a file has been uploaded
        if (!uploadedFile) {
            toast.error("Please upload a document file", {
                description:
                    "A document file is required to complete this form.",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Determine document status based on expiration date
            let status = "Active";
            if (values.expirationDate) {
                const expirationDate = values.expirationDate;
                const now = new Date();
                const thirtyDaysFromNow = new Date(now);
                thirtyDaysFromNow.setDate(now.getDate() + 30);

                if (expirationDate < now) {
                    status = "Expired";
                } else if (expirationDate < thirtyDaysFromNow) {
                    status = "AboutToExpire";
                }
            }

            // Create document in database using Drizzle
            const response = await fetch("/api/documents", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: values.title,
                    path: uploadedFile.url,
                    fileKey: uploadedFile.key,
                    fileName: uploadedFile.name,
                    category: values.category,
                    status: status,
                    documentType: getFileType(uploadedFile.type),
                    documentSize: formatFileSize(uploadedFile.size),
                    expirationDate: values.expirationDate
                        ? values.expirationDate.toISOString()
                        : null,
                    authorId: values.authorId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create document");
            }

            toast.success("Document uploaded successfully", {
                description: `${values.title} has been uploaded.`,
            });

            // Redirect to documents page
            router.push("/documents");
            router.refresh();
        } catch (error) {
            console.error("Error creating document:", error);
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

                <div className="space-y-2">
                    <FormLabel>Document File</FormLabel>
                    {!uploadedFile ? (
                        <UploadDropzone
                            endpoint="documentUploader"
                            onClientUploadComplete={(res) => {
                                if (res && res.length > 0) {
                                    setUploadedFile({
                                        url: res[0].url,
                                        key: res[0].key,
                                        name: res[0].name,
                                        size: res[0].size,
                                        type:
                                            res[0].type ||
                                            "application/octet-stream",
                                    });
                                    toast.success(
                                        "File uploaded successfully",
                                        {
                                            description:
                                                "Your document has been uploaded and is ready to be submitted.",
                                        }
                                    );
                                }
                            }}
                            onUploadError={(error: Error) => {
                                toast.error("Error uploading file", {
                                    description:
                                        error.message ||
                                        "There was a problem uploading your document.",
                                });
                            }}
                            onUploadBegin={() => {
                                toast.info("Uploading file...", {
                                    description:
                                        "Please wait while we upload your document.",
                                });
                            }}
                        />
                    ) : (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-md">
                            <div className="flex-shrink-0">
                                <FileIcon className="h-10 w-10 text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">
                                    {uploadedFile.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {getFileType(uploadedFile.type)} •{" "}
                                    {formatFileSize(uploadedFile.size)}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setUploadedFile(null)}
                            >
                                Replace
                            </Button>
                        </div>
                    )}
                    <FormDescription>
                        Upload a document file (PDF, DOC, DOCX, XLS, XLSX).
                        Maximum file size is 10MB.
                    </FormDescription>
                </div>

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

                <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading || !uploadedFile}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            "Upload Document"
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/documents")}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
