import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique route key
    avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        // Set permissions and file types for this FileRoute
        .middleware(async () => {
            // This code runs on your server before upload
            return { userId: "user-id" }; // Add user ID or other data here
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);

            console.log("file url", file.url);

            // Return the file URL or other data to the client
            return {
                uploadedBy: metadata.userId,
                url: file.url,
                key: file.key,
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
