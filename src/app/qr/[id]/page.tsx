"use client";

import dynamic from "next/dynamic";

const QrCard = dynamic(() => import("@/components/QrCard").then(mod => mod.QrCard), {
    ssr: false,
    loading: () => <div className="w-[320px] h-[500px] animate-pulse bg-white/5 rounded-3xl" />
});
import { AuroraBackground } from "@/components/aurora-background";
import { Footer } from "@/components/Footer";
import React, { useEffect, useState } from "react";
import { getInvitadoByUuid, getReservaByTicketId } from "@/services/api";
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
    const [reservaInfo, setReservaInfo] = useState<{ tipoLugar: string; mesaId: number; personas: number } | undefined>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (!identifier) {
            router.push("/");
            return;
        }

        const fetchInvitado = async () => {
            // Primero intentar desde la API (funciona en cualquier dispositivo)
            try {
                console.log(`Fetching invitado from API: ${identifier}`);
                const data = (await getInvitadoByUuid(identifier)) as unknown as Invitado;
                setInvitado(data);
                setLoading(false);

                // Guardar en localStorage para acceso rápido futuro
                if (typeof window !== 'undefined') {
                    localStorage.setItem('invitado', JSON.stringify(data));
                }
                return;
            } catch (err: any) {
                console.error("Error fetching invitado, trying reserva:", err);

                try {
                    const reservaData = await getReservaByTicketId(identifier);
                    // Map reserva to Invitado format for QrCard
                    const mappedReserv: Invitado = {
                        id: 0,
                        nombres: reservaData.nombres,
                        apellidoPaterno: reservaData.apellidoPaterno,
                        apellidoMaterno: reservaData.apellidoMaterno,
                        tipoDocumento: '',
                        numeroDocumento: '',
                        telefono: '',
                        email: '',
                        uuid: reservaData.uuid || identifier,
                        ticketId: reservaData.ticketId,
                        ticketId: reservaData.ticketId,
                        qrData: reservaData.qrData || '',
                    };
                    setInvitado(mappedReserv);
                    setReservaInfo({
                        tipoLugar: reservaData.tipoLugar,
                        mesaId: reservaData.mesaId,
                        personas: reservaData.personas
                    });
                    setLoading(false);
                    return;
                } catch (reservaErr: any) {
                    console.error("Error fetching reserva from API:", reservaErr);

                    // Si falla la API, intentar localStorage como fallback
                    if (typeof window !== 'undefined') {
                        const storedInvitado = localStorage.getItem('invitado');
                        if (storedInvitado) {
                            try {
                                const parsed = JSON.parse(storedInvitado);
                                // Verificar si el UUID o TicketID coincide
                                if (parsed.uuid === identifier || parsed.ticketId === identifier) {
                                    console.log("Using data from localStorage");
                                    setInvitado(parsed);
                                    setLoading(false);
                                    return;
                                }
                            } catch (e) {
                                console.error("Error parsing local storage", e);
                            }
                        }
                    }

                    // Si todo falla, mostrar error
                    setError("No se pudo cargar la información. Intenta recargar la página.");
                }
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
                    <QrCard invitado={invitado} qrData={invitado.qrData} reservaInfo={reservaInfo} />
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
