import { useEffect, useRef } from 'react';
import type { SystemMetrics } from '../lib/types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  size: number;
  kind: 'coarse' | 'pm10' | 'pm25' | 'fine';
  alpha: number;
  heat: number; // 1 hot → 0 cool
}

interface Props {
  metrics: SystemMetrics;
  running: boolean;
  width: number;
  height: number;
}

const STAGE_BOUNDS = [
  { x0: 0.1, x1: 0.28 },
  { x0: 0.28, x1: 0.46 },
  { x0: 0.46, x1: 0.64 },
  { x0: 0.64, x1: 0.86 },
];

function spawnRate(metrics: SystemMetrics): number {
  const load =
    metrics.inletConc.largeDust +
    metrics.inletConc.pm10 +
    metrics.inletConc.pm25 +
    metrics.inletConc.fine;
  return Math.min(10, 1.2 + load / 180);
}

function survivalAt(
  xNorm: number,
  metrics: SystemMetrics,
  kind: Particle['kind'],
): number {
  const inlet = metrics.inletConc;
  const s2 = metrics.stages[1]?.conc;
  const s4 = metrics.stages[3]?.conc;
  if (!s2 || !s4) return 1;

  const key =
    kind === 'coarse' ? 'largeDust' : kind === 'pm10' ? 'pm10' : kind === 'pm25' ? 'pm25' : 'fine';
  const afterCharcoal = s2[key] / Math.max(1, inlet[key]);
  const afterSynth = s4[key] / Math.max(1, inlet[key]);

  if (xNorm < 0.28) return 1;
  if (xNorm < 0.46) {
    const t = (xNorm - 0.28) / 0.18;
    return 1 - t * (1 - afterCharcoal);
  }
  if (xNorm < 0.64) return afterCharcoal;
  const t = Math.min(1, (xNorm - 0.64) / 0.22);
  return afterCharcoal - t * (afterCharcoal - afterSynth);
}

function heatAt(xNorm: number, metrics: SystemMetrics): number {
  const temps = [
    metrics.inletTempC,
    metrics.stages[0]?.tempC ?? metrics.inletTempC,
    metrics.stages[1]?.tempC ?? metrics.inletTempC,
    metrics.stages[2]?.tempC ?? metrics.outletTempC,
    metrics.outletTempC,
  ];
  const stops = [0.05, 0.22, 0.4, 0.58, 0.9];
  let t0 = temps[0];
  let t1 = temps[temps.length - 1];
  let u = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    if (xNorm <= stops[i + 1]) {
      u = (xNorm - stops[i]) / (stops[i + 1] - stops[i]);
      t0 = temps[i];
      t1 = temps[i + 1];
      break;
    }
  }
  const temp = t0 + (t1 - t0) * u;
  return Math.min(1, Math.max(0, (temp - 25) / 275));
}

