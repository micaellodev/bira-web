'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { PlaceholdersAndVanishInput } from "@/components/placeholders-and-vanish-input";

export default function HomePage() {
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

      <main className="relative flex flex-col items-center gap-6 text-center min-h-screen w-full justify-center bg-black text-white px-4 overflow-hidden">

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Logo with animation */}
          <div className="transform transition-all duration-500 hover:scale-105">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full max-w-xs sm:max-w-sm mb-2 drop-shadow-2xl"
            />
          </div>

          {/* Title with gradient */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
            Valida tu Código de Invitación
          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 text-sm sm:text-base max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
            Valida tu código de invitación para continuar
          </p>

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
            className="text-gray-500 hover:text-gray-300 text-xs sm:text-sm mt-4 animate-in fade-in duration-700 delay-500 transition-colors duration-300 cursor-pointer"
          >
            ¿No tienes un código? Contacta con tu promotor
          </Link>

          {/* Internal Navigation Footer */}
          <nav className="mt-8 pt-6 border-t border-white/10 w-full animate-in fade-in duration-700 delay-600">
            <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
              <Link
                href="/contacto-promotor"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                Contactar Promotor
              </Link>
            </div>
          </nav>
        </div>

      </main>
    </>
  );
}