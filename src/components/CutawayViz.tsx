import type { ControlsState, SystemMetrics } from '../lib/types';
import { PORTS, STAGES } from '../lib/stages';

interface Props {
  metrics: SystemMetrics;
  controls: ControlsState;
  selectedStageId: string | null;
  onSelectStage: (id: string) => void;
  fanAngle: number;
  oilFlowPhase?: number;
  heatShimmerPhase?: number;
  oilCoolantTempC?: number;
}

export function CutawayViz({
  metrics,
  controls,
  selectedStageId,
  onSelectStage,
  fanAngle,
  oilFlowPhase = 0,
  heatShimmerPhase = 0,
  oilCoolantTempC,
}: Props) {
  const running = controls.status === 'running';
  const service = controls.serviceMode;
  const undock = service ? 14 : 0;
  const oilTemp = oilCoolantTempC ?? metrics.oilCoolantTempC;
  const temps = [
    metrics.inletTempC,
    metrics.stages[0]?.tempC ?? metrics.inletTempC,
    metrics.stages[1]?.tempC ?? metrics.inletTempC,
    metrics.stages[2]?.tempC ?? metrics.outletTempC,
    metrics.outletTempC,
  ];

  const stageSelected = (id: string) => selectedStageId === id;

  return (
    <svg
      className="cutaway-svg"
      viewBox="0 0 1100 320"
      role="img"
      aria-label="AeroPure modular multi-stage exhaust filtration cutaway"
    >
      <defs>
        <linearGradient id="housingMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a5a70" />
          <stop offset="35%" stopColor="#2a3548" />
          <stop offset="70%" stopColor="#1a2434" />
          <stop offset="100%" stopColor="#0e1520" />
        </linearGradient>
        <linearGradient id="ductHotCold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={`rgba(220,60,30,0.35)`} />
          <stop offset="35%" stopColor={`rgba(200,100,40,0.22)`} />
          <stop offset="65%" stopColor={`rgba(80,140,220,0.2)`} />
          <stop offset="100%" stopColor={`rgba(50,140,255,0.35)`} />
        </linearGradient>
        <linearGradient id="oilGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff8a30" />
          <stop offset="100%" stopColor="#c44010" />
        </linearGradient>
        <linearGradient id="fanMetal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d0dde8" />
          <stop offset="50%" stopColor="#8aa0b4" />
          <stop offset="100%" stopColor="#5a7088" />
        </linearGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="meshPat" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3 H6 M3 0 V6" stroke="#6a6a5a" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Outer housing */}
      <rect
        x="70"
        y="48"
        width="960"
        height="224"
        rx="18"
        fill="url(#housingMetal)"
        stroke="#7a90a8"
        strokeWidth="2.5"
      />
      <rect
        x="82"
        y="60"
        width="936"
        height="200"
        rx="12"
        fill="url(#ductHotCold)"
        stroke="rgba(140,170,200,0.25)"
        strokeWidth="1"
      />

      {/* Phase banners */}
      <g className="phase-banners">
        <rect x="100" y="28" width="430" height="18" rx="4" fill="rgba(240,160,40,0.15)" stroke="rgba(240,180,60,0.35)" />
        <text x="315" y="41" textAnchor="middle" className="svg-label phase">
          Phase 1: Thermal &amp; Nanofiltration Module (Inlet side)
        </text>
        <rect x="560" y="28" width="450" height="18" rx="4" fill="rgba(60,140,220,0.15)" stroke="rgba(80,160,255,0.35)" />
        <text x="785" y="41" textAnchor="middle" className="svg-label phase">
          Phase 2: Post-Treatment &amp; Synthetic Array (Outlet side)
        </text>
      </g>

      {/* ——— Inlet + Self-Sealing Docking ——— */}
      <g
        className={`port-group inlet ${service ? 'service-mod' : ''}`}
        transform={`translate(${-undock},0)`}
      >
        {/* Flow arrows */}
        <g filter="url(#softGlow)">
          {[0, 1, 2].map((i) => (
            <polygon
              key={i}
              points="8,110 28,120 8,130"
              fill="#e84a2f"
              opacity={running ? 0.55 + (i % 2) * 0.25 : 0.4}
              transform={`translate(0,${i * 28})`}
              className={running ? 'flow-arrow-hot' : undefined}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </g>
        <text x="18" y="95" className="svg-label hot-sm" transform="rotate(-90 18 160)">
          Exhaust Inlet
        </text>
        {/* Docking ring */}
        <g transform="translate(42,100)">
          <ellipse cx="28" cy="60" rx="22" ry="58" fill="#2a3548" stroke="#9ab0c4" strokeWidth="3" />
          <ellipse cx="28" cy="60" rx="14" ry="42" fill="#0c1420" stroke="#6a8098" strokeWidth="2" />
          <ellipse cx="28" cy="60" rx="8" ry="28" fill="rgba(220,60,30,0.45)" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx="28" cy={18 + i * 28} r="3" fill="#c0d0e0" />
          ))}
        </g>
        <text x="55" y="278" textAnchor="middle" className="svg-label dock">
          Self-Sealing Docking Mechanism
        </text>
      </g>

      {/* ——— Stage 1: Oil Heat Sink ——— */}
      <g
        className={`stage-mod s1 ${stageSelected('stage1') ? 'sel' : ''} ${service ? 'service-mod' : ''}`}
        transform={`translate(0,${service ? -6 : 0})`}
        onClick={() => onSelectStage('stage1')}
        style={{ cursor: 'pointer' }}
      >
        <title>{STAGES[0].diagramLabel}</title>
        <rect
          x="105"
          y="70"
          width="200"
          height="180"
          rx="10"
          fill={stageSelected('stage1') ? 'rgba(94,176,255,0.12)' : 'rgba(0,0,0,0.28)'}
          stroke={stageSelected('stage1') ? '#5eb0ff' : 'rgba(120,160,210,0.4)'}
          strokeWidth={stageSelected('stage1') ? 2.5 : 1.5}
        />
        <text x="205" y="88" textAnchor="middle" className="svg-label stage-title">
          Stage 1: Heat Sink 1 (Lubricant Oil Cooling)
        </text>
        {/* Top canisters */}
        {[0, 1].map((i) => (
          <g key={`ct${i}`}>
            <rect
              x={125 + i * 85}
              y="98"
              width="70"
              height="22"
              rx="6"
              fill="url(#oilGlow)"
              stroke="#ffb060"
              strokeWidth="1"
              className={running ? 'oil-shimmer' : undefined}
            />
            <rect x={132 + i * 85} y="102" width="12" height="14" rx="2" fill="#8a4010" opacity="0.5" />
          </g>
        ))}
        {/* Coil heat exchanger */}
        <path
          d="M145 150 C160 120, 180 120, 195 150 S230 180, 245 150 S280 120, 295 150"
          fill="none"
          stroke="#9ab0c4"
          strokeWidth="5"
          strokeLinecap="round"
          filter="url(#softGlow)"
        />
        <path
          d="M145 165 C160 140, 180 140, 195 165 S230 190, 245 165 S280 140, 295 165"
          fill="none"
          stroke="#6a8098"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="205" cy="158" r="18" fill="rgba(255,120,40,0.25)" className={running ? 'oil-pulse' : undefined} />
        {/* Circulating oil droplets along coil path */}
        {running &&
          [0, 1, 2, 3, 4, 5].map((i) => {
            const t = (oilFlowPhase + i / 6) % 1;
            const x = 145 + t * 150;
            const y = 150 + Math.sin(t * Math.PI * 2) * 18;
            return (
              <circle
                key={`oil-drop-${i}`}
                cx={x}
                cy={y}
                r={3.5 + (i % 2)}
                fill="#ffb060"
                opacity={0.55 + 0.35 * Math.sin(t * Math.PI)}
                filter="url(#softGlow)"
              />
            );
          })}
        {/* Heat shimmer waves at oil sink */}
        {running &&
          [0, 1, 2].map((i) => {
            const o = 0.15 + ((heatShimmerPhase + i * 0.25) % 1) * 0.25;
            return (
              <ellipse
                key={`shimmer-${i}`}
                cx={170 + i * 28}
                cy={140}
                rx={10 + i * 2}
                ry={28}
                fill="none"
                stroke={`rgba(255,140,40,${o})`}
                strokeWidth="1.5"
                className="heat-shimmer-ellipse"
                style={{ animationDelay: `${i * 0.35}s` }}
              />
            );
          })}
        {/* Bottom canisters */}
        {[0, 1].map((i) => (
          <rect
            key={`cb${i}`}
            x={125 + i * 85}
            y="210"
            width="70"
            height="22"
            rx="6"
            fill="url(#oilGlow)"
            stroke="#ffb060"
            strokeWidth="1"
            className={running ? 'oil-shimmer' : undefined}
            style={{ animationDelay: '0.4s' }}
          />
        ))}
        <text x="205" y="248" textAnchor="middle" className="svg-label callout-oil">
          CIRCULATING, REPLACEABLE LUBRICANT OIL
        </text>
        <text x="205" y="238" textAnchor="middle" className="svg-label temp">
          Gas {temps[1].toFixed(0)}°C · Oil {oilTemp.toFixed(0)}°C
        </text>
      </g>

      {/* ——— Stage 2: Charcoal ——— */}
      <g
        className={`stage-mod s2 ${stageSelected('stage2') ? 'sel' : ''} ${service ? 'service-mod' : ''}`}
        transform={`translate(0,${service ? 5 : 0})`}
        onClick={() => onSelectStage('stage2')}
        style={{ cursor: 'pointer' }}
      >
        <title>{STAGES[1].diagramLabel}</title>
        <rect
          x="320"
          y="70"
          width="200"
          height="180"
          rx="10"
          fill={stageSelected('stage2') ? 'rgba(94,176,255,0.12)' : 'rgba(0,0,0,0.28)'}
          stroke={stageSelected('stage2') ? '#5eb0ff' : 'rgba(120,160,210,0.4)'}
          strokeWidth={stageSelected('stage2') ? 2.5 : 1.5}
        />
        <text x="420" y="88" textAnchor="middle" className="svg-label stage-title">
          Stage 2: 3-Layer Charcoal Nano-Material Filter
        </text>
        <text x="420" y="102" textAnchor="middle" className="svg-label nano">
          Nano-engineered Carbon matrix
        </text>
        {/* 3 vertical strata */}
        {[
          { x: 340, label: 'L1 Coarse Carbon', pore: 'Large Pore', fill: '#3a3a3a' },
          { x: 395, label: 'L2 Carbon+Zeolite', pore: 'Medium Pore', fill: '#262626' },
          { x: 450, label: 'L3 Nano Membrane', pore: 'Small Pore', fill: '#141414' },
        ].map((layer, i) => (
          <g key={layer.label}>
            <rect
              x={layer.x}
              y="112"
              width="48"
              height="110"
              rx="4"
              fill={layer.fill}
              stroke="rgba(255,255,255,0.15)"
            />
            {/* pore texture dots */}
            {Array.from({ length: 12 - i * 3 }).map((_, j) => (
              <circle
                key={j}
                cx={layer.x + 8 + (j % 3) * 14}
                cy={122 + Math.floor(j / 3) * 22}
                r={4 - i}
                fill={`rgba(90,90,90,${0.5 - i * 0.1})`}
              />
            ))}
            <text
              x={layer.x + 24}
              y="236"
              textAnchor="middle"
              className="svg-label layer-mini"
            >
              {layer.pore}
            </text>
          </g>
        ))}
      </g>

      {/* ——— Stage 3: Alloy Fan ——— */}
      <g
        className={`stage-mod s3 ${stageSelected('stage3') ? 'sel' : ''} ${service ? 'service-mod' : ''}`}
        onClick={() => onSelectStage('stage3')}
        style={{ cursor: 'pointer' }}
      >
        <title>{STAGES[2].diagramLabel}</title>
        <rect
          x="535"
          y="70"
          width="200"
          height="180"
          rx="10"
          fill={stageSelected('stage3') ? 'rgba(94,176,255,0.12)' : 'rgba(0,0,0,0.28)'}
          stroke={stageSelected('stage3') ? '#5eb0ff' : 'rgba(120,160,210,0.4)'}
          strokeWidth={stageSelected('stage3') ? 2.5 : 1.5}
        />
        <text x="635" y="88" textAnchor="middle" className="svg-label stage-title">
          Stage 3: Heat Sink 2 (Alloy Fan Cooling)
        </text>
        {/* Fan */}
        <g transform={`translate(635,165)`}>
          <circle r="58" fill="#1a2434" stroke="#8aa0b4" strokeWidth="3" />
          <circle r="52" fill="rgba(40,80,140,0.2)" stroke="#5a7088" strokeWidth="1" />
          <g transform={`rotate(${fanAngle})`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <path
                key={i}
                d="M0,-8 Q18,-28 8,-48 Q0,-52 -8,-48 Q-4,-28 0,-8"
                fill="url(#fanMetal)"
                stroke="#c0d0e0"
                strokeWidth="0.8"
                transform={`rotate(${i * 45})`}
              />
            ))}
          </g>
          <circle r="12" fill="#e0e8f0" stroke="#607080" strokeWidth="2" />
          <circle r="4" fill="#405060" />
          {running && (
            <circle
              r="56"
              fill="none"
              stroke="rgba(126,200,255,0.25)"
              strokeWidth="2"
              strokeDasharray="6 10"
              className="fan-spin-ring"
              transform={`rotate(${-fanAngle * 0.5})`}
            />
          )}
        </g>
        <text x="635" y="240" textAnchor="middle" className="svg-label callout-fan">
          ALLOY FAN COOLING
        </text>
        <text x="635" y="252" textAnchor="middle" className="svg-label temp">
          {metrics.fanRpm.toLocaleString()} rpm · {temps[3].toFixed(0)}°C
        </text>
      </g>

      {/* ——— Stage 4: 6-Layer Synthetic Array (exploded) ——— */}
      <g
        className={`stage-mod s4 ${stageSelected('stage4') ? 'sel' : ''} ${service ? 'service-mod' : ''}`}
        transform={`translate(0,${service ? 4 : 0})`}
        onClick={() => onSelectStage('stage4')}
        style={{ cursor: 'pointer' }}
      >
        <title>{STAGES[3].diagramLabel}</title>
        <rect
          x="750"
          y="70"
          width="200"
          height="180"
          rx="10"
          fill={stageSelected('stage4') ? 'rgba(94,176,255,0.12)' : 'rgba(0,0,0,0.28)'}
          stroke={stageSelected('stage4') ? '#5eb0ff' : 'rgba(120,160,210,0.4)'}
          strokeWidth={stageSelected('stage4') ? 2.5 : 1.5}
        />
        <text x="850" y="88" textAnchor="middle" className="svg-label stage-title">
          Stage 4: 6-Layer Synthetic Array
        </text>
        <text x="850" y="102" textAnchor="middle" className="svg-label nano">
          PRECISION GRADED PORE STRUCTURE
        </text>
        {(STAGES[3].layers ?? []).map((layer, i) => (
          <g key={layer.id} transform={`translate(${768 + i * 3},${112 + i * 18})`}>
            <rect
              width={160 - i * 4}
              height="14"
              rx="2"
              fill={layer.color}
              stroke="rgba(255,255,255,0.2)"
              opacity={0.95}
            />
            <text x="4" y="10" className="svg-label layer-tiny">
              {i + 1}. {layer.name.replace(/^Layer \d+: /, '')}
            </text>
          </g>
        ))}
      </g>

      {/* ——— Outlet Quick-Disconnect ——— */}
      <g
        className={`port-group outlet ${service ? 'service-mod' : ''}`}
        transform={`translate(${undock},0)`}
      >
        <g transform="translate(960,100)">
          <ellipse cx="28" cy="60" rx="22" ry="58" fill="#2a3548" stroke="#7ec8ff" strokeWidth="3" />
          <ellipse cx="28" cy="60" rx="14" ry="42" fill="#0c1420" stroke="#4a90c0" strokeWidth="2" />
          <ellipse cx="28" cy="60" rx="8" ry="28" fill="rgba(74,168,255,0.45)" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx="28" cy={18 + i * 28} r="3" fill="#a0d0ff" />
          ))}
        </g>
        <g filter="url(#softGlow)">
          {[0, 1, 2].map((i) => (
            <polygon
              key={i}
              points="1035,110 1055,120 1035,130"
              fill="#4aa8ff"
              opacity={running ? 0.55 + (i % 2) * 0.25 : 0.4}
              transform={`translate(0,${i * 28})`}
              className={running ? 'flow-arrow-cold' : undefined}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </g>
        <text x="990" y="278" textAnchor="middle" className="svg-label dock">
          Quick-Disconnect Coupling
        </text>
      </g>

      {/* Flow labels under chassis */}
      <text x="55" y="310" textAnchor="middle" className="svg-label hot">
        {PORTS.inlet}
      </text>
      <text x="1045" y="310" textAnchor="middle" className="svg-label cold">
        {PORTS.outlet}
      </text>

      {service && (
        <text x="550" y="18" textAnchor="middle" className="svg-label service-banner">
          ENGINEERED FOR MODULAR SERVICE — modules undocked for cartridge replacement
        </text>
      )}
    </svg>
  );
}
