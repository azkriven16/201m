"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const NavItems = () => {
    const pathname = usePathname();
    const { theme } = useTheme();

    const navItems = [
        { name: "Dashboard", path: "/" },
        { name: "Employees", path: "/employees" },
        { name: "Documents", path: "/documents" },
        { name: "Events", path: "/employees/birthdays" },
    ];

    return (
        <nav className="flex items-center space-x-8">
            {navItems.map((item) => (
                <Link
                    key={item.name}
                    href={item.path}
                    className={cn(
                        "text-black hover:text-black font-medium transition-colors px-1 py-2 dark:text-white dark:hover:text-white",
                        pathname === item.path &&
                            (theme === "dark"
                                ? "border-b-2 border-white"
                                : "border-b-2 border-black")
                    )}
                >
                    {item.name}
                </Link>
            ))}
        </nav>
    );
};

export default NavItems;
