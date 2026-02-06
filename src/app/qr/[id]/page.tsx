"use client";

import dynamic from "next/dynamic";

const QrCard = dynamic(() => import("@/components/QrCard").then(mod => mod.QrCard), {
    ssr: false,
    loading: () => <div className="w-[320px] h-[500px] animate-pulse bg-white/5 rounded-3xl" />
});
import { AuroraBackground } from "@/components/aurora-background";
import { Footer } from "@/components/Footer";
import React, { useEffect, useState } from "react";
import { getInvitadoByUuid } from "@/services/api";
import { useParams, useRouter } from "next/navigation";

interface Invitado {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    tipoDocumento: string;
    numeroDocumento: string;
    telefono: string;
    email: string;
    codigo?: string;
    uuid?: string;
    ticketId?: string;
    promotor?: {
        id: number;
        nombres: string;
        apellidos: string;
    };
    qrData: string;
}

export default function QRPage() {
    const params = useParams();
    const router = useRouter();
    const identifier = params.id as string;

    const [invitado, setInvitado] = useState<Invitado | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (!identifier) {
            router.push("/");
            return;
        }

        const fetchInvitado = async () => {
            // Intentar obtener de sessionStorage primero para inmediatez
            if (typeof window !== 'undefined') {
                const storedInvitado = sessionStorage.getItem('invitado');
                if (storedInvitado) {
                    try {
                        const parsed = JSON.parse(storedInvitado);
                        // Verificar si el UUID o TicketID coincide
                        if (parsed.uuid === identifier || parsed.ticketId === identifier) {
                            setInvitado(parsed);
                            setLoading(false);
                            // Opcionalmente podemos revalidar con la API en segundo plano
                            // pero para el usuario ya mostramos la info
                            return;
                        }
                    } catch (e) {
                        console.error("Error parsing session storage", e);
                    }
                }
            }

            // Si no hay en storage o no coincide, buscar en API
            try {
                // Cast API response to local Interface which includes ticketId
                const data = (await getInvitadoByUuid(identifier)) as unknown as Invitado;
                setInvitado(data);
            } catch (err: any) {
                console.error("Error fetching invitado:", err);

                // Si ya tenemos datos del storage (aunque sea como fallback final), no mostramos error
                // Pero aquí ya verificamos storage arriba. Si llegamos aquí es que falló API y no había storage.

                setError("No se pudo cargar la información. Intenta recargar la página.");
                // No redirigir automáticamente para dar tiempo a leer o reintentar
            } finally {
                setLoading(false);
            }
        };

        fetchInvitado();
    }, [identifier, router]);

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-black">
                <div className="text-white text-xl">Cargando...</div>
            </div>
        );
    }

    if (error && !invitado) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-black">
                <div className="text-red-400 text-xl">{error}</div>
            </div>
        );
    }

    if (!invitado) return null;

    return (
        <AuroraBackground className="h-screen w-full flex flex-col items-center justify-between bg-black overflow-hidden relative">

            {/* Top/Center Section: Logo + Card */}
            <div className="flex-1 flex flex-col items-center justify-center w-full z-20 relative px-4">
                {/* Logo - Positioned to align with lanyard anchor */}
                <div className="relative z-30 mb-[-50px] sm:mb-[-60px]">
                    {/* <img src="/logo.png" alt="Logo" className="w-[240px] sm:w-[320px] drop-shadow-2xl" /> */}
                </div>

                {/* Card Container */}
                <div className="w-full max-w-[450px] sm:max-w-[500px] relative z-20">
                    <QrCard invitado={invitado} qrData={invitado.qrData} />
                </div>
            </div>

            {/* Footer */}
            <div className="w-full relative z-20 pb-4">
                <Footer />
            </div>

            {/* Error Message if any */}
            {error && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/50 rounded-md px-4 py-2 text-red-400 text-sm z-50">
                    {error}
                </div>
            )}
        </AuroraBackground>
    );
}
