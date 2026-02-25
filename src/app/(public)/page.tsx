import Link from 'next/link';
import { Suspense } from 'react';
import BiraLogo from "@/components/icons/Biralogo";
import { CodigoForm } from "@/components/home/CodigoForm";
//import { FloatingPromo } from "@/components/home/FloatingPromo";

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center gap-6 text-center w-full justify-center px-4 py-8">
      {/* Reservas button — fixed top-right, same height as logo */}
      <div className="fixed top-0 right-0 z-50 p-4 sm:p-6">

      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md">

        {/* Logo with animation */}
        <div className="transform transition-all duration-500 hover:scale-105 relative w-full h-auto flex justify-center">
          <BiraLogo className="w-full max-w-sm sm:max-w-md mb-2 drop-shadow-2xl" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white [text-shadow:0_2px_4px_rgb(0_0_0/0.8)]">
          Valida tu Código de Invitación
        </h1>

        {/* Subtitle */}
        <p className="text-gray-100 font-semibold text-sm sm:text-base max-w-sm [text-shadow:0_2px_4px_rgb(0_0_0/0.8)] animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
          Valida tu código de invitación para continuar
        </p>

        <Suspense fallback={<div className="w-full h-20 animate-pulse bg-white/5 rounded-lg" />}>
          <CodigoForm />
        </Suspense>

        {/* Internal Navigation Footer */}
        <nav className="mt-2 pt-4 border-t border-white/10 w-full animate-in fade-in duration-700 delay-600">
          <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
            <Link
              href="/contacto-promotor"
              className="text-cyan-400 hover:text-cyan-300 font-extrabold [text-shadow:0_2px_4px_rgb(0_0_0/0.8)] transition-colors duration-300"
            >
              Contactar Promotor
            </Link>
          </div>
        </nav>
      </div>

      {/* Floating Promo Announcement */}
      {/*<FloatingPromo />*/}
    </main>
  );
}