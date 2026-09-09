import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ExhaustParticles } from './ExhaustParticles';

export type StageFocusId = 'stage1' | 'stage2' | 'stage3' | 'stage4' | null;
export type ShellMode = 'solid' | 'cutaway' | 'xray';

interface Props {
  running: boolean;
  fanRpm: number;
  oilFlowPhase: number;
  serviceMode: boolean;
  exploded: boolean;
  shellMode: ShellMode;
  selectedStageId: StageFocusId;
  onSelectStage: (id: StageFocusId) => void;
  contamination: number;
  efficiencyPct: number;
  inletTempC: number;
}

const metal = '#7a93a8';
const metalDark = '#2a3d52';
const teal = '#3b82f6';
const cyan = '#60a5fa';
const amber = '#f87171';

function HousingShell({
  serviceMode,
  shellMode,
}: {
  serviceMode: boolean;
  shellMode: ShellMode;
}) {
  const isSolid = shellMode === 'solid';
  const isXray = shellMode === 'xray';
  const isCutaway = shellMode === 'cutaway';

  // Solid: full opaque cylinder. Cutaway: open arc (~1.35π). X-ray: full transparent shell.
  const thetaLength = isSolid || isXray ? Math.PI * 2 : Math.PI * 1.28;
  const opacity = isSolid ? 0.96 : isXray ? 0.14 : 0.55;
  const color = serviceMode ? '#1a1020' : isXray ? '#2a3a58' : metalDark;

  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.15, 1.15, 8.8, 48, 1, true, isCutaway ? 0.35 : 0, thetaLength]} />
        <meshStandardMaterial
          color={color}
          metalness={isXray ? 0.2 : 0.85}
          roughness={isXray ? 0.6 : 0.35}
          side={THREE.DoubleSide}
          transparent
          opacity={opacity}
          depthWrite={!isXray && isSolid}
        />
      </mesh>
      {/* Cutaway rim highlight so the open section reads clearly */}
      {isCutaway && (
        <>
          <mesh position={[0, 0.95, 0.55]} rotation={[0.2, 0, Math.PI / 2]}>
            <boxGeometry args={[8.6, 0.04, 0.06]} />
            <meshStandardMaterial color={teal} emissive={teal} emissiveIntensity={0.35} metalness={0.6} />
          </mesh>
          <mesh position={[0, -0.95, 0.55]} rotation={[-0.2, 0, Math.PI / 2]}>
            <boxGeometry args={[8.6, 0.04, 0.06]} />
            <meshStandardMaterial color={teal} emissive={teal} emissiveIntensity={0.35} metalness={0.6} />
          </mesh>
        </>
      )}
      {/* Spine plate */}
      <mesh position={[0, -1.05, 0]}>
        <boxGeometry args={[8.8, 0.08, 1.6]} />
        <meshStandardMaterial
          color={metal}
          metalness={0.7}
          roughness={0.4}
          transparent={isXray}
          opacity={isXray ? 0.25 : 1}
        />
      </mesh>
      {/* Phase divider ring */}
      <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.05, 0.04, 12, 48]} />
        <meshStandardMaterial color={cyan} emissive="#1e40af" emissiveIntensity={0.55} />
      </mesh>
    </group>
  );
}

function Docking({ selected }: { selected: boolean }) {
  return (
    <group position={[-4.5, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.55, 0.62, 0.35, 24]} />
        <meshStandardMaterial
          color={selected ? '#60a5fa' : '#6a8498'}
          metalness={0.9}
          roughness={0.25}
          emissive={selected ? '#1a5a30' : '#000'}
          emissiveIntensity={selected ? 0.5 : 0}
        />
      </mesh>
      <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.42, 0.5, 16]} />
        <meshStandardMaterial color="#445566" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Inlet glow core — hot exhaust entry */}
      <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.15, 16]} />
        <meshStandardMaterial
          color={amber}
          emissive="#dc2626"
          emissiveIntensity={0.7}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

function OutletCoupling({ selected }: { selected: boolean }) {
  return (
    <group position={[4.5, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.58, 0.32, 24]} />
        <meshStandardMaterial
          color={selected ? cyan : '#7a9aaa'}
          metalness={0.9}
          roughness={0.25}
          emissive={selected ? '#1e40af' : '#000'}
          emissiveIntensity={selected ? 0.45 : 0}
        />
      </mesh>
      <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.12, 16]} />
        <meshStandardMaterial
          color={cyan}
          emissive="#0891b2"
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

