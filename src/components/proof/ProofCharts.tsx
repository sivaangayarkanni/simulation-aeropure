import type { PollutantKey } from '../../lib/types';
import {
  POLLUTANT_META,
  type LayerContribution,
  type ProofPackData,
} from '../../lib/proofSteps';

const STACK_KEYS: PollutantKey[] = [
  'largeDust',
  'pm10',
  'pm25',
  'fine',
  'odorIndex',
];

interface Props {
  pack: ProofPackData;
  activeStepIndex: number;
}

export function ProofCharts({ pack, activeStepIndex }: Props) {
  return (
    <div className="proof-charts">
      <ContributionBars contributions={pack.contributions} />
      <CumulativeCurve
        curve={pack.cumulativeCurve}
        activeIndex={activeStepIndex}
      />
      <TempProfile profile={pack.tempProfile} />
    </div>
  );
}

function ContributionBars({ contributions }: { contributions: LayerContribution[] }) {
  const W = 640;
  const H = 220;
  const padL = 120;
  const padR = 16;
  const padT = 28;
  const padB = 36;
  const rowH = (H - padT - padB) / Math.max(1, STACK_KEYS.length);

  // Max share across all for scale (0–1)
  let maxShare = 0.15;
  for (const c of contributions) {
    for (const k of STACK_KEYS) {
      maxShare = Math.max(maxShare, c.shareOfInlet[k]);
    }
  }

  const barMaxW = W - padL - padR;

  return (
    <article className="proof-chart-card glass">
      <h3>Capture contribution by layer (% of inlet)</h3>
      <p className="chart-hint">
        Each bar shows how much of the original inlet load that layer removed — educational,
        consistent with physics.ts capture coefficients.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="proof-svg" role="img" aria-label="Layer capture contribution">
        {STACK_KEYS.map((k, ki) => {
          const y = padT + ki * rowH;
          let x = padL;
          return (
            <g key={k}>
              <text x={padL - 8} y={y + rowH * 0.55} textAnchor="end" className="svg-label">
                {POLLUTANT_META[k].short}
              </text>
              {contributions.map((c) => {
                const frac = c.shareOfInlet[k];
                const w = Math.max(0, (frac / maxShare) * barMaxW * 0.92);
                const el = (
                  <rect
                    key={c.id}
                    x={x}
                    y={y + 4}
                    width={Math.max(w, frac > 0.002 ? 2 : 0)}
                    height={rowH - 10}
                    fill={c.color === '#1a1a1a' || c.color === '#1e1e1e' || c.color === '#2a2a2a' || c.color === '#3a3a3a' ? POLLUTANT_META[k].color : c.color}
                    opacity={0.55 + Math.min(0.4, frac * 2)}
                    rx={2}
                  >
                    <title>{`${c.name}: ${(frac * 100).toFixed(1)}% of inlet ${POLLUTANT_META[k].label}`}</title>
                  </rect>
                );
                x += w + (w > 0 ? 1 : 0);
                return el;
              })}
              {/* axis tick */}
              <line
                x1={padL}
                x2={W - padR}
                y1={y + rowH - 2}
                y2={y + rowH - 2}
                stroke="rgba(122,155,176,0.25)"
              />
            </g>
          );
        })}
        <text x={padL} y={H - 10} className="svg-muted">
          ← stacked layer segments (charcoal → synthetic)
        </text>
      </svg>
      <div className="contrib-legend">
        {contributions.map((c) => (
          <span key={c.id} className="contrib-pill">
            <i style={{ background: c.color || '#2dd4bf' }} />
            {c.id.toUpperCase()}
          </span>
        ))}
      </div>
    </article>
  );
}

