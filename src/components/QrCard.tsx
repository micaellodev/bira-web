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

const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

useEffect(() => {
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
        dotsOptions: {
            color: "#f472b6", // Pink-400
            type: "rounded",
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
    <div ref={containerRef} className="relative flex flex-col items-center justify-center min-h-[600px] overflow-visible w-full">

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
                strokeWidth="12"
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
                transform: "scale(min(1, calc((100vw - 2rem) / 320)))"
            }}
            drag
            dragElastic={1.3}
            dragConstraints={containerRef}
            dragSnapToOrigin
            dragTransition={{ bounceStiffness: 400, bounceDamping: 10 }}
            className="relative z-20 cursor-grab active:cursor-grabbing touch-none origin-top"
        >
            <CometCard
                className="w-80 h-[500px]"
                innerStyle={{
                    boxShadow: "none",
                    filter: "drop-shadow(0 0 30px rgba(236, 72, 153, 0.5)) drop-shadow(0 25px 50px rgba(0,0,0,0.9))"
                }}
            >
                <div
                    className="relative h-full w-full"
                    style={{
                        clipPath: "path('M0 24C0 10.7452 10.7452 0 24 0H90C101.332 0 106.635 1.70014 112 5.5C118.846 10.3496 123.896 23.332 129.5 28.5C138.803 37.0784 148.694 38 160 38C171.306 38 181.197 37.0784 190.5 28.5C196.104 23.332 201.154 10.3496 208 5.5C213.365 1.70014 218.668 0 230 0H296C309.255 0 320 10.7452 320 24V476C320 489.255 309.255 500 296 500H24C10.7452 500 0 489.255 0 476V24Z')"
                    }}
                >
                    <TicketBackground />

                    {/* Content */}
                    <div className="relative z-10 flex h-full w-full flex-col items-center justify-between p-8 pt-12">
                        <div className="flex flex-col items-center">
                            <img src="/logo.png" alt="Bira Logo" className="h-12 w-auto mb-4" />
                            <h2 className="text-3xl font-bold text-[#f472b6] tracking-tight">{invitado.nombres}</h2>
                            <h2 className="text-3xl font-bold text-[#f472b6] tracking-tight">{invitado.apellidoPaterno} {invitado.apellidoMaterno}</h2>
                        </div>

                        <div className="relative group p-4">
                            <div ref={qrRef} className="[&>canvas]:w-full [&>canvas]:h-auto" />
                        </div>

                        <div className="w-full text-center space-y-4 mb-2">
                            <div className="space-y-1">
                                <p className="text-zinc-400 text-xs uppercase tracking-wider">Promotor:</p>
                                <p className="text-[#f472b6] text-sm font-medium">
                                    {invitado.promotor ? `${invitado.promotor.nombres} ${invitado.promotor.apellidos}` : "Online & Barcelona, Spain"}
                                </p>
                            </div>

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
    </div>
);
};
