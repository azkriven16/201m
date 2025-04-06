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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Filter,
    MoreVertical,
    Trash2,
    FileIcon,
    FileIcon as FilePdf,
    FileSpreadsheet,
    FileIcon as FileWord,
    ExternalLink,
    Edit,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import type { DocumentWithAuthor } from "@/lib/db";

interface DocumentsTableProps {
    documents: DocumentWithAuthor[];
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] =
        useState<DocumentWithAuthor | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const itemsPerPage = 5;

    // Filter documents based on search query and status filter
    const filteredDocuments = documents.filter((doc) => {
        // Text search filter
        const matchesSearch =
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (doc.author?.fullName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ??
                false) ||
            doc.category.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        const matchesStatus =
            statusFilter.length === 0 || statusFilter.includes(doc.status);

        return matchesSearch && matchesStatus;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDocuments = filteredDocuments.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    // Get file icon based on file type
    const getFileIcon = (fileType: string) => {
        switch (fileType.toLowerCase()) {
            case "pdf":
                return <FilePdf className="h-5 w-5 text-red-500" />;
            case "doc":
            case "docx":
                return <FileWord className="h-5 w-5 text-blue-500" />;
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

    // Toggle status filter
    const toggleStatusFilter = (status: string) => {
        setStatusFilter((prev) =>
            prev.includes(status)
                ? prev.filter((s) => s !== status)
                : [...prev, status]
        );
        setCurrentPage(1); // Reset to first page when filter changes
    };

    // Clear all filters
    const clearFilters = () => {
        setStatusFilter([]);
        setSearchQuery("");
        setCurrentPage(1);
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

    // View employee
    const viewEmployee = (id: string) => {
        router.push(`/employees/view/${id}`);
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

            toast.success("Document deleted successfully", {
                description: `${documentToDelete?.title} has been deleted.`,
            });

            // Refresh the page to update the document list
            router.refresh();
        } catch (error) {
            console.error("Error deleting document:", error);
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
    const confirmDelete = (doc: DocumentWithAuthor) => {
        setDocumentToDelete(doc);
        setDeleteDialogOpen(true);
    };

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search documents..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                Filters{" "}
                                {statusFilter.length > 0 &&
                                    `(${statusFilter.length})`}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={clearFilters}>
                                Clear filters
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="p-2">
                                <p className="text-sm font-medium mb-2">
                                    Status
                                </p>
                                <DropdownMenuCheckboxItem
                                    checked={statusFilter.includes("Active")}
                                    onCheckedChange={() =>
                                        toggleStatusFilter("Active")
                                    }
                                >
                                    Active
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={statusFilter.includes(
                                        "AboutToExpire"
                                    )}
                                    onCheckedChange={() =>
                                        toggleStatusFilter("AboutToExpire")
                                    }
                                >
                                    Expiring Soon
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={statusFilter.includes("Expired")}
                                    onCheckedChange={() =>
                                        toggleStatusFilter("Expired")
                                    }
                                >
                                    Expired
                                </DropdownMenuCheckboxItem>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {itemsPerPage} per page
                        </span>
                    </div>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Document</TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead>Expiry Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedDocuments.length > 0 ? (
                            paginatedDocuments.map((doc, index) => {
                                const docId = `DOC${String(
                                    startIndex + index + 1
                                ).padStart(3, "0")}`;

                                return (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium">
                                            {docId}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    {getFileIcon(
                                                        doc.documentType
                                                    )}
                                                    <span>{doc.title}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {doc.documentType} •{" "}
                                                    {doc.documentSize}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {doc.author ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        {doc.author.avatar ? (
                                                            <AvatarImage
                                                                src={
                                                                    doc.author
                                                                        .avatar
                                                                }
                                                                alt={
                                                                    doc.author
                                                                        .fullName
                                                                }
                                                            />
                                                        ) : null}
                                                        <AvatarFallback className="text-xs">
                                                            {getInitials(
                                                                doc.author
                                                                    .fullName
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <button
                                                        onClick={() =>
                                                            doc.author
                                                                ? viewEmployee(
                                                                      doc.author
                                                                          .id
                                                                  )
                                                                : undefined
                                                        }
                                                        className="hover:underline text-primary"
                                                        disabled={!doc.author}
                                                    >
                                                        {doc.author.fullName}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Unknown
                                                </span>
                                            )}
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
                                                      new Date(
                                                          doc.expirationDate
                                                      ),
                                                      "MMM d, yyyy"
                                                  )
                                                : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(doc.status)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            openDocument(
                                                                doc.path
                                                            )
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
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center"
                                >
                                    No documents found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredDocuments.length > 0 ? startIndex + 1 : 0}-
                    {Math.min(
                        startIndex + itemsPerPage,
                        filteredDocuments.length
                    )}{" "}
                    of {filteredDocuments.length} documents
                </p>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(prev - 1, 1)
                                    )
                                }
                                className={
                                    currentPage === 1
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                }
                            />
                        </PaginationItem>

                        {Array.from({ length: Math.min(totalPages, 5) }).map(
                            (_, i) => {
                                const pageNumber = i + 1;
                                return (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                            isActive={
                                                currentPage === pageNumber
                                            }
                                            onClick={() =>
                                                setCurrentPage(pageNumber)
                                            }
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            }
                        )}

                        {totalPages > 5 && (
                            <>
                                <PaginationItem>
                                    <PaginationLink>...</PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink
                                        onClick={() =>
                                            setCurrentPage(totalPages)
                                        }
                                    >
                                        {totalPages}
                                    </PaginationLink>
                                </PaginationItem>
                            </>
                        )}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages)
                                    )
                                }
                                className={
                                    currentPage === totalPages
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
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
