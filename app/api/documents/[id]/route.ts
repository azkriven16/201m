import { type NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
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

        // Find the document to get the file path
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

        // Delete the file from the uploads folder
        if (document.path) {
            try {
                // Convert the relative path to an absolute path
                const filePath = path.join(
                    process.cwd(),
                    "public",
                    document.path.replace(/^\//, "") // Remove leading slash if present
                );

                // Check if file exists before attempting to delete
                if (fs.existsSync(filePath)) {
                    await fs.promises.unlink(filePath);
                    console.log(`Deleted document file: ${filePath}`);
                }
            } catch (fileError) {
                console.error("Error deleting file:", fileError);
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
            category: data.category,
            status: status as (typeof documentStatus.enumValues)[number],
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
