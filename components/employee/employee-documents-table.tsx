"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    FileIcon,
    FileText,
    FileSpreadsheet,
    ExternalLink,
    Edit,
    Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Document } from "@/db/schema";

interface EmployeeDocumentsTableProps {
    documents: Document[];
}

export function EmployeeDocumentsTable({
    documents,
}: EmployeeDocumentsTableProps) {
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);

    // Get file icon based on file type
    const getFileIcon = (fileType: string) => {
        switch (fileType.toLowerCase()) {
            case "pdf":
                return <FileText className="h-5 w-5 text-red-500" />;
            case "doc":
            case "docx":
                return <FileIcon className="h-5 w-5 text-blue-500" />;
            case "xls":
            case "xlsx":
                return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
            default:
                return <FileIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    // Get status badge color
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Active":
                return <Badge className="bg-green-500">Active</Badge>;
            case "Expired":
                return <Badge variant="destructive">Expired</Badge>;
            case "AboutToExpire":
                return <Badge className="bg-yellow-500">Expiring Soon</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    // Open document
    const openDocument = (path: string) => {
        // For UploadThing URLs, we can open them directly in a new tab
        window.open(path, "_blank");

        toast.info("Opening document", {
            description: "The document is being opened in a new tab.",
        });
    };

    // Edit document
    const editDocument = (id: string) => {
        router.push(`/documents/edit/${id}`);
    };

    // Delete document
    const deleteDocument = async (id: string) => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/documents/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete document");
            }

            // Show success toast
            toast.success("Document deleted successfully", {
                description: `"${documentToDelete?.title}" has been removed.`,
                duration: 5000,
            });

            // Refresh the page to update the document list
            router.refresh();
        } catch (error) {
            console.error("Error deleting document:", error);

            // Show error toast
            toast.error("Failed to delete document", {
                description:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred",
            });
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setDocumentToDelete(null);
        }
    };

    // Confirm delete
    const confirmDelete = (doc: Document) => {
        setDocumentToDelete(doc);
        setDeleteDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Document</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead>Expiry Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.length > 0 ? (
                            documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                {getFileIcon(doc.documentType)}
                                                <span>{doc.title}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {doc.documentType} •{" "}
                                                {doc.documentSize}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {doc.category
                                            .replace(/([A-Z])/g, " $1")
                                            .trim()}
                                    </TableCell>
                                    <TableCell>
                                        {format(
                                            new Date(doc.createdAt),
                                            "MMM d, yyyy"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {doc.expirationDate
                                            ? format(
                                                  new Date(doc.expirationDate),
                                                  "MMM d, yyyy"
                                              )
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(doc.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openDocument(doc.path)
                                                    }
                                                >
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    <span>Open</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        editDocument(doc.id)
                                                    }
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() =>
                                                        confirmDelete(doc)
                                                    }
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-24 text-center"
                                >
                                    No documents found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the document "
                            {documentToDelete?.title}". This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                documentToDelete &&
                                deleteDocument(documentToDelete.id)
                            }
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
