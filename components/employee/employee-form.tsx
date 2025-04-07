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
import type { Employee } from "@/db/schema"; // Import the Employee type from Drizzle schema
import { UploadButton } from "@/lib/uploadthing";
import { BirthdayPicker } from "@/components/employee/birthday-picker";

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
    // New fields
    email: z
        .string()
        .email({
            message: "Please enter a valid email address.",
        })
        .optional()
        .or(z.literal("")),
    mobileNumber: z
        .string()
        .regex(/^(\+\d{1,3})?\d{10,15}$/, {
            message: "Please enter a valid mobile number.",
        })
        .optional()
        .or(z.literal("")),
    biometricId: z.string().optional().or(z.literal("")),
    designation: z
        .string()
        .min(2, {
            message: "Designation must be at least 2 characters.",
        })
        .optional()
        .or(z.literal("")),
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
            // New fields
            email: employee?.email || "",
            mobileNumber: employee?.mobileNumber || "",
            biometricId: employee?.biometricId || "",
            designation: employee?.designation || "",
        },
    });

    // Cleanup function for uploaded image if form is not submitted
    useEffect(() => {
        return () => {
            // Only run cleanup if we have a new upload, the form wasn't submitted, and we're not in edit mode
            // This prevents deleting files that are already saved or about to be saved
            if (newUploadKey && !formSubmitted && !isEditMode) {
                console.log("Cleaning up unused upload:", newUploadKey);
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
    }, [newUploadKey, formSubmitted, isEditMode]);

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

            // Ensure avatar is properly included in the request
            const formData = {
                ...values,
                // Make sure avatar is explicitly set to the current value or null
                avatar: values.avatar || null,
            };

            console.log("Submitting form with data:", {
                ...formData,
                avatar: formData.avatar ? "Avatar URL exists" : "No avatar URL",
            });

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            // Check if response is ok before trying to parse JSON
            if (!response.ok) {
                const text = await response.text();
                console.error("Error response:", text);

                let errorMessage = "Failed to update employee";
                try {
                    // Try to parse as JSON if possible
                    const errorData = JSON.parse(text);
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    // If parsing fails, use the raw text
                    errorMessage = text || errorMessage;
                }

                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log("Form submission result:", result);

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
        // Only delete the new upload if it's not an existing avatar in edit mode
        if (
            newUploadKey &&
            (!isEditMode || avatarPreview !== employee?.avatar)
        ) {
            console.log("Cancelling - cleaning up upload:", newUploadKey);
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
                                                    if (res && res.length > 0) {
                                                        console.log(
                                                            "Upload complete:",
                                                            res[0]
                                                        );
                                                        // Set form value
                                                        field.onChange(
                                                            res[0].url
                                                        );
                                                        // Update preview
                                                        setAvatarPreview(
                                                            res[0].url
                                                        );
                                                        // Store the file key for potential cleanup
                                                        setNewUploadKey(
                                                            res[0].key
                                                        );
                                                        toast.success(
                                                            "Avatar uploaded successfully",
                                                            {
                                                                description:
                                                                    "Your new profile image has been uploaded.",
                                                            }
                                                        );
                                                    }
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            Enter the employee's academic rank
                                            or department.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="designation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Designation</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Senior Faculty"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the employee's job
                                            designation.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                            placeholder="Ph.D. in Computer Science"
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="john.doe@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the employee's email address.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="mobileNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mobile Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="+1234567890"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the employee's mobile number.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="biometricId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Biometric ID</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="BIO12345"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the employee's biometric ID
                                            number.
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
                                        <FormControl>
                                            <BirthdayPicker
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Select the employee's date of birth.
                                            First select a year, then choose the
                                            month and day.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
