
import Link from 'next/link';
import { AuroraBackground } from '@/components/aurora-background';
import { Metadata } from 'next';
import BiraLogo from '@/components/icons/Biralogo';
import { Suspense } from 'react';
import { PromotoresList } from '@/components/promotores/PromotoresList';


export const metadata: Metadata = {
    title: 'Contactar Promotor | Bira Party',
    description: 'Encuentra y contacta a tu promotor oficial de Bira Party para obtener tu código de invitación.',
};

export default function ContactoPromotorPage() {
    return (
        <AuroraBackground>
            <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 py-8">

                {/* Logo with animation */}
                <div className="transform transition-all duration-500 hover:scale-105">
                    <div className="relative w-80 h-36 sm:w-[28rem] sm:h-48 mb-2">
                        <BiraLogo className="object-contain drop-shadow-2xl" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-bold text-white text-center">
                    Encuentra y Contacta con tu Promotor
                </h1>
                <p className="text-zinc-400 text-base sm:text-lg max-w-2xl text-center">
                    Selecciona tu promotor y obtén tu código de invitación el evento
                </p>

                {/* Promoters Grid */}
                <Suspense fallback={
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white/5 border border-white/20 rounded-xl p-6 h-64"></div>
                        ))}
                    </div>
                }>
                    <PromotoresList />
                </Suspense>

                {/* Social Sharing Section */}
                <div className="w-full max-w-md mt-8 pt-6 border-t border-white/10 animate-in fade-in duration-700 delay-400">
                    <p className="text-zinc-400 text-sm mb-4 text-center">Comparte con tus amigos</p>
                    <div className="flex justify-center gap-4">
                        {/* WhatsApp Share */}
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent('¡Bira Party te invita a asistir a su evento! ' + 'https://biraparty.lat')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-green-600 hover:bg-green-700 rounded-full transition-all duration-300 transform hover:scale-110 flex items-center justify-center text-white"
                            aria-label="Compartir en WhatsApp"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </a>

                        {/* Instagram Share */}
                        <a
                            href="https://www.instagram.com/biraparty"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 rounded-full transition-all duration-300 transform hover:scale-110 flex items-center justify-center text-white"
                            aria-label="Ir a Instagram"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.073-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>

                        {/* Twitter/X Share */}
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('¡Bira Party te invita a asistir a su evento!')}&url=${encodeURIComponent('https://biraparty.lat')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-black hover:bg-gray-800 border border-white/20 rounded-full transition-all duration-300 transform hover:scale-110 flex items-center justify-center text-white"
                            aria-label="Compartir en Twitter"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Navigation Footer */}
                <nav className="w-full max-w-4xl mt-6 pt-4 border-t border-white/10 animate-in fade-in duration-700 delay-500">
                    <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
                        <Link
                            href="/"
                            className="text-zinc-400 hover:text-white transition-colors duration-300"
                        >
                            ← Volver al inicio
                        </Link>
                    </div>
                </nav>
            </div>
        </AuroraBackground>
    );
}
