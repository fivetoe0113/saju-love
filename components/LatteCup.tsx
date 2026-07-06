"use client";

import { useEffect, useRef } from "react";

/** 히어로에 쓰이는 하트 라떼아트 + 스팀 애니메이션 캔버스 */
export function LatteCup() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    function resize() {
      if (!canvas || !canvas.parentElement) return;
      w = canvas.parentElement.clientWidth;
      h = canvas.parentElement.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const steam = Array.from({ length: 3 }, (_, i) => ({ offset: i * 0.9, seed: Math.random() * 10 }));
    let start: number | null = null;
    let raf = 0;

    function drawCup() {
      const cx = w * 0.5;
      const cupTop = h * 0.42;
      const cupW = w * 0.5;
      const cupBottomW = cupW * 0.8;
      const cupH = h * 0.4;

      ctx!.fillStyle = "#f1d9be";
      ctx!.beginPath();
      ctx!.ellipse(cx, cupTop + cupH + 6, cupW * 0.62, 8, 0, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.fillStyle = "#fffdfb";
      ctx!.strokeStyle = "#d8b9ac";
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(cx - cupW / 2, cupTop);
      ctx!.lineTo(cx + cupW / 2, cupTop);
      ctx!.lineTo(cx + cupBottomW / 2, cupTop + cupH);
      ctx!.lineTo(cx - cupBottomW / 2, cupTop + cupH);
      ctx!.closePath();
      ctx!.fill();
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.ellipse(cx + cupW / 2 + 14, cupTop + cupH * 0.45, 14, 20, 0, -0.6, 2.4);
      ctx!.stroke();

      const surfW = cupW * 0.94;
      ctx!.fillStyle = "#c9975f";
      ctx!.beginPath();
      ctx!.ellipse(cx, cupTop + 4, surfW / 2, 9, 0, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.fillStyle = "#f6e9d8";
      const hy = cupTop + 4;
      ctx!.beginPath();
      ctx!.moveTo(cx, hy + 7);
      ctx!.bezierCurveTo(cx - 16, hy - 6, cx - 7, hy - 14, cx, hy - 4);
      ctx!.bezierCurveTo(cx + 7, hy - 14, cx + 16, hy - 6, cx, hy + 7);
      ctx!.fill();
    }

    function drawSteam(elapsed: number) {
      ctx!.strokeStyle = "rgba(180,150,130,0.35)";
      ctx!.lineWidth = 2.4;
      ctx!.lineCap = "round";
      const cx = w * 0.5;
      const baseY = h * 0.4;
      steam.forEach((s, i) => {
        const t = (elapsed / 2600 + s.offset) % 1;
        const x0 = cx + (i - 1) * 14;
        const alpha = Math.sin(t * Math.PI) * 0.5;
        ctx!.globalAlpha = reduceMotion ? 0.25 : alpha;
        ctx!.beginPath();
        const steps = 20;
        for (let k = 0; k <= steps; k++) {
          const pct = k / steps;
          const y = baseY - pct * 60 * (reduceMotion ? 0.6 : t + 0.4);
          const x = x0 + Math.sin(pct * 6 + s.seed + elapsed * 0.0015) * 6;
          if (k === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.stroke();
      });
      ctx!.globalAlpha = 1;
    }

    function frame(ts: number) {
      if (start === null) start = ts;
      const elapsed = ts - start;
      ctx!.clearRect(0, 0, w, h);
      drawSteam(elapsed);
      drawCup();
      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative mx-auto mb-3 aspect-[1/0.82] w-full max-w-[300px]">
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: "radial-gradient(circle, var(--rose-soft) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <canvas ref={canvasRef} className="relative h-full w-full" aria-hidden="true" />
    </div>
  );
}
