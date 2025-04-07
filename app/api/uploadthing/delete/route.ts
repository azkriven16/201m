import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "../core";
import { UTApi } from "uploadthing/server";

// Create a new UploadThing API instance
const utapi = new UTApi();

export async function POST(request: Request) {
    try {
        const { fileKey } = await request.json();

        if (!fileKey || typeof fileKey !== "string") {
            return Response.json(
                { error: "Invalid or missing fileKey" },
                { status: 400 }
            );
        }

        // Delete the file using the UploadThing API
        await utapi.deleteFiles(fileKey);

        return Response.json({ success: true });
    } catch (error) {
        console.error("Error deleting file:", error);
        return Response.json(
            { error: "Failed to delete file" },
            { status: 500 }
        );
    }
}
