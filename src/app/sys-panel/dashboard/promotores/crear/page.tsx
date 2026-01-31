'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { adminService } from '@/services/admin';
import { MobileNav } from '@/components/MobileNav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CrearPromotorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        dni: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        telefono: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await adminService.createPromotor(formData);
            setSuccess(true);
            setTimeout(() => {
                router.push('/sys-panel/dashboard/promotores');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear promotor');
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
                        <button
                            onClick={() => router.push('/sys-panel/dashboard/promotores')}
                            className="hidden md:block px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            ← Volver
                        </button>

                        {/* Mobile Navigation */}
                        <MobileNav
                            items={[
                                { label: '← Volver', href: '/sys-panel/dashboard/promotores' },
                            ]}
                        />
                    </div>
                </div>
            </header>

            <main className="w-full px-4 py-6 max-w-2xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">Crear Nuevo Promotor</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-sm">
                    {success ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-green-400 mb-2">¡Promotor creado exitosamente!</h2>
                            <p className="text-gray-400">Redirigiendo...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">DNI</label>
                                <Input
                                    type="text"
                                    name="dni"
                                    value={formData.dni}
                                    onChange={handleChange}
                                    required
                                    maxLength={8}
                                    placeholder="12345678"
                                    className="w-full bg-white/5 border-white/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Nombres</label>
                                <Input
                                    type="text"
                                    name="nombres"
                                    value={formData.nombres}
                                    onChange={handleChange}
                                    required
                                    placeholder="Juan Carlos"
                                    className="w-full bg-white/5 border-white/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Apellido Paterno</label>
                                    <Input
                                        type="text"
                                        name="apellido_paterno"
                                        value={formData.apellido_paterno}
                                        onChange={handleChange}
                                        required
                                        placeholder="Pérez"
                                        className="w-full bg-white/5 border-white/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Apellido Materno</label>
                                    <Input
                                        type="text"
                                        name="apellido_materno"
                                        value={formData.apellido_materno}
                                        onChange={handleChange}
                                        required
                                        placeholder="García"
                                        className="w-full bg-white/5 border-white/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="promotor@ejemplo.com"
                                    className="w-full bg-white/5 border-white/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Teléfono</label>
                                <Input
                                    type="tel"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    required
                                    placeholder="987654321"
                                    className="w-full bg-white/5 border-white/20"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-500 hover:bg-green-600 text-white min-h-[48px]"
                            >
                                {loading ? 'Creando...' : 'Crear Promotor'}
                            </Button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