function CumulativeCurve({
  curve,
  activeIndex,
}: {
  curve: ProofPackData['cumulativeCurve'];
  activeIndex: number;
}) {
  const W = 640;
  const H = 200;
  const pad = { l: 44, r: 16, t: 24, b: 40 };
  const n = curve.length;
  if (n < 2) return null;

  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const xAt = (i: number) => pad.l + (i / (n - 1)) * plotW;
  const yAt = (pct: number) => pad.t + plotH * (1 - pct / 100);

  const line = curve
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(p.efficiencyPct).toFixed(1)}`)
    .join(' ');

  const area =
    line +
    ` L ${xAt(n - 1).toFixed(1)} ${(pad.t + plotH).toFixed(1)} L ${xAt(0).toFixed(1)} ${(pad.t + plotH).toFixed(1)} Z`;

  return (
    <article className="proof-chart-card glass">
      <h3>Cumulative filtration efficiency</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="proof-svg" role="img" aria-label="Cumulative efficiency curve">
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={yAt(t)}
              y2={yAt(t)}
              stroke="rgba(122,155,176,0.2)"
            />
            <text x={pad.l - 6} y={yAt(t) + 3} textAnchor="end" className="svg-muted">
              {t}%
            </text>
          </g>
        ))}
        <path d={area} fill="rgba(45, 212, 191, 0.15)" />
        <path d={line} fill="none" stroke="#2dd4bf" strokeWidth="2.5" />
        {curve.map((p, i) => (
          <g key={p.label}>
            <circle
              cx={xAt(i)}
              cy={yAt(p.efficiencyPct)}
              r={i === activeIndex ? 6 : 3.5}
              fill={i === activeIndex ? '#fbbf24' : '#22d3ee'}
              stroke={i === activeIndex ? '#fff' : 'none'}
              strokeWidth={1.5}
            />
            {(i === 0 || i === n - 1 || i === activeIndex || i % 3 === 0) && (
              <text
                x={xAt(i)}
                y={H - 12}
                textAnchor="middle"
                className={i === activeIndex ? 'svg-label-hot' : 'svg-muted'}
              >
                {p.label}
              </text>
            )}
          </g>
        ))}
        <text x={W - pad.r} y={pad.t - 8} textAnchor="end" className="svg-label">
          {curve[Math.min(activeIndex, n - 1)]?.efficiencyPct.toFixed(1)}% @ step
        </text>
      </svg>
    </article>
  );
}

function TempProfile({ profile }: { profile: ProofPackData['tempProfile'] }) {
  const W = 640;
  const H = 180;
  const pad = { l: 44, r: 16, t: 24, b: 36 };
  const n = profile.length;
  if (n < 2) return null;

  const temps = profile.map((p) => p.tempC);
  const tMin = Math.min(...temps) - 10;
  const tMax = Math.max(...temps) + 10;
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const xAt = (i: number) => pad.l + (i / (n - 1)) * plotW;
  const yAt = (t: number) => pad.t + plotH * (1 - (t - tMin) / (tMax - tMin));

  const line = profile
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(p.tempC).toFixed(1)}`)
    .join(' ');

  return (
    <article className="proof-chart-card glass">
      <h3>Temperature profile across stages</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="proof-svg" role="img" aria-label="Temperature profile">
        <defs>
          <linearGradient id="tempStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        {profile.map((p, i) => (
          <g key={p.label}>
            <line
              x1={xAt(i)}
              x2={xAt(i)}
              y1={pad.t}
              y2={pad.t + plotH}
              stroke="rgba(122,155,176,0.15)"
            />
            <text x={xAt(i)} y={H - 10} textAnchor="middle" className="svg-muted">
              {p.label}
            </text>
            <circle cx={xAt(i)} cy={yAt(p.tempC)} r={5} fill="#fb923c" stroke="#fff" strokeWidth={1} />
            <text x={xAt(i)} y={yAt(p.tempC) - 10} textAnchor="middle" className="svg-label-hot">
              {p.tempC.toFixed(0)}°
            </text>
          </g>
        ))}
        <path d={line} fill="none" stroke="url(#tempStroke)" strokeWidth="3" strokeLinejoin="round" />
        <text x={pad.l - 6} y={yAt(tMax) + 4} textAnchor="end" className="svg-muted">
          °C
        </text>
      </svg>
    </article>
  );
}
