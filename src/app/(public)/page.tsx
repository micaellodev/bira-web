import Link from 'next/link';
import { Suspense } from 'react';
import BiraLogo from "@/components/icons/Biralogo";
import { CodigoForm } from "@/components/home/CodigoForm";

export const experimental_ppr = true;

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center gap-6 text-center w-full justify-center text-white px-4 overflow-hidden">
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Logo with animation */}
        <div className="transform transition-all duration-500 hover:scale-105 relative w-full h-auto flex justify-center">
          <BiraLogo className="w-full max-w-xs sm:max-w-sm mb-2 drop-shadow-2xl" />
        </div>

        {/* Title with gradient */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Valida tu Código de Invitación
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-sm sm:text-base max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
          Valida tu código de invitación para continuar
        </p>

        <Suspense fallback={<div className="w-full h-20 animate-pulse bg-white/5 rounded-lg" />}>
          <CodigoForm />
        </Suspense>

        {/* Internal Navigation Footer */}
        <nav className="mt-8 pt-6 border-t border-white/10 w-full animate-in fade-in duration-700 delay-600">
          <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
            <Link
              href="/contacto-promotor"
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              Contactar Promotor
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}