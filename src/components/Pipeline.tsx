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
}

export function Pipeline({ metrics, controls, selectedStageId, onSelectStage }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1100, h: 320 });
  const [fanAngle, setFanAngle] = useState(0);
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

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const rps = metrics.fanRpm / 60;
      // Visual spin scaled down for readability
      setFanAngle((a) => (a + rps * 360 * dt * 0.35) % 360);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, metrics.fanRpm]);

  return (
    <section className={`pipeline-panel ${controls.serviceMode ? 'service-mode' : ''}`}>
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
        />
        <div className="cutaway-layer" style={{ width: size.w, height: size.h }}>
          <CutawayViz
            metrics={metrics}
            controls={controls}
            selectedStageId={selectedStageId}
            onSelectStage={onSelectStage}
            fanAngle={fanAngle}
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
        Click any stage for verbatim layer names, capture rates (Large dust / PM10 / PM2.5 / Fine /
        VOC-odor), pore class, and service life %. Keyboard: Space = Start/Pause.
      </p>
    </section>
  );
}
