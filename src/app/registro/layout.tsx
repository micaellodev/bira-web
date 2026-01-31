import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Registro de Invitado - Bira Party",
    description: "Completa tu registro para acceder al evento. Ingresa tus datos personales y obtén tu código QR de invitación.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function RegistroLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
