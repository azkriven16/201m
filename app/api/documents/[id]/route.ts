import { type NextRequest, NextResponse } from "next/server";
import { getDocumentById, updateDocument, deleteDocument } from "@/lib/db";
import type { documentStatus } from "@/db/schema";

// DELETE handler
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    try {
        // Ensure params is awaited
        const { id } = await params;

        // Find the document to get the file path and key
        const document = await getDocumentById(id);

        if (!document) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        // Delete the document from the database
        const success = await deleteDocument(id);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to delete document from database" },
                { status: 500 }
            );
        }

        // Delete the file from UploadThing if we have a fileKey
        if (document.fileKey) {
            try {
                await fetch("/api/uploadthing/delete", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ fileKey: document.fileKey }),
                });
            } catch (fileError) {
                console.error(
                    "Error deleting file from UploadThing:",
                    fileError
                );
                // We continue even if file deletion fails, but log the error
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting document:", error);
        return NextResponse.json(
            { error: "Failed to delete document" },
            { status: 500 }
        );
    }
}

// PATCH handler
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    try {
        // Ensure params is awaited
        const { id } = await params;

        const data = await request.json();

        // Find the document to check if it exists
        const existingDocument = await getDocumentById(id);

        if (!existingDocument) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        // Determine document status based on expiration date
        let status = "Active";
        if (data.expirationDate) {
            const expirationDate = new Date(data.expirationDate);
            const now = new Date();
            const thirtyDaysFromNow = new Date(now);
            thirtyDaysFromNow.setDate(now.getDate() + 30);

            if (expirationDate < now) {
                status = "Expired";
            } else if (expirationDate < thirtyDaysFromNow) {
                status = "AboutToExpire";
            }
        }

        // Update the document in the database
        const updatedDocument = await updateDocument(id, {
            title: data.title,
            path: data.path,
            fileKey: data.fileKey,
            fileName: data.fileName,
            category: data.category,
            status: status as (typeof documentStatus.enumValues)[number],
            documentType: data.documentType || existingDocument.documentType,
            documentSize: data.documentSize || existingDocument.documentSize,
            expirationDate: data.expirationDate
                ? new Date(data.expirationDate)
                : null,
            authorId: data.authorId,
            updatedAt: new Date(),
        });

        return NextResponse.json({ success: true, document: updatedDocument });
    } catch (error) {
        console.error("Error updating document:", error);
        return NextResponse.json(
            { error: "Failed to update document" },
            { status: 500 }
        );
    }
}

// GET handler
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    try {
        // Ensure params is awaited
        const { id } = await params;

        const document = await getDocumentById(id);

        if (!document) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(document);
    } catch (error) {
        console.error("Error fetching document:", error);
        return NextResponse.json(
            { error: "Failed to fetch document" },
            { status: 500 }
        );
    }
}
