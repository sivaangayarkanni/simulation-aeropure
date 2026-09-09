import type { ProofFocusId, ProofStepSnapshot } from '../../lib/proofSteps';

interface Props {
  focusId: ProofFocusId;
  snap: ProofStepSnapshot;
  fanRpm: number;
  oilTempC: number;
}

const SEGMENTS: {
  id: ProofFocusId;
  x: number;
  w: number;
  label: string;
  sub?: string;
}[] = [
  { id: 'inlet', x: 20, w: 70, label: 'INLET' },
  { id: 'stage1', x: 100, w: 100, label: 'S1 OIL', sub: 'Heat Sink' },
  { id: 'c1', x: 210, w: 55, label: 'C1', sub: 'Coarse' },
  { id: 'c2', x: 268, w: 55, label: 'C2', sub: 'Zeolite' },
  { id: 'c3', x: 326, w: 55, label: 'C3', sub: 'Nano' },
  { id: 'stage3', x: 395, w: 90, label: 'S3 FAN', sub: 'Alloy' },
  { id: 's1', x: 500, w: 42, label: 'S1', sub: 'Dust' },
  { id: 's2', x: 545, w: 42, label: 'S2', sub: 'PM10' },
  { id: 's3', x: 590, w: 42, label: 'S3', sub: 'PM2.5' },
  { id: 's4', x: 635, w: 42, label: 'S4', sub: 'Fine' },
  { id: 's5', x: 680, w: 42, label: 'S5', sub: 'Odor' },
  { id: 's6', x: 725, w: 42, label: 'S6', sub: 'PTFE' },
  { id: 'outlet', x: 782, w: 78, label: 'OUTLET' },
];

export function ProofSchematic({ focusId, snap, fanRpm, oilTempC }: Props) {
  const active = SEGMENTS.find((s) => s.id === focusId) ?? SEGMENTS[0];

  return (
    <div className="proof-schematic glass">
      <svg viewBox="0 0 880 150" className="proof-schematic-svg" role="img" aria-label="Stage focus schematic">
        <defs>
          <linearGradient id="proofDuct" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(249,115,22,0.45)" />
            <stop offset="40%" stopColor="rgba(251,191,36,0.25)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.45)" />
          </linearGradient>
          <filter id="proofGlow">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Housing */}
        <rect x="12" y="28" width="856" height="94" rx="14" fill="rgba(14,36,54,0.85)" stroke="#2dd4bf" strokeWidth="1.5" />
        <rect x="40" y="58" width="800" height="34" rx="8" fill="url(#proofDuct)" opacity="0.55" />

        {SEGMENTS.map((seg) => {
          const on = seg.id === focusId;
          const isCharcoal = seg.id.startsWith('c');
          const isSynth = seg.id.startsWith('s') && seg.id !== 'stage1' && seg.id !== 'stage3';
          const fill = on
            ? 'rgba(251, 191, 36, 0.35)'
            : isCharcoal
              ? 'rgba(40,40,40,0.85)'
              : isSynth
                ? 'rgba(45, 100, 110, 0.45)'
                : seg.id === 'stage1'
                  ? 'rgba(180, 70, 20, 0.35)'
                  : seg.id === 'stage3'
                    ? 'rgba(34, 211, 238, 0.28)'
                    : 'rgba(20, 40, 55, 0.5)';
          return (
            <g key={seg.id} filter={on ? 'url(#proofGlow)' : undefined}>
              <rect
                x={seg.x}
                y={42}
                width={seg.w}
                height={66}
                rx={8}
                fill={fill}
                stroke={on ? '#fbbf24' : 'rgba(45,212,191,0.35)'}
                strokeWidth={on ? 2.5 : 1}
              />
              <text
                x={seg.x + seg.w / 2}
                y={70}
                textAnchor="middle"
                fill={on ? '#fef3c7' : '#e2f0f7'}
                fontSize={on ? 11 : 9}
                fontWeight={700}
              >
                {seg.label}
              </text>
              {seg.sub && (
                <text
                  x={seg.x + seg.w / 2}
                  y={86}
                  textAnchor="middle"
                  fill={on ? '#fbbf24' : '#7a9bb0'}
                  fontSize={8}
                >
                  {seg.sub}
                </text>
              )}
            </g>
          );
        })}

        {/* Flow arrow under active */}
        <polygon
          points={`${active.x + active.w / 2 - 8},128 ${active.x + active.w / 2 + 8},128 ${active.x + active.w / 2},138`}
          fill="#fbbf24"
        />
      </svg>

      <div className="proof-schematic-stats">
        <span>
          Focus <strong>{snap.step.shortTitle}</strong>
        </span>
        <span>
          T <strong>{snap.tempBeforeC.toFixed(0)} → {snap.tempAfterC.toFixed(0)} °C</strong>
          {snap.deltaT > 0.05 && (
            <>
              {' '}
              <em className="hot-delta">ΔT −{snap.deltaT.toFixed(1)}</em>
            </>
          )}
        </span>
        <span>
          Step η <strong>{(snap.conc.removalFrac.largeDust * 100).toFixed(0)}%</strong> dust ·{' '}
          <strong>{(snap.cumulativeEfficiency * 100).toFixed(1)}%</strong> cumulative
        </span>
        {focusId === 'stage1' && (
          <span>
            Oil <strong>{oilTempC.toFixed(0)} °C</strong>
          </span>
        )}
        {focusId === 'stage3' && (
          <span>
            Fan <strong>{fanRpm} RPM</strong>
          </span>
        )}
      </div>
    </div>
  );
}
