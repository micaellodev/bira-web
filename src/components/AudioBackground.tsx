'use client';

import { useEffect, useRef, useState } from 'react';

export function AudioBackground() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const playAudio = async () => {
            try {
                audio.volume = 0.2 // 20% de volumen para que sea música de fondo
                await audio.play();
            } catch (err) {
                // El navegador ha bloqueado el autoplay hasta que el usuario interactúe
                console.log("Autoplay bloqueado por el navegador. Esperando interacción.");
            }
        };

        // Intentamos reproducirlo de inmediato por si el navegador lo permite
        if (!hasInteracted) {
            playAudio();
        }

        const handleInteraction = () => {
            if (!hasInteracted) {
                setHasInteracted(true);
                playAudio();

                // Una vez que interactúa, ya no necesitamos escuchar estos eventos
                removeListeners();
            }
        };

        const removeListeners = () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
        };

        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);

        return () => {
            removeListeners();
        };
    }, [hasInteracted]);

    return (
        <audio
            ref={audioRef}
            loop
            src="/sound_back.mp3"
            className="hidden"
        />
    );
}
