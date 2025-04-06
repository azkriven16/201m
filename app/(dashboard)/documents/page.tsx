import { getAllDocuments, getDocumentCountByStatus } from "@/lib/db";
import { DocumentsTable } from "@/components/documents/documents-table";
import { DocumentStats } from "@/components/documents/documents-stats";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    UploadIcon as FileUpload,
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

export default async function DocumentsPage() {
    // Fetch documents with their authors using Drizzle
    const documents = await getAllDocuments();

    // Get document statistics using Drizzle
    const {
        active: activeDocuments,
        expiringSoon: expiringDocuments,
        expired: expiredDocuments,
    } = await getDocumentCountByStatus();

    // Calculate total documents
    const totalDocuments =
        activeDocuments + expiringDocuments + expiredDocuments;

    return (
        <div className="container mx-auto py-6 space-y-6 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Document Management</h1>
                <Link href="/documents/upload">
                    <Button>
                        <FileUpload className="mr-2 h-4 w-4" />
                        Upload Document
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DocumentStats
                    title="Total Documents"
                    value={totalDocuments}
                    icon={<FileText className="h-5 w-5 text-gray-500" />}
                />
                <DocumentStats
                    title="Active"
                    value={activeDocuments}
                    icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                />
                <DocumentStats
                    title="Expiring Soon"
                    value={expiringDocuments}
                    icon={<Clock className="h-5 w-5 text-yellow-500" />}
                />
                <DocumentStats
                    title="Expired"
                    value={expiredDocuments}
                    icon={<AlertCircle className="h-5 w-5 text-red-500" />}
                />
            </div>

            <DocumentsTable documents={documents} />
        </div>
    );
}
