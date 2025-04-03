import { auth } from "@/auth";
import GoogleLoginForm from "@/components/auth/signin-button";
import Header from "@/components/header";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) return <GoogleLoginForm />;

    return (
        <div>
            <Header />
            {children}
        </div>
    );
}
