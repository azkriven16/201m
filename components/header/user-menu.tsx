import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User } from "lucide-react";
import { auth, signOut } from "@/auth";

const UserMenu = async () => {
    const session = await auth();

    if (!session?.user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
                <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage
                        src={session.user.image ?? ""}
                        alt={session.user.name ?? ""}
                    />
                    <AvatarFallback className="bg-indigo-100 text-indigo-600">
                        {session?.user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") ?? ""}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {session.user.name ?? ""}
                        </p>
                        <p className="text-xs leading-none text-slate-500">
                            {session.user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form
                    action={async () => {
                        "use server";
                        await signOut();
                    }}
                >
                    <button type="submit" className="w-full h-full">
                        <DropdownMenuItem className="text-red-600 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </button>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserMenu;