export function ParticleCanvas({ metrics, running, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const metricsRef = useRef(metrics);
  const runningRef = useRef(running);
  const arrowPhaseRef = useRef(0);

  metricsRef.current = metrics;
  runningRef.current = running;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let last = performance.now();
    let acc = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const m = metricsRef.current;
      const isRun = runningRef.current;
      if (isRun) arrowPhaseRef.current += dt;

      ctx.clearRect(0, 0, width, height);

      // Thermal duct wash
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      const temps = [
        m.inletTempC,
        m.stages[0]?.tempC ?? m.inletTempC,
        m.stages[1]?.tempC ?? m.inletTempC,
        m.stages[2]?.tempC ?? m.outletTempC,
        m.outletTempC,
      ];
      const stops = [0, 0.22, 0.42, 0.62, 0.9];
      temps.forEach((tc, i) => {
        const t = Math.min(1, Math.max(0, (tc - 25) / 275));
        const r = Math.round(60 + t * 195);
        const g = Math.round(140 - t * 100);
        const b = Math.round(220 - t * 190);
        grad.addColorStop(stops[i], `rgba(${r},${g},${b},0.16)`);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, height * 0.18, width, height * 0.64);

      // Pressure / flow chevrons
      if (isRun) {
        const phase = arrowPhaseRef.current;
        ctx.save();
        for (let i = 0; i < 12; i++) {
          const x = ((i / 12 + phase * 0.15) % 1) * width * 0.9 + width * 0.05;
          const heat = heatAt(x / width, m);
          ctx.strokeStyle = `rgba(${Math.round(220 * heat + 50 * (1 - heat))},${Math.round(80 + 80 * (1 - heat))},${Math.round(40 + 200 * (1 - heat))},0.28)`;
          ctx.lineWidth = 1.5;
          const y = height * 0.5;
          ctx.beginPath();
          ctx.moveTo(x - 6, y - 10);
          ctx.lineTo(x + 4, y);
          ctx.lineTo(x - 6, y + 10);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (isRun) {
        acc += spawnRate(m) * dt * 60;
        while (acc >= 1) {
          acc -= 1;
          const roll = Math.random();
          const kind: Particle['kind'] =
            roll < 0.3 ? 'coarse' : roll < 0.55 ? 'pm10' : roll < 0.8 ? 'pm25' : 'fine';
          const size =
            kind === 'coarse'
              ? 4.5 + Math.random() * 3.5
              : kind === 'pm10'
                ? 2.8 + Math.random() * 2
                : kind === 'pm25'
                  ? 1.8 + Math.random() * 1.2
                  : 1 + Math.random();
          particlesRef.current.push({
            x: width * 0.05,
            y: height * (0.28 + Math.random() * 0.44),
            vx: (130 + Math.random() * 90) * (0.55 + m.airflowM3h / 1100),
            size,
            kind,
            alpha: 0.9,
            heat: 1,
          });
        }
      }

      const next: Particle[] = [];
      for (const p of particlesRef.current) {
        if (isRun) {
          p.x += p.vx * dt;
          p.y += Math.sin(p.x * 0.018 + p.y * 0.04) * 10 * dt;
        }
        const xNorm = p.x / width;
        const surv = survivalAt(xNorm, m, p.kind);
        p.heat = heatAt(xNorm, m);

        if (isRun && Math.random() > Math.pow(surv, dt * 2.8) && xNorm > 0.28) {
          // Shrink-out flash
          if (p.size > 1.2) {
            p.size *= 0.55;
            p.alpha *= 0.5;
            next.push(p);
          }
          continue;
        }
        p.alpha = 0.2 + 0.7 * surv;
        p.size = Math.max(0.6, p.size * (0.998));

        if (p.x > width * 0.95) continue;

        const heat = p.heat;
        const colors: Record<Particle['kind'], string> = {
          coarse: `rgba(${Math.round(200 + 40 * heat)},${Math.round(40 + 40 * (1 - heat))},${Math.round(30 + 80 * (1 - heat))},${p.alpha})`,
          pm10: `rgba(${Math.round(210 + 30 * heat)},${Math.round(100 + 40 * (1 - heat))},${Math.round(40 + 100 * (1 - heat))},${p.alpha})`,
          pm25: `rgba(${Math.round(220 + 20 * heat)},${Math.round(160 + 20 * (1 - heat))},${Math.round(60 + 120 * (1 - heat))},${p.alpha * 0.9})`,
          fine: `rgba(${Math.round(160 + 40 * (1 - heat))},${Math.round(190 + 20 * (1 - heat))},${Math.round(200 + 40 * (1 - heat))},${p.alpha * 0.75})`,
        };
        ctx.beginPath();
        ctx.fillStyle = colors[p.kind];
        ctx.arc(p.x, p.y, p.size * (0.55 + 0.45 * surv), 0, Math.PI * 2);
        ctx.fill();

        // Cool blue trail near outlet for survivors
        if (xNorm > 0.75 && surv > 0.05) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(100,180,255,${0.15 * surv})`;
          ctx.arc(p.x - 4, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        next.push(p);
      }
      particlesRef.current = next.slice(-450);

      ctx.strokeStyle = 'rgba(100, 160, 220, 0.12)';
      ctx.lineWidth = 1;
      for (const b of STAGE_BOUNDS) {
        ctx.beginPath();
        ctx.moveTo(b.x0 * width, height * 0.2);
        ctx.lineTo(b.x0 * width, height * 0.8);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="particle-canvas"
      aria-hidden
    />
  );
}
