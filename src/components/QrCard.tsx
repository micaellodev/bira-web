"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { CometCard } from "./comet-card";
import { TicketBackground } from "./ticket-background";
import BiraLogo from "@/components/icons/Biralogo"
import {
    motion,
    useMotionValue,
    useTransform,
} from "framer-motion";

interface Promotor {
    nombres: string;
    apellidos: string;
}

interface Invitado {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    promotor?: Promotor;
}

interface QrCardProps {
    invitado: Invitado;
    qrData: string;
    reservaInfo?: {
        tipoLugar: string;
        mesaId: number;
        personas: number;
    };
}

export const QrCard = ({ invitado, qrData, reservaInfo }: QrCardProps) => {
    const qrRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Physics state
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Lanyard anchor point
    const ANCHOR_Y = -350;

    const lanyardPath = useTransform(
        [x, y],
        ([latestX, latestY]: any[]) => {
            const startX = 0;
            const startY = ANCHOR_Y;
            const cardTopY = -250;
            const endX = latestX;
            const endY = latestY + cardTopY + 12;

            const cp1X = startX;
            const cp1Y = startY + (endY - startY) * 0.5;
            const cp2X = endX;
            const cp2Y = endY - (endY - startY) * 0.5;

            return `M ${startX} ${startY} C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${endX} ${endY}`;
        }
    );

    const calculateTimeLeft = () => {
        const difference = +new Date("2026-02-28T22:00:00") - +new Date();
        let timeLeft = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        // Initial calculation on client side
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const qrCode = new QRCodeStyling({
            width: 190,
            height: 190,
            image: "",
            // Lower error correction = fewer dots = larger blocks (chunkier look)
            qrOptions: {
                errorCorrectionLevel: 'L'
            },
            dotsOptions: {
                color: "#f472b6", // Pink-400
                type: "extra-rounded", // Changed to extra-rounded for more "liquid" feel
            },
            backgroundOptions: {
                color: "transparent",
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 20,
            },
            cornersSquareOptions: {
                type: "extra-rounded",
                color: "#f472b6",
            },
            cornersDotOptions: {
                type: "dot",
                color: "#f472b6",
            },
            data: qrData
        });

        if (qrRef.current) {
            qrRef.current.innerHTML = "";
            qrCode.append(qrRef.current);
        }
    }, [qrData]);

    return (
        <div ref={containerRef} className="relative flex flex-col items-center justify-center min-h-[940px] overflow-visible w-full">

            {/* Lanyard String SVG Layer */}
            <svg
                className="absolute top-1/2 left-1/2 overflow-visible pointer-events-none z-10"
                style={{
                    transform: "translate(-50%, -50%)"
                }}
                width="1" height="1"
            >
                <motion.path
                    d={lanyardPath}
                    stroke="#18181b"
                    strokeWidth="24"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                />
            </svg>

            {/* Draggable Card Component */}
            <motion.div
                style={{
                    x,
                    y,
                    // Responsive Scaling:
                    // If window width < 360px (padding 20px each side), scale down.
                    // Uses CSS min() to ensure it never scales UP past 1.
                    // Calculation: (100vw - 2rem padding) / 320px base width
                    transform: "scale(min(1, calc((100vw - 2rem) / 320)))"
                }}
                drag
                dragElastic={1.3} // Very stretchy to allow big movements
                dragConstraints={containerRef}
                dragSnapToOrigin
                // "Ball thrown to floor" effect: high bounce, low damping
                dragTransition={{ bounceStiffness: 400, bounceDamping: 10 }}
                className="relative z-20 cursor-grab active:cursor-grabbing touch-none origin-top"
            >
                <CometCard
                    className="w-80 h-[500px]"
                    innerStyle={{
                        boxShadow: "none",
                    }}
                    innerClassName="drop-shadow-xl md:[filter:drop-shadow(0_0_30px_rgba(236,72,153,0.5))_drop-shadow(0_25px_50px_rgba(0,0,0,0.9))]"
                >
                    <div
                        className="relative h-full w-full"
                        style={{
                            // Removed clipPath to prevent border clipping
                        }}
                    >
                        {/* SVG Background with Custom Shape and Border */}
                        <TicketBackground />

                        {/* Content */}
                        <div className="relative z-10 flex h-full w-full flex-col items-center justify-between px-6 pt-14 pb-6">
                            <div className="flex flex-col items-center">
                                <BiraLogo className="h-10 w-auto mb-2" />
                                <h2 className="text-2xl font-bold text-[#f472b6] tracking-tight text-center uppercase">{invitado.nombres}</h2>
                                <h2 className="text-2xl font-bold text-[#f472b6] tracking-tight text-center uppercase">{invitado.apellidoPaterno} {invitado.apellidoMaterno}</h2>
                            </div>

                            <div className="relative group p-2">
                                {/* QR Container */}
                                <div ref={qrRef} className="[&>canvas]:w-full [&>canvas]:h-auto" />
                            </div>

                            {/* Footer Info */}
                            <div className="w-full text-center space-y-2">
                                {reservaInfo ? (
                                    <div className="space-y-0.5">
                                        <p className="text-zinc-400 text-[10px] uppercase tracking-wider">Reserva:</p>
                                        <p className="text-emerald-400 text-xs font-medium">
                                            {reservaInfo.tipoLugar === 'box' ? 'Box VIP' : 'Mesa'} #{reservaInfo.mesaId} - {reservaInfo.personas} per.
                                        </p>
                                    </div>
                                ) : invitado.promotor ? (
                                    <div className="space-y-0.5">
                                        <p className="text-zinc-400 text-[10px] uppercase tracking-wider">Promotor:</p>
                                        <p className="text-[#f472b6] text-xs font-medium">
                                            {invitado.promotor.nombres} {invitado.promotor.apellidos}
                                        </p>
                                    </div>
                                ) : null}
                                <div className="space-y-0.5">
                                    <p className="text-zinc-400 text-[10px] uppercase tracking-wider">Opens in:</p>
                                    <p className="text-[#f472b6] text-xs font-mono">
                                        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CometCard>
            </motion.div>
        </div >
    );
};
