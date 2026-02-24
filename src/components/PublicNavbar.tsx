import Link from 'next/link';
import BiraLogo from '@/components/icons/Biralogo';

export function PublicNavbar() {
    return (
        <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 bg-transparent pointer-events-none">
            {/* Logo */}
            <Link href="/" className="pointer-events-auto flex items-center gap-2 hover:opacity-80 hover:scale-105 transition-all duration-500">
                <BiraLogo className="w-32 sm:w-48 drop-shadow-2xl translate-y-1 sm:translate-y-2" />
            </Link>

            {/* Actions */}
            <div className="pointer-events-auto flex items-center gap-4">
                <Link
                    href="/reservas"
                    className="backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 text-white px-5 py-2 rounded-full font-semibold transition-all duration-300 [text-shadow:0_1px_2px_rgb(0_0_0/0.5)] shadow-xl hover:scale-105 active:scale-95"
                >
                    Reservas
                </Link>
            </div>
        </nav>
    );
}
