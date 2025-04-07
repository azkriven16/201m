import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique route key
    avatarUploader: f({ image: { maxFileSize: "32MB", maxFileCount: 1 } })
        // Set permissions and file types for this FileRoute
        .middleware(async () => {
            // This code runs on your server before upload
            return { userId: "user-id" }; // Add user ID or other data here
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);
            console.log("File details:", {
                url: file.url,
                key: file.key,
                name: file.name,
                size: file.size,
            });

            // Return the file URL or other data to the client
            return {
                uploadedBy: metadata.userId,
                url: file.url,
                key: file.key,
                name: file.name,
                size: file.size,
            };
        }),

    // Add a new route for document uploads
    documentUploader: f({
        // Accept PDF, DOC, DOCX, XLS, XLSX files up to 32MB
        "application/pdf": { maxFileSize: "32MB", maxFileCount: 1 },
        "application/msword": { maxFileSize: "32MB", maxFileCount: 1 },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            { maxFileSize: "32MB", maxFileCount: 1 },
        "application/vnd.ms-excel": { maxFileSize: "32MB", maxFileCount: 1 },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
            maxFileSize: "32MB",
            maxFileCount: 1,
        },
        // Add more document types as needed
    })
        .middleware(async () => {
            // This code runs on your server before upload
            return { userId: "user-id", documentType: "document" };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log(
                "Document upload complete for userId:",
                metadata.userId
            );
            console.log("Document file url:", file.url);

            // Return the file URL or other data to the client
            return {
                uploadedBy: metadata.userId,
                url: file.url,
                key: file.key,
                name: file.name,
                size: file.size,
                type: file.type,
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
