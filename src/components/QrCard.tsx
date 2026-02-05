"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { CometCard } from "./comet-card";
import { TicketBackground } from "./ticket-background";
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
}

export const QrCard = ({ invitado, qrData }: QrCardProps) => {
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
        const difference = +new Date("2026-02-28T21:00:00") - +new Date();
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
            width: 160,
            height: 160,
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
                            clipPath: "path('M0 24C0 10.7452 10.7452 0 24 0H90C101.332 0 106.635 1.70014 112 5.5C118.846 10.3496 123.896 23.332 129.5 28.5C138.803 37.0784 148.694 38 160 38C171.306 38 181.197 37.0784 190.5 28.5C196.104 23.332 201.154 10.3496 208 5.5C213.365 1.70014 218.668 0 230 0H296C309.255 0 320 10.7452 320 24V476C320 489.255 309.255 500 296 500H24C10.7452 500 0 489.255 0 476V24Z')"
                        }}
                    >
                        {/* SVG Background with Custom Shape and Border */}
                        <TicketBackground />

                        {/* Content */}
                        <div className="relative z-10 flex h-full w-full flex-col items-center justify-between p-8 pt-12">
                            <div className="flex flex-col items-center">
                                <img src="/logo.png" alt="Bira Logo" className="h-12 w-auto mb-4" />
                                <h2 className="text-3xl font-bold text-[#f472b6] tracking-tight">{invitado.nombres}</h2>
                                <h2 className="text-3xl font-bold text-[#f472b6] tracking-tight">{invitado.apellidoPaterno} {invitado.apellidoMaterno}</h2>
                            </div>

                            <div className="relative group p-4">
                                {/* QR Container */}
                                <div ref={qrRef} className="[&>canvas]:w-full [&>canvas]:h-auto" />
                            </div>

                            {/* Footer Info */}
                            <div className="w-full text-center space-y-4 mb-2">
                                {invitado.promotor && (
                                    <div className="space-y-1">
                                        <p className="text-zinc-400 text-xs uppercase tracking-wider">Promotor:</p>
                                        <p className="text-[#f472b6] text-sm font-medium">
                                            {invitado.promotor.nombres} {invitado.promotor.apellidos}
                                        </p>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <p className="text-zinc-400 text-xs uppercase tracking-wider">Opens in:</p>
                                    <p className="text-[#f472b6] text-sm font-mono">
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
