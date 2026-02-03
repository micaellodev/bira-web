export default function CrmLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-neutral-950 font-sans text-neutral-100 antialiased selection:bg-teal-500/30">
            {children}
        </div>
    );
}
