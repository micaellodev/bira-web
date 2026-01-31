'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { adminService, DashboardStats, AnalyticsPromotor, AnalyticsEvento } from '@/services/admin';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MobileNav } from '@/components/MobileNav';

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [promotorAnalytics, setPromotorAnalytics] = useState<AnalyticsPromotor[]>([]);
    const [eventoAnalytics, setEventoAnalytics] = useState<AnalyticsEvento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!adminService.isAuthenticated()) {
            router.push('/sys-panel');
            return;
        }

        loadData();
    }, [router]);

    const loadData = async () => {
        try {
            const [dashboardData, promotorData, eventoData] = await Promise.all([
                adminService.getDashboard(),
                adminService.getAnalyticsPromotor(),
                adminService.getAnalyticsEvento(),
            ]);

            setStats(dashboardData);
            setPromotorAnalytics(promotorData);
            setEventoAnalytics(eventoData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            router.push('/sys-panel');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        adminService.logout();
        router.push('/sys-panel');
    };

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
                    <p className="text-white text-sm">Cargando panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10">
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
                                    onClick={() => router.push('/sys-panel/dashboard/promotores')}
                                    className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    Promotores
                                </button>
                                <button
                                    onClick={() => router.push('/sys-panel/dashboard/canjeados')}
                                    className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    Canjeados
                                </button>
                                <button
                                    onClick={() => router.push('/sys-panel/dashboard/validados')}
                                    className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    Validados
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                >
                                    Salir
                                </button>
                            </div>

                            {/* Mobile Navigation */}
                            <MobileNav
                                items={[
                                    { label: 'Promotores', href: '/sys-panel/dashboard/promotores' },
                                    { label: 'Canjeados', href: '/sys-panel/dashboard/canjeados' },
                                    { label: 'Validados', href: '/sys-panel/dashboard/validados' },
                                    { label: 'Salir', onClick: handleLogout, variant: 'danger' },
                                ]}
                            />
                        </div>
                    </div>
                </header>

                <main className="w-full px-4 py-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Códigos</h3>
                            <p className="text-4xl font-bold">{stats?.totalCodes || 0}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                            <h3 className="text-gray-400 text-sm font-medium mb-2">Códigos Canjeados</h3>
                            <p className="text-4xl font-bold text-green-400">{stats?.codesRedeemed || 0}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                            <h3 className="text-gray-400 text-sm font-medium mb-2">Validados en Evento</h3>
                            <p className="text-4xl font-bold text-blue-400">{stats?.codesValidated || 0}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Promotores</h3>
                            <p className="text-4xl font-bold text-purple-400">{stats?.totalPromoters || 0}</p>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        {/* Promotor Performance Chart */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Rendimiento por Promotor</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={promotorAnalytics}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                    <XAxis dataKey="nombre" stroke="#ffffff80" tick={{ fill: '#ffffff80', fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                                    <YAxis stroke="#ffffff80" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                        labelStyle={{ color: '#ffffff' }}
                                    />
                                    <Legend wrapperStyle={{ color: '#ffffff', fontSize: 12 }} />
                                    <Bar dataKey="totalCodigos" fill="#8b5cf6" name="Total Códigos" />
                                    <Bar dataKey="canjeados" fill="#10b981" name="Canjeados" />
                                    <Bar dataKey="validados" fill="#3b82f6" name="Validados" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Event Timeline Chart */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Tendencia de Validaciones</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={eventoAnalytics}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                    <XAxis
                                        dataKey="fecha"
                                        stroke="#ffffff80"
                                        tick={{ fill: '#ffffff80', fontSize: 12 }}
                                        tickFormatter={(value) => {
                                            try {
                                                return format(new Date(value), 'dd/MM', { locale: es });
                                            } catch {
                                                return value;
                                            }
                                        }}
                                    />
                                    <YAxis stroke="#ffffff80" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                        labelStyle={{ color: '#ffffff' }}
                                        labelFormatter={(value) => {
                                            try {
                                                return format(new Date(value), 'dd MMMM yyyy', { locale: es });
                                            } catch {
                                                return value;
                                            }
                                        }}
                                    />
                                    <Legend wrapperStyle={{ color: '#ffffff', fontSize: 12 }} />
                                    <Line type="monotone" dataKey="canjeados" stroke="#10b981" strokeWidth={2} name="Canjeados" />
                                    <Line type="monotone" dataKey="validados" stroke="#3b82f6" strokeWidth={2} name="Validados" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
                        <h2 className="text-lg sm:text-xl font-bold mb-4">Acciones Rápidas</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                onClick={() => router.push('/sys-panel/dashboard/promotores/crear')}
                                className="px-6 py-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg transition-all duration-300 font-semibold text-sm sm:text-base"
                            >
                                + Crear Promotor
                            </button>
                            <button
                                onClick={() => router.push('/sys-panel/dashboard/promotores')}
                                className="px-6 py-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition-all duration-300 font-semibold text-sm sm:text-base"
                            >
                                Asignar Códigos
                            </button>
                            <button
                                onClick={loadData}
                                className="px-6 py-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded-lg transition-all duration-300 font-semibold text-sm sm:text-base"
                            >
                                🔄 Actualizar Datos
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
