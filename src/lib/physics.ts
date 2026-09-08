import type {
  Concentrations,
  ControlsState,
  LayerCaptureRates,
  LayerMetrics,
  PollutantKey,
  StageLayer,
  StageMetrics,
  SystemMetrics,
} from './types';
import { STAGES } from './stages';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const POLLUTANTS: PollutantKey[] = [
  'largeDust',
  'pm10',
  'pm25',
  'fine',
  'odorIndex',
];

/** Baseline dirty-air concentrations at full contamination load. */
function inletConcentrations(load: number): Concentrations {
  return {
    largeDust: lerp(30, 1200, load),
    pm10: lerp(20, 850, load),
    pm25: lerp(10, 420, load),
    fine: lerp(5, 280, load),
    odorIndex: lerp(5, 95, load),
  };
}

function copyConc(c: Concentrations): Concentrations {
  return { ...c };
}

function applyCapture(
  c: Concentrations,
  capture: LayerCaptureRates,
  health: number,
): Concentrations {
  const h = clamp(health, 0.15, 1);
  const out = copyConc(c);
  for (const k of POLLUTANTS) {
    out[k] = c[k] * (1 - capture[k] * h);
  }
  return out;
}

function overallRemoval(inlet: Concentrations, outlet: Concentrations): number {
  let removed = 0;
  let total = 0;
  for (const k of POLLUTANTS) {
    total += inlet[k];
    removed += inlet[k] - outlet[k];
  }
  if (total <= 0) return 1;
  return clamp(removed / total, 0, 1);
}

function layerHealth(lifeHours: number, elapsedSec: number, load: number): number {
  // Accelerated sim-time: 1 real second ≈ 0.02 media-hours * load factor
  const mediaHours = (elapsedSec / 3600) * 72 * (0.6 + load * 0.8);
  return clamp(1 - mediaHours / lifeHours, 0.12, 1);
}

function buildLayerMetrics(
  layers: StageLayer[],
  elapsedSec: number,
  load: number,
  inlet: Concentrations,
): { layers: LayerMetrics[]; outlet: Concentrations } {
  let conc = copyConc(inlet);
  const result: LayerMetrics[] = [];
  for (const layer of layers) {
    const health = layerHealth(layer.lifeHours, elapsedSec, load);
    const before = copyConc(conc);
    const after = applyCapture(conc, layer.baseCapture, health);
    const capture: LayerCaptureRates = {
      largeDust: before.largeDust > 0 ? 1 - after.largeDust / before.largeDust : 0,
      pm10: before.pm10 > 0 ? 1 - after.pm10 / before.pm10 : 0,
      pm25: before.pm25 > 0 ? 1 - after.pm25 / before.pm25 : 0,
      fine: before.fine > 0 ? 1 - after.fine / before.fine : 0,
      odorIndex: before.odorIndex > 0 ? 1 - after.odorIndex / before.odorIndex : 0,
    };
    result.push({
      id: layer.id,
      name: layer.name,
      role: layer.role,
      poreClass: layer.poreClass,
      color: layer.color,
      capture,
      serviceLifePct: health * 100,
    });
    conc = after;
  }
  return { layers: result, outlet: conc };
}

/**
 * AeroPure educational physics:
 * - Oil sink (S1) + alloy fan (S3) dominate cooling.
 * - Charcoal (S2) + synthetic array (S4) dominate filtration by pore class.
 * - Electrostatic layer boosts PM2.5; PTFE is final barrier.
 * - Pressure drop rises with contamination + time-based clogging.
 * - Service Mode "replace" resets elapsed filter loading via App resetService.
 */
