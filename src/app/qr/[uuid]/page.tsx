"use client";

import { QrCard } from "@/components/QrCard";
import React, { useEffect, useState } from "react";
import { addToGoogleWallet, addToAppleWallet, getInvitadoByUuid } from "@/services/api";
import { addToGoogleWallet, addToAppleWallet, getInvitadoByUuid } from "@/services/api";
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
    const uuid = params.uuid as string;

    const [invitado, setInvitado] = useState<Invitado | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [loadingApple, setLoadingApple] = useState(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (!uuid) {
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
                        // Verificar si el UUID coincide (ahora viene en el objeto directamente)
                        if (parsed.uuid === uuid) {
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
                const data = await getInvitadoByUuid(uuid);
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
    }, [uuid, router]);

    const handleGoogleWallet = async () => {
        if (!invitado) return;

        setLoadingGoogle(true);
        setError("");

        try {
            const { url } = await addToGoogleWallet(invitado.id);
            window.open(url, '_blank');
        } catch (err: any) {
            console.error("Error adding to Google Wallet:", err);
            setError(err.message || "Error al generar pase de Google Wallet");
        } finally {
            setLoadingGoogle(false);
        }
    };

    const handleAppleWallet = async () => {
        if (!invitado) return;

        setLoadingApple(true);
        setError("");

        try {
            const blob = await addToAppleWallet(invitado.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invitation-${invitado.id}.pkpass`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            console.error("Error adding to Apple Wallet:", err);
            setError(err.message || "Error al generar pase de Apple Wallet");
        } finally {
            setLoadingApple(false);
        }
    };

    if (loading) {
        return (
            <AuroraBackground className="min-h-screen w-full flex items-center justify-center bg-black">
                <div className="text-white text-xl">Cargando...</div>
            </AuroraBackground>
        );
    }

    if (error && !invitado) {
        return (
            <AuroraBackground className="min-h-screen w-full flex items-center justify-center bg-black">
                <div className="text-red-400 text-xl">{error}</div>
            </AuroraBackground>
        );
    }

    if (!invitado) return null;

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden relative px-4 py-8">
            <img src="/logo.png" alt="Logo" className="w-full max-w-[200px] sm:max-w-[280px] mb-8 relative z-20" />

            {/* Container for the card with some breathing room */}
            <div className="w-full max-w-[400px]">
                <QrCard invitado={invitado} qrData={invitado.qrData} />
            </div>

            {/* Wallet Button */}
            <div className="mt-8 flex flex-col gap-3 w-full max-w-[340px] sm:max-w-[380px] relative z-20">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-md px-4 py-2 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Google Wallet Button */}
                <button
                    onClick={handleGoogleWallet}
                    disabled={loadingGoogle}
                    className="flex items-center justify-center gap-2 bg-black border border-white/20 rounded-md px-4 py-2.5 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loadingGoogle ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="text-white text-sm font-medium">Generando...</span>
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21.8 10.5H12.3V13.5H17.7C17.1 16.2 14.7 18 12 18C8.7 18 6 15.3 6 12C6 8.7 8.7 6 12 6C13.5 6 14.9 6.6 15.9 7.5L18.1 5.3C16.5 3.9 14.4 3 12 3C7.0 3 3 7.0 3 12C3 17.0 7.0 21 12 21C16.5 21 20.3 17.7 20.9 13.5C21.0 12.8 21.0 12.4 21.0 12C21.0 11.5 21.0 11.0 20.9 10.5H21.8Z" fill="white" />
                            </svg>
                            <span className="text-white text-sm font-medium">Add to Google Wallet</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}


