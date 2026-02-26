'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X } from 'lucide-react';
import Link from 'next/link';

export function FloatingPromo() {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Optional Overlay to focus attention - uncomment if desired */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-49 pointer-events-auto"
                        onClick={() => setIsVisible(false)}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                        exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-1/2 left-1/2 z-50 w-[95%] max-w-lg pointer-events-auto"
                    >
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-linear-to-r from-yellow-600 via-amber-400 to-yellow-600 rounded-3xl blur-md opacity-75 animate-pulse"></div>

                            <div className="relative flex flex-col items-center text-center gap-4 bg-black/95 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl">

                                {/* Close Button */}
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>

                                <div className="bg-linear-to-br from-yellow-400 to-yellow-600 p-4 sm:p-5 rounded-full shadow-inner shrink-0">
                                    <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-black" fill="currentColor" />
                                </div>

                                <div className="flex-1 w-full space-y-2">
                                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                        ¡Promoción Exclusiva!
                                    </h3>
                                    <p className="text-base sm:text-lg text-gray-200 leading-relaxed">
                                        Si reservas un Box o Mesa obtienes <br className="hidden sm:block" />
                                        <span className="text-yellow-400 font-extrabold uppercase tracking-wide text-lg sm:text-xl drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                                            15% de descuento
                                        </span>
                                        <br /> en la botella.
                                    </p>
                                </div>

                                <div className="w-full mt-4 flex flex-col gap-3">
                                    <Link
                                        href="/reservas"
                                        onClick={() => setIsVisible(false)}
                                        className="w-full text-center py-4 px-6 bg-linear-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:via-yellow-300 hover:to-yellow-400 text-black font-extrabold text-lg sm:text-xl rounded-2xl transition-all shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:shadow-[0_0_40px_rgba(250,204,21,0.6)] transform hover:scale-[1.03] active:scale-[0.98] uppercase tracking-wide border-2 border-yellow-200/50 relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 w-full h-full bg-linear-to-r from-white/0 via-white/40 to-white/0 transform -translate-x-full group-hover:animate-shimmer"></div>
                                        <span className="relative z-10">¡Quiero Reservar!</span>
                                    </Link>

                                    <button
                                        onClick={() => setIsVisible(false)}
                                        className="w-full py-2 px-4 text-gray-400 hover:text-white text-sm font-medium transition-colors bg-transparent border border-transparent hover:border-white/10 rounded-xl"
                                    >
                                        Seguir navegando
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
