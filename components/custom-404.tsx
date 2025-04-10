import React from "react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/auth";
import { adminEmails } from "@/lib/admin";

export async function Custom404() {
    const session = await auth();

    return (
        <div className="flex flex-col items-center gap-10 justify-center h-screen">
            <Link href="/">
                <Logo size="large" />
            </Link>
            <p className="text-center text-2xl font-bold mb-4">
                {adminEmails.includes(session?.user?.email ?? "")
                    ? "Page not found."
                    : "You need to be an admin to access this page."}
            </p>
            <Link href="/">
                <Button variant="outline" className="px-4 py-2">
                    Go back home
                </Button>
            </Link>
        </div>
    );
}
