import { computeMetrics, defaultControls } from './physics';
import type { ControlsState, SystemMetrics } from './types';

const FIXED_DT = 1 / 60;
const MAX_SUBSTEPS = 5;

export interface SimSnapshot {
  controls: ControlsState;
  metrics: SystemMetrics;
  /** Circulating lubricant oil coolant temperature (°C), evolved smoothly */
  oilCoolantTempC: number;
  /** Fan blade angle for SVG rotation */
  fanAngleDeg: number;
  /** 0–1 phase for oil loop / shimmer / chevrons */
  oilFlowPhase: number;
  heatShimmerPhase: number;
  flowChevronPhase: number;
  simTimeSec: number;
  frame: number;
  /** True when last server validate succeeded */
  serverValidated: boolean;
}

export type SimListener = (snap: SimSnapshot) => void;

/**
 * Fixed-timestep simulation backend (client-side engine).
 * Evolves media age, oil coolant temp, fan angle, and emits UI snapshots each frame.
 */
export class SimEngine {
  private controls: ControlsState;
  private elapsedSec = 0;
  private serviceResetAt = 0;
  private oilCoolantTempC = 55;
  private fanAngleDeg = 0;
  private oilFlowPhase = 0;
  private heatShimmerPhase = 0;
  private flowChevronPhase = 0;
  private frame = 0;
  private serverValidated = false;
  private accumulator = 0;
  private lastNow = 0;
  private rafId = 0;
  private running = false;
  private listeners = new Set<SimListener>();

  constructor(initial?: Partial<ControlsState>) {
    this.controls = { ...defaultControls(), ...initial, status: 'running' };
    this.running = this.controls.status === 'running';
  }

  subscribe(fn: SimListener): () => void {
    this.listeners.add(fn);
    fn(this.getSnapshot());
    return () => this.listeners.delete(fn);
  }

  getSnapshot(): SimSnapshot {
    const metrics = this.buildMetrics();
    return {
      controls: { ...this.controls },
      metrics,
      oilCoolantTempC: this.oilCoolantTempC,
      fanAngleDeg: this.fanAngleDeg,
      oilFlowPhase: this.oilFlowPhase,
      heatShimmerPhase: this.heatShimmerPhase,
      flowChevronPhase: this.flowChevronPhase,
      simTimeSec: this.elapsedSec,
      frame: this.frame,
      serverValidated: this.serverValidated,
    };
  }

  getControls(): ControlsState {
    return { ...this.controls };
  }

  setControls(patch: Partial<ControlsState>): void {
    const next = { ...this.controls, ...patch };
    const statusChanged = patch.status !== undefined && patch.status !== this.controls.status;
    this.controls = next;

    if (statusChanged) {
      if (next.status === 'running') this.start();
      else this.pause();
    } else {
      this.emit();
    }
  }

  start(): void {
    this.controls = { ...this.controls, status: 'running' };
    if (this.running) {
      this.emit();
      return;
    }
    this.running = true;
    this.lastNow = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.loop);
    this.emit();
  }

  pause(): void {
    this.controls = {
      ...this.controls,
      status: this.controls.status === 'idle' ? 'idle' : 'paused',
    };
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    this.emit();
  }

  reset(): void {
    this.pause();
    this.controls = defaultControls();
    this.controls = { ...this.controls, status: 'running' };
    this.elapsedSec = 0;
    this.serviceResetAt = 0;
    this.oilCoolantTempC = 55;
    this.fanAngleDeg = 0;
    this.oilFlowPhase = 0;
    this.heatShimmerPhase = 0;
    this.flowChevronPhase = 0;
    this.frame = 0;
    this.accumulator = 0;
    this.serverValidated = false;
    this.start();
  }

  replaceCartridges(): void {
    this.serviceResetAt = this.elapsedSec;
    this.emit();
  }

  markServerValidated(ok: boolean): void {
    this.serverValidated = ok;
    this.emit();
  }

  dispose(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.listeners.clear();
  }

  private buildMetrics(): SystemMetrics {
    const base = computeMetrics(this.controls, this.elapsedSec, this.serviceResetAt);
    return {
      ...base,
      oilCoolantTempC: this.oilCoolantTempC,
    };
  }

  private step(dt: number): void {
    this.elapsedSec += dt;
    this.frame += 1;

    const metrics = computeMetrics(this.controls, this.elapsedSec, this.serviceResetAt);
    const stage1Temp = metrics.stages[0]?.tempC ?? metrics.inletTempC;
    // Oil loop absorbs heat: target rises with inlet heat load, falls with age/fouling
    const heatExtracted = Math.max(0, this.controls.inletTempC - stage1Temp);
    const targetOil =
      38 + heatExtracted * 0.55 + this.controls.contaminationLoad * 8 + metrics.filterLoadingPct * 0.12;
    const tau = 1.8; // seconds
    const alpha = 1 - Math.exp(-dt / tau);
    this.oilCoolantTempC += (targetOil - this.oilCoolantTempC) * alpha;

    const fanFrac = this.controls.fanSpeedPct / 100;
    const rpm = metrics.fanRpm;
    // Visual spin: ~0.4 of real RPS for readability, still clearly spinning
    this.fanAngleDeg = (this.fanAngleDeg + (rpm / 60) * 360 * dt * 0.42) % 360;

    // Circulation / shimmer phases (faster when running hot / high fan)
    const flowBoost = 0.55 + fanFrac * 0.9 + heatExtracted / 400;
    this.oilFlowPhase = (this.oilFlowPhase + dt * flowBoost * 0.85) % 1;
    this.heatShimmerPhase = (this.heatShimmerPhase + dt * (0.7 + heatExtracted / 180)) % 1;
    this.flowChevronPhase = (this.flowChevronPhase + dt * (0.35 + fanFrac * 0.55)) % 1;
  }

  private loop = (now: number): void => {
    if (!this.running) return;
    const frameDt = Math.min(0.08, (now - this.lastNow) / 1000);
    this.lastNow = now;
    this.accumulator += frameDt;

    let steps = 0;
    while (this.accumulator >= FIXED_DT && steps < MAX_SUBSTEPS) {
      this.step(FIXED_DT);
      this.accumulator -= FIXED_DT;
      steps += 1;
    }
    // Avoid spiral of death
    if (this.accumulator >= FIXED_DT) this.accumulator = 0;

    this.emit();
    this.rafId = requestAnimationFrame(this.loop);
  };

  private emit(): void {
    const snap = this.getSnapshot();
    for (const fn of this.listeners) fn(snap);
  }
}

export function createSimEngine(initial?: Partial<ControlsState>): SimEngine {
  return new SimEngine(initial);
}
