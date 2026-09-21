'use client';

import { useEffect, useRef } from 'react';

type StreamLine = {
  points: Array<{ x: number; y: number }>;
  speed: number;
  offset: number;
  color: string;
  width: number;
  side: 'left' | 'right';
};

// Single-hue, low alpha: the background is subordinate to the content.
const COLORS = [
  'rgba(82, 234, 253, 0.10)',
  'rgba(82, 234, 253, 0.07)',
  'rgba(34, 211, 238, 0.08)',
  'rgba(255, 255, 255, 0.05)'
];

function createStreamLines(width: number, height: number): StreamLine[] {
  const lines: StreamLine[] = [];
  const lineCount = 14;
  const centerX = width / 2;
  const centerY = height / 2;

  for (let i = 0; i < lineCount; i++) {
    const side: 'left' | 'right' = i < lineCount / 2 ? 'left' : 'right';
    const edgeX = side === 'left' ? -20 : width + 20;
    const edgeY = centerY + (Math.random() - 0.5) * height * 0.9;

    const convergeY = centerY + (Math.random() - 0.5) * height * 0.15;
    const convergeX = centerX + (Math.random() - 0.5) * width * 0.08;

    const controlOffset = (Math.random() - 0.5) * height * 0.3;
    const midX = (edgeX + convergeX) / 2;

    const points = [
      { x: edgeX, y: edgeY },
      { x: midX, y: edgeY + controlOffset },
      { x: convergeX, y: convergeY },
    ];

    lines.push({
      points,
      speed: 0.3 + Math.random() * 0.7,
      offset: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      width: 0.4 + Math.random() * 0.7,
      side,
    });
  }

  return lines;
}

function drawCurve(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  color: string,
  lineWidth: number,
  pulseProgress: number
) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  // Draw a glowing pulse traveling along the curve
  const t = pulseProgress;
  const invT = 1 - t;
  const px = invT * invT * points[0].x + 2 * invT * t * points[1].x + t * t * points[2].x;
  const py = invT * invT * points[0].y + 2 * invT * t * points[1].y + t * t * points[2].y;

  const gradient = ctx.createRadialGradient(px, py, 0, px, py, 4);
  gradient.addColorStop(0, color.replace(/[\d.]+\)$/, '0.28)'));
  gradient.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

export function StreamBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<StreamLine[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas || !ctx) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      linesRef.current = createStreamLines(w, h);
    }

    resize();
    window.addEventListener('resize', resize);

    let startTime = performance.now();

    function animate(now: number) {
      if (!canvas || !ctx) return;
      const elapsed = (now - startTime) / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const line of linesRef.current) {
        const pulseProgress = ((elapsed * line.speed * 0.15 + line.offset) % 1);
        drawCurve(ctx, line.points, line.color, line.width, pulseProgress);
      }

      animRef.current = requestAnimationFrame(animate);
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      // Paint one static frame instead of animating.
      for (const line of linesRef.current) {
        drawCurve(ctx, line.points, line.color, line.width, 0);
      }
    } else {
      animRef.current = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
