import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Validate required fields
        if (!data.title || !data.path || !data.category || !data.authorId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create document in database using Drizzle
        const [document] = await db
            .insert(documents)
            .values({
                title: data.title,
                path: data.path,
                fileKey: data.fileKey || null, // Make sure fileKey is not undefined
                fileName: data.fileName || null, // Make sure fileName is not undefined
                category: data.category,
                status: data.status || "Active",
                documentType: data.documentType || "PDF",
                documentSize: data.documentSize || "Unknown",
                expirationDate: data.expirationDate
                    ? new Date(data.expirationDate)
                    : null,
                authorId: data.authorId,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return NextResponse.json({ success: true, document });
    } catch (error) {
        console.error("Error creating document:", error);
        return NextResponse.json(
            { error: "Failed to create document" },
            { status: 500 }
        );
    }
}
