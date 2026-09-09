import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ExhaustParticles } from './ExhaustParticles';

export type StageFocusId = 'stage1' | 'stage2' | 'stage3' | 'stage4' | null;

interface Props {
  running: boolean;
  fanRpm: number;
  oilFlowPhase: number;
  serviceMode: boolean;
  exploded: boolean;
  selectedStageId: StageFocusId;
  onSelectStage: (id: StageFocusId) => void;
  contamination: number;
  efficiencyPct: number;
  inletTempC: number;
}

const metal = '#8a9bb0';
const metalDark = '#3a4555';

function HousingShell({ serviceMode }: { serviceMode: boolean }) {
  return (
    <group>
      {/* Outer cutaway cylinder (half-open via clipped look using open tube + plates) */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.15, 1.15, 8.8, 48, 1, true, 0, Math.PI * 1.35]} />
        <meshStandardMaterial
          color={serviceMode ? '#2a4a3a' : metalDark}
          metalness={0.85}
          roughness={0.35}
          side={THREE.DoubleSide}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* Spine plate */}
      <mesh position={[0, -1.05, 0]}>
        <boxGeometry args={[8.8, 0.08, 1.6]} />
        <meshStandardMaterial color={metal} metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Phase divider ring */}
      <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.05, 0.04, 12, 48]} />
        <meshStandardMaterial color="#5eb0ff" emissive="#1a4a7a" emissiveIntensity={0.4} />
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
          color={selected ? '#4ade80' : '#6a7a8a'}
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
    </group>
  );
}

function OutletCoupling({ selected }: { selected: boolean }) {
  return (
    <group position={[4.5, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.58, 0.32, 24]} />
        <meshStandardMaterial
          color={selected ? '#5eb0ff' : '#7a8a9a'}
          metalness={0.9}
          roughness={0.25}
          emissive={selected ? '#1a4060' : '#000'}
          emissiveIntensity={selected ? 0.45 : 0}
        />
      </mesh>
    </group>
  );
}

function OilHeatSink({
  selected,
  oilPhase,
  glow,
}: {
  selected: boolean;
  oilPhase: number;
  glow: number;
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
      mat.emissiveIntensity = 0.25 + Math.sin(oilPhase * Math.PI * 2) * 0.15 + glow * 0.3;
    }
  });

  return (
    <group position={[-2.2, 0, 0]}>
      <mesh>
        <boxGeometry args={[1.8, 1.5, 1.5]} />
        <meshStandardMaterial
          color={selected ? '#3a5568' : '#2a3540'}
          metalness={0.6}
          roughness={0.45}
          transparent
          opacity={0.35}
          wireframe={false}
        />
      </mesh>
      {/* Canisters */}
      <mesh position={[0.25, 0.15, 0.25]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.9, 16]} />
        <meshStandardMaterial color="#c4a035" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.25, -0.2, -0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.9, 16]} />
        <meshStandardMaterial color="#b89030" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh ref={coilRef} geometry={tube}>
        <meshStandardMaterial
          color="#e8a040"
          emissive="#ff6020"
          emissiveIntensity={0.35}
          metalness={0.4}
          roughness={0.35}
        />
      </mesh>
      {selected && (
        <mesh>
          <boxGeometry args={[1.85, 1.55, 1.55]} />
          <meshBasicMaterial color="#ff8a4c" wireframe transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
}

function CharcoalStack({ selected, serviceMode }: { selected: boolean; serviceMode: boolean }) {
  const layers = [
    { y: 0.38, color: '#4a4a4a', name: 'Coarse Carbon' },
    { y: 0, color: '#2e2e2e', name: 'Carbon+Zeolite' },
    { y: -0.38, color: '#1a1a1a', name: 'Nano Membrane' },
  ];
  const gap = serviceMode || selected ? 0.12 : 0;
  return (
    <group position={[-0.55, 0, 0]}>
      {layers.map((l, i) => (
        <mesh key={l.name} position={[0, l.y + (1 - i) * gap, 0]}>
          <boxGeometry args={[1.1, 0.32, 1.1]} />
          <meshStandardMaterial
            color={l.color}
            roughness={0.9}
            metalness={0.05}
            emissive={selected ? '#222' : '#000'}
            emissiveIntensity={selected ? 0.3 : 0}
          />
        </mesh>
      ))}
      {selected && (
        <mesh>
          <boxGeometry args={[1.2, 1.35, 1.2]} />
          <meshBasicMaterial color="#5eb0ff" wireframe transparent opacity={0.4} />
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
    const rps = (rpm / 60) * (Math.PI * 2) * 0.15; // visual scale
    ref.current.rotation.x += rps * dt;
  });
  return (
    <group position={[1.35, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.7, 0.7, 0.25, 24]} />
        <meshStandardMaterial
          color="#5a6a7a"
          metalness={0.85}
          roughness={0.3}
          transparent
          opacity={0.25}
        />
      </mesh>
      <group ref={ref} rotation={[0, 0, Math.PI / 2]}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} rotation={[0, (i / 7) * Math.PI * 2, 0]} position={[0.28, 0, 0]}>
            <boxGeometry args={[0.42, 0.06, 0.18]} />
            <meshStandardMaterial
              color={selected ? '#9ecfff' : '#c0d0e0'}
              metalness={0.95}
              roughness={0.2}
            />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#d0d8e0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      {selected && (
        <mesh>
          <sphereGeometry args={[0.85, 16, 16]} />
          <meshBasicMaterial color="#5eb0ff" wireframe transparent opacity={0.25} />
        </mesh>
      )}
    </group>
  );
}

