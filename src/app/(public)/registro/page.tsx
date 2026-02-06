import { Suspense } from 'react';
import { RegistroForm } from "@/components/registro/RegistroForm";
import BiraLogo from "@/components/icons/Biralogo";

export default function RegistroPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 relative z-10">
      <div className="relative z-10 shadow-input mx-auto w-full max-w-md rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 p-6 sm:p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <BiraLogo
            className="w-48 sm:w-56 drop-shadow-2xl"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Completa tu Registro de Invitación
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Ingresa tus datos para obtener tu código QR
          </p>
        </div>

        <Suspense fallback={
          <div className="w-full h-[400px] animate-pulse bg-white/5 rounded-xl"></div>
        }>
          <RegistroForm />
        </Suspense>
      </div>
    </div>
  );
}