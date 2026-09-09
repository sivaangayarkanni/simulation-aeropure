import { useEffect, useRef, useState } from 'react';
import type { ControlsState, SystemMetrics } from '../lib/types';
import { PHASES, PORTS } from '../lib/stages';
import { ParticleCanvas } from './ParticleCanvas';
import { CutawayViz } from './CutawayViz';

interface Props {
  metrics: SystemMetrics;
  controls: ControlsState;
  selectedStageId: string | null;
  onSelectStage: (id: string) => void;
  fanAngle: number;
  oilFlowPhase: number;
  heatShimmerPhase: number;
  flowChevronPhase: number;
  oilCoolantTempC: number;
}

export function Pipeline({
  metrics,
  controls,
  selectedStageId,
  onSelectStage,
  fanAngle,
  oilFlowPhase,
  heatShimmerPhase,
  flowChevronPhase,
  oilCoolantTempC,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1100, h: 320 });
  const running = controls.status === 'running';

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      setSize({ w: Math.max(700, Math.floor(width)), h: Math.round(Math.max(280, width * 0.29)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section className={`pipeline-panel ${controls.serviceMode ? 'service-mode' : ''} ${running ? 'is-running' : ''}`}>
      <div className="pipeline-labels-top">
        <span className="flow-tag hot">{PORTS.inlet}</span>
        <span className="phase-tag">{PHASES[0].name}</span>
        <span className="phase-tag">{PHASES[1].name}</span>
        <span className="flow-tag cold">{PORTS.outlet}</span>
      </div>

      <div className="pipeline-chassis" ref={wrapRef}>
        <ParticleCanvas
          metrics={metrics}
          running={running}
          width={size.w}
          height={size.h}
          flowChevronPhase={flowChevronPhase}
          heatShimmerPhase={heatShimmerPhase}
        />
        <div className="cutaway-layer" style={{ width: size.w, height: size.h }}>
          <CutawayViz
            metrics={metrics}
            controls={controls}
            selectedStageId={selectedStageId}
            onSelectStage={onSelectStage}
            fanAngle={fanAngle}
            oilFlowPhase={oilFlowPhase}
            heatShimmerPhase={heatShimmerPhase}
            oilCoolantTempC={oilCoolantTempC}
          />
        </div>
      </div>

      <div className="temp-legend">
        <span>Thermal gradient (Heat Sink 1 oil → Heat Sink 2 fan)</span>
        <div className="temp-bar" />
        <span>Hot / particulate</span>
        <span>Cleaned, Cooled</span>
      </div>

      <p className="click-hint">
        Simulation auto-runs on load. Click any stage for verbatim layer names, capture rates (Large dust /
        PM10 / PM2.5 / Fine / VOC-odor), pore class, and service life %. Keyboard: Space = Start/Pause.
      </p>
    </section>
  );
}
