'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ReservaModal } from '@/components/reservas/ReservaModal';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
// ─── New layout based on updated floor plan ───────────────────────────────────
// Circles = Mesas (cyan/blue)   |   Rounded rects = Boxes (amber/gold)

interface MesaDef {
    id: number;
    // percentage position on the floor plan canvas
    x: number; // left %
    y: number; // top %
}

interface BoxDef {
    id: number;
    label: string;
    x: number;
    y: number;
}

/**
 * Mesa grid: 3 columns × 4 rows, centered in the room
 * The image shows 12 circles arranged in a 3-column × 4-row grid
 * occupying roughly the center-left of the room (next to ESCENARIO).
 *
 * IDs 1-12, numbered top-left → bottom-right, column-major:
 *   Col 1 (leftmost): 1-4
 *   Col 2 (center):   5-8
 *   Col 3 (right):    9-12
 */
const MESAS: MesaDef[] = [
    // Column 1
    { id: 1, x: 22, y: 23 },
    { id: 2, x: 22, y: 38 },
    { id: 3, x: 22, y: 53 },
    { id: 4, x: 22, y: 68 },
    // Column 2
    { id: 5, x: 37, y: 23 },
    { id: 6, x: 37, y: 38 },
    { id: 7, x: 37, y: 53 },
    { id: 8, x: 37, y: 68 },
    // Column 3
    { id: 9, x: 52, y: 23 },
    { id: 10, x: 52, y: 38 },
    { id: 11, x: 52, y: 53 },
    { id: 12, x: 52, y: 68 },
];

/**
 * Boxes: 3 rounded rectangles at the bottom, centered below the mesa grid.
 * IDs 101-103 to avoid collision with mesa IDs.
 */
const BOXES: BoxDef[] = [
    { id: 101, label: 'BOX 1', x: 22, y: 85 },
    { id: 102, label: 'BOX 2', x: 37, y: 85 },
    { id: 103, label: 'BOX 3', x: 52, y: 85 },
];

const BOX_PACKAGES = [
    { id: 'ron_tequila_box', name: 'Ron Flor de Caña 4 años + Tequila Jose Cuervo + Adicionales', price: 500 },
    { id: 'double_black_box', name: 'JW Double Black Label + Adicionales', price: 600 },
    { id: 'gold_label_box', name: 'Gold Label + Adicionales', price: 700 },
];

const MESA_BOTTLES = [
    { id: 'flor_cana_12', name: 'Flor de Caña 4 Años', price: 150 },
    { id: 'jose_cuervo', name: 'José Cuervo Especial', price: 150 },
    { id: 'red_label', name: 'JW Red Label', price: 150 },
    { id: 'jager', name: 'Jägermeister', price: 150 },
    { id: 'absolut', name: 'Vodka Absolut', price: 150 },
    { id: 'black_label', name: 'JW Black Label', price: 210 },
    { id: 'double_black', name: 'JW Double Black', price: 290 },
    { id: 'gold_label', name: 'JW Gold Label', price: 380 },

];

// ─── Color tokens ─────────────────────────────────────────────────────────────
const MESA_IDLE = 'bg-sky-500 border-sky-400 shadow-sky-500/40';
const MESA_SELECTED = 'bg-sky-300 border-sky-200 shadow-sky-300/70 scale-110';
const MESA_BLOCKED = 'bg-zinc-700 border-zinc-600 opacity-40 shadow-none';
const MESA_DIMMED = 'bg-zinc-800 border-zinc-700 opacity-20 shadow-none';

const BOX_IDLE = 'bg-amber-500 border-amber-400 shadow-amber-500/40';
const BOX_SELECTED = 'bg-amber-300 border-amber-200 shadow-amber-300/70 scale-105';
const BOX_BLOCKED = 'bg-zinc-700 border-zinc-600 opacity-40 shadow-none';
const BOX_DIMMED = 'bg-zinc-800 border-zinc-700 opacity-20 shadow-none';

