import React from "react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/auth";

export async function Custom404() {
    
    const session = await auth();

    return (
        <div className="flex flex-col items-center gap-10 justify-center h-screen">
            <Link href="/">
                <Logo size="large" />
            </Link>
            <p className="text-center text-2xl font-bold mb-4">
                {session?.user?.email !== process.env.ADMIN_EMAIL
                    ? "You need to be an admin to access this page."
                    : "Page not found."}
            </p>
            <Link href="/">
                <Button variant="outline" className="px-4 py-2">
                    Go back home
                </Button>
            </Link>
        </div>
    );
}
