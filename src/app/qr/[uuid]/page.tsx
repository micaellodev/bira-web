"use client";

import { CometCard } from "@/components/comet-card";
import { AuroraBackground } from "@/components/aurora-background";
import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
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
        <AuroraBackground className="min-h-screen w-full flex flex-col items-center justify-center bg-black px-4 py-8">
            <img src="/logo.png" alt="Logo" className="w-full max-w-[200px] sm:max-w-[280px] mb-8" />

            <CometCard className="w-full max-w-[340px] sm:max-w-[380px]">
                <div
                    className="flex flex-col items-stretch rounded-[16px] border-0 bg-[#1F2121] p-3 saturate-0 sm:p-4"
                    aria-label={`View invite ${invitado.id}`}
                >
                    <div className="mx-2 flex-1">
                        <div className="relative mt-2 aspect-[3/4] w-full overflow-hidden rounded-[16px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        backgroundImage:
                                            "radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 60% 70%, white, transparent), radial-gradient(1px 1px at 50% 50%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(2px 2px at 90% 60%, white, transparent), radial-gradient(1px 1px at 33% 80%, white, transparent)",
                                        backgroundSize: "200% 200%",
                                        opacity: 0.4,
                                    }}
                                />
                            </div>

                            <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 z-10">
                                <div className="text-white drop-shadow-lg">
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
                                        {invitado.nombres}
                                    </h2>
                                    <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-4">
                                        {invitado.apellidoPaterno} {invitado.apellidoMaterno}
                                    </h3>
                                    <p className="text-base sm:text-lg md:text-xl font-mono opacity-90 font-semibold">
                                        {invitado.tipoDocumento}: {invitado.numeroDocumento}
                                    </p>
                                    {invitado.promotor && (
                                        <p className="text-xs sm:text-sm mt-2 opacity-90 font-semibold bg-black/20 px-2 py-1 rounded">
                                            Promotor: {invitado.promotor.nombres}{" "}
                                            {invitado.promotor.apellidos}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-center mt-4">
                                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg">
                                        <QRCodeSVG
                                            value={invitado.qrData}
                                            size={160}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 flex flex-shrink-0 items-center justify-between p-3 sm:p-4 font-mono text-white">
                        <div className="text-xs">Comet Invitation</div>
                        <div className="text-xs text-gray-300 opacity-50">
                            #{invitado.codigo || ""}
                        </div>
                    </div>
                </div>
            </CometCard>

            {/* Wallet Button */}
            <div className="mt-6 flex flex-col gap-3 w-full max-w-[340px] sm:max-w-[380px]">
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
        </AuroraBackground >
    );
}


