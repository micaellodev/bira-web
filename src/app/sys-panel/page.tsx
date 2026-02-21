'use client';

import { useState } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim() || loading) return;

        setLoading(true);
        setError(null);

        try {
            await adminService.login(password.trim());
            router.push('/sys-panel/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Contraseña incorrecta');
            setLoading(false);
        }
    };

    return (
        <main className="relative flex flex-col items-center justify-center min-h-screen w-full bg-black text-white px-4 overflow-hidden">

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Logo */}
                <div className="transform transition-all duration-500 hover:scale-105">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={384}
                        height={120}
                        className="w-full max-w-xs sm:max-w-sm mb-2 drop-shadow-2xl"
                    />
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-white animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                    Panel de Administración
                </h1>

                {/* Subtitle */}
                <p className="text-gray-400 text-sm sm:text-base max-w-sm text-center animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
                    Acceso restringido - Ingresa la contraseña
                </p>

                {/* Form */}
                <form onSubmit={handleLogin} className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
                    <Input
                        type="password"
                        placeholder="Contraseña de administrador"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full bg-white/5 border-white/20 backdrop-blur-sm transition-all duration-300 focus:bg-white/10 focus:border-white/40 focus:shadow-lg focus:shadow-white/10"
                    />

                    <Button
                        type="submit"
                        variant="outline"
                        disabled={loading || !password.trim()}
                        className="w-full min-h-[48px] bg-white text-black hover:bg-gray-200 border-0 font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Spinner data-icon="inline-start" />
                                Verificando…
                            </span>
                        ) : (
                            "Acceder"
                        )}
                    </Button>
                </form>

                {/* Error message */}
                {error && (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 backdrop-blur-sm">
                            <p className="text-red-400 text-sm text-center">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

            </div>

        </main>
    );
}