function OilHeatSink({
  selected,
  oilPhase,
  glow,
  shellMode,
}: {
  selected: boolean;
  oilPhase: number;
  glow: number;
  shellMode: ShellMode;
}) {
  const coilRef = useRef<THREE.Mesh>(null);
  const tube = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      Array.from({ length: 40 }, (_, i) => {
        const t = i / 39;
        const a = t * Math.PI * 6;
        return new THREE.Vector3(-2.9 + t * 1.5, Math.sin(a) * 0.35, Math.cos(a) * 0.35);
      }),
    );
    return new THREE.TubeGeometry(curve, 80, 0.06, 8, false);
  }, []);

  useFrame(() => {
    if (coilRef.current) {
      const mat = coilRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(oilPhase * Math.PI * 2) * 0.2 + glow * 0.35;
    }
  });

  const enclosureOpacity = shellMode === 'solid' ? 0.22 : shellMode === 'xray' ? 0.08 : 0.18;

  return (
    <group position={[-2.2, 0, 0]}>
      <mesh>
        <boxGeometry args={[1.8, 1.5, 1.5]} />
        <meshStandardMaterial
          color={selected ? '#3a5568' : '#243848'}
          metalness={0.55}
          roughness={0.45}
          transparent
          opacity={enclosureOpacity}
        />
      </mesh>
      {/* Oil canisters — clearly visible */}
      <mesh position={[0.25, 0.15, 0.25]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.9, 16]} />
        <meshStandardMaterial color="#ef4444" metalness={0.45} roughness={0.35} emissive="#991b1b" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0.25, -0.2, -0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.9, 16]} />
        <meshStandardMaterial color="#dc2626" metalness={0.45} roughness={0.35} emissive="#7f1d1d" emissiveIntensity={0.2} />
      </mesh>
      <mesh ref={coilRef} geometry={tube}>
        <meshStandardMaterial
          color="#ef4444"
          emissive="#dc2626"
          emissiveIntensity={0.4}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
      {selected && (
        <mesh>
          <boxGeometry args={[1.85, 1.55, 1.55]} />
          <meshBasicMaterial color={amber} wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}

function CharcoalStack({
  selected,
  serviceMode,
}: {
  selected: boolean;
  serviceMode: boolean;
}) {
  const layers = [
    { y: 0.38, color: '#4a4a4a', name: 'Layer 1: Coarse Carbon' },
    { y: 0, color: '#2e2e2e', name: 'Layer 2: Carbon+Zeolite' },
    { y: -0.38, color: '#1a1a1a', name: 'Layer 3: Nano Membrane' },
  ];
  const gap = serviceMode || selected ? 0.14 : 0.04;
  return (
    <group position={[-0.55, 0, 0]}>
      {layers.map((l, i) => (
        <mesh key={l.name} position={[0, l.y + (1 - i) * gap, 0]}>
          <boxGeometry args={[1.1, 0.3, 1.1]} />
          <meshStandardMaterial
            color={l.color}
            roughness={0.9}
            metalness={0.05}
            emissive={selected ? '#333' : '#111'}
            emissiveIntensity={selected ? 0.35 : 0.08}
          />
        </mesh>
      ))}
      {/* Edge highlight so dark strata read against cutaway */}
      {layers.map((l, i) => (
        <mesh key={`edge-${l.name}`} position={[0, l.y + (1 - i) * gap, 0.56]}>
          <boxGeometry args={[1.12, 0.02, 0.02]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      ))}
      {selected && (
        <mesh>
          <boxGeometry args={[1.2, 1.4, 1.2]} />
          <meshBasicMaterial color={teal} wireframe transparent opacity={0.45} />
        </mesh>
      )}
    </group>
  );
}

function AlloyFan({
  rpm,
  running,
  selected,
}: {
  rpm: number;
  running: boolean;
  selected: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current || !running) return;
    const rps = (rpm / 60) * (Math.PI * 2) * 0.15;
    ref.current.rotation.x += rps * dt;
  });
  return (
    <group position={[1.35, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.7, 0.7, 0.25, 24]} />
        <meshStandardMaterial
          color="#4a6070"
          metalness={0.85}
          roughness={0.3}
          transparent
          opacity={0.2}
        />
      </mesh>
      <group ref={ref} rotation={[0, 0, Math.PI / 2]}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} rotation={[0, (i / 7) * Math.PI * 2, 0]} position={[0.28, 0, 0]}>
            <boxGeometry args={[0.42, 0.06, 0.18]} />
            <meshStandardMaterial
              color={selected ? '#bfdbfe' : '#dbeafe'}
              metalness={0.95}
              roughness={0.18}
              emissive={selected ? cyan : '#000'}
              emissiveIntensity={selected ? 0.25 : 0}
            />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      {selected && (
        <mesh>
          <sphereGeometry args={[0.85, 16, 16]} />
          <meshBasicMaterial color={cyan} wireframe transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

const SYN_COLORS = ['#8a8a7a', '#a67c52', '#e8e0d0', '#d4c4a8', '#1e1e1e', '#c8d8e8'];
const SYN_NAMES = [
  'Layer 1: Coarse Synthetic Mesh',
  'Layer 2: Mid-Size Microfiber Filter',
  'Layer 3: Electrostatic Filter',
  'Layer 4: Nanofiber Barrier Structure',
  'Layer 5: Activated Carbon + Zeolite Composite',
  'Layer 6: PTFE Protective Membrane',
];

function SyntheticArray({
  selected,
  exploded,
  shellMode,
}: {
  selected: boolean;
  exploded: boolean;
  shellMode: ShellMode;
}) {
  // In cutaway/xray, slightly separate layers so they read inside the barrel
  const baseSpread = exploded || selected ? 0.22 : shellMode === 'solid' ? 0.09 : 0.13;
  return (
    <group position={[3.05, 0, 0]}>
      {SYN_COLORS.map((color, i) => {
        const y = (2.5 - i) * baseSpread;
        return (
          <mesh key={SYN_NAMES[i]} position={[0, y, 0]}>
            <boxGeometry args={[1.05, 0.07, 1.05]} />
            <meshStandardMaterial
              color={color}
              roughness={i === 5 ? 0.25 : 0.7}
              metalness={i === 5 ? 0.3 : 0.05}
              transparent={i === 5 || shellMode === 'xray'}
              opacity={i === 5 ? 0.85 : shellMode === 'xray' ? 0.9 : 1}
            />
          </mesh>
        );
      })}
      {selected && (
        <mesh>
          <boxGeometry args={[1.15, 1.7, 1.15]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}

function StageHitBox({
  position,
  size,
  id,
  onSelect,
}: {
  position: [number, number, number];
  size: [number, number, number];
  id: StageFocusId;
  onSelect: (id: StageFocusId) => void;
}) {
  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      visible={false}
    >
      <boxGeometry args={size} />
      <meshBasicMaterial />
    </mesh>
  );
}

export function AeroPureModule({
  running,
  fanRpm,
  oilFlowPhase,
  serviceMode,
  exploded,
  shellMode,
  selectedStageId,
  onSelectStage,
  contamination,
  efficiencyPct,
  inletTempC,
}: Props) {
  const glow = Math.min(1, Math.max(0, (inletTempC - 80) / 270));

  return (
    <group>
      <HousingShell serviceMode={serviceMode} shellMode={shellMode} />
      <Docking selected={serviceMode} />
      <OutletCoupling selected={serviceMode} />

      <OilHeatSink
        selected={selectedStageId === 'stage1'}
        oilPhase={oilFlowPhase}
        glow={glow}
        shellMode={shellMode}
      />
      <CharcoalStack
        selected={selectedStageId === 'stage2'}
        serviceMode={serviceMode}
      />
      <AlloyFan
        rpm={fanRpm}
        running={running}
        selected={selectedStageId === 'stage3'}
      />
      <SyntheticArray
        selected={selectedStageId === 'stage4'}
        exploded={exploded || serviceMode}
        shellMode={shellMode}
      />

      <ExhaustParticles
        running={running}
        contamination={contamination}
        efficiency01={efficiencyPct / 100}
      />

      <pointLight
        position={[-4.2, 0.2, 0.5]}
        intensity={1.4 + glow * 2}
        color="#ef4444"
        distance={4}
      />
      <pointLight position={[4.2, 0.2, 0.5]} intensity={1.25} color="#60a5fa" distance={4} />
      {/* Interior fill light so cutaway internals stay readable */}
      <pointLight position={[0, 0.6, 1.2]} intensity={0.55} color="#93c5fd" distance={8} />

      <StageHitBox position={[-2.2, 0, 0]} size={[2, 1.8, 1.8]} id="stage1" onSelect={onSelectStage} />
      <StageHitBox position={[-0.55, 0, 0]} size={[1.4, 1.6, 1.4]} id="stage2" onSelect={onSelectStage} />
      <StageHitBox position={[1.35, 0, 0]} size={[1.4, 1.6, 1.4]} id="stage3" onSelect={onSelectStage} />
      <StageHitBox position={[3.05, 0, 0]} size={[1.4, 1.8, 1.4]} id="stage4" onSelect={onSelectStage} />
    </group>
  );
}
