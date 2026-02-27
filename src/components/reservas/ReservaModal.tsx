'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import QRCodeStyling from 'qr-code-styling';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bira-backend-production.up.railway.app';

// ─── Payment details ─────────────────────────────────────────────────────────
const PAYMENT_YAPE_NUMBER = '943 955 095'; // Replace with actual Yape number
const PAYMENT_WHATSAPP_NUMBER = '51943955095'; // International format for wa.me
const PAYMENT_NAME = 'DONATTO MICAELLO ZOPPI BALCAZAR';

const BOTTLE_NAMES: Record<string, string> = {
    // Mesas
    flor_cana_12: 'Flor de Caña 4 Años',
    jose_cuervo: 'José Cuervo Especial',
    red_label: 'JW Red Label',
    jager: 'Jägermeister',
    absolut: 'Vodka Absolut',
    black_label: 'JW Black Label',
    double_black: 'JW Double Black',
    gold_label: 'JW Gold Label',
    // Boxes (Paquetes)
    ron_tequila_box: 'Ron Flor de Caña 4 años + Tequila Jose Cuervo + Adicionales',
    double_black_box: 'JW Double Black Label + Adicionales',
    gold_label_box: 'Gold Label + Adicionales',
};

const BOTTLE_PRICES: Record<string, number> = {
    // Mesas
    flor_cana_12: 150,
    jose_cuervo: 150,
    red_label: 150,
    jager: 150,
    absolut: 150,
    black_label: 210,
    double_black: 290,
    gold_label: 380,
    // Boxes (Paquetes)
    ron_tequila_box: 500,
    double_black_box: 600,
    gold_label_box: 700,
};

interface ReservaModalProps {
    isOpen: boolean;
    onClose: () => void;
    mesaId: number;
    tipoLugar: 'box' | 'mesa';
    personas: number;
    licores: Record<string, number>;
}