export function computeMetrics(
  controls: ControlsState,
  elapsedSec: number,
  serviceResetAt = 0,
): SystemMetrics {
  const { inletTempC, contaminationLoad, fanSpeedPct } = controls;
  const mediaAge = Math.max(0, elapsedSec - serviceResetAt);
  const fanFrac = fanSpeedPct / 100;
  const fanRpm = Math.round(lerp(800, 4200, fanFrac));

  const loadingFrac = clamp(mediaAge / 900, 0, 1) * (0.4 + contaminationLoad * 0.6);
  const filterLoadingPct = loadingFrac * 100;

  const airflowM3h =
    lerp(180, 920, fanFrac) *
    (0.88 + 0.12 * (1 - contaminationLoad * 0.25)) *
    (1 - loadingFrac * 0.18);

  const inletConc = inletConcentrations(contaminationLoad);
  let conc = copyConc(inletConc);
  let temp = inletTempC;
  let pressureDropPa = 45 + loadingFrac * 80;

  const oilHealth = clamp(1 - mediaAge / 2400, 0.25, 1);
  const charcoalHealth = clamp(1 - mediaAge / 1800, 0.2, 1);
  const syntheticHealth = clamp(1 - mediaAge / 1600, 0.2, 1);

  const stages: StageMetrics[] = [];

  // Stage 1: Lubricant oil heat sink
  {
    const oilEffectiveness = (0.42 + 0.1 * (1 - contaminationLoad * 0.2)) * oilHealth;
    const ambientSink = 35;
    const cooled = temp - (temp - ambientSink) * oilEffectiveness;
    const dP = 28 + loadingFrac * 12;
    pressureDropPa += dP;
    temp = cooled;
    const out = applyCapture(
      conc,
      { largeDust: 0.04, pm10: 0.02, pm25: 0.01, fine: 0.005, odorIndex: 0.03 },
      1,
    );
    stages.push({
      id: 'stage1',
      name: STAGES[0].name,
      tempC: temp,
      conc: out,
      pressureDropPa: dP,
      removalEfficiency: overallRemoval(conc, out),
    });
    conc = out;
  }

  // Stage 2: 3-layer charcoal nano filter
  {
    const def = STAGES[1];
    const built = buildLayerMetrics(def.layers!, mediaAge, contaminationLoad, conc);
    // Slight thermal mass loss
    temp = temp - 3 * (temp > 60 ? 1 : 0.3);
    const dP = (95 + contaminationLoad * 40) * (1 + loadingFrac * 0.55) * (1.15 - charcoalHealth * 0.15);
    pressureDropPa += dP;
    stages.push({
      id: 'stage2',
      name: def.name,
      tempC: temp,
      conc: built.outlet,
      pressureDropPa: dP,
      removalEfficiency: overallRemoval(conc, built.outlet),
      layers: built.layers,
    });
    conc = built.outlet;
  }

  // Stage 3: Alloy fan cooling
  {
    const fanCoolFrac = (0.18 + 0.45 * fanFrac) * (0.9 + 0.1 * oilHealth);
    const ambientSink = 28;
    const cooled = temp - (temp - ambientSink) * fanCoolFrac;
    const dP = 35 + fanFrac * 55;
    pressureDropPa += dP;
    temp = cooled;
    const out = applyCapture(
      conc,
      { largeDust: 0.01, pm10: 0.01, pm25: 0.01, fine: 0.01, odorIndex: 0.01 },
      1,
    );
    stages.push({
      id: 'stage3',
      name: STAGES[2].name,
      tempC: temp,
      conc: out,
      pressureDropPa: dP,
      removalEfficiency: overallRemoval(conc, out),
    });
    conc = out;
  }

  // Stage 4: 6-layer synthetic array — electrostatic boost already in layer defs
  {
    const def = STAGES[3];
    const built = buildLayerMetrics(def.layers!, mediaAge, contaminationLoad, conc);
    temp = temp - 1.5;
    const dP =
      (140 + contaminationLoad * 60 + fanFrac * 25) *
      (1 + loadingFrac * 0.7) *
      (1.2 - syntheticHealth * 0.2);
    pressureDropPa += dP;
    stages.push({
      id: 'stage4',
      name: def.name,
      tempC: temp,
      conc: built.outlet,
      pressureDropPa: dP,
      removalEfficiency: overallRemoval(conc, built.outlet),
      layers: built.layers,
    });
    conc = built.outlet;
  }

  const outletTempC = clamp(temp, 18, inletTempC);
  const filtrationEfficiencyPct = overallRemoval(inletConc, conc) * 100;

  return {
    inletTempC,
    outletTempC,
    deltaT: inletTempC - outletTempC,
    inletConc,
    outletConc: conc,
    filtrationEfficiencyPct,
    pressureDropPa,
    airflowM3h,
    fanRpm,
    stages,
    elapsedSec,
    filterLoadingPct,
    oilServiceLifePct: oilHealth * 100,
    charcoalServiceLifePct: charcoalHealth * 100,
    syntheticServiceLifePct: syntheticHealth * 100,
  };
}

export function tempToColor(tempC: number, min = 25, max = 300): string {
  const t = clamp((tempC - min) / (max - min), 0, 1);
  if (t > 0.66) {
    const u = (t - 0.66) / 0.34;
    return `rgb(${Math.round(lerp(255, 220, 1 - u))}, ${Math.round(lerp(80, 40, 1 - u))}, ${Math.round(lerp(40, 30, 1 - u))})`;
  }
  if (t > 0.33) {
    const u = (t - 0.33) / 0.33;
    return `rgb(${Math.round(lerp(255, 255, u))}, ${Math.round(lerp(160, 80, u))}, ${Math.round(lerp(60, 40, u))})`;
  }
  const u = t / 0.33;
  return `rgb(${Math.round(lerp(60, 255, u))}, ${Math.round(lerp(140, 160, u))}, ${Math.round(lerp(220, 60, u))})`;
}

export function defaultControls(): ControlsState {
  return {
    status: 'idle',
    inletTempC: 220,
    contaminationLoad: 0.65,
    fanSpeedPct: 55,
    serviceMode: false,
  };
}
