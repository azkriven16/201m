import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { accounts, sessions, users } from "./db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
    }),
    providers: [Google],
});

// Array of authorized emails that can edit content
export const AUTHORIZED_EDITOR_EMAILS = [
    "admin@example.com",
    "editor@example.com",
    // Add more authorized emails here
];

/**
 * Checks if a user's email is authorized to edit content
 * @param email The email to check
 * @returns Boolean indicating if the user is authorized
 */
export function isAuthorizedEditor(email: string | null | undefined): boolean {
    if (!email) return false;
    return AUTHORIZED_EDITOR_EMAILS.includes(email.toLowerCase());
}
