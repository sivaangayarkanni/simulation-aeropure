import { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Pipeline } from './components/Pipeline';
import { Controls } from './components/Controls';
import { MetricsPanel } from './components/MetricsPanel';
import { DetailDrawer } from './components/DetailDrawer';
import { ReferencePanel } from './components/ReferencePanel';
import { LegendPanel } from './components/LegendPanel';
import { useSimEngine } from './hooks/useSimEngine';
import { STAGES, SYSTEM_ADVANTAGES } from './lib/stages';
import type { ControlsState } from './lib/types';
import './App.css';

export default function App() {
  const { snap, setControls, reset, replaceCartridges, validateOnServer } = useSimEngine();
  const { controls, metrics } = snap;
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [diagramOpen, setDiagramOpen] = useState(false);
  const [splitView, setSplitView] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
      e.preventDefault();
      setControls({
        status: controls.status === 'running' ? 'paused' : 'running',
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [controls.status, setControls]);

  const onChange = useCallback(
    (patch: Partial<ControlsState>) => {
      setControls(patch);
      // Opportunistic server validate when sliders settle (fire-and-forget)
      if (
        patch.inletTempC !== undefined ||
        patch.contaminationLoad !== undefined ||
        patch.fanSpeedPct !== undefined
      ) {
        const next = { ...controls, ...patch };
        void validateOnServer({
          inletTempC: next.inletTempC,
          contaminationLoad: next.contaminationLoad,
          fanSpeedPct: next.fanSpeedPct,
        });
      }
    },
    [controls, setControls, validateOnServer],
  );

  const onReset = useCallback(() => {
    reset();
    setSelectedStageId(null);
  }, [reset]);

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
            fanAngle={snap.fanAngleDeg}
            oilFlowPhase={snap.oilFlowPhase}
            heatShimmerPhase={snap.heatShimmerPhase}
            flowChevronPhase={snap.flowChevronPhase}
            oilCoolantTempC={snap.oilCoolantTempC}
          />
          <LegendPanel metrics={metrics} serviceMode={controls.serviceMode} />
        </div>
        <div className="side-panels">
          <Controls
            controls={controls}
            onChange={onChange}
            onReset={onReset}
            onReplaceCartridges={replaceCartridges}
          />
          <MetricsPanel
            metrics={metrics}
            oilCoolantTempC={snap.oilCoolantTempC}
            serverValidated={snap.serverValidated}
          />
        </div>
        {splitView && <ReferencePanel open mode="split" onClose={() => setSplitView(false)} />}
      </main>

      <footer className="ap-footer">
        <div>
          <strong>Legend &amp; Summary — SYSTEM ADVANTAGES:</strong> {SYSTEM_ADVANTAGES}
        </div>
        <div className="footer-meta">
          AeroPure™ Concept Simulation · Client sim engine
          {snap.serverValidated ? ' · API validated' : ' · API optional (client fallback)'}
          {' · '}
          frame {snap.frame}
        </div>
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
