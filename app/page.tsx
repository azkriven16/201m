import { auth } from "@/auth";
import { SignOut } from "@/components/auth/signout-button";

export default async function Page() {
    const session = await auth();
    if (!session) return <div>Not authenticated</div>;

    return (
        <div>
            <SignOut />
            <pre>{JSON.stringify(session, null, 2)}</pre>
        </div>
    );
}
