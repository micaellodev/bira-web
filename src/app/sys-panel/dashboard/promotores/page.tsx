'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { adminService, Promotor } from '@/services/admin';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';

export default function PromotoresPage() {
    const router = useRouter();
    const [promotores, setPromotores] = useState<Promotor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!adminService.isAuthenticated()) {
            router.push('/sys-panel');
            return;
        }

        loadPromotores();
    }, [router]);

    const loadPromotores = async () => {
        try {
            const data = await adminService.getPromotores();
            setPromotores(data);
        } catch (error) {
            console.error('Error loading promotores:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPromotores = promotores.filter(p =>
        p.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.apellidoPaterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.dni.includes(searchTerm)
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
                    <p className="text-white text-sm">Cargando promotores...</p>
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
                                onClick={() => router.push('/sys-panel/dashboard/promotores/crear')}
                                className="px-3 py-1.5 text-sm bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                            >
                                + Crear Promotor
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        <MobileNav
                            items={[
                                { label: '← Dashboard', href: '/sys-panel/dashboard' },
                                { label: '+ Crear Promotor', href: '/sys-panel/dashboard/promotores/crear' },
                            ]}
                        />
                    </div>
                </div>
            </header>

            <main className="w-full px-4 py-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-6">Gestión de Promotores</h2>

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 w-full sm:w-64"
                    />
                    <Button
                        onClick={() => router.push('/sys-panel/dashboard/promotores/crear')}
                        className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto py-3 whitespace-nowrap"
                    >
                        + Crear Promotor
                    </Button>
                </div>

                {/* Promotores Table - Desktop */}
                <div className="hidden md:block bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">DNI</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Teléfono</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Códigos</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Canjeados</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Validados</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredPromotores.map((promotor) => (
                                    <tr key={promotor.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{promotor.dni}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {promotor.nombres} {promotor.apellidoPaterno} {promotor.apellidoMaterno}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{promotor.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{promotor.telefono}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
                                                {promotor.stats.totalCodes}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                                                {promotor.stats.codesRedeemed}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                                                {promotor.stats.codesValidated}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => router.push(`/sys-panel/dashboard/promotores/${promotor.id}/asignar`)}
                                                className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors text-xs font-semibold"
                                            >
                                                Asignar Códigos
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredPromotores.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            No se encontraron promotores
                        </div>
                    )}
                </div>

                {/* Promotores Cards - Mobile */}
                <div className="md:hidden space-y-4">
                    {filteredPromotores.map((promotor) => (
                        <div key={promotor.id} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-lg">
                                        {promotor.nombres} {promotor.apellidoPaterno}
                                    </h3>
                                    <p className="text-sm text-gray-400">{promotor.apellidoMaterno}</p>
                                </div>
                                <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono">
                                    {promotor.dni}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">📧</span>
                                    <span className="text-gray-300 break-all">{promotor.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">📱</span>
                                    <span className="text-gray-300">{promotor.telefono}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-400 mb-1">Códigos</p>
                                    <p className="text-lg font-bold text-purple-400">{promotor.stats.totalCodes}</p>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-400 mb-1">Canjeados</p>
                                    <p className="text-lg font-bold text-green-400">{promotor.stats.codesRedeemed}</p>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-400 mb-1">Validados</p>
                                    <p className="text-lg font-bold text-blue-400">{promotor.stats.codesValidated}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push(`/sys-panel/dashboard/promotores/${promotor.id}/asignar`)}
                                className="w-full px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors font-semibold"
                            >
                                Asignar Códigos
                            </button>
                        </div>
                    ))}

                    {filteredPromotores.length === 0 && (
                        <div className="text-center py-12 text-gray-400 bg-white/5 border border-white/10 rounded-xl">
                            No se encontraron promotores
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
