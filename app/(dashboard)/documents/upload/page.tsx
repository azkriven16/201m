import { getAllEmployees } from "@/lib/db";
import { DocumentForm } from "@/components/documents/documents-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function UploadDocumentPage() {
    // Fetch employees for the form dropdown using Drizzle
    const employees = await getAllEmployees();

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <div className="mb-6">
                <Link href="/documents">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Documents
                    </Button>
                </Link>
            </div>

            <div className="bg-white p-8 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold mb-6">Upload New Document</h1>
                <DocumentForm employees={employees} />
            </div>
        </div>
    );
}
