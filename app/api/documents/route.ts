import { type NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { documents } from "@/db/schema";

// Helper function to format file size
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1024 * 1024 * 1024)
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

export async function POST(req: NextRequest) {
    try {
        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), "public/uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }

        // Parse the multipart form data
        const formData = await req.formData();

        // Extract form fields
        const title = formData.get("title") as string;
        const authorId = formData.get("authorId") as string;
        const category = formData.get("category") as string;
        const expirationDateStr = formData.get("expirationDate") as
            | string
            | null;
        const file = formData.get("file") as File;

        if (!file || !title || !authorId || !category) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Extract file information
        const fileExt = path.extname(file.name).toLowerCase();
        const documentType = fileExt.replace(".", "").toUpperCase();
        const documentSize = formatFileSize(file.size);

        // Generate a unique filename
        const fileName = `${uuidv4()}${fileExt}`;
        const filePath = path.join(uploadDir, fileName);

        // Save the file
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, fileBuffer);

        // Save file path relative to public directory
        const relativePath = `/uploads/${fileName}`;

        // Determine document status based on expiration date
        let status = "Active";
        if (expirationDateStr) {
            const expirationDate = new Date(expirationDateStr);
            const now = new Date();
            const thirtyDaysFromNow = new Date(now);
            thirtyDaysFromNow.setDate(now.getDate() + 30);

            if (expirationDate < now) {
                status = "Expired";
            } else if (expirationDate < thirtyDaysFromNow) {
                status = "AboutToExpire";
            }
        }

        // Create document in database using Drizzle
        const [document] = await db
            .insert(documents)
            .values({
                title,
                path: relativePath,
                category: category,
                status: status as any, // Cast to the enum type
                documentType: documentType || "UNKNOWN",
                documentSize: documentSize,
                expirationDate: expirationDateStr
                    ? new Date(expirationDateStr)
                    : null,
                authorId,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return NextResponse.json({ success: true, document });
    } catch (error) {
        console.error("Error uploading document:", error);
        return NextResponse.json(
            { error: "Failed to upload document" },
            { status: 500 }
        );
    }
}
