'use client';

import { useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GlowStick {
    angle: number;
    depth: number;        // 0=center(far), 1=viewer(near)
    speed: number;
    length: number;
    width: number;
    color: string;
    glowColor: string;
}

interface Arc {
    // A large bezier curve sweeping across the screen
    progress: number;     // 0..1 how far along animation
    speed: number;
    color: string;
    width: number;
    // control points stored as fractions of W/H
    x0: number; y0: number;
    x1: number; y1: number; // control
    x2: number; y2: number; // control
    x3: number; y3: number;
    alpha: number;
    alphaDir: number;
}

interface Star {
    x: number; y: number;
    r: number;
    alpha: number;
    twinkleSpeed: number;
    twinklePhase: number;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const STICK_PALETTE: { color: string; glow: string }[] = [
    { color: '#ff2d78', glow: '#ff80b0' },
    { color: '#00f5ff', glow: '#80faff' },
    { color: '#c800ff', glow: '#e080ff' },
    { color: '#ffee00', glow: '#fff380' },
    { color: '#39ff14', glow: '#9dff80' },
    { color: '#ff6a00', glow: '#ffb380' },
    { color: '#0088ff', glow: '#80c4ff' },
    { color: '#ff00aa', glow: '#ff80d5' },
];

const ARC_COLORS = ['#4488ff', '#9933ff', '#00ccff', '#ff44aa', '#44ffcc'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function r(a: number, b: number) { return a + Math.random() * (b - a); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function hexToRgb(hex: string) {
    const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return res
        ? `${parseInt(res[1], 16)},${parseInt(res[2], 16)},${parseInt(res[3], 16)}`
        : '255,255,255';
}

// Cubic bezier point
function bezier(t: number, p0: number, p1: number, p2: number, p3: number) {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function createStick(atDepth?: number): GlowStick {
    const { color, glow } = pick(STICK_PALETTE);
    return {
        angle: r(0, Math.PI * 2),
        depth: atDepth ?? r(0, 0.8),
        speed: r(0.0035, 0.008),
        length: r(100, 220),
        width: r(5, 13),
        color,
        glowColor: glow,
    };
}

function createArc(): Arc {
    const color = pick(ARC_COLORS);
    return {
        progress: r(0, 1),
        speed: r(0.0008, 0.002),
        color,
        width: r(2, 5),
        // random bezier across screen
        x0: r(-0.1, 0.3), y0: r(0.1, 0.9),
        x1: r(0.1, 0.9), y1: r(-0.2, 0.4),
        x2: r(0.2, 1.1), y2: r(0.5, 1.2),
        x3: r(0.7, 1.2), y3: r(0.1, 0.9),
        alpha: r(0.3, 0.7),
        alphaDir: Math.random() > 0.5 ? 1 : -1,
    };
}

function createStar(W: number, H: number): Star {
    return {
        x: r(0, W),
        y: r(0, H),
        r: r(0.5, 2.5),
        alpha: r(0.3, 1),
        twinkleSpeed: r(0.01, 0.04),
        twinklePhase: r(0, Math.PI * 2),
    };
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VideoBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let frame = 0;

        function resize() {
            if (!canvas) return;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const STICK_COUNT = 38;
        const ARC_COUNT = 5;
        const STAR_COUNT = 120;

        const sticks: GlowStick[] = Array.from({ length: STICK_COUNT }, (_, i) =>
            createStick(i < STICK_COUNT * 0.5 ? r(0.2, 0.9) : undefined)
        );
        const arcs: Arc[] = Array.from({ length: ARC_COUNT }, createArc);
        let stars: Star[] = [];

        function initStars() {
            stars = Array.from({ length: STAR_COUNT }, () =>
                createStar(canvas!.width, canvas!.height)
            );
        }
        initStars();

        // ─────────────────────────────────────────────────────────────────────────
        function draw() {
            if (!ctx || !canvas) return;
            const W = canvas.width;
            const H = canvas.height;
            const cx = W / 2;
            const cy = H / 2;
            frame++;

            // ── 1. Background ──────────────────────────────────────────────────────
            ctx.fillStyle = '#030010';
            ctx.fillRect(0, 0, W, H);

            // ── 2. Stars ───────────────────────────────────────────────────────────
            for (const s of stars) {
                s.twinklePhase += s.twinkleSpeed;
                const a = s.alpha * (0.5 + 0.5 * Math.sin(s.twinklePhase));
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${a})`;
                ctx.fill();
            }

            // ── 3. Sweeping arcs ───────────────────────────────────────────────────
            for (const arc of arcs) {
                // Draw the full arc as many small segments (stroking incrementally)
                const segments = 80;
                ctx.beginPath();
                for (let j = 0; j <= segments; j++) {
                    const t = j / segments;
                    const x = bezier(t, arc.x0 * W, arc.x1 * W, arc.x2 * W, arc.x3 * W);
                    const y = bezier(t, arc.y0 * H, arc.y1 * H, arc.y2 * H, arc.y3 * H);
                    if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = `rgba(${hexToRgb(arc.color)},${arc.alpha * 0.3})`;
                ctx.lineWidth = arc.width * 4;
                ctx.stroke();

                ctx.beginPath();
                for (let j = 0; j <= segments; j++) {
                    const t = j / segments;
                    const x = bezier(t, arc.x0 * W, arc.x1 * W, arc.x2 * W, arc.x3 * W);
                    const y = bezier(t, arc.y0 * H, arc.y1 * H, arc.y2 * H, arc.y3 * H);
                    if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = `rgba(${hexToRgb(arc.color)},${arc.alpha * 0.8})`;
                ctx.lineWidth = arc.width;
                ctx.stroke();

                // Animate alpha gently
                arc.alpha += arc.alphaDir * 0.003;
                if (arc.alpha > 0.75 || arc.alpha < 0.1) {
                    arc.alphaDir *= -1;
                    if (arc.alpha < 0.1) {
                        // Respawn with new shape
                        Object.assign(arc, createArc(), { alpha: 0.1 });
                    }
                }
            }

            // ── 4. Radial starburst lines (tunnel) ────────────────────────────────
            const LINE_COUNT = 90;
            const baseRotation = frame * 0.002; // very slow spin

            // Pink/magenta inner, cyan/white outer — just like the original video
            for (let i = 0; i < LINE_COUNT; i++) {
                const angle = (i / LINE_COUNT) * Math.PI * 2 + baseRotation;
                const lineLen = Math.max(W, H) * 0.65;

                // Color gradient: inner=magenta, outer=cyan
                const grad = ctx.createLinearGradient(
                    cx, cy,
                    cx + Math.cos(angle) * lineLen,
                    cy + Math.sin(angle) * lineLen,
                );
                grad.addColorStop(0, 'rgba(220, 0, 180, 0)');
                grad.addColorStop(0.08, 'rgba(220, 0, 180, 0.55)');
                grad.addColorStop(0.4, 'rgba(120, 80, 255, 0.25)');
                grad.addColorStop(0.7, 'rgba(0, 200, 255, 0.2)');
                grad.addColorStop(1, 'rgba(0, 200, 255, 0)');

                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(
                    cx + Math.cos(angle) * lineLen,
                    cy + Math.sin(angle) * lineLen,
                );
                ctx.strokeStyle = grad;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }

            // Center dark vortex
            const vortex = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.08);
            vortex.addColorStop(0, 'rgba(3,0,16,1)');
            vortex.addColorStop(1, 'rgba(3,0,16,0)');
            ctx.fillStyle = vortex;
            ctx.beginPath();
            ctx.arc(cx, cy, Math.min(W, H) * 0.08, 0, Math.PI * 2);
            ctx.fill();

            // ── 5. Glow sticks ────────────────────────────────────────────────────
            for (let i = 0; i < sticks.length; i++) {
                const s = sticks[i];
                const t = s.depth;

                // Quadratic perspective: slow birth, fast exit
                const scale = 0.04 + t * t * 1.6;
                const spread = Math.max(W, H) * 0.7 * t * t;

                const px = cx + Math.cos(s.angle) * spread;
                const py = cy + Math.sin(s.angle) * spread;

                const sw = s.width * scale;
                const sl = s.length * scale;

                if (sw < 0.5 || sl < 0.5) { s.depth += s.speed; continue; }

                // Stick points radially outward
                const rotation = s.angle + Math.PI / 2;

                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(rotation);

                // Outer diffuse glow
                const og = sw * 6;
                const glowGrad = ctx.createLinearGradient(0, -sl / 2, 0, sl / 2);
                glowGrad.addColorStop(0, 'rgba(0,0,0,0)');
                glowGrad.addColorStop(0.2, `rgba(${hexToRgb(s.glowColor)},0.25)`);
                glowGrad.addColorStop(0.5, `rgba(${hexToRgb(s.glowColor)},0.35)`);
                glowGrad.addColorStop(0.8, `rgba(${hexToRgb(s.glowColor)},0.25)`);
                glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = glowGrad;
                ctx.beginPath();
                ctx.ellipse(0, 0, og / 2, sl / 2, 0, 0, Math.PI * 2);
                ctx.fill();

                // Mid body
                const mg = sw * 2;
                const midGrad = ctx.createLinearGradient(0, -sl / 2, 0, sl / 2);
                midGrad.addColorStop(0, 'rgba(0,0,0,0)');
                midGrad.addColorStop(0.1, `rgba(${hexToRgb(s.color)},0.8)`);
                midGrad.addColorStop(0.5, `rgba(${hexToRgb(s.color)},0.9)`);
                midGrad.addColorStop(0.9, `rgba(${hexToRgb(s.color)},0.8)`);
                midGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = midGrad;
                ctx.beginPath();
                ctx.ellipse(0, 0, mg / 2, sl / 2, 0, 0, Math.PI * 2);
                ctx.fill();

                // White bright core
                const cg = ctx.createLinearGradient(0, -sl / 2, 0, sl / 2);
                cg.addColorStop(0, 'rgba(255,255,255,0)');
                cg.addColorStop(0.1, 'rgba(255,255,255,0.95)');
                cg.addColorStop(0.5, 'rgba(255,255,255,1)');
                cg.addColorStop(0.9, 'rgba(255,255,255,0.95)');
                cg.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = cg;
                ctx.beginPath();
                ctx.ellipse(0, 0, sw / 2, sl / 2, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();

                // Advance
                s.depth += s.speed;
                if (s.depth > 1.08 || Math.abs(px - cx) > W * 0.7 || Math.abs(py - cy) > H * 0.7) {
                    sticks[i] = createStick(0); // respawn at center
                }
            }

            // ── 6. Outer vignette ─────────────────────────────────────────────────
            const vig = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.3, cx, cy, Math.max(W, H) * 0.8);
            vig.addColorStop(0, 'rgba(0,0,0,0)');
            vig.addColorStop(1, 'rgba(0,0,0,0.7)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, W, H);

            animId = requestAnimationFrame(draw);
        }

        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-0"
            style={{ display: 'block', background: '#030010' }}
        />
    );
}
