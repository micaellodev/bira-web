"use client";

import { QrCard } from "@/components/QrCard";
import { AuroraBackground } from "@/components/aurora-background";
import { Footer } from "@/components/Footer";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

// Mock data for display
const mockInvitado = {
    id: 99999,
    nombres: "Usuario",
    apellidoPaterno: "De Prueba",
    apellidoMaterno: "Sistema",
    tipoDocumento: "DNI",
    numeroDocumento: "88888888",
    telefono: "999999999",
    email: "prueba@bira.lat",
    codigo: "BIRTEST",
    uuid: "test-uuid-mock",
    promotor: {
        id: 1,
        nombres: "Admin",
        apellidos: "Bira"
    },
    qrData: JSON.stringify({
        codigo: "BIRTEST",
        uuid: "test-uuid-mock",
        timestamp: 1700000000000 // Static timestamp for testing
    })
};

export default function TestQRPage() {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSendTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email && !phone) return;

        setLoading(true);
        setStatus(null);

        const qrLink = `${window.location.origin}/qr/${mockInvitado.uuid}`;
        const results = [];

        try {
            // 1. Send Email if provided
            if (email) {
                const emailRes = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        names: `${mockInvitado.nombres} ${mockInvitado.apellidoPaterno}`,
                        qrLink
                    }),
                });
                if (!emailRes.ok) throw new Error('Error enviando correo');
                results.push('Correo enviado');
            }

            // 2. Send WhatsApp if provided
            if (phone) {
                const waRes = await fetch('/api/send-whatsapp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone,
                        names: `${mockInvitado.nombres} ${mockInvitado.apellidoPaterno}`,
                        email: email || 'test@bira.lat', // Fallback for log
                        type: 'guest',
                        qrLink
                    }),
                });

                if (!waRes.ok) {
                    const errData = await waRes.json().catch(() => ({}));
                    // Intelligently format the error
                    const specificDetail = errData.detail?.error?.message || errData.detail?.message || errData.message;
                    throw new Error(specificDetail || 'Error enviando WhatsApp');
                }
                results.push('WhatsApp enviado');
            }

            setStatus({ type: 'success', message: `¡Éxito! ${results.join(' y ')}.` });

        } catch (error: any) {
            console.error(error);
            setStatus({ type: 'error', message: error.message || 'Hubo un error en el envío' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuroraBackground className="min-h-screen w-full flex flex-col items-center justify-between bg-black overflow-hidden relative">

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center w-full z-20 relative px-4 py-8">

                <h1 className="text-white text-2xl font-bold mb-6 text-center">
                    Modo Prueba: Confirmación
                </h1>

                <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full max-w-5xl">

                    {/* Left: QR Card Preview */}
                    <div className="w-full max-w-[450px] flex flex-col items-center">
                        <div className="mb-2 text-gray-400 text-sm">Vista Previa del QR</div>
                        <QrCard invitado={mockInvitado} qrData={mockInvitado.qrData} />
                    </div>

                    {/* Right: Test Controls */}
                    <div className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                        <h2 className="text-white text-xl font-semibold mb-4">Probar Envíos</h2>
                        <p className="text-gray-300 text-sm mb-6">
                            Ingresa correo y/o teléfono para recibir las notificaciones de prueba.
                        </p>

                        <form onSubmit={handleSendTest} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Correo Electrónico:</label>
                                <Input
                                    type="email"
                                    placeholder="tu-correo@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">WhatsApp (51...):</label>
                                <Input
                                    type="tel"
                                    placeholder="999888777"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || (!email && !phone)}
                                className="w-full bg-[#ec4899] hover:bg-[#db2777] text-white font-bold"
                            >
                                {loading ? <Spinner className="mr-2" /> : null}
                                {loading ? 'Procesando...' : 'Enviar Prueba'}
                            </Button>
                        </form>

                        {status && (
                            <div className={`mt-4 p-3 rounded-lg text-sm text-center ${status.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}>
                                {status.message}
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-white/10">
                            <h3 className="text-white text-sm font-medium mb-2">Datos Mockeados:</h3>
                            <pre className="text-[10px] text-gray-500 bg-black/30 p-2 rounded overflow-auto max-h-32">
                                {JSON.stringify(mockInvitado, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="w-full relative z-20 pb-4">
                <Footer />
            </div>

        </AuroraBackground>
    );
}
