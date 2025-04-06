"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NavItems = () => {
    const pathname = usePathname();

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
                        "text-slate-700 hover:text-indigo-600 font-medium transition-colors px-1 py-2",
                        pathname === item.path &&
                            "text-indigo-600 border-b-2 border-indigo-600"
                    )}
                >
                    {item.name}
                </Link>
            ))}
        </nav>
    );
};

export default NavItems;
