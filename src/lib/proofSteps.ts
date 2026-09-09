import type { Concentrations, PollutantKey, SystemMetrics } from './types';
import { STAGES } from './stages';

export type ProofFocusId =
  | 'inlet'
  | 'stage1'
  | 'c1'
  | 'c2'
  | 'c3'
  | 'stage3'
  | 's1'
  | 's2'
  | 's3'
  | 's4'
  | 's5'
  | 's6'
  | 'outlet';

export interface ProofStepDef {
  id: string;
  index: number;
  title: string;
  shortTitle: string;
  focusId: ProofFocusId;
  /** Maps to CutawayViz / 3D stage selection */
  stageId: string | null;
  plainCaption: string;
  techCaption: string;
  role?: string;
}

export interface ConcDelta {
  before: Concentrations;
  after: Concentrations;
  removed: Concentrations;
  removalFrac: Concentrations;
}

export interface ProofStepSnapshot {
  step: ProofStepDef;
  tempBeforeC: number;
  tempAfterC: number;
  deltaT: number;
  conc: ConcDelta;
  /** Cumulative removal from system inlet → after this step */
  cumulativeEfficiency: number;
  /** Live extras for this step */
  extras: Record<string, string | number>;
}

export interface LayerContribution {
  id: string;
  name: string;
  role: string;
  color: string;
  removed: Concentrations;
  /** Fraction of *inlet* pollutant this layer removed */
  shareOfInlet: Concentrations;
}

export interface ProofPackData {
  steps: ProofStepSnapshot[];
  contributions: LayerContribution[];
  /** Cumulative efficiency after each filtration/thermal checkpoint (step index → %) */
  cumulativeCurve: { label: string; efficiencyPct: number; tempC: number }[];
  tempProfile: { label: string; tempC: number }[];
  overall: {
    efficiencyPct: number;
    deltaT: number;
    outletConc: Concentrations;
    inletConc: Concentrations;
    fanRpm: number;
    oilCoolantTempC: number;
  };
}

const POLLUTANTS: PollutantKey[] = [
  'largeDust',
  'pm10',
  'pm25',
  'fine',
  'odorIndex',
];

export const POLLUTANT_META: Record<
  PollutantKey,
  { label: string; short: string; color: string; unit: string }
> = {
  largeDust: { label: 'Large dust', short: 'Dust', color: '#fb923c', unit: 'µg/m³' },
  pm10: { label: 'PM10', short: 'PM10', color: '#fbbf24', unit: 'µg/m³' },
  pm25: { label: 'PM2.5', short: 'PM2.5', color: '#a3e635', unit: 'µg/m³' },
  fine: { label: 'Fine', short: 'Fine', color: '#22d3ee', unit: 'µg/m³' },
  odorIndex: { label: 'Odor / VOC', short: 'Odor', color: '#c084fc', unit: 'idx' },
};

