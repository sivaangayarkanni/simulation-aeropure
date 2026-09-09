import { Canvas } from '@react-three/fiber';
import { ContactShadows, Html, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AeroPureModule, type StageFocusId } from './AeroPureModule';
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
              background: selected === l.id ? 'rgba(94,176,255,0.35)' : 'rgba(10,18,32,0.65)',
              border: '1px solid rgba(94,176,255,0.35)',
              color: '#d7e3f4',
              backdropFilter: 'blur(6px)',
            }}
          >
            {l.text}
          </div>
        </Html>
      ))}
      <Html position={[-4.5, 1.0, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{ fontSize: 10, color: '#ff8a4c', whiteSpace: 'nowrap' }}>
          Inlet · Self-Sealing Dock
        </div>
      </Html>
      <Html position={[4.5, 1.0, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{ fontSize: 10, color: '#5eb0ff', whiteSpace: 'nowrap' }}>
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
      <color attach="background" args={['#070d18']} />
      <fog attach="fog" args={['#070d18', 10, 22]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 5]} intensity={1.35} />
      <directionalLight position={[-5, 3, -3]} intensity={0.4} color="#8ec8ff" />
      <hemisphereLight args={['#b8d4ff', '#1a2030', 0.35]} />
      <AeroPureModule
        running={props.controls.status === 'running'}
        fanRpm={props.metrics.fanRpm}
        oilFlowPhase={props.oilFlowPhase}
        serviceMode={props.controls.serviceMode}
        exploded={props.exploded}
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

  return (
    <div className="scene-viewport">
      <WebGLErrorBoundary onError={() => setFailed(true)}>
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor('#070d18');
          }}
        >
          <Suspense fallback={null}>
            <SceneInner {...props} />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
      <div className="scene-hud">
        <span>Orbit · Scroll zoom · Click stage · Keys 1–4 focus · Space pause</span>
        <span className="hud-eff">
          Eff {props.metrics.filtrationEfficiencyPct.toFixed(0)}% · ΔT{' '}
          {props.metrics.deltaT.toFixed(0)}°C · {props.metrics.fanRpm.toLocaleString()} RPM
        </span>
      </div>
    </div>
  );
}
