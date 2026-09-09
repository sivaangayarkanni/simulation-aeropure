import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { MetricsPanel } from './components/MetricsPanel';
import { DetailDrawer } from './components/DetailDrawer';
import { ReferencePanel } from './components/ReferencePanel';
import { LegendPanel } from './components/LegendPanel';
import { AgentsPanel } from './components/AgentsPanel';
import { ProductIntelligence } from './components/ProductIntelligence';
import { ServiceModeView } from './components/ServiceModeView';
import { useSimEngine } from './hooks/useSimEngine';
import { STAGES, SYSTEM_ADVANTAGES } from './lib/stages';
import { PRODUCT_META } from './lib/knowledgeBase';
import type { ControlsState } from './lib/types';
import './App.css';

const SceneViewport = lazy(async () => {
  const m = await import('./components/scene3d/SceneViewport');
  return { default: m.SceneViewport };
});

type TabId = 'simulation' | 'intelligence' | 'service';
type ShellMode = 'solid' | 'cutaway' | 'xray';

export default function App() {
  const { snap, setControls, reset, replaceCartridges, validateOnServer } = useSimEngine();
  const { controls, metrics } = snap;
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [diagramOpen, setDiagramOpen] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(true);
  const [tab, setTab] = useState<TabId>('simulation');
  const [exploded, setExploded] = useState(false);
  const [shellMode, setShellMode] = useState<ShellMode>('cutaway');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setControls({
          status: controls.status === 'running' ? 'paused' : 'running',
        });
        return;
      }

      const stageMap: Record<string, string> = {
        Digit1: 'stage1',
        Digit2: 'stage2',
        Digit3: 'stage3',
        Digit4: 'stage4',
        Numpad1: 'stage1',
        Numpad2: 'stage2',
        Numpad3: 'stage3',
        Numpad4: 'stage4',
      };
      const stageId = stageMap[e.code];
      if (stageId) {
        e.preventDefault();
        setTab('simulation');
        setSelectedStageId((cur) => (cur === stageId ? null : stageId));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [controls.status, setControls]);

  const onChange = useCallback(
    (patch: Partial<ControlsState>) => {
      setControls(patch);
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
  const selectedMetrics = metrics.stages.find((s) => s.id === selectedStageId) ?? null;

  return (
    <div className={`app-shell ${agentsOpen ? 'agents-open' : ''}`}>
      <Header
        onOpenDiagram={() => setDiagramOpen(true)}
        onToggleAgents={() => setAgentsOpen((v) => !v)}
        agentsOpen={agentsOpen}
        tab={tab}
        onTab={setTab}
      />

      <main className="app-main">
        {tab === 'simulation' && (
          <>
            <div className="sim-column">
              <div className="viewport-toolbar glass">
                <span className="micro">
                  {PRODUCT_META.tagline}
                </span>
                <div className="toolbar-actions">
                  <div className="shell-mode-group" role="group" aria-label="Housing view">
                    {([
                      ['cutaway', 'Cutaway'],
                      ['xray', 'X-ray'],
                      ['solid', 'Solid'],
                    ] as const).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        className={`btn shell-mode ${shellMode === id ? 'active' : ''}`}
                        onClick={() => setShellMode(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={`btn ${exploded ? 'primary' : ''}`}
                    onClick={() => setExploded((v) => !v)}
                  >
                    {exploded ? 'Collapse Array' : 'Explode Synthetic ×6'}
                  </button>
                  <button type="button" className="btn" onClick={() => setDiagramOpen(true)}>
                    Concept Diagram
                  </button>
                </div>
              </div>
              <Suspense
                fallback={
                  <div className="scene-viewport scene-loading">
                    <div className="fallback-banner">Loading AeroPure 3D module…</div>
                  </div>
                }
              >
                <SceneViewport
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
                  exploded={exploded}
                  shellMode={shellMode}
                />
              </Suspense>
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
          </>
        )}

        {tab === 'intelligence' && (
          <div className="tab-pane">
            <ProductIntelligence />
          </div>
        )}

        {tab === 'service' && (
          <div className="tab-pane">
            <ServiceModeView
              controls={controls}
              metrics={metrics}
              onChange={onChange}
              onReplaceCartridges={replaceCartridges}
            />
          </div>
        )}
      </main>

      <AgentsPanel
        metrics={metrics}
        open={agentsOpen}
        onClose={() => setAgentsOpen(false)}
      />

      <footer className="ap-footer">
        <div>
          <strong>SYSTEM ADVANTAGES:</strong> {SYSTEM_ADVANTAGES}
        </div>
        <div className="footer-meta">
          AeroPure™ · {PRODUCT_META.author.name} · {PRODUCT_META.event} ·{' '}
          {snap.serverValidated ? 'API validated' : 'Client engine'} · frame {snap.frame}
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
