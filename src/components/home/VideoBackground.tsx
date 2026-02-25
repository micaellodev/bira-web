'use client';

import { useEffect, useState } from 'react';

const DESKTOP_SRC = 'https://pptmoljiblztxdfwjbsr.supabase.co/storage/v1/object/public/background/background.mp4';
const MOBILE_SRC = 'https://pptmoljiblztxdfwjbsr.supabase.co/storage/v1/object/public/background/background_phone.mp4';

export function VideoBackground() {
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
        // Solo se ejecuta en el cliente — elige el video según el ancho real del dispositivo
        const isMobile = window.innerWidth < 768;
        setSrc(isMobile ? MOBILE_SRC : DESKTOP_SRC);
    }, []);

    // Durante SSR y primer render no se muestra nada (evita hydration mismatch)
    if (!src) return null;

    return (
        <video
            key={src}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 scale-105"
        >
            <source src={src} type="video/mp4" />
        </video>
    );
}
