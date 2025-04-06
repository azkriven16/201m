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
import { CalendarIcon, Loader2 } from "lucide-react";
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
import { useRouter } from "next/navigation";
import type { Employee } from "@/db/schema";
import type { DocumentWithAuthor } from "@/lib/db";
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
});

export function EditDocumentForm({
    document,
    employees,
}: {
    document: DocumentWithAuthor;
    employees: Employee[];
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isReplacing, setIsReplacing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{
        url: string;
        key: string;
        name: string;
        size: number;
        type: string;
    } | null>(null);

    // Format the expirationDate for the form
    const expirationDate = document.expirationDate
        ? new Date(document.expirationDate)
        : undefined;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: document.title,
            category: document.category as any,
            expirationDate: expirationDate,
            authorId: document.authorId,
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
        return type.split("/")[1]?.toUpperCase() || document.documentType;
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
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

            // Prepare update data
            const updateData: any = {
                title: values.title,
                category: values.category,
                status: status,
                expirationDate: values.expirationDate
                    ? values.expirationDate.toISOString()
                    : null,
                authorId: values.authorId,
            };

            // If a new file was uploaded, update file-related fields
            if (uploadedFile) {
                // Delete the old file if we have a fileKey
                if (document.fileKey) {
                    try {
                        await fetch("/api/uploadthing/delete", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ fileKey: document.fileKey }),
                        });
                    } catch (error) {
                        console.error("Error deleting old file:", error);
                        // Continue with the update even if file deletion fails
                    }
                }

                // Add new file information to the update
                updateData.path = uploadedFile.url;
                updateData.fileKey = uploadedFile.key;
                updateData.fileName = uploadedFile.name;
                updateData.documentType = getFileType(uploadedFile.type);
                updateData.documentSize = formatFileSize(uploadedFile.size);
            }

            const response = await fetch(`/api/documents/${document.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update document");
            }

            toast.success("Document updated successfully", {
                description: `${values.title} has been updated.`,
            });

            router.push("/documents");
            router.refresh();
        } catch (error) {
            console.error("Error updating document:", error);
            toast.error("Failed to update document", {
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
                    {isReplacing ? (
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
                                    setIsReplacing(false);
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
                                setIsReplacing(false);
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
                                {document.documentType === "PDF" ? (
                                    <div className="w-10 h-10 bg-red-100 rounded-md flex items-center justify-center text-red-500">
                                        PDF
                                    </div>
                                ) : document.documentType === "DOCX" ? (
                                    <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center text-blue-500">
                                        DOC
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                                        {document.documentType}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">
                                    {uploadedFile
                                        ? uploadedFile.name
                                        : document.fileName ||
                                          document.path.split("/").pop()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {uploadedFile
                                        ? getFileType(uploadedFile.type)
                                        : document.documentType}{" "}
                                    •
                                    {uploadedFile
                                        ? formatFileSize(uploadedFile.size)
                                        : document.documentSize}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsReplacing(true)}
                            >
                                Replace
                            </Button>
                        </div>
                    )}
                    <FormDescription>
                        You can replace the current document file with a new one
                        if needed.
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
                    <Button type="submit" disabled={isLoading || isReplacing}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update Document"
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
