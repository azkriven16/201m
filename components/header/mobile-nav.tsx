"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/logo";

const MobileNav = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: "Dashboard", path: "/" },
        { name: "Employees", path: "/employees" },
        { name: "Documents", path: "/documents" },
        { name: "Events", path: "/events" },
    ];

    return (
        <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between py-4">
                            <Logo size="small" />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <nav className="flex flex-col space-y-6 mt-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className="text-lg font-medium text-slate-700 hover:text-indigo-600"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default MobileNav;