type Step = 'form' | 'loading' | 'payment' | 'screenshot' | 'uploading' | 'submitted' | 'error';

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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

    const totalPrice = Object.entries(licores).reduce((acc, [id, qty]) => {
        return acc + (BOTTLE_PRICES[id] || 0) * qty;
    }, 0) || 250; // Fallback a 250 en caso de no haber precio computable

    const [dniLookupLoading, setDniLookupLoading] = useState(false);
    const [dniLookupError, setDniLookupError] = useState("");

    const lookupDNI = async (dni: string) => {
        if (form.tipoDocumento !== 'DNI' || dni.length !== 8) return;

        setDniLookupLoading(true);
        setDniLookupError("");
        try {
            const res = await fetch('/api/dni-lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dni }),
            });
            const data = await res.json();
            if (!res.ok) {
                setDniLookupError(data.error || 'Error al consultar DNI');
                return;
            }
            if (data.success && data.data) {
                setForm(prev => ({
                    ...prev,
                    nombres: data.data.nombres,
                    apellidoPaterno: data.data.apellidoPaterno,
                    apellidoMaterno: data.data.apellidoMaterno
                }));
            }
        } catch (error) {
            setDniLookupError('Error al consultar DNI');
        } finally {
            setDniLookupLoading(false);
        }
    };

    // Reset on open/close
    useEffect(() => {
        if (isOpen) {
            setStep('form');
            setErrorMsg('');
            setResult(null);
            setSelectedFile(null);
            setPreviewUrl(null);
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

    // Generate QR once result is ready (when showing ticket in submitted step)
    useEffect(() => {
        if (step === 'submitted' && result && qrRef.current) {
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
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (name === 'numeroDocumento' && form.tipoDocumento === 'DNI' && value.length === 8 && /^\d{8}$/.test(value)) {
            lookupDNI(value);
        }

        if (name === 'numeroDocumento') {
            setDniLookupError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('loading');
        setErrorMsg('');

        try {
            const res = await fetch(`${NEXT_PUBLIC_API_URL}/reservas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, mesaId, tipoLugar, personas, licores }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data?.message || 'Error al crear la reserva. Intenta de nuevo.');
                setStep('error');
                return;
            }

            setResult(data);
            setStep('payment');
        } catch {
            setErrorMsg('Error de conexión. Intenta de nuevo.');
            setStep('error');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const handleUploadComprobante = async () => {
        if (!selectedFile || !result) return;
        setStep('uploading');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const res = await fetch(`${NEXT_PUBLIC_API_URL}/reservas/${result.uuid}/pago`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                setErrorMsg(data?.message || 'Error al subir el comprobante.');
                setStep('error');
                return;
            }

            setStep('submitted');
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
                        <span className={cn('text-xl font-black', tipoLugar === 'box' ? 'text-fuchsia-400' : 'text-cyan-400')}>
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

                    {/* ── STEP: FORM ───────────────────────────────────────── */}
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

                            <p className="text-sm text-gray-400 text-center">Complete sus datos para continuar</p>

                            <div className="flex flex-col gap-3">
                                <input type="text" name="nombres" required placeholder="Nombres *"
                                    value={form.nombres} onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" name="apellidoPaterno" required placeholder="Ap. Paterno *"
                                        value={form.apellidoPaterno} onChange={handleChange}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
                                    <input type="text" name="apellidoMaterno" required placeholder="Ap. Materno *"
                                        value={form.apellidoMaterno} onChange={handleChange}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
                                </div>
                                <div className="grid grid-cols-5 gap-3">
                                    <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange}
                                        className="col-span-2 bg-zinc-900 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-fuchsia-500 transition-colors text-sm">
                                        <option value="DNI">DNI</option>
                                        <option value="PASAPORTE">Pasaporte</option>
                                        <option value="CARNET_EXTRANJERIA">C.E.</option>
                                    </select>
                                    <div className="col-span-3 relative">
                                        <input type="text" name="numeroDocumento" required placeholder="Nº Documento *"
                                            value={form.numeroDocumento} onChange={handleChange}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
                                        {dniLookupLoading && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {dniLookupError && (
                                    <p className="text-red-400 text-xs mt-[-4px]">{dniLookupError}</p>
                                )}

                                <input type="tel" name="telefono" required placeholder="Teléfono (9 dígitos) *"
                                    value={form.telefono} onChange={handleChange}
                                    pattern="\d{9}" maxLength={9}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
                                <input type="email" name="email" required placeholder="Correo electrónico *"
                                    value={form.email} onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors" />
                            </div>

                            <button type="submit"
                                className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-fuchsia-900/30 hover:scale-[1.02] mt-2">
                                Siguiente →
                            </button>
                        </form>
                    )}

                    {/* ── STEP: LOADING ────────────────────────────────────── */}
                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center gap-4 py-16 animate-in fade-in duration-300">
                            <div className="w-12 h-12 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-400">Creando tu reserva...</p>
                        </div>
                    )}

                    {/* ── STEP: PAYMENT ────────────────────────────────────── */}
                    {step === 'payment' && result && (
                        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="text-center">
                                <p className="text-2xl font-black text-fuchsia-400">¡Reserva creada! 🎉</p>
                                <p className="text-gray-400 text-sm mt-1">Ahora realiza el pago para confirmar tu lugar</p>
                            </div>

                            {/* Payment info card */}
                            <div className="rounded-2xl bg-gradient-to-b from-fuchsia-950/60 to-purple-950/60 border border-fuchsia-500/30 p-5 flex flex-col gap-4">
                                {/* Price */}
                                <div className="text-center">
                                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Monto a pagar</p>
                                    <p className="text-4xl font-black text-white">S/ {totalPrice}</p>
                                    <p className="text-gray-400 text-xs mt-1">{tipoLabel} #{result.mesaId} · {result.nombres}</p>
                                </div>

                                <div className="border-t border-fuchsia-500/20" />

                                {/* Yape / Plin */}
                                <div className="flex flex-col gap-2">
                                    <p className="text-center text-gray-300 text-sm font-semibold">Paga por Yape, Plin o Transferencia</p>

                                    <div className="bg-zinc-900/80 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Número Yape</p>
                                            <p className="text-white font-bold text-lg font-mono">{PAYMENT_YAPE_NUMBER}</p>
                                            <p className="text-fuchsia-400 text-sm">{PAYMENT_NAME}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-2xl">
                                            💜
                                        </div>
                                    </div>

                                    <div className="bg-zinc-900/80 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Cuenta BCP</p>
                                            <p className="text-white font-bold text-lg font-mono">191-0935261-0-84</p>
                                            <p className="text-gray-400 text-xs uppercase tracking-wider mt-2 mb-1">CCI</p>
                                            <p className="text-white font-bold text-sm font-mono leading-none">002-191-109352614084-57</p>
                                            <p className="text-fuchsia-400 text-sm mt-2">{PAYMENT_NAME}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center p-2 shrink-0">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                                                <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6Z" />
                                                <path d="M12 12h.01" />
                                                <path d="M22 12h-4" />
                                                <path d="M6 12h-4" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* WhatsApp link */}
                                <a
                                    href={`https://wa.me/${PAYMENT_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola! Soy ${result.nombres} ${result.apellidoPaterno}, quiero enviar mi comprobante de pago para la reserva ${tipoLabel} #${result.mesaId} (Ticket: ${result.ticketId})`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-400 font-bold py-3 rounded-xl transition-all"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                                    </svg>
                                    Enviar comprobante por WhatsApp
                                </a>
                            </div>

                            <div className="flex flex-col gap-2">
                                <p className="text-center text-gray-400 text-sm">¿Ya realizaste el pago? Sube el screenshot aquí:</p>
                                <button
                                    onClick={() => setStep('screenshot')}
                                    className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-fuchsia-900/30 hover:scale-[1.02]"
                                >
                                    📸 Subir Comprobante
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP: SCREENSHOT ─────────────────────────────────── */}
                    {step === 'screenshot' && result && (
                        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="text-center">
                                <p className="text-xl font-black text-fuchsia-400">Subir Comprobante</p>
                                <p className="text-gray-400 text-sm mt-1">Adjunta el screenshot de tu pago</p>
                            </div>

                            {/* File picker */}
                            <label className="cursor-pointer flex flex-col items-center gap-3 border-2 border-dashed border-fuchsia-500/40 hover:border-fuchsia-500/70 rounded-2xl p-6 transition-all bg-fuchsia-950/10 hover:bg-fuchsia-950/20">
                                {previewUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={previewUrl} alt="Comprobante" className="max-h-48 rounded-xl object-contain" />
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-3xl">📷</div>
                                        <p className="text-gray-300 font-semibold text-sm text-center">Toca para seleccionar imagen</p>
                                        <p className="text-gray-500 text-xs">JPG, PNG, WEBP</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>

                            {previewUrl && (
                                <p className="text-center text-gray-400 text-xs">
                                    ✓ imagen seleccionada — toca la imagen para cambiarla
                                </p>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleUploadComprobante}
                                    disabled={!selectedFile}
                                    className={cn(
                                        "w-full font-bold py-4 rounded-xl transition-all",
                                        selectedFile
                                            ? "bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white shadow-lg shadow-fuchsia-900/30 hover:scale-[1.02]"
                                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                    )}
                                >
                                    ✓ Confirmar y Enviar
                                </button>
                                <button
                                    onClick={() => setStep('payment')}
                                    className="w-full py-3 text-gray-400 hover:text-white text-sm transition-colors"
                                >
                                    ← Volver
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP: UPLOADING ──────────────────────────────────── */}
                    {step === 'uploading' && (
                        <div className="flex flex-col items-center justify-center gap-4 py-16 animate-in fade-in duration-300">
                            <div className="w-12 h-12 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-400">Enviando comprobante...</p>
                        </div>
                    )}

                    {/* ── STEP: SUBMITTED ──────────────────────────────────── */}
                    {step === 'submitted' && result && (
                        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Ticket card */}
                            <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-950 to-purple-950 border border-fuchsia-500/30 shadow-xl shadow-fuchsia-900/20">
                                <div className="flex justify-center -mt-1">
                                    <div className="w-24 h-6 bg-zinc-950 rounded-b-full border-x border-b border-fuchsia-500/30" />
                                </div>
                                <div className="px-6 pb-6 flex flex-col items-center gap-4">
                                    <div className="text-center mt-2">
                                        <div className="text-2xl font-black tracking-[6px] text-fuchsia-400 mb-2">BIRA</div>
                                        <p className="text-white text-xl font-bold">{result.nombres}</p>
                                        <p className="text-white text-xl font-bold">{result.apellidoPaterno} {result.apellidoMaterno}</p>
                                    </div>
                                    <div className="bg-white/95 rounded-xl p-3 shadow-lg">
                                        <div ref={qrRef} />
                                    </div>
                                    <div className="w-full border-t border-fuchsia-500/20 pt-4 flex flex-col gap-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400 uppercase tracking-wider text-xs">Reserva</span>
                                            <span className="text-fuchsia-400 font-bold">{tipoLabel} #{result.mesaId}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400 uppercase tracking-wider text-xs">Personas</span>
                                            <span className="text-white font-bold">{result.personas}</span>
                                        </div>
                                        <div className="text-center text-xs text-zinc-500 font-mono mt-2">
                                            Reserva #{result.ticketId}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4 flex gap-3 items-start">
                                <span className="text-yellow-400 text-xl">⏳</span>
                                <div>
                                    <p className="text-yellow-400 font-bold text-sm">¡Comprobante enviado!</p>
                                    <p className="text-gray-400 text-xs mt-1">Tu reserva está en revisión. Recibirás confirmación por <span className="text-white">WhatsApp</span> en breve.</p>
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

                    {/* ── STEP: ERROR ───────────────────────────────────────── */}
                    {step === 'error' && (
                        <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in duration-300">
                            <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                                <span className="text-2xl">✕</span>
                            </div>
                            <p className="text-white font-bold text-center text-lg">Error</p>
                            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
                            <button
                                onClick={() => setStep('form')}
                                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-bold mt-2"
                            >
                                Intentar de Nuevo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