export function InteractiveFloorPlan() {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'box' | 'mesa'>('all');
    const [blockedIds, setBlockedIds] = useState<Set<number>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [peopleCount, setPeopleCount] = useState<number>(1);
    const [selectedBottles, setSelectedBottles] = useState<Record<string, number>>({});

    // Fetch blocked tables on mount
    useEffect(() => {
        fetch(`${NEXT_PUBLIC_API_URL}/reservas/bloqueadas`)
            .then(r => r.json())
            .then((data: { mesaId: number }[]) => {
                if (Array.isArray(data)) setBlockedIds(new Set(data.map(r => r.mesaId)));
            })
            .catch(() => { });
    }, []);

    const refreshBlocked = () => {
        fetch(`${NEXT_PUBLIC_API_URL}/reservas/bloqueadas`)
            .then(r => r.json())
            .then((data: { mesaId: number }[]) => {
                if (Array.isArray(data)) setBlockedIds(new Set(data.map(r => r.mesaId)));
            })
            .catch(() => { });
    };

    const isBoxId = (id: number) => id >= 101;
    const isMesaId = (id: number) => id < 100;

    const handleClick = (id: number) => {
        if (selectedId === id) {
            setSelectedId(null);
        } else {
            setSelectedId(id);
            setPeopleCount(1);
            setSelectedBottles(isMesaId(id) ? { flor_cana_12: 1 } : {});
        }
    };

    const toggleFilter = (type: 'box' | 'mesa') => {
        setFilterType(prev => prev === type ? 'all' : type);
        setSelectedId(null);
    };

    const activeIsBox = selectedId !== null && isBoxId(selectedId);
    const activeIsMesa = selectedId !== null && isMesaId(selectedId);
    const maxPeople = activeIsBox ? 10 : 5;

    const getTotalBottles = () => Object.values(selectedBottles).reduce((a, b) => a + b, 0);

    const updatePeople = (delta: number) => {
        setPeopleCount(prev => {
            let next = Math.max(1, Math.min(maxPeople, prev + delta));
            const minNeeded = Math.ceil(getTotalBottles() / 2);
            if (next < minNeeded) next = minNeeded;
            return next;
        });
    };

    const updateBottle = (bottleId: string, delta: number) => {
        setSelectedBottles(prev => {
            const current = prev[bottleId] || 0;
            let next = current + delta;
            const currentTotal = Object.values(prev).reduce((a, b) => a + b, 0);

            if (activeIsMesa) {
                if (next > 1) next = 1;
            }

            const proposedTotal = currentTotal - current + next;
            if (proposedTotal > peopleCount * 2) return prev;

            if (next <= 0) {
                const nb = { ...prev };
                delete nb[bottleId];
                return nb;
            }
            return { ...prev, [bottleId]: next };
        });
    };

    const selectedLabel = selectedId !== null
        ? (isBoxId(selectedId)
            ? BOXES.find(b => b.id === selectedId)?.label ?? `Box #${selectedId}`
            : `Mesa #${selectedId}`)
        : '';

    return (
        <div className="w-full flex flex-col items-center gap-6 sm:gap-8 pb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white [text-shadow:0_2px_4px_rgb(0_0_0/0.8)] text-center">
                Selecciona tu Reserva
            </h2>

            {/* ── Filters ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-center gap-4 w-full">
                <button
                    onClick={() => toggleFilter('mesa')}
                    className={cn(
                        "px-6 py-2 rounded-full font-bold transition-all duration-300 border-2 shadow-lg",
                        filterType === 'mesa' || filterType === 'all'
                            ? "bg-sky-600 border-sky-400 text-white shadow-[#0ea5e9_0_0_15px] scale-105"
                            : "bg-zinc-800 border-zinc-600 text-zinc-400 opacity-60"
                    )}
                >
                    Reservar Mesa
                </button>
                <button
                    onClick={() => toggleFilter('box')}
                    className={cn(
                        "px-6 py-2 rounded-full font-bold transition-all duration-300 border-2 shadow-lg",
                        filterType === 'box' || filterType === 'all'
                            ? "bg-amber-500 border-amber-400 text-white shadow-[#f59e0b_0_0_15px] scale-105"
                            : "bg-zinc-800 border-zinc-600 text-zinc-400 opacity-60"
                    )}
                >
                    Reservar Box
                </button>
            </div>

            {/* ── Main Content Area ─────────────────────────────────────────── */}
            <div className="w-full flex flex-col lg:flex-row gap-6 sm:gap-8 items-start justify-center max-w-7xl mx-auto px-4">

                {/* ── Floor Plan ──────────────────────────────────────────────── */}
                <div className="relative w-full lg:w-2/3 max-w-5xl bg-zinc-950 rounded-2xl border border-white/15 shadow-[0_0_40px_rgba(255,255,255,0.06)] overflow-hidden shrink-0"
                    style={{ aspectRatio: '16/9' }}>

                    {/* ── Structural labels ─────────────────────────────────── */}

                    {/* BAÑOS */}
                    <div className="absolute top-[4%] left-[12%] w-[35%] h-[12%] bg-zinc-800 border border-zinc-600 rounded-lg flex items-center justify-center">
                        <span className="text-zinc-300 font-bold tracking-[0.2em] text-[10px] sm:text-xs uppercase">Baños</span>
                    </div>

                    {/* ESCENARIO */}
                    <div className="absolute left-[3%] top-[20%] w-[9%] h-[58%] bg-zinc-800 border border-zinc-600 rounded-xl flex items-center justify-center">
                        <span className="text-zinc-300 font-bold tracking-[0.15em] text-[9px] sm:text-[11px] uppercase [writing-mode:vertical-rl] rotate-180">Escenario</span>
                    </div>

                    {/* GENERAL — zona sin reserva */}
                    <div className="absolute top-[21%] left-[61%] w-[30%] h-[65%] bg-zinc-800/60 border border-zinc-600 rounded-2xl flex items-center justify-center">
                        <span className="text-zinc-400 font-bold tracking-[0.25em] text-sm sm:text-base uppercase [writing-mode:vertical-rl] rotate-180 select-none">General</span>
                    </div>

                    {/* BARRA */}
                    <div className="absolute top-[4%] left-[55%] w-[25%] h-[12%] bg-zinc-800 border border-zinc-600 rounded-lg flex items-center justify-center">
                        <span className="text-zinc-300 font-bold tracking-[0.2em] text-[10px] sm:text-xs uppercase">Barra</span>
                    </div>

                    {/* ENTRADA — tira vertical extremo derecho */}
                    <div className="absolute top-[18%] right-[1%] w-[4%] h-[30%] bg-zinc-700/60 border border-zinc-500 rounded-lg flex items-center justify-center">
                        <span className="text-zinc-400 font-bold tracking-[0.2em] text-[8px] sm:text-[10px] uppercase [writing-mode:vertical-rl] rotate-180 select-none">Entrada</span>
                    </div>

                    {/* ── Mesas (circles) ─────────────────────────────────────── */}
                    {MESAS.map(mesa => {
                        const isSelected = selectedId === mesa.id;
                        const isBlocked = blockedIds.has(mesa.id);
                        const isDimmed = filterType === 'box';
                        const isDisabled = isBlocked || isDimmed;

                        const circleClass = isBlocked
                            ? MESA_BLOCKED
                            : isDimmed
                                ? MESA_DIMMED
                                : isSelected
                                    ? MESA_SELECTED
                                    : MESA_IDLE;

                        return (
                            <button
                                key={mesa.id}
                                title={isBlocked ? 'Reservado' : `Mesa ${mesa.id}`}
                                disabled={isDisabled}
                                onClick={() => handleClick(mesa.id)}
                                className={cn(
                                    "absolute flex items-center justify-center rounded-full border-2 transition-all duration-200 shadow-lg",
                                    "w-[5.5%] aspect-square text-white font-bold text-[9px] sm:text-xs",
                                    circleClass,
                                    !isDisabled && "hover:scale-110 active:scale-95 cursor-pointer",
                                    isDisabled && "cursor-default",
                                    isSelected && "ring-2 ring-white/60 ring-offset-1 ring-offset-zinc-950"
                                )}
                                style={{
                                    left: `${mesa.x}%`,
                                    top: `${mesa.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                {mesa.id}
                            </button>
                        );
                    })}

                    {/* ── Boxes (rounded rectangles) ────────────────────────── */}
                    {BOXES.map(box => {
                        const isSelected = selectedId === box.id;
                        const isBlocked = blockedIds.has(box.id);
                        const isDimmed = filterType === 'mesa';
                        const isDisabled = isBlocked || isDimmed;

                        const rectClass = isBlocked
                            ? BOX_BLOCKED
                            : isDimmed
                                ? BOX_DIMMED
                                : isSelected
                                    ? BOX_SELECTED
                                    : BOX_IDLE;

                        return (
                            <button
                                key={box.id}
                                title={isBlocked ? 'Reservado' : box.label}
                                disabled={isDisabled}
                                onClick={() => handleClick(box.id)}
                                className={cn(
                                    "absolute flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-200 shadow-lg",
                                    "w-[12%] h-[14%] text-white font-bold text-[10px] sm:text-sm",
                                    rectClass,
                                    !isDisabled && "hover:scale-105 active:scale-95 cursor-pointer",
                                    isDisabled && "cursor-default",
                                    isSelected && "ring-2 ring-white/60 ring-offset-1 ring-offset-zinc-950"
                                )}
                                style={{
                                    left: `${box.x}%`,
                                    top: `${box.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <span>{box.label}</span>
                            </button>
                        );
                    })}

                    {/* ── Legend ─────────────────────────────────────────────── */}
                    <div className="absolute bottom-2 right-3 flex items-center gap-3 opacity-70">
                        <span className="flex items-center gap-1 text-[9px] sm:text-xs text-zinc-400">
                            <span className="inline-block w-3 h-3 rounded-full bg-sky-500" />Mesa
                        </span>
                        <span className="flex items-center gap-1 text-[9px] sm:text-xs text-zinc-400">
                            <span className="inline-block w-4 h-3 rounded bg-amber-500" />Box
                        </span>
                        <span className="flex items-center gap-1 text-[9px] sm:text-xs text-zinc-400">
                            <span className="inline-block w-3 h-3 rounded-full bg-zinc-600" />Reservado
                        </span>
                    </div>
                </div>

                {/* ── Selection Panel ─────────────────────────────────────────── */}
                <div className="w-full lg:w-[450px] shrink-0 flex flex-col items-center bg-zinc-950/80 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all duration-500 min-h-[380px] lg:sticky lg:top-8 z-10">
                    {selectedId !== null ? (
                        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Header */}
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <div>
                                    <span className="text-gray-400 uppercase tracking-widest text-xs font-bold block mb-1">
                                        Reservando
                                    </span>
                                    <span className={cn(
                                        "text-3xl font-black drop-shadow-md",
                                        activeIsBox ? 'text-amber-400' : 'text-sky-400'
                                    )}>
                                        {selectedLabel}
                                    </span>
                                    {activeIsBox && (
                                        <span className="block text-amber-300 font-bold text-sm mt-1">Selecciona tu paquete</span>
                                    )}
                                </div>
                                <div className={cn(
                                    "w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-white text-lg",
                                    activeIsBox ? "border-amber-400 bg-amber-500/20" : "border-sky-400 bg-sky-500/20"
                                )}>
                                    {activeIsBox ? '🥃' : '🪑'}
                                </div>
                            </div>

                            {/* People */}
                            <div className="flex flex-col gap-2">
                                <label className="text-gray-300 font-semibold text-sm">
                                    Número de Personas (Máx. {maxPeople})
                                </label>
                                <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-xl border border-white/10 w-fit">
                                    <button onClick={() => updatePeople(-1)} disabled={peopleCount <= 1}
                                        className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white rounded-lg transition-colors font-bold text-xl">
                                        -
                                    </button>
                                    <span className="text-white font-mono font-bold text-xl w-8 text-center">{peopleCount}</span>
                                    <button onClick={() => updatePeople(1)} disabled={peopleCount >= maxPeople}
                                        className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white rounded-lg transition-colors font-bold text-xl">
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Bottles */}
                            <div className="flex flex-col gap-3">
                                <label className="text-gray-300 font-semibold text-sm flex flex-col">
                                    {activeIsBox ? 'Paquete de Licores (Obligatorio 1)' : 'Botellas'}
                                    {!activeIsBox && <span className="text-xs text-yellow-400 mt-1 opacity-80">*Máximo 1 botella por mesa.</span>}
                                </label>

                                {activeIsBox ? (
                                    <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                        {BOX_PACKAGES.map(bottle => {
                                            const isSelected = selectedBottles[bottle.id] === 1;
                                            return (
                                                <button
                                                    key={bottle.id}
                                                    onClick={() => setSelectedBottles({ [bottle.id]: 1 })}
                                                    className={cn(
                                                        "text-left flex items-center justify-between p-3 border rounded-xl transition-all",
                                                        isSelected ? "bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-zinc-900/60 border-white/5 hover:bg-zinc-800/80"
                                                    )}
                                                >
                                                    <span className="text-gray-200 font-medium text-sm sm:text-base pr-4">{bottle.name}</span>
                                                    <span className="font-bold text-amber-500 whitespace-nowrap">S/ {bottle.price}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                                        {MESA_BOTTLES.map(bottle => {
                                            const qty = selectedBottles[bottle.id] || 0;
                                            const isSelected = qty === 1;
                                            const totalBottles = getTotalBottles();
                                            const wouldExceedGlobal = totalBottles >= 1;
                                            const isAtMax = wouldExceedGlobal;

                                            return (
                                                <button
                                                    key={bottle.id}
                                                    disabled={!isSelected && isAtMax}
                                                    onClick={() => updateBottle(bottle.id, isSelected ? -1 : 1)}
                                                    className={cn(
                                                        "flex flex-col items-start p-3 border rounded-xl transition-all text-left",
                                                        isSelected
                                                            ? "bg-sky-500/20 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                                                            : isAtMax
                                                                ? "bg-zinc-900/40 border-white/5 opacity-50 cursor-not-allowed"
                                                                : "bg-zinc-900/60 border-white/5 hover:bg-zinc-800 hover:border-white/10"
                                                    )}
                                                >
                                                    <div className="flex justify-between w-full items-start mb-1 gap-2">
                                                        <span className={cn(
                                                            "font-medium text-sm leading-tight",
                                                            isSelected ? "text-white" : "text-gray-300"
                                                        )}>
                                                            {bottle.name}
                                                        </span>
                                                        {isSelected && (
                                                            <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        "font-bold mt-auto",
                                                        isSelected ? "text-sky-300" : "text-sky-500/80"
                                                    )}>
                                                        S/ {bottle.price}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="w-full mt-2 flex flex-col gap-2">
                                {activeIsMesa && getTotalBottles() === 0 && (
                                    <p className="text-red-400 text-xs text-center font-semibold animate-pulse">
                                        Mínimo 1 botella obligatorio para Mesa.
                                    </p>
                                )}
                                {activeIsBox && getTotalBottles() === 0 && (
                                    <p className="text-amber-400 text-xs text-center font-semibold animate-pulse">
                                        Debes seleccionar 1 paquete de licores para tu Box.
                                    </p>
                                )}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    disabled={(activeIsMesa || activeIsBox) && getTotalBottles() === 0}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-3 font-bold py-4 px-6 rounded-xl transition-all duration-300",
                                        (activeIsMesa || activeIsBox) && getTotalBottles() === 0
                                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                                            : activeIsBox
                                                ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white shadow-lg shadow-amber-900/30 hover:scale-[1.02]"
                                                : "bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white shadow-lg shadow-sky-900/30 hover:scale-[1.02]"
                                    )}
                                >
                                    Confirmar Reserva
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm sm:text-base animate-in fade-in duration-700 py-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-30 hidden sm:block">
                                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            </svg>
                            <p className="text-center px-4 leading-relaxed">
                                {filterType === 'all' ? 'Toca una Mesa (círculo) o un Box (rectángulo) en el plano para iniciar tu reserva.' :
                                    filterType === 'mesa' ? 'Toca una Mesa (círculo azul) en el plano para confirmar.' :
                                        'Toca un Box (rectángulo dorado) en el plano para confirmar.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modal ───────────────────────────────────────────────────── */}
            {selectedId !== null && (
                <ReservaModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedId(null);
                        refreshBlocked();
                    }}
                    mesaId={selectedId}
                    tipoLugar={activeIsBox ? 'box' : 'mesa'}
                    personas={peopleCount}
                    licores={selectedBottles}
                />
            )}
        </div>
    );
}
