'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { adminService, CodigoValidado } from '@/services/admin';
import { format } from 'date-fns';
import { MobileNav } from '@/components/MobileNav';
import { es } from 'date-fns/locale';

export default function ValidadosPage() {
    const router = useRouter();
    const [codigos, setCodigos] = useState<CodigoValidado[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!adminService.isAuthenticated()) {
            router.push('/sys-panel');
            return;
        }

        loadCodigos();

        // Auto-refresh every 30 seconds
        const interval = setInterval(loadCodigos, 30000);
        return () => clearInterval(interval);
    }, [router]);

    const loadCodigos = async () => {
        try {
            const data = await adminService.getCodigosValidados();
            setCodigos(data);
        } catch (error) {
            console.error('Error loading codigos:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCodigos = codigos.filter(c =>
        c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.invitado?.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.promotor.nombres.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="relative flex items-center justify-center min-h-screen w-full bg-black overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
                </div>

                {/* Loading spinner */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-white text-sm">Cargando códigos validados...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-black text-white">
            {/* Header */}
            <header className="bg-white/5 border-b border-white/10 backdrop-blur-sm sticky top-0 z-50">
                <div className="w-full px-4 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Link href="/sys-panel/dashboard" className="relative w-20 h-20 sm:w-24 sm:h-24">
                                <Image src="/logo.png" alt="Bira" fill className="object-contain" />
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex flex-wrap gap-2">
                            <button
                                onClick={() => router.push('/sys-panel/dashboard')}
                                className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                ← Dashboard
                            </button>
                            <button
                                onClick={loadCodigos}
                                className="px-3 py-1.5 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                            >
                                ↻ Actualizar
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        <MobileNav
                            items={[
                                { label: '← Dashboard', href: '/sys-panel/dashboard' },
                                { label: '↻ Actualizar', onClick: loadCodigos },
                            ]}
                        />
                    </div>
                </div>
            </header>

            <main className="w-full px-4 py-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-6">Códigos Validados en Evento</h2>
                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Buscar por código, invitado o promotor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 w-full md:w-96"
                    />
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Total Validados en Evento</p>
                            <p className="text-5xl font-bold text-blue-400">{codigos.length}</p>
                        </div>
                        <div className="text-6xl">🎉</div>
                    </div>
                </div>

                {/* Table - Desktop */}
                <div className="hidden md:block bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Código</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Invitado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Documento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Promotor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha Validación</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredCodigos.map((codigo) => (
                                    <tr key={codigo.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold">
                                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                                                {codigo.codigo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {codigo.invitado?.nombres} {codigo.invitado?.apellidos}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {codigo.invitado?.documento}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {codigo.promotor.nombres} {codigo.promotor.apellidos}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {format(new Date(codigo.fechaValidacion), 'dd/MM/yyyy HH:mm', { locale: es })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredCodigos.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            No se encontraron códigos validados en el evento
                        </div>
                    )}
                </div>

                {/* Cards - Mobile */}
                <div className="md:hidden space-y-4">
                    {filteredCodigos.map((codigo) => (
                        <div key={codigo.id} className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex justify-between items-start mb-3">
                                <span className="px-3 py-1.5 bg-blue-500/30 text-blue-300 rounded-lg font-mono font-bold text-sm">
                                    {codigo.codigo}
                                </span>
                                <span className="text-2xl">🎉</span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Invitado</p>
                                    <p className="font-semibold text-lg">{codigo.invitado?.nombres} {codigo.invitado?.apellidos}</p>
                                    <p className="text-sm text-gray-400">{codigo.invitado?.documento}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Promotor</p>
                                    <p className="text-sm">{codigo.promotor.nombres} {codigo.promotor.apellidos}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Fecha de Validación</p>
                                    <p className="text-sm font-semibold text-blue-400">{format(new Date(codigo.fechaValidacion), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredCodigos.length === 0 && (
                        <div className="text-center py-12 text-gray-400 bg-white/5 border border-white/10 rounded-xl">
                            No se encontraron códigos validados en el evento
                        </div>
                    )}
                </div>

                <p className="text-gray-500 text-sm mt-4 text-center">
                    🔄 Esta página se actualiza automáticamente cada 30 segundos
                </p>
            </main>
        </div>
    );
}
