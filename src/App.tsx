import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { Pipeline } from './components/Pipeline';
import { Controls } from './components/Controls';
import { MetricsPanel } from './components/MetricsPanel';
import { DetailDrawer } from './components/DetailDrawer';
import { ReferencePanel } from './components/ReferencePanel';
import { LegendPanel } from './components/LegendPanel';
import { computeMetrics, defaultControls } from './lib/physics';
import { STAGES, SYSTEM_ADVANTAGES } from './lib/stages';
import type { ControlsState } from './lib/types';
import './App.css';

export default function App() {
  const [controls, setControls] = useState<ControlsState>(defaultControls);
  const [elapsed, setElapsed] = useState(0);
  const [serviceResetAt, setServiceResetAt] = useState(0);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [diagramOpen, setDiagramOpen] = useState(false);
  const [splitView, setSplitView] = useState(false);

  const metrics = useMemo(
    () => computeMetrics(controls, elapsed, serviceResetAt),
    [controls, elapsed, serviceResetAt],
  );

  useEffect(() => {
    if (controls.status !== 'running') return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setElapsed((e) => e + dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [controls.status]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
      e.preventDefault();
      setControls((c) => ({
        ...c,
        status: c.status === 'running' ? 'paused' : 'running',
      }));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onChange = useCallback((patch: Partial<ControlsState>) => {
    setControls((c) => ({ ...c, ...patch }));
  }, []);

  const onReset = useCallback(() => {
    setControls(defaultControls());
    setElapsed(0);
    setServiceResetAt(0);
    setSelectedStageId(null);
  }, []);

  const onReplaceCartridges = useCallback(() => {
    setServiceResetAt(elapsed);
  }, [elapsed]);

  const selectedStage = STAGES.find((s) => s.id === selectedStageId) ?? null;
  const selectedMetrics =
    metrics.stages.find((s) => s.id === selectedStageId) ?? null;

  return (
    <div className={`app-shell ${splitView ? 'split-on' : ''}`}>
      <Header
        onOpenDiagram={() => setDiagramOpen(true)}
        splitView={splitView}
        onToggleSplit={() => setSplitView((v) => !v)}
      />
      <main className="app-main">
        <div className="sim-column">
          <Pipeline
            metrics={metrics}
            controls={controls}
            selectedStageId={selectedStageId}
            onSelectStage={(id) =>
              setSelectedStageId((cur) => (cur === id ? null : id))
            }
          />
          <LegendPanel metrics={metrics} serviceMode={controls.serviceMode} />
        </div>
        <div className="side-panels">
          <Controls
            controls={controls}
            onChange={onChange}
            onReset={onReset}
            onReplaceCartridges={onReplaceCartridges}
          />
          <MetricsPanel metrics={metrics} />
        </div>
        {splitView && <ReferencePanel open mode="split" onClose={() => setSplitView(false)} />}
      </main>

      <footer className="ap-footer">
        <div>
          <strong>Legend &amp; Summary — SYSTEM ADVANTAGES:</strong> {SYSTEM_ADVANTAGES}
        </div>
        <div className="footer-meta">AeroPure™ Concept Simulation · Pure frontend · No backend</div>
      </footer>

      <DetailDrawer
        stage={selectedStage}
        metrics={selectedMetrics}
        onClose={() => setSelectedStageId(null)}
      />
      <ReferencePanel open={diagramOpen} onClose={() => setDiagramOpen(false)} mode="lightbox" />
    </div>
  );
}
