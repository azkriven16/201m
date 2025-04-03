import Logo from "@/components/logo";
import Link from "next/link";
import MobileNav from "./mobile-nav";
import UserMenu from "./user-menu";
import NavItems from "./nav-items";

export default function Header() {
    return (
        <header className="w-full border-b border-slate-200 bg-white">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo (Left) */}
                    <div className="flex-shrink-0">
                        <Link href="/dashboard">
                            <Logo size="small" />
                        </Link>
                    </div>

                    {/* Navigation (Center) */}
                    <div className="hidden md:flex flex-grow justify-center">
                        <NavItems />
                    </div>

                    {/* Right section: Mobile menu button or User avatar */}
                    <div className="flex items-center">
                        {/* Mobile Navigation */}
                        <MobileNav />

                        {/* User Menu (visible on all screens) */}
                        <UserMenu />
                    </div>
                </div>
            </div>
        </header>
    );
}
