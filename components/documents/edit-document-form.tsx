"use client";

import { PopoverContent } from "@/components/ui/popover";

import { PopoverTrigger } from "@/components/ui/popover";

import { Popover } from "@/components/ui/popover";

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
import {
    Loader2,
    Check,
    ChevronsUpDown,
    FileText,
    Clock,
    User,
    Save,
} from "lucide-react";
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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/date-picker";

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
        message: "Please select a document owner.",
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
    const [openOwnerCombobox, setOpenOwnerCombobox] = useState(false);

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
        <Card className="border-none shadow-none sm:border sm:shadow-sm">
            <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Edit Document
                </CardTitle>
                <CardDescription>
                    Update document information and replace the file if needed.
                </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6 pt-8">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-8 md:col-span-1">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-medium">
                                                Document Title
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Resume"
                                                    {...field}
                                                    className="h-10"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Enter a descriptive title for
                                                the document.
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
                                            <FormLabel className="text-base font-medium">
                                                Document Category
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-10">
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
                                                Select the category that best
                                                describes this document.
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
                                            <FormLabel className="text-base font-medium">
                                                Expiration Date (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Set an expiration date for the
                                                document. First select a year,
                                                then choose the month and day.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="authorId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-base font-medium">
                                                Document Owner
                                            </FormLabel>
                                            <Popover
                                                open={openOwnerCombobox}
                                                onOpenChange={
                                                    setOpenOwnerCombobox
                                                }
                                            >
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={
                                                                openOwnerCombobox
                                                            }
                                                            className={cn(
                                                                "h-10 w-full justify-between",
                                                                !field.value &&
                                                                    "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value
                                                                ? employees.find(
                                                                      (
                                                                          employee
                                                                      ) =>
                                                                          employee.id ===
                                                                          field.value
                                                                  )?.fullName
                                                                : "Search for an employee..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search employees..." />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                No employee
                                                                found.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {employees.map(
                                                                    (
                                                                        employee
                                                                    ) => (
                                                                        <CommandItem
                                                                            key={
                                                                                employee.id
                                                                            }
                                                                            value={
                                                                                employee.fullName
                                                                            }
                                                                            onSelect={() => {
                                                                                form.setValue(
                                                                                    "authorId",
                                                                                    employee.id
                                                                                );
                                                                                setOpenOwnerCombobox(
                                                                                    false
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    employee.id ===
                                                                                        field.value
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {
                                                                                employee.fullName
                                                                            }
                                                                            <span className="ml-2 text-xs text-muted-foreground">
                                                                                {employee.employeeType ===
                                                                                "Teaching"
                                                                                    ? "Teaching"
                                                                                    : "Non-Teaching"}
                                                                            </span>
                                                                        </CommandItem>
                                                                    )
                                                                )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>
                                                Select the employee who owns
                                                this document.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-8 md:col-span-1">
                                <div className="space-y-2">
                                    <FormLabel className="text-base font-medium">
                                        Document File
                                    </FormLabel>
                                    {isReplacing ? (
                                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/30">
                                            <UploadDropzone
                                                endpoint="documentUploader"
                                                onClientUploadComplete={(
                                                    res
                                                ) => {
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
                                                onUploadError={(
                                                    error: Error
                                                ) => {
                                                    toast.error(
                                                        "Error uploading file",
                                                        {
                                                            description:
                                                                error.message ||
                                                                "There was a problem uploading your document.",
                                                        }
                                                    );
                                                    setIsReplacing(false);
                                                }}
                                                onUploadBegin={() => {
                                                    toast.info(
                                                        "Uploading file...",
                                                        {
                                                            description:
                                                                "Please wait while we upload your document.",
                                                        }
                                                    );
                                                }}
                                                className="w-full ut-button:bg-primary ut-button:hover:bg-primary/90 ut-button:ut-readying:bg-primary/70 ut-button:ut-uploading:bg-primary/70 ut-label:text-base"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-lg border">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                                                    {document.documentType ===
                                                    "PDF" ? (
                                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-500 font-medium">
                                                            PDF
                                                        </div>
                                                    ) : document.documentType ===
                                                      "DOCX" ? (
                                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500 font-medium">
                                                            DOC
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-medium">
                                                            {
                                                                document.documentType
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">
                                                    {uploadedFile
                                                        ? uploadedFile.name
                                                        : document.fileName ||
                                                          document.path
                                                              .split("/")
                                                              .pop()}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                                                        {uploadedFile
                                                            ? getFileType(
                                                                  uploadedFile.type
                                                              )
                                                            : document.documentType}
                                                    </span>
                                                    <span>
                                                        {uploadedFile
                                                            ? formatFileSize(
                                                                  uploadedFile.size
                                                              )
                                                            : document.documentSize}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setIsReplacing(true)
                                                }
                                            >
                                                Replace
                                            </Button>
                                        </div>
                                    )}
                                    <FormDescription>
                                        You can replace the current document
                                        file with a new one if needed.
                                    </FormDescription>
                                </div>

                                <div className="bg-muted/30 rounded-lg p-4 border">
                                    <h3 className="font-medium flex items-center gap-2 mb-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        Document Status
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        The document status will be
                                        automatically determined based on the
                                        expiration date:
                                    </p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span>
                                                Active - Document is valid and
                                                not close to expiration
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <span>
                                                Expiring Soon - Document expires
                                                within 30 days
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <span>
                                                Expired - Document has passed
                                                its expiration date
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-muted/30 rounded-lg p-4 border">
                                    <h3 className="font-medium flex items-center gap-2 mb-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        Document Owner
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        The document owner is responsible for
                                        maintaining and updating this document.
                                    </p>
                                    {document.author && (
                                        <div className="flex items-center gap-3 p-2 bg-background rounded-md">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                                {document.author.fullName
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {document.author.fullName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {document.author
                                                        .employeeType ===
                                                    "Teaching"
                                                        ? "Teaching"
                                                        : "Non-Teaching"}{" "}
                                                    • {document.author.position}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/documents")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || isReplacing}
                                className="gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Update Document
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
