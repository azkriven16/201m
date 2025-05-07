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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Check,
    ChevronsUpDown,
    User,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    BadgeCheck,
    Upload,
    Loader2,
} from "lucide-react";
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

// Define teaching positions
const TEACHING_POSITIONS = [
    "Instructor I",
    "Instructor II",
    "Instructor III",
    "Associate Professor I",
    "Associate Professor II",
    "Associate Professor III",
    "Associate Professor IV",
    "Professor I",
    "Professor II",
    "Professor III",
    "Professor IV",
    "Professor V",
    "Professor VI",
    "University Professor",
];

// Define non-teaching positions
const NONTEACHING_POSITIONS = [
    "Administrative Aide I",
    "Administrative Aide II",
    "Administrative Aide III",
    "Administrative Aide IV",
    "Administrative Aide V",
    "Administrative Aide VI",
    "Administrative Assistant I",
    "Administrative Assistant II",
    "Administrative Assistant III",
    "Administrative Officer I",
    "Administrative Officer II",
    "Administrative Officer III",
    "Administrative Officer IV",
    "Administrative Officer V",
];

// Define the schema for client-side validation
const formSchema = z.object({
    fullName: z.string().min(2, {
        message: "Full name must be at least 2 characters.",
    }),
    employeeType: z.enum(
        ["Teaching", "NonTeaching", "cosTeaching", "cosNonTeaching"],
        {
            required_error: "Employee type is required.",
        }
    ),
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
    const [customPosition, setCustomPosition] = useState(false);
    const [openPositionCombobox, setOpenPositionCombobox] = useState(false);
    const isEditMode = !!employee;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: employee?.fullName || "",
            employeeType: employee?.employeeType || "Teaching",
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

    // Get the current employee type value from the form
    const currentEmployeeType = form.watch("employeeType");
    const currentPosition = form.watch("position");
    const currentFullName = form.watch("fullName");

    // Determine if the position is custom (not in predefined lists)
    useEffect(() => {
        const positionsList =
            currentEmployeeType === "Teaching"
                ? TEACHING_POSITIONS
                : NONTEACHING_POSITIONS;
        setCustomPosition(
            !positionsList.includes(currentPosition) && currentPosition !== ""
        );
    }, [currentEmployeeType, currentPosition]);

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
        <Card className="border-none shadow-none sm:border sm:shadow-sm">
            <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <User className="h-6 w-6 text-primary" />
                    {isEditMode ? "Edit Employee" : "Add New Employee"}
                </CardTitle>
                <CardDescription>
                    {isEditMode
                        ? "Update employee information in the system."
                        : "Fill in the employee details to add them to the system."}
                </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6 pt-8">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        {/* Basic Information Section */}
                        <div>
                            <h2 className="text-lg font-semibold mb-6">
                                Basic Information
                            </h2>
                            <div className="grid gap-8 md:grid-cols-3">
                                {/* Avatar Upload Section */}
                                <div className="flex flex-col items-center gap-4 md:col-span-1">
                                    <Avatar className="w-32 h-32 border-2 border-muted">
                                        {avatarPreview ? (
                                            <AvatarImage
                                                src={avatarPreview}
                                                alt="Avatar preview"
                                            />
                                        ) : null}
                                        <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                            {currentFullName
                                                ? getInitials(currentFullName)
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
                                                                if (
                                                                    res &&
                                                                    res.length >
                                                                        0
                                                                ) {
                                                                    console.log(
                                                                        "Upload complete:",
                                                                        res[0]
                                                                    );
                                                                    // Set form value
                                                                    field.onChange(
                                                                        res[0]
                                                                            .url
                                                                    );
                                                                    // Update preview
                                                                    setAvatarPreview(
                                                                        res[0]
                                                                            .url
                                                                    );
                                                                    // Store the file key for potential cleanup
                                                                    setNewUploadKey(
                                                                        res[0]
                                                                            .key
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
                                                            className="ut-button:bg-primary ut-button:hover:bg-primary/90"
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-xs text-muted-foreground mt-2 text-center">
                                                        Upload a square JPG or
                                                        PNG image. Max 4MB.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Basic Information Fields */}
                                <div className="space-y-6 md:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    Full Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="John Doe"
                                                        {...field}
                                                        className="h-10"
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Enter the employee's full
                                                    name.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="employeeType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base font-medium">
                                                        Employee Type
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={(
                                                            value
                                                        ) => {
                                                            field.onChange(
                                                                value
                                                            );
                                                            // Reset position when employee type changes
                                                            form.setValue(
                                                                "position",
                                                                ""
                                                            );
                                                        }}
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="h-10">
                                                                <SelectValue placeholder="Select employee type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Teaching">
                                                                Teaching
                                                            </SelectItem>
                                                            <SelectItem value="NonTeaching">
                                                                Non-Teaching
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        Select whether this is a
                                                        teaching or non-teaching
                                                        position.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="position"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-base font-medium">
                                                        Position
                                                    </FormLabel>
                                                    <div className="flex gap-2">
                                                        <Popover
                                                            open={
                                                                openPositionCombobox
                                                            }
                                                            onOpenChange={
                                                                setOpenPositionCombobox
                                                            }
                                                        >
                                                            <PopoverTrigger
                                                                asChild
                                                            >
                                                                <FormControl>
                                                                    <Button
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        aria-expanded={
                                                                            openPositionCombobox
                                                                        }
                                                                        className={cn(
                                                                            "h-10 w-full justify-between",
                                                                            !field.value &&
                                                                                "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {field.value
                                                                            ? field.value
                                                                            : `Select ${
                                                                                  currentEmployeeType ===
                                                                                  "Teaching"
                                                                                      ? "academic"
                                                                                      : "administrative"
                                                                              } position`}
                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-[400px] p-0">
                                                                <Command>
                                                                    <CommandInput
                                                                        placeholder={`Search ${
                                                                            currentEmployeeType ===
                                                                            "Teaching"
                                                                                ? "academic"
                                                                                : "administrative"
                                                                        } positions...`}
                                                                    />
                                                                    <CommandList>
                                                                        <CommandEmpty>
                                                                            No
                                                                            position
                                                                            found.
                                                                            <Button
                                                                                variant="link"
                                                                                className="p-0 h-auto text-primary"
                                                                                onClick={() => {
                                                                                    setOpenPositionCombobox(
                                                                                        false
                                                                                    );
                                                                                    setCustomPosition(
                                                                                        true
                                                                                    );
                                                                                }}
                                                                            >
                                                                                Enter
                                                                                custom
                                                                                position
                                                                            </Button>
                                                                        </CommandEmpty>
                                                                        <CommandGroup>
                                                                            {(currentEmployeeType ===
                                                                            "Teaching"
                                                                                ? TEACHING_POSITIONS
                                                                                : NONTEACHING_POSITIONS
                                                                            ).map(
                                                                                (
                                                                                    position
                                                                                ) => (
                                                                                    <CommandItem
                                                                                        key={
                                                                                            position
                                                                                        }
                                                                                        value={
                                                                                            position
                                                                                        }
                                                                                        onSelect={() => {
                                                                                            form.setValue(
                                                                                                "position",
                                                                                                position
                                                                                            );
                                                                                            setOpenPositionCombobox(
                                                                                                false
                                                                                            );
                                                                                            setCustomPosition(
                                                                                                false
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        <Check
                                                                                            className={cn(
                                                                                                "mr-2 h-4 w-4",
                                                                                                position ===
                                                                                                    field.value
                                                                                                    ? "opacity-100"
                                                                                                    : "opacity-0"
                                                                                            )}
                                                                                        />
                                                                                        {
                                                                                            position
                                                                                        }
                                                                                    </CommandItem>
                                                                                )
                                                                            )}
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                    <div className="p-2 border-t">
                                                                        <Button
                                                                            variant="ghost"
                                                                            className="w-full justify-start text-muted-foreground"
                                                                            onClick={() => {
                                                                                setOpenPositionCombobox(
                                                                                    false
                                                                                );
                                                                                setCustomPosition(
                                                                                    true
                                                                                );
                                                                            }}
                                                                        >
                                                                            Enter
                                                                            custom
                                                                            position
                                                                        </Button>
                                                                    </div>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>

                                                        {customPosition && (
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setCustomPosition(
                                                                        false
                                                                    );
                                                                    setOpenPositionCombobox(
                                                                        true
                                                                    );
                                                                }}
                                                                type="button"
                                                                className="h-10 w-10"
                                                            >
                                                                <ChevronsUpDown className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {customPosition && (
                                                        <Input
                                                            placeholder="Enter custom position"
                                                            value={field.value}
                                                            onChange={
                                                                field.onChange
                                                            }
                                                            className="mt-2 h-10"
                                                        />
                                                    )}

                                                    <FormDescription>
                                                        {customPosition
                                                            ? "Enter a custom position title."
                                                            : `Select from standard ${
                                                                  currentEmployeeType ===
                                                                  "Teaching"
                                                                      ? "academic"
                                                                      : "administrative"
                                                              } positions or enter a custom one.`}
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
                                                <FormLabel className="text-base font-medium">
                                                    Educational Attainment
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ph.D. in Computer Science"
                                                        {...field}
                                                        className="h-10"
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Enter the employee's
                                                    educational attainment or
                                                    job title.
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
                                                <FormLabel className="text-base font-medium">
                                                    Birthday
                                                </FormLabel>
                                                <FormControl>
                                                    <BirthdayPicker
                                                        value={field.value}
                                                        onChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Select the employee's date
                                                    of birth. First select a
                                                    year, then choose the month
                                                    and day.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Additional Information Section */}
                        <div>
                            <h2 className="text-lg font-semibold mb-6">
                                Additional Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-medium flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                Email Address
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="john.doe@example.com"
                                                    {...field}
                                                    className="h-10"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the employee's email
                                                address.
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
                                            <FormLabel className="text-base font-medium flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                Mobile Number
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="+1234567890"
                                                    {...field}
                                                    className="h-10"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the employee's mobile
                                                number.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <FormField
                                    control={form.control}
                                    name="biometricId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-medium flex items-center gap-2">
                                                <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                                                Biometric ID
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="BIO12345"
                                                    {...field}
                                                    className="h-10"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the employee's biometric
                                                ID number.
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
                                            <FormLabel className="text-base font-medium flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                Designation
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Department Chair"
                                                    {...field}
                                                    className="h-10"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Enter the employee's job
                                                designation or role.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="bg-muted/30 rounded-lg p-4 border mt-6">
                                <h3 className="font-medium flex items-center gap-2 mb-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    Employee Information
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Additional information helps with employee
                                    management and communication:
                                </p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        <span>
                                            Email and mobile number are used for
                                            notifications and communications
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        <span>
                                            Biometric ID is used for attendance
                                            tracking and access control
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        <span>
                                            Designation helps identify roles and
                                            responsibilities within departments
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {isEditMode
                                            ? "Updating..."
                                            : "Creating..."}
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        {isEditMode
                                            ? "Update Employee"
                                            : "Create Employee"}
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
