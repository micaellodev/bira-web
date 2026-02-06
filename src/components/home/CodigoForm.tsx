'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const PlaceholdersAndVanishInput = dynamic(
    () => import("@/components/placeholders-and-vanish-input").then((mod) => mod.PlaceholdersAndVanishInput),
    {
        ssr: false,
        loading: () => <div className="w-full h-12 bg-white/5 rounded-full animate-pulse" />,
    }
);

export function CodigoForm() {
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const [transitioning, setTransitioning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const validar = async () => {
        if (!codigo.trim() || loading) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/codigos/validar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo: codigo.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Código inválido');
            }

            // Guardamos el código para el registro
            sessionStorage.setItem('codigo', codigo.trim());

            // Activar spinner de transición
            setLoading(false);
            setTransitioning(true);

            // Delay para mostrar el spinner de transición
            setTimeout(() => {
                router.push('/registro');
            }, 1500);

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <>
            {/* Full-page transition spinner */}
            {transitioning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-gray-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                        </div>
                        <p className="text-white text-lg font-medium animate-pulse">Cargando registro...</p>
                    </div>
                </div>
            )}

            {/* Input container with glass effect */}
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
                <div className="w-full flex flex-col items-center justify-center">
                    <PlaceholdersAndVanishInput
                        placeholders={["Ingresa tu código", "Tu código de invitación", "Ej: BIRA-2026"]}
                        onChange={(e) => {
                            setCodigo(e.target.value);
                            setError(null);
                        }}
                        onSubmit={validar}
                    />
                </div>
            </div>

            {/* Error message with animation */}
            {error && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-red-400 text-sm">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Helper text */}
            <Link
                href="/contacto-promotor"
                className="text-blue-300 hover:text-blue-200 text-sm sm:text-base font-medium mt-4 animate-in fade-in duration-700 delay-500 transition-colors duration-300 cursor-pointer hover:underline"
            >
                ¿No tienes un código? Contacta con tu promotor
            </Link>
        </>
    );
}
