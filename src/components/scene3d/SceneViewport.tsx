import { Canvas } from '@react-three/fiber';
import { ContactShadows, Html, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AeroPureModule, type ShellMode, type StageFocusId } from './AeroPureModule';
import { Pipeline } from '../Pipeline';
import type { ControlsState, SystemMetrics } from '../../lib/types';

interface Props {
  metrics: SystemMetrics;
  controls: ControlsState;
  selectedStageId: string | null;
  onSelectStage: (id: string | null) => void;
  fanAngle: number;
  oilFlowPhase: number;
  heatShimmerPhase: number;
  flowChevronPhase: number;
  oilCoolantTempC: number;
  exploded: boolean;
  shellMode: ShellMode;
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

class WebGLErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function StageLabels({ selected }: { selected: string | null }) {
  const labels = [
    { id: 'stage1', pos: [-2.2, 1.15, 0] as const, text: 'S1 Oil Heat Sink' },
    { id: 'stage2', pos: [-0.55, 1.15, 0] as const, text: 'S2 Charcoal ×3' },
    { id: 'stage3', pos: [1.35, 1.15, 0] as const, text: 'S3 Alloy Fan' },
    { id: 'stage4', pos: [3.05, 1.15, 0] as const, text: 'S4 Synthetic ×6' },
  ];
  return (
    <>
      {labels.map((l) => (
        <Html key={l.id} position={l.pos} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              whiteSpace: 'nowrap',
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 6,
              background: selected === l.id ? 'rgba(45,212,191,0.4)' : 'rgba(10,24,40,0.7)',
              border: '1px solid rgba(45,212,191,0.4)',
              color: '#e2f0f7',
              backdropFilter: 'blur(6px)',
            }}
          >
            {l.text}
          </div>
        </Html>
      ))}
      <Html position={[-4.5, 1.0, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{ fontSize: 10, color: '#fb923c', whiteSpace: 'nowrap', fontWeight: 600 }}>
          Inlet · Self-Sealing Dock
        </div>
      </Html>
      <Html position={[4.5, 1.0, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{ fontSize: 10, color: '#22d3ee', whiteSpace: 'nowrap', fontWeight: 600 }}>
          Outlet · Quick-Disconnect
        </div>
      </Html>
    </>
  );
}

function SceneInner(props: Props) {
  const focus = (props.selectedStageId as StageFocusId) ?? null;
  const target = useMemo((): [number, number, number] => {
    switch (focus) {
      case 'stage1':
        return [-2.2, 0, 0];
      case 'stage2':
        return [-0.55, 0, 0];
      case 'stage3':
        return [1.35, 0, 0];
      case 'stage4':
        return [3.05, 0, 0];
      default:
        return [0, 0, 0];
    }
  }, [focus]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0.4, 2.8, 7.2]} fov={42} />
      <color attach="background" args={['#0a1628']} />
      <fog attach="fog" args={['#0a1628', 11, 24]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 5]} intensity={1.4} />
      <directionalLight position={[-5, 3, -3]} intensity={0.45} color="#67e8f9" />
      <hemisphereLight args={['#a5f3fc', '#1a2838', 0.4]} />
      <AeroPureModule
        running={props.controls.status === 'running'}
        fanRpm={props.metrics.fanRpm}
        oilFlowPhase={props.oilFlowPhase}
        serviceMode={props.controls.serviceMode}
        exploded={props.exploded}
        shellMode={props.shellMode}
        selectedStageId={focus}
        onSelectStage={(id) => props.onSelectStage(id)}
        contamination={props.controls.contaminationLoad}
        efficiencyPct={props.metrics.filtrationEfficiencyPct}
        inletTempC={props.controls.inletTempC}
      />
      <StageLabels selected={props.selectedStageId} />
      <ContactShadows position={[0, -1.35, 0]} opacity={0.45} scale={14} blur={2.5} far={4} />
      <OrbitControls
        makeDefault
        target={target}
        enablePan
        minDistance={3}
        maxDistance={14}
        maxPolarAngle={Math.PI * 0.49}
      />
    </>
  );
}

function Fallback2D(props: Props) {
  return (
    <div className="scene-viewport fallback">
      <div className="fallback-banner">
        WebGL unavailable — showing 2D engineering cutaway (graceful fallback)
      </div>
      <Pipeline
        metrics={props.metrics}
        controls={props.controls}
        selectedStageId={props.selectedStageId}
        onSelectStage={(id) => props.onSelectStage(id)}
        fanAngle={props.fanAngle}
        oilFlowPhase={props.oilFlowPhase}
        heatShimmerPhase={props.heatShimmerPhase}
        flowChevronPhase={props.flowChevronPhase}
        oilCoolantTempC={props.oilCoolantTempC}
      />
    </div>
  );
}

export function SceneViewport(props: Props) {
  const [webgl, setWebgl] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setWebgl(detectWebGL());
  }, []);

  if (!webgl || failed) {
    return <Fallback2D {...props} />;
  }

  const modeLabel =
    props.shellMode === 'cutaway'
      ? 'Cutaway'
      : props.shellMode === 'xray'
        ? 'X-ray'
        : 'Solid';

  return (
    <div className="scene-viewport">
      <WebGLErrorBoundary onError={() => setFailed(true)}>
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor('#0a1628');
          }}
        >
          <Suspense fallback={null}>
            <SceneInner {...props} />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
      <div className="scene-hud">
        <span>
          Orbit · Scroll zoom · Click stage · Keys 1–4 · Space pause · Shell: {modeLabel}
        </span>
        <span className="hud-eff">
          Eff {props.metrics.filtrationEfficiencyPct.toFixed(0)}% · ΔT{' '}
          {props.metrics.deltaT.toFixed(0)}°C · {props.metrics.fanRpm.toLocaleString()} RPM
        </span>
      </div>
    </div>
  );
}