export const PROOF_STEPS: ProofStepDef[] = [
  {
    id: 'inlet',
    index: 0,
    title: 'Exhaust Inlet',
    shortTitle: 'Inlet',
    focusId: 'inlet',
    stageId: null,
    plainCaption:
      'Hot, dirty exhaust enters the module through the self-sealing docking port — high temperature and heavy particulate load.',
    techCaption:
      'Inlet boundary condition: particulate-laden gas at T_in with coarse dust, PM10, PM2.5, fine aerosol, and VOC/odor index set by contamination load.',
  },
  {
    id: 'stage1',
    index: 1,
    title: 'Stage 1 — Heat Sink 1 (Oil Cooling)',
    shortTitle: 'Oil Heat Sink',
    focusId: 'stage1',
    stageId: 'stage1',
    role: 'Primary thermal extraction',
    plainCaption:
      'Circulating lubricant oil pulls heat out of the exhaust through coiled tubing and replaceable oil canisters. Air cools before filters see it.',
    techCaption:
      'Oil heat exchanger: effectiveness η_oil · (T − T_sink). Minor incidental capture of condensables; ΔT dominates this stage. Oil coolant temperature tracks absorbed heat.',
  },
  {
    id: 'c1',
    index: 2,
    title: 'Charcoal L1 — Coarse Carbon',
    shortTitle: 'Charcoal L1',
    focusId: 'c1',
    stageId: 'stage2',
    role: 'Large Pore — coarse particulate',
    plainCaption:
      'First charcoal layer uses large pores to snag big dust particles — like a coarse sieve that protects finer media downstream.',
    techCaption:
      'Depth filtration in large-pore activated carbon: inertial + interception capture of largeDust; limited PM10; low fine/VOC efficiency by design.',
  },
  {
    id: 'c2',
    index: 3,
    title: 'Charcoal L2 — Carbon + Zeolite',
    shortTitle: 'Charcoal L2',
    focusId: 'c2',
    stageId: 'stage2',
    role: 'Medium Pore — PM / VOC',
    plainCaption:
      'Medium pores plus zeolite catch mid-size particles and start soaking up smelly VOC gases.',
    techCaption:
      'Bimodal Carbon+Zeolite: medium-pore particulate capture with adsorptive VOC/odor uptake (odorIndex). Progressive pore grading reduces clogging upstream.',
  },
  {
    id: 'c3',
    index: 4,
    title: 'Charcoal L3 — Nano Membrane',
    shortTitle: 'Charcoal L3',
    focusId: 'c3',
    stageId: 'stage2',
    role: 'Small Pore — fine barrier',
    plainCaption:
      'Nano-scale membrane finishes Phase 1 filtration — finer particles that slipped past L1/L2 get trapped here.',
    techCaption:
      'Small-pore nano membrane: diffusion-dominated capture of remaining fine fraction; residual PM10/PM2.5 polishing before Phase 2.',
  },
  {
    id: 'stage3',
    index: 5,
    title: 'Stage 3 — Alloy Fan Cooling',
    shortTitle: 'Alloy Fan',
    focusId: 'stage3',
    stageId: 'stage3',
    role: 'Secondary cooling + airflow drive',
    plainCaption:
      'The alloy centrifugal fan spins up to pull air through the synthetic array and shed more heat — RPM sets both cooling and flow rate.',
    techCaption:
      'Active alloy fan: T cooled toward ambient with fanFrac; RPM ∈ [800, 4200]; pressure recovery and airflow M³/h scale with fan speed.',
  },
  {
    id: 's1',
    index: 6,
    title: 'Synthetic L1 — Coarse Mesh',
    shortTitle: 'Synth L1',
    focusId: 's1',
    stageId: 'stage4',
    role: 'Large dust removal',
    plainCaption:
      'Coarse synthetic mesh knocks out remaining large dust before finer synthetic layers.',
    techCaption:
      'Coarse mesh mechanical filtration — high largeDust capture coefficient; sacrificial prefilter for the graded array.',
  },
  {
    id: 's2',
    index: 7,
    title: 'Synthetic L2 — Mid Microfiber',
    shortTitle: 'Synth L2',
    focusId: 's2',
    stageId: 'stage4',
    role: 'PM10 filtration',
    plainCaption:
      'Mid-size microfibers target PM10 — the particles that irritate lungs and show up in ambient air metrics.',
    techCaption:
      'Microfiber interception/inertial capture tuned for PM10 size class (~≤10 µm aerodynamic diameter proxy).',
  },
  {
    id: 's3',
    index: 8,
    title: 'Synthetic L3 — Electrostatic',
    shortTitle: 'Synth L3',
    focusId: 's3',
    stageId: 'stage4',
    role: 'PM2.5 capture',
    plainCaption:
      'Electrostatic charge pulls in PM2.5 — the hard-to-catch fine soot that ordinary mesh misses.',
    techCaption:
      'Electret / electrostatic enhancement boosts PM2.5 capture beyond geometric pore size — key differentiator in the array.',
  },
  {
    id: 's4',
    index: 9,
    title: 'Synthetic L4 — Nanofiber Barrier',
    shortTitle: 'Synth L4',
    focusId: 's4',
    stageId: 'stage4',
    role: 'Fine particle capture',
    plainCaption:
      'Nanofiber mat catches the tiniest particles still floating after electrostatic capture.',
    techCaption:
      'Nanofiber barrier: high surface area, diffusion + interception for fine aerosol fraction.',
  },
  {
    id: 's5',
    index: 10,
    title: 'Synthetic L5 — Carbon + Zeolite Composite',
    shortTitle: 'Synth L5',
    focusId: 's5',
    stageId: 'stage4',
    role: 'VOC / odor adsorption',
    plainCaption:
      'Activated carbon and zeolite composite scrub remaining odors and chemical vapors.',
    techCaption:
      'Adsorbent composite: physisorption of VOC/odorIndex; secondary particulate polish at low rates.',
  },
  {
    id: 's6',
    index: 11,
    title: 'Synthetic L6 — PTFE Membrane',
    shortTitle: 'Synth L6',
    focusId: 's6',
    stageId: 'stage4',
    role: 'Final PTFE barrier',
    plainCaption:
      'PTFE protective membrane is the final polish — a tough last barrier before clean air exits.',
    techCaption:
      'PTFE membrane final barrier: broad-spectrum residual particulate capture with chemical resistance.',
  },
  {
    id: 'outlet',
    index: 12,
    title: 'Purified Air Outlet',
    shortTitle: 'Outlet',
    focusId: 'outlet',
    stageId: null,
    plainCaption:
      'Cooled, cleaned air leaves through the quick-disconnect outlet — overall efficiency, ΔT, and outlet concentrations prove the multi-stage design.',
    techCaption:
      'Outlet state: T_out, C_out, η_total = Σ(C_in − C_out)/Σ C_in across pollutant classes; ΔT = T_in − T_out from oil + fan sinks.',
  },
];

