
"use client";

import { generateEmailHtml } from "@/lib/email-template";
import { useState, useEffect } from "react";

export default function EmailPreviewPage() {
    const [html, setHtml] = useState("");
    const [name, setName] = useState("Lenin Silvio Alvizuri Torres");
    const [promoter, setPromoter] = useState("Donatto Micaello Zoppi Balcazar");

    useEffect(() => {
        // Generate the HTML using the shared helper
        // We pass a dummy QR link
        const generated = generateEmailHtml(name, "https://biraparty.lat/qr/demo", promoter);
        setHtml(generated);
    }, [name, promoter]);

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-2xl font-bold mb-6">Vista Previa del Correo</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                        <h2 className="text-xl font-bold mb-4 text-pink-500">Controles</h2>

                        <div className="space-y-2">
                            <label className="block text-sm text-slate-400">Nombre del Invitado</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm text-slate-400">Nombre del Promotor</label>
                            <input
                                type="text"
                                value={promoter}
                                onChange={(e) => setPromoter(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                        <p className="text-sm text-slate-400">
                            Esta es una representación exacta del HTML que se enviará por correo.
                            Ten en cuenta que cada cliente de correo (Gmail, Outlook, iCloud) puede renderizarlo ligeramente diferente.
                        </p>
                    </div>
                </div>

                <div className="border border-slate-700 rounded-lg overflow-hidden bg-white">
                    <iframe
                        srcDoc={html}
                        className="w-full h-[800px] border-none"
                        title="Email Preview"
                    />
                </div>
            </div>
        </div>
    );
}
