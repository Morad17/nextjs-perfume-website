"use client";

import { useRef, useEffect, RefObject } from "react";

interface Color { h: number; s: number; l: number; }

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  h: number;
  s: number;
  l: number;
  offset: number; // unique turbulence phase per particle
}

interface Props {
  colors: Color[];
  targetRef: RefObject<HTMLDivElement | null>;
}

const MAX_PARTICLES = 150;
const TRAIL_STEPS    = 8;   // overlapping blobs per particle → elongated wisp
const BLUR_PX        = 10;  // applied once per frame to the whole smoke layer

export default function SmokeCanvas({ colors, targetRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const target = targetRef.current;
    if (!canvas || !target) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Particles are drawn to this offscreen buffer first, then the whole buffer
    // is blurred and composited — one blur pass for all particles is fast and
    // makes individual blobs merge into continuous smoky wisps.
    const off = document.createElement("canvas");
    let offCtx = off.getContext("2d")!;

    let particles: Particle[] = [];
    let mouse      = { x: -1000, y: -1000, active: false };
    let prevMouse  = { x: -1000, y: -1000 };
    let rafId: number;

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width  = w;
      canvas.height = h;
      off.width  = w;
      off.height = h;
      // Re-fetch context after resize (width/height reset resets state)
      offCtx = off.getContext("2d")!;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onMouseLeave = () => { mouse.active = false; };

    target.addEventListener("mousemove", onMouseMove);
    target.addEventListener("mouseleave", onMouseLeave);

    function spawn(x: number, y: number) {
      for (let i = 0; i < 3; i++) {
        if (particles.length >= MAX_PARTICLES) break;
        const c = colors[Math.floor(Math.random() * colors.length)];
        particles.push({
          x: x + (Math.random() - 0.5) * 22,
          y: y + (Math.random() - 0.5) * 22,
          vx: (Math.random() - 0.5) * 1.6,
          vy: -(Math.random() * 2.2 + 0.5),
          life:  1,
          decay: 0.005 + Math.random() * 0.004,
          size:  22 + Math.random() * 32,
          h: c.h + (Math.random() - 0.5) * 28,
          s: c.s,
          l: c.l,
          offset: Math.random() * 100,
        });
      }
    }

    function animate(ts: number) {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const t = ts * 0.001;

      // ── Spawn ────────────────────────────────────────────────────────────
      const moved = Math.hypot(mouse.x - prevMouse.x, mouse.y - prevMouse.y) > 2;
      if (mouse.active && moved) {
        spawn(mouse.x, mouse.y);
        prevMouse = { ...mouse };
      }

      // ── Draw particles to offscreen buffer ───────────────────────────────
      offCtx.clearRect(0, 0, w, h);
      // "screen" blending so overlapping wisps brighten each other (glow effect)
      offCtx.globalCompositeOperation = "screen";

      particles = particles.filter(p => {
        p.life -= p.decay;
        if (p.life <= 0) return false;

        // Turbulence: sine/cosine field gives organic curling motion
        p.vx += Math.sin(p.y * 0.007 + t * 0.9 + p.offset) * 0.30;
        p.vy += Math.cos(p.x * 0.007 + t * 0.7 + p.offset) * 0.18 - 0.12;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x  += p.vx;
        p.y  += p.vy;
        p.size = Math.min(p.size * 1.013, p.size * 5);

        // ── Trail blobs ────────────────────────────────────────────────────
        // Draw TRAIL_STEPS overlapping soft circles stepping back along the
        // velocity vector.  The overlap creates an elongated wisp shape —
        // the key visual difference from a single circle.
        for (let j = 0; j < TRAIL_STEPS; j++) {
          const frac  = j / TRAIL_STEPS;         // 0 = head, 1 = tail
          const bx    = p.x - p.vx * j * 2.8;
          const by    = p.y - p.vy * j * 2.8;
          const r     = p.size * (1 - frac * 0.45);
          const alpha = (1 - frac) * p.life * p.life * 0.55;

          const g = offCtx.createRadialGradient(bx, by, 0, bx, by, r);
          g.addColorStop(0,    `hsla(${p.h},${p.s}%,${p.l}%,${alpha})`);
          g.addColorStop(0.45, `hsla(${p.h},${p.s}%,${p.l}%,${alpha * 0.3})`);
          g.addColorStop(1,    `hsla(${p.h},${p.s}%,${p.l}%,0)`);

          offCtx.beginPath();
          offCtx.arc(bx, by, r, 0, Math.PI * 2);
          offCtx.fillStyle = g;
          offCtx.fill();
        }

        return true;
      });

      // ── Composite offscreen → main canvas with a single blur pass ────────
      // One blur per frame (not per particle) keeps performance solid and
      // merges all blobs into continuous, cloudy smoke.
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.filter = `blur(${BLUR_PX}px)`;
      ctx.drawImage(off, 0, 0);
      ctx.restore();

      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      target.removeEventListener("mousemove", onMouseMove);
      target.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [colors, targetRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
}