function copyConc(c: Concentrations): Concentrations {
  return { ...c };
}

function zeroConc(): Concentrations {
  return { largeDust: 0, pm10: 0, pm25: 0, fine: 0, odorIndex: 0 };
}

function applyFrac(before: Concentrations, capture: Concentrations): Concentrations {
  const after = zeroConc();
  for (const k of POLLUTANTS) {
    after[k] = before[k] * (1 - Math.min(1, Math.max(0, capture[k])));
  }
  return after;
}

function removedConc(before: Concentrations, after: Concentrations): Concentrations {
  const r = zeroConc();
  for (const k of POLLUTANTS) r[k] = Math.max(0, before[k] - after[k]);
  return r;
}

function removalFrac(before: Concentrations, after: Concentrations): Concentrations {
  const r = zeroConc();
  for (const k of POLLUTANTS) {
    r[k] = before[k] > 1e-9 ? 1 - after[k] / before[k] : 0;
  }
  return r;
}

function overallRemoval(inlet: Concentrations, outlet: Concentrations): number {
  let removed = 0;
  let total = 0;
  for (const k of POLLUTANTS) {
    total += inlet[k];
    removed += inlet[k] - outlet[k];
  }
  if (total <= 0) return 1;
  return Math.min(1, Math.max(0, removed / total));
}

function makeDelta(before: Concentrations, after: Concentrations): ConcDelta {
  return {
    before: copyConc(before),
    after: copyConc(after),
    removed: removedConc(before, after),
    removalFrac: removalFrac(before, after),
  };
}

function layerCaptureAsConc(capture: {
  largeDust: number;
  pm10: number;
  pm25: number;
  fine: number;
  odorIndex: number;
}): Concentrations {
  return { ...capture };
}

/**
 * Build educational proof snapshots from live SystemMetrics.
 * Reconstructs per-layer before→after using effective capture fractions already
 * computed by physics.ts (health-aware).
 */