const SYN_COLORS = ['#8a8a7a', '#a67c52', '#e8e0d0', '#d4c4a8', '#1e1e1e', '#c8d8e8'];
const SYN_NAMES = [
  'Coarse Synthetic Mesh',
  'Mid Microfiber',
  'Electrostatic',
  'Nanofiber Barrier',
  'Carbon+Zeolite Composite',
  'PTFE Protective Membrane',
];

function SyntheticArray({
  selected,
  exploded,
}: {
  selected: boolean;
  exploded: boolean;
}) {
  return (
    <group position={[3.05, 0, 0]}>
      {SYN_COLORS.map((color, i) => {
        const spread = exploded || selected ? 0.22 : 0.09;
        const y = (2.5 - i) * spread;
        return (
          <mesh key={SYN_NAMES[i]} position={[0, y, 0]}>
            <boxGeometry args={[1.05, 0.07, 1.05]} />
            <meshStandardMaterial
              color={color}
              roughness={i === 5 ? 0.25 : 0.7}
              metalness={i === 5 ? 0.3 : 0.05}
              transparent={i === 5}
              opacity={i === 5 ? 0.85 : 1}
            />
          </mesh>
        );
      })}
      {selected && (
        <mesh>
          <boxGeometry args={[1.15, 1.6, 1.15]} />
          <meshBasicMaterial color="#c084fc" wireframe transparent opacity={0.35} />
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
  selectedStageId,
  onSelectStage,
  contamination,
  efficiencyPct,
  inletTempC,
}: Props) {
  const glow = Math.min(1, Math.max(0, (inletTempC - 80) / 270));

  return (
    <group>
      <HousingShell serviceMode={serviceMode} />
      <Docking selected={serviceMode} />
      <OutletCoupling selected={serviceMode} />

      <OilHeatSink
        selected={selectedStageId === 'stage1'}
        oilPhase={oilFlowPhase}
        glow={glow}
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
      />

      <ExhaustParticles
        running={running}
        contamination={contamination}
        efficiency01={efficiencyPct / 100}
      />

      {/* Thermal glow at inlet */}
      <pointLight
        position={[-4.2, 0.2, 0.5]}
        intensity={1.2 + glow * 2}
        color="#ff6020"
        distance={4}
      />
      <pointLight position={[4.2, 0.2, 0.5]} intensity={1.1} color="#4a9fff" distance={4} />

      <StageHitBox position={[-2.2, 0, 0]} size={[2, 1.8, 1.8]} id="stage1" onSelect={onSelectStage} />
      <StageHitBox position={[-0.55, 0, 0]} size={[1.4, 1.6, 1.4]} id="stage2" onSelect={onSelectStage} />
      <StageHitBox position={[1.35, 0, 0]} size={[1.4, 1.6, 1.4]} id="stage3" onSelect={onSelectStage} />
      <StageHitBox position={[3.05, 0, 0]} size={[1.4, 1.8, 1.4]} id="stage4" onSelect={onSelectStage} />
    </group>
  );
}
