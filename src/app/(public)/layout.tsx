import { Footer } from "@/components/Footer";
import { AuroraBackground } from "@/components/aurora-background";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuroraBackground>
            {children}
            <Footer />
        </AuroraBackground>
    );
}
