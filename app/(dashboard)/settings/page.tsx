import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AppearanceForm } from "@/components/settings/appearance-form";

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-6 max-w-3xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Customize your application preferences.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize how the application looks on your device.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AppearanceForm />
                </CardContent>
            </Card>
        </div>
    );
}
