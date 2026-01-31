import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Panel de Administración - Bira Party",
    robots: {
        index: false,
        follow: false,
    },
};

export default function SysPanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
