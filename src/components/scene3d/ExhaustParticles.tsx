import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const COUNT = 420;
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
      positions[i * 3] = -4.6 + Math.random() * SPAN;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.55;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.55;
      speeds[i] = 0.8 + Math.random() * 1.6;
      seeds[i] = Math.random();
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.25;
      colors[i * 3 + 2] = 0.05;
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
        arr[i * 3 + 1] = (Math.random() - 0.5) * 0.55;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.55;
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
        arr[i * 3 + 1] = (Math.random() - 0.5) * 0.55;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.55;
        data.seeds[i] = Math.random();
      }
      arr[i * 3] = x;
      const t = Math.min(1, Math.max(0, (x + 4.6) / SPAN));
      // hot red → cool blue
      carr[i * 3] = 1 - t * 0.85;
      carr[i * 3 + 1] = 0.2 + t * 0.45;
      carr[i * 3 + 2] = 0.05 + t * 0.95;
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
        size={0.055}
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

