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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import type { Employee } from "@/db/schema"; // Import the Employee type from Drizzle schema
import { UploadButton } from "@/lib/uploadthing";

// Define the schema for client-side validation
const formSchema = z.object({
    fullName: z.string().min(2, {
        message: "Full name must be at least 2 characters.",
    }),
    position: z.string().min(2, {
        message: "Position must be at least 2 characters.",
    }),
    education: z.string().min(2, {
        message: "Education must be at least 2 characters.",
    }),
    avatar: z.string().optional(),
    birthday: z.date({
        required_error: "Birthday is required.",
    }),
});

export function EmployeeForm({ employee }: { employee?: Employee }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        employee?.avatar || null
    );
    const [newUploadKey, setNewUploadKey] = useState<string | null>(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const isEditMode = !!employee;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: employee?.fullName || "",
            position: employee?.position || "",
            education: employee?.education || "",
            avatar: employee?.avatar || "",
            birthday: employee?.birthday
                ? new Date(employee.birthday)
                : undefined,
        },
    });

    // Cleanup function for uploaded image if form is not submitted
    useEffect(() => {
        return () => {
            // Only run cleanup if we have a new upload and the form wasn't submitted
            if (newUploadKey && !formSubmitted) {
                // Delete the uploaded file
                fetch("/api/uploadthing/delete", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ fileKey: newUploadKey }),
                }).catch((error) => {
                    console.error("Error cleaning up uploaded file:", error);
                    toast.error("Failed to clean up uploaded file", {
                        description:
                            "The temporary file couldn't be deleted. This won't affect your data.",
                    });
                });
            }
        };
    }, [newUploadKey, formSubmitted]);

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
            const url = isEditMode
                ? `/api/employees/${employee.id}`
                : "/api/employees";

            const method = isEditMode ? "PATCH" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error ||
                        `Failed to ${isEditMode ? "update" : "create"} employee`
                );
            }

            // Mark form as successfully submitted
            setFormSubmitted(true);

            // Show success toast
            toast.success(
                isEditMode
                    ? "Employee updated successfully"
                    : "Employee created successfully",
                {
                    description: isEditMode
                        ? `${values.fullName}'s information has been updated.`
                        : `${values.fullName} has been added to the system.`,
                    duration: 5000,
                }
            );

            router.push("/employees");
            router.refresh();
        } catch (error) {
            console.error(
                `Error ${isEditMode ? "updating" : "creating"} employee:`,
                error
            );

            // Show error toast
            toast.error(
                isEditMode
                    ? "Failed to update employee"
                    : "Failed to create employee",
                {
                    description:
                        error instanceof Error
                            ? error.message
                            : "An unexpected error occurred",
                }
            );
        } finally {
            setIsLoading(false);
        }
    }

    // Handle cancel button - cleanup and navigate away
    const handleCancel = () => {
        // Mark as submitted to prevent cleanup on unmount
        // (we'll handle cleanup here directly)
        setFormSubmitted(true);

        // If we have a new upload that wasn't there originally, delete it
        if (newUploadKey && avatarPreview !== employee?.avatar) {
            fetch("/api/uploadthing/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fileKey: newUploadKey }),
            }).catch((error) => {
                console.error("Error cleaning up uploaded file:", error);
                toast.error("Failed to clean up uploaded file", {
                    description:
                        "The temporary file couldn't be deleted. This won't affect your data.",
                });
            });
        }

        toast.info("Changes discarded", {
            description:
                "You've cancelled the operation. No changes were saved.",
        });

        router.push("/employees");
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex flex-col items-center sm:items-start sm:flex-row gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="w-24 h-24">
                            {avatarPreview ? (
                                <AvatarImage
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                />
                            ) : null}
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                {form.watch("fullName")
                                    ? getInitials(form.watch("fullName"))
                                    : "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-center">
                            <FormField
                                control={form.control}
                                name="avatar"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <UploadButton
                                                endpoint="avatarUploader"
                                                onClientUploadComplete={(
                                                    res
                                                ) => {
                                                    // Set form value
                                                    field.onChange(res[0].url);
                                                    // Update preview
                                                    setAvatarPreview(
                                                        res[0].url
                                                    );
                                                    // Store the file key for potential cleanup
                                                    setNewUploadKey(res[0].key);
                                                    toast.success(
                                                        "Avatar uploaded successfully",
                                                        {
                                                            description:
                                                                "Your new profile image has been uploaded.",
                                                        }
                                                    );
                                                }}
                                                onUploadError={(
                                                    error: Error
                                                ) => {
                                                    toast.error(
                                                        "Error uploading avatar",
                                                        {
                                                            description:
                                                                error.message ||
                                                                "There was a problem uploading your image.",
                                                        }
                                                    );
                                                }}
                                                onUploadBegin={() => {
                                                    toast.info(
                                                        "Uploading avatar...",
                                                        {
                                                            description:
                                                                "Please wait while we upload your image.",
                                                        }
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs text-muted-foreground mt-1 text-center">
                                            Upload a square JPG or PNG image.
                                            Max 4MB.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-6">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="John Doe"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the employee's full name.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Academic Rank</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Engineering"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the employee's academic rank or
                                        department.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="education"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Educational Attainment
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Senior Developer"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the employee's educational
                                        attainment or job title.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="birthday"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Birthday</FormLabel>
                                    <div className="flex gap-2">
                                        <FormControl>
                                            <Input
                                                placeholder="MM/DD/YYYY"
                                                value={
                                                    field.value
                                                        ? format(
                                                              field.value,
                                                              "MM/dd/yyyy"
                                                          )
                                                        : ""
                                                }
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value;
                                                    const date = new Date(
                                                        value
                                                    );
                                                    // Check if the date is valid and not in the future
                                                    if (
                                                        !isNaN(
                                                            date.getTime()
                                                        ) &&
                                                        date <= new Date()
                                                    ) {
                                                        field.onChange(date);
                                                    } else if (value === "") {
                                                        // Clear the field if input is empty
                                                        field.onChange(
                                                            undefined
                                                        );
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                >
                                                    <CalendarIcon className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="end"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    disabled={(date) =>
                                                        date > new Date()
                                                    }
                                                    fromYear={1940}
                                                    toYear={new Date().getFullYear()}
                                                    captionLayout="dropdown-buttons"
                                                    classNames={{
                                                        caption_label:
                                                            "text-sm font-medium",
                                                        dropdown: "p-1",
                                                        caption_dropdowns:
                                                            "flex justify-center gap-1",
                                                        vhidden: "hidden",
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <FormDescription>
                                        Enter the employee's date of birth. You
                                        can type the date or use the calendar.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading
                            ? isEditMode
                                ? "Updating..."
                                : "Creating..."
                            : isEditMode
                            ? "Update Employee"
                            : "Create Employee"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
