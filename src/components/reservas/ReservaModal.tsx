'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import QRCodeStyling from 'qr-code-styling';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bira-backend-production.up.railway.app';

const BOTTLE_NAMES: Record<string, string> = {
    flor_cana_12: 'Flor de Caña 12 Años',
    black_label: 'JW Black Label',
    jager: 'Jägermeister',
    jose_cuervo: 'José Cuervo Especial',
};

interface ReservaModalProps {
    isOpen: boolean;
    onClose: () => void;
    mesaId: number;
    tipoLugar: 'box' | 'mesa';
    personas: number;
    licores: Record<string, number>;
}

type Step = 'form' | 'loading' | 'success' | 'error';

interface ReservaResult {
    uuid: string;
    ticketId: string;
    mesaId: number;
    tipoLugar: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    personas: number;
    licores: Record<string, number>;
    qrLink: string;
}

export function ReservaModal({ isOpen, onClose, mesaId, tipoLugar, personas, licores }: ReservaModalProps) {
    const [step, setStep] = useState<Step>('form');
    const [errorMsg, setErrorMsg] = useState('');
    const [result, setResult] = useState<ReservaResult | null>(null);
    const qrRef = useRef<HTMLDivElement>(null);

    const tipoLabel = tipoLugar === 'box' ? 'Box Vip' : 'Mesa';

    const [form, setForm] = useState({
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        tipoDocumento: 'DNI' as 'DNI' | 'PASAPORTE' | 'CARNET_EXTRANJERIA',
        numeroDocumento: '',
        telefono: '',
        email: '',
    });

    // Reset on open/close
    useEffect(() => {
        if (isOpen) {
            setStep('form');
            setErrorMsg('');
            setResult(null);
            setForm({
                nombres: '',
                apellidoPaterno: '',
                apellidoMaterno: '',
                tipoDocumento: 'DNI',
                numeroDocumento: '',
                telefono: '',
                email: '',
            });
        }
    }, [isOpen]);

    // Generate QR once result is ready
    useEffect(() => {
        if (step === 'success' && result && qrRef.current) {
            qrRef.current.innerHTML = '';
            const qrCode = new QRCodeStyling({
                width: 180,
                height: 180,
                qrOptions: { errorCorrectionLevel: 'L' },
                dotsOptions: { color: '#f472b6', type: 'extra-rounded' },
                backgroundOptions: { color: 'transparent' },
                cornersSquareOptions: { type: 'extra-rounded', color: '#f472b6' },
                cornersDotOptions: { type: 'dot', color: '#f472b6' },
                data: result.qrLink,
            });
            qrCode.append(qrRef.current);
        }
    }, [step, result]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('loading');
        setErrorMsg('');

        try {
            const res = await fetch(`${BACKEND_URL}/reservas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    mesaId,
                    tipoLugar,
                    personas,
                    licores,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data?.message || 'Error al crear la reserva. Intenta de nuevo.');
                setStep('error');
                return;
            }

            setResult(data);
            setStep('success');
        } catch {
            setErrorMsg('Error de conexión. Intenta de nuevo.');
            setStep('error');
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[95vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-zinc-950/90 backdrop-blur border-b border-white/10">
                    <div>
                        <span className="text-xs uppercase tracking-widest text-gray-400 font-bold block">Reservar</span>
                        <span className={cn(
                            'text-xl font-black',
                            tipoLugar === 'box' ? 'text-fuchsia-400' : 'text-cyan-400'
                        )}>
                            {tipoLabel} #{mesaId}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-white/10 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6">

                    {/* STEP: FORM */}
                    {step === 'form' && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in fade-in duration-300">
                            {/* Summary */}
                            <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-gray-300 flex flex-col gap-1">
                                <div className="flex justify-between"><span className="text-gray-500">Lugar:</span> <span className="font-bold text-white">{tipoLabel} #{mesaId}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Personas:</span> <span className="font-bold text-white">{personas}</span></div>
                                {Object.keys(licores).length > 0 && (
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-500">Licores:</span>
                                        <span className="text-white font-bold text-right">
                                            {Object.entries(licores).map(([id, qty]) => `${qty}x ${BOTTLE_NAMES[id] || id}`).join(', ')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-400 text-center">Complete sus datos para confirmar la reserva</p>

                            {/* Personal data */}
                            <div className="flex flex-col gap-3">
                                <input
                                    type="text" name="nombres" required placeholder="Nombres *"
                                    value={form.nombres} onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text" name="apellidoPaterno" required placeholder="Ap. Paterno *"
                                        value={form.apellidoPaterno} onChange={handleChange}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
                                    />
                                    <input
                                        type="text" name="apellidoMaterno" required placeholder="Ap. Materno *"
                                        value={form.apellidoMaterno} onChange={handleChange}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-5 gap-3">
                                    <select
                                        name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange}
                                        className="col-span-2 bg-zinc-900 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-fuchsia-500 transition-colors text-sm"
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="PASAPORTE">Pasaporte</option>
                                        <option value="CARNET_EXTRANJERIA">C.E.</option>
                                    </select>
                                    <input
                                        type="text" name="numeroDocumento" required placeholder="Nº Documento *"
                                        value={form.numeroDocumento} onChange={handleChange}
                                        className="col-span-3 w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
                                    />
                                </div>
                                <input
                                    type="tel" name="telefono" required placeholder="Teléfono (9 dígitos) *"
                                    value={form.telefono} onChange={handleChange}
                                    pattern="\d{9}" maxLength={9}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
                                />
                                <input
                                    type="email" name="email" required placeholder="Correo electrónico *"
                                    value={form.email} onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-fuchsia-900/30 hover:scale-[1.02] mt-2"
                            >
                                Confirmar Reserva
                            </button>
                        </form>
                    )}

                    {/* STEP: LOADING */}
                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center gap-4 py-16 animate-in fade-in duration-300">
                            <div className="w-12 h-12 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-400">Confirmando tu reserva...</p>
                        </div>
                    )}

                    {/* STEP: ERROR */}
                    {step === 'error' && (
                        <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in duration-300">
                            <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                                <span className="text-2xl">✕</span>
                            </div>
                            <p className="text-white font-bold text-center text-lg">Error al Reservar</p>
                            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
                            <button
                                onClick={() => setStep('form')}
                                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-bold mt-2"
                            >
                                Intentar de Nuevo
                            </button>
                        </div>
                    )}

                    {/* STEP: SUCCESS */}
                    {step === 'success' && result && (
                        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Ticket card */}
                            <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-950 to-purple-950 border border-fuchsia-500/30 shadow-xl shadow-fuchsia-900/20">
                                {/* Notch */}
                                <div className="flex justify-center -mt-1">
                                    <div className="w-24 h-6 bg-zinc-950 rounded-b-full border-x border-b border-fuchsia-500/30" />
                                </div>

                                <div className="px-6 pb-6 flex flex-col items-center gap-4">
                                    {/* Logo + Name */}
                                    <div className="text-center mt-2">
                                        <div className="text-2xl font-black tracking-[6px] text-fuchsia-400 mb-2">BIRA</div>
                                        <p className="text-white text-xl font-bold">{result.nombres}</p>
                                        <p className="text-white text-xl font-bold">{result.apellidoPaterno} {result.apellidoMaterno}</p>
                                    </div>

                                    {/* QR Code */}
                                    <div className="bg-white/95 rounded-xl p-3 shadow-lg">
                                        <div ref={qrRef} />
                                    </div>

                                    {/* Details */}
                                    <div className="w-full border-t border-fuchsia-500/20 pt-4 flex flex-col gap-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400 uppercase tracking-wider text-xs">Reserva</span>
                                            <span className="text-fuchsia-400 font-bold">{tipoLabel} #{result.mesaId}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400 uppercase tracking-wider text-xs">Personas</span>
                                            <span className="text-white font-bold">{result.personas}</span>
                                        </div>
                                        {Object.keys(result.licores).length > 0 && (
                                            <div className="flex justify-between text-sm items-start">
                                                <span className="text-gray-400 uppercase tracking-wider text-xs">Licores</span>
                                                <span className="text-white font-bold text-right">
                                                    {Object.entries(result.licores).map(([id, qty]) => `${qty}x ${BOTTLE_NAMES[id] || id}`).join(', ')}
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-center text-xs text-zinc-500 font-mono mt-2">
                                            Reserva #{result.ticketId}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full rounded-xl bg-green-500/10 border border-green-500/30 p-4 flex gap-3 items-start">
                                <span className="text-green-400 text-xl">✓</span>
                                <div>
                                    <p className="text-green-400 font-bold text-sm">¡Reserva Confirmada!</p>
                                    <p className="text-gray-400 text-xs mt-1">Te enviamos un correo a <span className="text-white">{form.email}</span> con todos los detalles.</p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
