'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';

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
            Ingresa tu código
          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 text-sm sm:text-base max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
            Valida tu código de invitación para continuar
          </p>

          {/* Input container with glass effect */}
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
            {error ? (
              <Field data-invalid className="w-full">
                <Input
                  id="codigo"
                  placeholder="Ingresa tu código"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && validar()}
                  disabled={loading}
                  aria-invalid
                  className="bg-white/5 border-red-500/50 backdrop-blur-sm transition-all duration-300 focus:bg-white/10 focus:border-red-500"
                />
              </Field>
            ) : (
              <Input
                id="codigo"
                placeholder="Ingresa tu código"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && validar()}
                disabled={loading}
                className="w-full bg-white/5 border-white/20 backdrop-blur-sm transition-all duration-300 focus:bg-white/10 focus:border-white/40 focus:shadow-lg focus:shadow-white/10"
              />
            )}

            {/* Button with gradient and animation */}
            <Button
              variant="outline"
              onClick={validar}
              disabled={loading || !codigo.trim()}
              className="w-full min-h-[48px] bg-white text-black hover:bg-gray-200 border-0 font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner data-icon="inline-start" />
                  Validando…
                </span>
              ) : (
                "Validar Código"
              )}
            </Button>
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
          <p className="text-gray-500 text-xs sm:text-sm mt-4 animate-in fade-in duration-700 delay-500">
            ¿No tienes un código? Contacta con tu promotor
          </p>
        </div>

      </main>
    </>
  );
}