import { getDocumentById, getAllEmployees } from "@/lib/db";
import { EditDocumentForm } from "@/components/documents/edit-document-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminEmails } from "@/lib/admin";
import { auth } from "@/auth";

export default async function EditDocumentPage({
    params,
}: {
    params: Promise<any>;
}) {
    const { id } = await params;
    // Fetch the document to edit using Drizzle
    const document = await getDocumentById(id);

    // Fetch employees for the form dropdown using Drizzle
    const employees = await getAllEmployees();

    // If document not found, return 404
    if (!document) {
        notFound();
    }

    const session = await auth();

    if (!adminEmails.includes(session?.user?.email ?? "")) return notFound();

    return (
        <div className="container mx-auto py-6 p-4">
            <div className="mb-6">
                <Link href="/documents">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Documents
                    </Button>
                </Link>
            </div>

            <div className="bg-white p-8 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold mb-6">Edit Document</h1>
                <EditDocumentForm document={document} employees={employees} />
            </div>
        </div>
    );
}
