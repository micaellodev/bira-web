'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { adminService, Promotor } from '@/services/admin';
import { Input } from '@/components/ui/input';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';

export default function AsignarCodigosPage() {
    const router = useRouter();
    const params = useParams();
    const promotorId = parseInt(params.id as string);

    const [cantidad, setCantidad] = useState('10');
    const [loading, setLoading] = useState(false);
    const [promotorInfo, setPromotorInfo] = useState<any>(null);
    const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
    const [allCodes, setAllCodes] = useState<any[]>([]);
    const [filteredCodes, setFilteredCodes] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'available' | 'redeemed' | 'validated'>('all');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!adminService.isAuthenticated()) {
            router.push('/sys-panel');
            return;
        }

        loadPromotorInfo();
        loadPromotorCodes();
    }, [router, promotorId]);

    useEffect(() => {
        // Apply filter
        switch (filter) {
            case 'available':
                setFilteredCodes(allCodes.filter(c => !c.usado));
                break;
            case 'redeemed':
                setFilteredCodes(allCodes.filter(c => c.usado && !c.validadoEvento));
                break;
            case 'validated':
                setFilteredCodes(allCodes.filter(c => c.validadoEvento));
                break;
            default:
                setFilteredCodes(allCodes);
        }
    }, [filter, allCodes]);

    const loadPromotorInfo = async () => {
        try {
            const data = await adminService.getPromotorStats(promotorId);
            setPromotorInfo(data);
        } catch (error) {
            console.error('Error loading promotor:', error);
        }
    };

    const loadPromotorCodes = async () => {
        try {
            const codes = await adminService.getPromotorCodes(promotorId);
            setAllCodes(codes);
        } catch (error) {
            console.error('Error loading codes:', error);
        }
    };

    const handleGenerate = async () => {
        if (!cantidad || parseInt(cantidad) <= 0) return;

        setLoading(true);
        setError(null);

        try {
            const result = await adminService.assignCodesToPromotor(promotorId, parseInt(cantidad));
            setGeneratedCodes(result.codigos);
            await loadPromotorInfo(); // Refresh stats
            await loadPromotorCodes(); // Refresh all codes
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al generar códigos');
        } finally {
            setLoading(false);
        }
    };


    const downloadCodes = () => {
        const text = generatedCodes.join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `codigos_nuevos_promotor_${promotorId}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadAllCodes = () => {
        const lines = ['CÓDIGOS DEL PROMOTOR', '='.repeat(50), ''];

        filteredCodes.forEach(code => {
            let status = '✓ DISPONIBLE';
            if (code.validadoEvento) {
                status = '✓✓ VALIDADO EN EVENTO';
            } else if (code.usado) {
                status = '✓ CANJEADO';
            }

            lines.push(`${code.codigo} - ${status}`);
            if (code.invitado) {
                lines.push(`   Invitado: ${code.invitado.nombres} ${code.invitado.apellidoPaterno} ${code.invitado.apellidoMaterno}`);
                lines.push(`   Documento: ${code.invitado.numeroDocumento}`);
            }
            lines.push('');
        });

        lines.push('='.repeat(50));
        lines.push(`Total: ${filteredCodes.length} códigos`);
        lines.push(`Disponibles: ${filteredCodes.filter(c => !c.usado).length}`);
        lines.push(`Canjeados: ${filteredCodes.filter(c => c.usado && !c.validadoEvento).length}`);
        lines.push(`Validados: ${filteredCodes.filter(c => c.validadoEvento).length}`);

        const text = lines.join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todos_codigos_promotor_${promotorId}.txt`;
        a.click();
        URL.revokeObjectURL(url);
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

            <main className="w-full px-4 py-6 max-w-4xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold mb-6">Asignar Códigos</h2>
                {/* Promotor Info */}
                {promotorInfo && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm mb-6">
                        <h2 className="text-xl font-bold mb-4">Información del Promotor</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-gray-400 text-sm">Nombre</p>
                                <p className="font-semibold">{promotorInfo.nombres} {promotorInfo.apellidos}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total Códigos</p>
                                <p className="font-semibold text-purple-400">{promotorInfo.totalCodes}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Canjeados</p>
                                <p className="font-semibold text-green-400">{promotorInfo.codesRedeemed}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Validados</p>
                                <p className="font-semibold text-blue-400">{promotorInfo.codesValidated}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Generate Codes Form */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-sm mb-6">
                    <h2 className="text-xl font-bold mb-6">Generar Nuevos Códigos</h2>

                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Cantidad de códigos</label>
                            <Input
                                type="number"
                                min="1"
                                max="1000"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                placeholder="10"
                                className="w-full bg-white/5 border-white/20"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={handleGenerate}
                                disabled={loading || !cantidad}
                                className="bg-green-500 hover:bg-green-600 text-white min-h-[48px] px-8"
                            >
                                {loading ? 'Generando...' : 'Generar Códigos'}
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                </div>


                {/* Generated Codes Display */}
                {generatedCodes.length > 0 && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 backdrop-blur-sm mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-green-400">✨ Códigos Recién Generados ({generatedCodes.length})</h2>
                            <Button
                                onClick={downloadCodes}
                                className="bg-green-500 hover:bg-green-600 text-white"
                            >
                                📥 Descargar Nuevos
                            </Button>
                        </div>

                        <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {generatedCodes.map((code, index) => (
                                    <div
                                        key={index}
                                        className="bg-green-500/20 border border-green-500/30 rounded px-3 py-2 text-center font-mono text-sm hover:bg-green-500/30 transition-colors"
                                    >
                                        {code}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p className="text-green-400 text-sm mt-4">
                            ✅ Códigos generados exitosamente
                        </p>
                    </div>
                )}

                {/* All Codes Display */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold">Todos los Códigos Asignados ({filteredCodes.length})</h2>

                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                                    }`}
                            >
                                Todos ({allCodes.length})
                            </button>
                            <button
                                onClick={() => setFilter('available')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'available'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                                    }`}
                            >
                                Disponibles ({allCodes.filter(c => !c.usado).length})
                            </button>
                            <button
                                onClick={() => setFilter('redeemed')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'redeemed'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                                    }`}
                            >
                                Canjeados ({allCodes.filter(c => c.usado && !c.validadoEvento).length})
                            </button>
                            <button
                                onClick={() => setFilter('validated')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'validated'
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                                    }`}
                            >
                                Validados ({allCodes.filter(c => c.validadoEvento).length})
                            </button>
                        </div>
                    </div>

                    {filteredCodes.length > 0 ? (
                        <>
                            <div className="bg-black/30 rounded-lg p-4 max-h-[500px] overflow-y-auto mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredCodes.map((code) => (
                                        <div
                                            key={code.id}
                                            className={`rounded-lg p-3 border transition-colors ${code.validadoEvento
                                                    ? 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20'
                                                    : code.usado
                                                        ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                                                        : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-mono font-bold text-lg">{code.codigo}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${code.validadoEvento
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : code.usado
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {code.validadoEvento ? '✓✓ Validado' : code.usado ? '✓ Canjeado' : '○ Disponible'}
                                                </span>
                                            </div>

                                            {code.invitado && (
                                                <div className="text-xs text-gray-400 space-y-1 mt-2 pt-2 border-t border-white/10">
                                                    <p className="font-semibold text-white">
                                                        {code.invitado.nombres} {code.invitado.apellidoPaterno}
                                                    </p>
                                                    <p>Doc: {code.invitado.numeroDocumento}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-gray-400 text-sm">
                                    💡 Tip: Usa los filtros para ver códigos por estado
                                </p>
                                <Button
                                    onClick={downloadAllCodes}
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    📥 Descargar {filter !== 'all' ? 'Filtrados' : 'Todos'}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            {allCodes.length === 0
                                ? '📋 Este promotor aún no tiene códigos asignados. Genera algunos arriba.'
                                : '🔍 No hay códigos con este filtro.'
                            }
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
