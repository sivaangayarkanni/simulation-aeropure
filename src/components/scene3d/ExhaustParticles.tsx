import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const COUNT = 520;
const SPAN = 9.2; // x from -4.6 to +4.6

interface Props {
  running: boolean;
  contamination: number;
  efficiency01: number;
}

export function ExhaustParticles({ running, contamination, efficiency01 }: Props) {
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      // Stream travels THROUGH the barrel core (tight y/z so it crosses each stage)
      positions[i * 3] = -4.6 + Math.random() * SPAN;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.42;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.42;
      speeds[i] = 0.85 + Math.random() * 1.55;
      seeds[i] = Math.random();
      // Hot amber start
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.45;
      colors[i * 3 + 2] = 0.08;
    }
    return { positions, colors, speeds, seeds };
  }, []);

  useFrame((_, dt) => {
    if (!ref.current || !running) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const col = ref.current.geometry.attributes.color as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const carr = col.array as Float32Array;
    const loadBoost = 0.7 + contamination * 0.8;
    const aliveChance = 1 - efficiency01 * 0.92;

    for (let i = 0; i < COUNT; i++) {
      let x = arr[i * 3];
      x += data.speeds[i] * loadBoost * dt * 1.35;
      if (x > 4.6) {
        x = -4.6;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 0.42;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.42;
        data.seeds[i] = Math.random();
      }
      // Progressive capture after charcoal (~x=-0.5) and synthetic (~x=2)
      const progress = (x + 4.6) / SPAN;
      const survival =
        progress < 0.35
          ? 1
          : progress < 0.55
            ? 0.55 + aliveChance * 0.35
            : progress < 0.75
              ? 0.25 + aliveChance * 0.35
              : aliveChance * 0.5;
      if (data.seeds[i] > survival && x > -1.2) {
        x = -4.6;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 0.42;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.42;
        data.seeds[i] = Math.random();
      }
      arr[i * 3] = x;
      const t = Math.min(1, Math.max(0, (x + 4.6) / SPAN));
      // Hot orange/amber → cool cyan/teal
      carr[i * 3] = 1 - t * 0.88; // R drops
      carr[i * 3 + 1] = 0.4 + t * 0.45; // G rises toward teal
      carr[i * 3 + 2] = 0.05 + t * 0.9; // B rises to cyan
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        vertexColors
        transparent
        opacity={0.92}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
