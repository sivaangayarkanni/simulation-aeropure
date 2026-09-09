import { useEffect, useMemo, useRef } from 'react';
import type { Concentrations } from '../../lib/types';
import { POLLUTANT_META } from '../../lib/proofSteps';

type Kind = 'largeDust' | 'pm10' | 'pm25' | 'fine';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  kind: Kind;
  a: number;
}

interface Props {
  title: string;
  subtitle?: string;
  conc: Concentrations;
  /** Tint: hot inlet vs cool outlet */
  tone: 'hot' | 'cool' | 'mid';
  running?: boolean;
}

const KIND_STYLE: Record<Kind, { color: string; r: number }> = {
  largeDust: { color: POLLUTANT_META.largeDust.color, r: 4.2 },
  pm10: { color: POLLUTANT_META.pm10.color, r: 2.8 },
  pm25: { color: POLLUTANT_META.pm25.color, r: 1.9 },
  fine: { color: POLLUTANT_META.fine.color, r: 1.2 },
};

function targetCounts(conc: Concentrations): Record<Kind, number> {
  // Educational density scaling — visible but not overwhelming
  const scale = (v: number, maxN: number, ref: number) =>
    Math.max(0, Math.min(maxN, Math.round((v / Math.max(ref, 1)) * maxN)));
  return {
    largeDust: scale(conc.largeDust, 48, 1200),
    pm10: scale(conc.pm10, 56, 850),
    pm25: scale(conc.pm25, 64, 420),
    fine: scale(conc.fine, 72, 280),
  };
}

function spawn(kind: Kind, w: number, h: number): Particle {
  const st = KIND_STYLE[kind];
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: st.r * (0.75 + Math.random() * 0.5),
    kind,
    a: 0.45 + Math.random() * 0.5,
  };
}

export function ParticleMicroscope({
  title,
  subtitle,
  conc,
  tone,
  running = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const concRef = useRef(conc);
  concRef.current = conc;

  const badges = useMemo(() => {
    const c = targetCounts(conc);
    return (Object.keys(c) as Kind[]).map((k) => ({
      kind: k,
      count: c[k],
      label: POLLUTANT_META[k].short,
      color: POLLUTANT_META[k].color,
      value: conc[k],
      unit: POLLUTANT_META[k].unit,
    }));
  }, [conc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(120, Math.floor(parent.clientWidth));
      const h = Math.max(120, Math.floor(parent.clientHeight));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const reconcile = (w: number, h: number) => {
      const targets = targetCounts(concRef.current);
      const byKind: Record<Kind, Particle[]> = {
        largeDust: [],
        pm10: [],
        pm25: [],
        fine: [],
      };
      for (const p of particlesRef.current) byKind[p.kind].push(p);
      const next: Particle[] = [];
      (Object.keys(targets) as Kind[]).forEach((k) => {
        const list = byKind[k];
        const need = targets[k];
        while (list.length > need) list.pop();
        while (list.length < need) list.push(spawn(k, w, h));
        next.push(...list);
      });
      particlesRef.current = next;
    };

    const draw = (now: number) => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : 300;
      const h = parent ? parent.clientHeight : 180;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      reconcile(w, h);

      // Background
      const g = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.7);
      if (tone === 'hot') {
        g.addColorStop(0, 'rgba(153, 27, 27, 0.55)');
        g.addColorStop(1, 'rgba(10, 5, 5, 0.9)');
      } else if (tone === 'cool') {
        g.addColorStop(0, 'rgba(37, 99, 235, 0.45)');
        g.addColorStop(1, 'rgba(5, 5, 8, 0.92)');
      } else {
        g.addColorStop(0, 'rgba(30, 41, 59, 0.45)');
        g.addColorStop(1, 'rgba(8, 8, 14, 0.9)');
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Grid reticle
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 20; x < w; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 20; y < h; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.32, 0, Math.PI * 2);
      ctx.stroke();

      if (running) {
        for (const p of particlesRef.current) {
          p.x += p.vx * (1 + dt * 40);
          p.y += p.vy * (1 + dt * 40);
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
        }
      }

      for (const p of particlesRef.current) {
        const st = KIND_STYLE[p.kind];
        ctx.beginPath();
        ctx.fillStyle = st.color;
        ctx.globalAlpha = p.a;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.kind === 'largeDust') {
          ctx.strokeStyle = 'rgba(255,255,255,0.25)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [tone, running]);

  return (
    <div className={`proof-scope tone-${tone}`}>
      <div className="proof-scope-head">
        <h4>{title}</h4>
        {subtitle && <span className="muted">{subtitle}</span>}
      </div>
      <div className="proof-scope-canvas-wrap">
        <canvas ref={canvasRef} aria-label={title} />
      </div>
      <div className="proof-scope-badges">
        {badges.map((b) => (
          <span key={b.kind} className="proof-badge" style={{ borderColor: b.color }}>
            <i style={{ background: b.color }} />
            <strong>{b.count}</strong>
            <em>{b.label}</em>
            <small>
              {b.value.toFixed(0)} {b.unit}
            </small>
          </span>
        ))}
        <span className="proof-badge odor">
          <i style={{ background: POLLUTANT_META.odorIndex.color }} />
          <strong>{conc.odorIndex.toFixed(0)}</strong>
          <em>Odor</em>
          <small>idx</small>
        </span>
      </div>
    </div>
  );
}
