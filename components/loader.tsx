import { Loader2 } from "lucide-react";

export const Loader = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="size-20 animate-spin" />
        </div>
    );
};
