
import { Suspense } from 'react';
import { RegistroForm } from "@/components/registro/RegistroForm";

export const experimental_ppr = true;

export default function RegistroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md h-[800px] rounded-2xl bg-white/5 animate-pulse border border-white/10"></div>
      </div>
    }>
      <RegistroForm />
    </Suspense>
  );
}