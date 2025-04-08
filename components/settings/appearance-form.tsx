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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Laptop } from "lucide-react";

const formSchema = z.object({
    theme: z.enum(["light", "dark", "system"], {
        required_error: "Please select a theme.",
    }),
});

export function AppearanceForm() {
    const [isLoading, setIsLoading] = useState(false);
    const { theme, setTheme } = useTheme();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            theme: (theme as "light" | "dark" | "system") || "system",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        // Update theme
        setTheme(values.theme);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Appearance updated", {
                description:
                    "Your appearance settings have been updated successfully.",
            });
        }, 500);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Theme</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-3 gap-4"
                                >
                                    <FormItem>
                                        <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                            <FormControl>
                                                <RadioGroupItem
                                                    value="light"
                                                    className="sr-only"
                                                />
                                            </FormControl>
                                            <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent cursor-pointer">
                                                <Sun className="h-5 w-5 mb-3" />
                                                <div className="font-medium">
                                                    Light
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Light mode for daytime use
                                                </div>
                                            </div>
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem>
                                        <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                            <FormControl>
                                                <RadioGroupItem
                                                    value="dark"
                                                    className="sr-only"
                                                />
                                            </FormControl>
                                            <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent cursor-pointer">
                                                <Moon className="h-5 w-5 mb-3" />
                                                <div className="font-medium">
                                                    Dark
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Dark mode for nighttime use
                                                </div>
                                            </div>
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem>
                                        <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                            <FormControl>
                                                <RadioGroupItem
                                                    value="system"
                                                    className="sr-only"
                                                />
                                            </FormControl>
                                            <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent cursor-pointer">
                                                <Laptop className="h-5 w-5 mb-3" />
                                                <div className="font-medium">
                                                    System
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Follow system preferences
                                                </div>
                                            </div>
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormDescription>
                                Select the theme for the dashboard.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save preferences"}
                </Button>
            </form>
        </Form>
    );
}