export function buildProofPack(metrics: SystemMetrics): ProofPackData {
  const inlet = copyConc(metrics.inletConc);
  const s1 = metrics.stages[0];
  const s2 = metrics.stages[1];
  const s3 = metrics.stages[2];
  const s4 = metrics.stages[3];

  const contributions: LayerContribution[] = [];
  const steps: ProofStepSnapshot[] = [];

  // Walk concentrations through the system
  let conc = copyConc(inlet);
  let temp = metrics.inletTempC;

  const pushStep = (
    def: ProofStepDef,
    before: Concentrations,
    after: Concentrations,
    tempBefore: number,
    tempAfter: number,
    extras: Record<string, string | number> = {},
  ) => {
    steps.push({
      step: def,
      tempBeforeC: tempBefore,
      tempAfterC: tempAfter,
      deltaT: tempBefore - tempAfter,
      conc: makeDelta(before, after),
      cumulativeEfficiency: overallRemoval(inlet, after),
      extras,
    });
  };

  // 0 Inlet — before = after = inlet (show load)
  pushStep(PROOF_STEPS[0], conc, conc, temp, temp, {
    'Inlet T': `${temp.toFixed(0)} °C`,
    Load: `${(metrics.filterLoadingPct).toFixed(0)}% media load`,
  });

  // 1 Stage 1 oil
  {
    const before = copyConc(conc);
    const after = copyConc(s1?.conc ?? conc);
    const tAfter = s1?.tempC ?? temp;
    pushStep(PROOF_STEPS[1], before, after, temp, tAfter, {
      'ΔT': `${(temp - tAfter).toFixed(1)} °C`,
      'Oil coolant': `${metrics.oilCoolantTempC.toFixed(0)} °C`,
      'Oil life': `${metrics.oilServiceLifePct.toFixed(0)}%`,
      'dP': `${(s1?.pressureDropPa ?? 0).toFixed(0)} Pa`,
    });
    conc = after;
    temp = tAfter;
  }

  // 2–4 Charcoal layers
  {
    const layers = s2?.layers ?? [];
    const charcoalDefs = STAGES[1].layers ?? [];
    const tStart = temp;
    const tEnd = s2?.tempC ?? temp;
    for (let i = 0; i < 3; i++) {
      const lm = layers[i];
      const def = charcoalDefs[i];
      const before = copyConc(conc);
      const capture = lm
        ? layerCaptureAsConc(lm.capture)
        : def?.baseCapture ?? zeroConc();
      const after = applyFrac(before, capture);
      const tAfter = tStart + ((i + 1) / 3) * (tEnd - tStart);
      const removed = removedConc(before, after);
      contributions.push({
        id: def?.id ?? `c${i + 1}`,
        name: def?.name ?? `Charcoal L${i + 1}`,
        role: def?.role ?? '',
        color: def?.color ?? '#333',
        removed,
        shareOfInlet: {
          largeDust: inlet.largeDust > 0 ? removed.largeDust / inlet.largeDust : 0,
          pm10: inlet.pm10 > 0 ? removed.pm10 / inlet.pm10 : 0,
          pm25: inlet.pm25 > 0 ? removed.pm25 / inlet.pm25 : 0,
          fine: inlet.fine > 0 ? removed.fine / inlet.fine : 0,
          odorIndex: inlet.odorIndex > 0 ? removed.odorIndex / inlet.odorIndex : 0,
        },
      });
      pushStep(PROOF_STEPS[2 + i], before, after, temp, tAfter, {
        Role: def?.role ?? '',
        'Pore class': def?.poreClass ?? '',
        'Life': lm ? `${lm.serviceLifePct.toFixed(0)}%` : '—',
        'Dust capture': `${((capture.largeDust) * 100).toFixed(0)}%`,
        'PM10 capture': `${((capture.pm10) * 100).toFixed(0)}%`,
      });
      conc = after;
      temp = tAfter;
    }
    // Align to stage2 outlet (numerical safety)
    conc = copyConc(s2?.conc ?? conc);
    temp = s2?.tempC ?? temp;
  }

  // 5 Stage 3 fan
  {
    const before = copyConc(conc);
    const after = copyConc(s3?.conc ?? conc);
    const tAfter = s3?.tempC ?? temp;
    pushStep(PROOF_STEPS[5], before, after, temp, tAfter, {
      RPM: metrics.fanRpm,
      'ΔT': `${(temp - tAfter).toFixed(1)} °C`,
      Airflow: `${metrics.airflowM3h.toFixed(0)} m³/h`,
      'dP': `${(s3?.pressureDropPa ?? 0).toFixed(0)} Pa`,
    });
    conc = after;
    temp = tAfter;
  }

  // 6–11 Synthetic layers
  {
    const layers = s4?.layers ?? [];
    const synthDefs = STAGES[3].layers ?? [];
    const tStart = temp;
    const tEnd = s4?.tempC ?? temp;
    for (let i = 0; i < 6; i++) {
      const lm = layers[i];
      const def = synthDefs[i];
      const before = copyConc(conc);
      const capture = lm
        ? layerCaptureAsConc(lm.capture)
        : def?.baseCapture ?? zeroConc();
      const after = applyFrac(before, capture);
      const tAfter = tStart + ((i + 1) / 6) * (tEnd - tStart);
      const removed = removedConc(before, after);
      contributions.push({
        id: def?.id ?? `s${i + 1}`,
        name: def?.name ?? `Synthetic L${i + 1}`,
        role: def?.role ?? '',
        color: def?.color ?? '#888',
        removed,
        shareOfInlet: {
          largeDust: inlet.largeDust > 0 ? removed.largeDust / inlet.largeDust : 0,
          pm10: inlet.pm10 > 0 ? removed.pm10 / inlet.pm10 : 0,
          pm25: inlet.pm25 > 0 ? removed.pm25 / inlet.pm25 : 0,
          fine: inlet.fine > 0 ? removed.fine / inlet.fine : 0,
          odorIndex: inlet.odorIndex > 0 ? removed.odorIndex / inlet.odorIndex : 0,
        },
      });
      const primaryKey: PollutantKey =
        i === 0
          ? 'largeDust'
          : i === 1
            ? 'pm10'
            : i === 2
              ? 'pm25'
              : i === 3
                ? 'fine'
                : i === 4
                  ? 'odorIndex'
                  : 'fine';
      pushStep(PROOF_STEPS[6 + i], before, after, temp, tAfter, {
        Role: def?.role ?? '',
        'Pore class': def?.poreClass ?? '',
        'Life': lm ? `${lm.serviceLifePct.toFixed(0)}%` : '—',
        [`${POLLUTANT_META[primaryKey].short} capture`]: `${(capture[primaryKey] * 100).toFixed(0)}%`,
      });
      conc = after;
      temp = tAfter;
    }
    conc = copyConc(s4?.conc ?? conc);
    temp = s4?.tempC ?? temp;
  }

  // 12 Outlet summary
  {
    const outlet = copyConc(metrics.outletConc);
    pushStep(PROOF_STEPS[12], inlet, outlet, metrics.inletTempC, metrics.outletTempC, {
      'Overall η': `${metrics.filtrationEfficiencyPct.toFixed(1)}%`,
      'ΔT': `${metrics.deltaT.toFixed(1)} °C`,
      'Outlet T': `${metrics.outletTempC.toFixed(1)} °C`,
      'ΔP total': `${metrics.pressureDropPa.toFixed(0)} Pa`,
    });
  }

  const cumulativeCurve = steps.map((s) => ({
    label: s.step.shortTitle,
    efficiencyPct: s.cumulativeEfficiency * 100,
    tempC: s.tempAfterC,
  }));

  const tempProfile = [
    { label: 'Inlet', tempC: metrics.inletTempC },
    { label: 'After Oil', tempC: s1?.tempC ?? metrics.inletTempC },
    { label: 'After Charcoal', tempC: s2?.tempC ?? metrics.inletTempC },
    { label: 'After Fan', tempC: s3?.tempC ?? metrics.outletTempC },
    { label: 'Outlet', tempC: metrics.outletTempC },
  ];

  return {
    steps,
    contributions,
    cumulativeCurve,
    tempProfile,
    overall: {
      efficiencyPct: metrics.filtrationEfficiencyPct,
      deltaT: metrics.deltaT,
      outletConc: copyConc(metrics.outletConc),
      inletConc: copyConc(metrics.inletConc),
      fanRpm: metrics.fanRpm,
      oilCoolantTempC: metrics.oilCoolantTempC,
    },
  };
}

export function focusToStageId(focus: ProofFocusId): string | null {
  if (focus === 'inlet' || focus === 'outlet') return null;
  if (focus === 'stage1') return 'stage1';
  if (focus === 'stage3') return 'stage3';
  if (focus.startsWith('c')) return 'stage2';
  if (focus.startsWith('s')) return 'stage4';
  return null;
}
