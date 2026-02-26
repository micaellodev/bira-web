'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { adminService, ReservaPendiente } from '@/services/admin';
import { MobileNav } from '@/components/MobileNav';
import BiraLogo from '@/components/icons/Biralogo';

const BOTTLE_NAMES: Record<string, string> = {
    ron_tequila: 'Ron + Tequila',
    double_black: 'JW Double Black',
    gold_label: 'Gold Label',
    flor_cana_12: 'Flor de Caña 12A',
    black_label: 'JW Black Label',
    jager: 'Jägermeister',
    jose_cuervo: 'José Cuervo',
};

function estadoBadge(estado: string) {
    if (estado === 'RESERVADO') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">RESERVADO</span>;
    if (estado === 'PENDIENTE') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">PENDIENTE</span>;
    if (estado === 'REVISION') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">EN REVISIÓN</span>;
    if (estado === 'CANCELADA') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">CANCELADA</span>;
    return null;
}

export default function ReservasAdminPage() {
    const router = useRouter();
    const [reservas, setReservas] = useState<ReservaPendiente[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        if (!adminService.isAuthenticated()) {
            router.push('/sys-panel');
            return;
        }
        loadReservas();
    }, [router]);

    const loadReservas = async () => {
        setLoading(true);
        try {
            const data = await adminService.getReservasPendientes();
            setReservas(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAceptar = async (uuid: string) => {
        if (processingId) return;
        if (!confirm('¿Confirmar esta reserva y enviar WhatsApp al cliente?')) return;
        setProcessingId(uuid);
        try {
            await adminService.aceptarReserva(uuid);
            alert('Reserva confirmada. WhatsApp enviado al cliente.');
            await loadReservas();
        } catch (e: any) {
            alert(`Error: ${e?.response?.data?.message || e?.message || 'Error desconocido'}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleRechazar = async (uuid: string) => {
        if (processingId) return;
        if (!confirm('¿Cancelar esta reserva? El cliente será notificado por WhatsApp.')) return;
        setProcessingId(uuid);
        try {
            await adminService.rechazarReserva(uuid);
            alert('Reserva rechazada/cancelada. WhatsApp enviado al cliente.');
            await loadReservas();
        } catch (e: any) {
            alert(`Error: ${e?.response?.data?.message || e?.message || 'Error desconocido'}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleLogout = () => {
        adminService.logout();
        router.push('/sys-panel');
    };

    if (loading) {
        return (
            <div className="relative flex items-center justify-center min-h-screen w-full bg-black overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-white text-sm">Cargando reservas...</p>
                </div>
            </div>
        );
    }

    const activas = reservas.filter(r => r.estado === 'RESERVADO');
    const pendientes = reservas.filter(r => r.estado === 'PENDIENTE' || r.estado === 'REVISION');

    return (
        <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <header className="bg-white/5 border-b border-white/10 backdrop-blur-sm sticky top-0 z-50">
                    <div className="w-full px-4 py-3">
                        <div className="flex justify-between items-center">
                            <Link href="/sys-panel/dashboard" className="relative w-20 h-20 sm:w-24 sm:h-24">
                                <BiraLogo className="object-contain" />
                            </Link>
                            <div className="hidden md:flex flex-wrap gap-2">
                                <button onClick={() => router.push('/sys-panel/dashboard')}
                                    className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                                    ← Dashboard
                                </button>
                                <button onClick={loadReservas}
                                    className="px-3 py-1.5 text-sm bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-400 rounded-lg transition-colors">
                                    🔄 Actualizar
                                </button>
                                <button onClick={handleLogout}
                                    className="px-3 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                                    Salir
                                </button>
                            </div>
                            <MobileNav items={[
                                { label: '← Dashboard', href: '/sys-panel/dashboard' },
                                { label: 'Salir', onClick: handleLogout, variant: 'danger' },
                            ]} />
                        </div>
                    </div>
                </header>

                <main className="w-full px-4 py-6 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold">🎟 Gestión de Reservas</h2>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 text-sm font-bold border border-gray-500/30">
                                {pendientes.length} por aprobar
                            </span>
                            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/30">
                                {activas.length} aprobadas
                            </span>
                        </div>
                    </div>

                    {reservas.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-gray-400">
                            No hay reservas en este momento.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {pendientes.length > 0 && (
                                <>
                                    <h3 className="text-sm uppercase tracking-wider text-gray-400 font-bold mt-2">Por Aprobar</h3>
                                    {pendientes.map(r => (
                                        <ReservaCard key={r.uuid} reserva={r} processingId={processingId}
                                            expandedId={expandedId} setExpandedId={setExpandedId}
                                            onAceptar={handleAceptar} onRechazar={handleRechazar} />
                                    ))}
                                </>
                            )}

                            {activas.length > 0 && (
                                <>
                                    <h3 className="text-sm uppercase tracking-wider text-green-400 font-bold mt-6">Aprobadas / Activas</h3>
                                    {activas.map(r => (
                                        <ReservaCard key={r.uuid} reserva={r} processingId={processingId}
                                            expandedId={expandedId} setExpandedId={setExpandedId}
                                            onAceptar={handleAceptar} onRechazar={handleRechazar} />
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function ReservaCard({ reserva, processingId, expandedId, setExpandedId, onAceptar, onRechazar }: {
    reserva: ReservaPendiente;
    processingId: string | null;
    expandedId: string | null;
    setExpandedId: (id: string | null) => void;
    onAceptar: (uuid: string) => void;
    onRechazar: (uuid: string) => void;
}) {
    const isExpanded = expandedId === reserva.uuid;
    const isProcessing = processingId === reserva.uuid;
    const tipoLabel = reserva.tipoLugar === 'box' ? 'Box VIP' : 'Mesa';
    const licores = reserva.licores as Record<string, number>;

    return (
        <div className={`bg-white/5 border rounded-xl overflow-hidden transition-all duration-300 border-white/10`}>
            {/* Card header */}
            <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : reserva.uuid)}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${reserva.tipoLugar === 'box' ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'}`}>
                        {reserva.tipoLugar === 'box' ? '🥃' : '🪑'}
                    </div>
                    <div>
                        <p className="font-bold text-white">{reserva.nombres} {reserva.apellidoPaterno}</p>
                        <p className="text-gray-400 text-xs">{tipoLabel} #{reserva.mesaId} · {reserva.personas} personas</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {estadoBadge(reserva.estado)}
                    <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
            </button>

            {/* Expanded details */}
            {isExpanded && (
                <div className="px-4 pb-4 flex flex-col gap-4 animate-in fade-in duration-200">
                    <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Nombre completo</p>
                            <p className="text-white font-semibold">{reserva.nombres} {reserva.apellidoPaterno} {reserva.apellidoMaterno}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Teléfono</p>
                            <p className="text-white font-semibold">{reserva.telefono}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Email</p>
                            <p className="text-white font-semibold break-all">{reserva.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Documento</p>
                            <p className="text-white font-semibold">{reserva.tipoDocumento}: {reserva.numeroDocumento}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Ticket ID</p>
                            <p className="text-white font-mono text-xs">{reserva.ticketId}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Fecha</p>
                            <p className="text-white font-semibold">{new Date(reserva.createdAt).toLocaleString('es-PE')}</p>
                        </div>
                        {Object.keys(licores).length > 0 && (
                            <div className="col-span-2">
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Licores</p>
                                <p className="text-white font-semibold">
                                    {Object.entries(licores).map(([id, qty]) => `${qty}x ${BOTTLE_NAMES[id] || id}`).join(', ')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Screenshot */}
                    {reserva.comprobantePago && (
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Comprobante de Pago</p>
                            <a href={reserva.comprobantePago} target="_blank" rel="noopener noreferrer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={reserva.comprobantePago}
                                    alt="Comprobante"
                                    className="max-h-64 rounded-xl border border-white/10 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                />
                            </a>
                            <p className="text-gray-500 text-xs mt-1">Toca la imagen para ver en tamaño completo</p>
                        </div>
                    )}

                    {!reserva.comprobantePago && (
                        <div className="rounded-xl bg-gray-900/50 border border-white/5 p-4 text-center text-gray-500 text-sm">
                            El cliente aún no ha enviado su comprobante de pago.
                        </div>
                    )}

                    {(reserva.estado === 'PENDIENTE' || reserva.estado === 'REVISION') && (
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={() => onAceptar(reserva.uuid)}
                                disabled={isProcessing}
                                className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-400 font-bold rounded-xl transition-all disabled:opacity-50"
                            >
                                {isProcessing ? '...' : '✅ Aprobar y Avisar'}
                            </button>
                            <button
                                onClick={() => onRechazar(reserva.uuid)}
                                disabled={isProcessing}
                                className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold rounded-xl transition-all disabled:opacity-50"
                            >
                                {isProcessing ? '...' : '❌ Rechazar'}
                            </button>
                        </div>
                    )}

                    {(reserva.estado === 'RESERVADO') && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => onRechazar(reserva.uuid)}
                                disabled={isProcessing}
                                className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold rounded-xl transition-all disabled:opacity-50"
                            >
                                {isProcessing ? '...' : '❌ Cancelar Reserva'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
