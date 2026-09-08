import type { StageDef } from './types';

export const SYSTEM_TITLE =
  'MODULAR MULTI-STAGE EXHAUST FILTRATION SYSTEM';
export const SYSTEM_CONCEPT = 'AeroPure™ Concept';
export const SYSTEM_TAGLINE = 'ENGINEERED FOR MODULAR SERVICE';
export const SYSTEM_ADVANTAGES =
  'Optimized for modular servicing, enhanced thermal management, and multi-stage pollutant removal with graded filtration media.';

export const STAGES: StageDef[] = [
  {
    id: 'stage1',
    stageNumber: 1,
    name: 'Heat Sink 1 (Lubricant Oil Cooling)',
    shortName: 'Heat Sink 1',
    diagramLabel: 'Stage 1: Heat Sink 1 (Lubricant Oil Cooling)',
    phase: 1,
    phaseLabel: 'Phase 1: Thermal & Nanofiltration Module (Inlet side)',
    moduleName: 'Oil Cartridge Module',
    description:
      'Primary thermal extraction via CIRCULATING, REPLACEABLE LUBRICANT OIL. Coiled heat-exchange tubing and cylindrical oil canisters absorb exhaust heat before filtration stages.',
    cooling: 'oil',
    callout: 'CIRCULATING, REPLACEABLE LUBRICANT OIL',
  },
  {
    id: 'stage2',
    stageNumber: 2,
    name: '3-Layer Charcoal Nano-Material Filter',
    shortName: 'Charcoal Nano Filter',
    diagramLabel: 'Stage 2: 3-Layer Charcoal Nano-Material Filter',
    phase: 1,
    phaseLabel: 'Phase 1: Thermal & Nanofiltration Module (Inlet side)',
    moduleName: 'Charcoal Cartridge Module',
    description:
      'Nano-engineered Carbon matrix with graded pores for progressive particulate and VOC capture. CHARCOAL NANO-MATERIAL STRUCTURE (3 LAYERS).',
    callout: 'CHARCOAL NANO-MATERIAL STRUCTURE (3 LAYERS)',
    layers: [
      {
        id: 'c1',
        name: 'Layer 1: Coarse Carbon',
        role: 'Large Pore — coarse particulate capture',
        poreClass: 'Large Pore',
        color: '#3a3a3a',
        baseCapture: {
          largeDust: 0.55,
          pm10: 0.28,
          pm25: 0.08,
          fine: 0.03,
          odorIndex: 0.12,
        },
        lifeHours: 18,
      },
      {
        id: 'c2',
        name: 'Layer 2: Carbon+Zeolite',
        role: 'Medium Pore — mid-size particles & VOC',
        poreClass: 'Medium Pore',
        color: '#2a2a2a',
        baseCapture: {
          largeDust: 0.25,
          pm10: 0.35,
          pm25: 0.22,
          fine: 0.1,
          odorIndex: 0.35,
        },
        lifeHours: 16,
      },
      {
        id: 'c3',
        name: 'Layer 3: Nano Membrane',
        role: 'Small Pore / Fine — fine particle barrier',
        poreClass: 'Small Pore (Fine)',
        color: '#1a1a1a',
        baseCapture: {
          largeDust: 0.1,
          pm10: 0.22,
          pm25: 0.18,
          fine: 0.2,
          odorIndex: 0.15,
        },
        lifeHours: 14,
      },
    ],
  },
  {
    id: 'stage3',
    stageNumber: 3,
    name: 'Heat Sink 2 (Alloy Fan Cooling)',
    shortName: 'Alloy Fan Cooling',
    diagramLabel: 'Stage 3: Heat Sink 2 (Alloy Fan Cooling)',
    phase: 2,
    phaseLabel: 'Phase 2: Post-Treatment & Synthetic Array (Outlet side)',
    moduleName: 'Alloy Fan Assembly',
    description:
      'Active alloy centrifugal fan provides secondary cooling and drives airflow through the synthetic filtration array. Fan speed directly affects ΔT and pressure recovery.',
    cooling: 'fan',
    callout: 'ALLOY FAN COOLING',
  },
  {
    id: 'stage4',
    stageNumber: 4,
    name: '6-Layer Synthetic Array',
    shortName: 'Synthetic Array',
    diagramLabel: 'Stage 4: 6-Layer Synthetic Array',
    phase: 2,
    phaseLabel: 'Phase 2: Post-Treatment & Synthetic Array (Outlet side)',
    moduleName: 'Synthetic Array Cartridge',
    description:
      'PRECISION GRADED PORE STRUCTURE for multi-class pollutant removal — from large dust through PM10, PM2.5, fine particles, chemical/odor, to final PTFE barrier.',
    callout: 'PRECISION GRADED PORE STRUCTURE',
    layers: [
      {
        id: 's1',
        name: 'Layer 1: Coarse Synthetic Mesh',
        role: 'Large Dust Removal',
        poreClass: 'Coarse Mesh',
        color: '#8a8a7a',
        baseCapture: {
          largeDust: 0.7,
          pm10: 0.15,
          pm25: 0.04,
          fine: 0.01,
          odorIndex: 0.02,
        },
        lifeHours: 20,
      },
      {
        id: 's2',
        name: 'Layer 2: Mid-Size Microfiber Filter',
        role: 'PM10 Filtration',
        poreClass: 'Mid Microfiber',
        color: '#a67c52',
        baseCapture: {
          largeDust: 0.2,
          pm10: 0.55,
          pm25: 0.12,
          fine: 0.04,
          odorIndex: 0.03,
        },
        lifeHours: 16,
      },
      {
        id: 's3',
        name: 'Layer 3: Electrostatic Filter',
        role: 'PM2.5 Capture',
        poreClass: 'Electrostatic',
        color: '#e8e0d0',
        baseCapture: {
          largeDust: 0.05,
          pm10: 0.25,
          pm25: 0.62,
          fine: 0.18,
          odorIndex: 0.05,
        },
        lifeHours: 12,
      },
      {
        id: 's4',
        name: 'Layer 4: Nanofiber Barrier Structure',
        role: 'Fine Particle Capture',
        poreClass: 'Nanofiber',
        color: '#d4c4a8',
        baseCapture: {
          largeDust: 0.02,
          pm10: 0.15,
          pm25: 0.28,
          fine: 0.55,
          odorIndex: 0.04,
        },
        lifeHours: 12,
      },
      {
        id: 's5',
        name: 'Layer 5: Activated Carbon + Zeolite Composite',
        role: 'VOC / odor adsorption',
        poreClass: 'Adsorbent Composite',
        color: '#1e1e1e',
        baseCapture: {
          largeDust: 0.01,
          pm10: 0.05,
          pm25: 0.08,
          fine: 0.1,
          odorIndex: 0.72,
        },
        lifeHours: 14,
      },
      {
        id: 's6',
        name: 'Layer 6: PTFE Protective Membrane',
        role: 'Final barrier',
        poreClass: 'PTFE Membrane',
        color: '#c8d8e8',
        baseCapture: {
          largeDust: 0.15,
          pm10: 0.35,
          pm25: 0.4,
          fine: 0.45,
          odorIndex: 0.08,
        },
        lifeHours: 22,
      },
    ],
  },
];

export const PHASES = [
  {
    id: 'phase1',
    name: 'Phase 1: Thermal & Nanofiltration Module (Inlet side)',
    stageIds: ['stage1', 'stage2'] as const,
  },
  {
    id: 'phase2',
    name: 'Phase 2: Post-Treatment & Synthetic Array (Outlet side)',
    stageIds: ['stage3', 'stage4'] as const,
  },
];

export const PORTS = {
  inlet: 'Exhaust Inlet (Hot, Particulate-laden)',
  docking: 'Self-Sealing Docking Mechanism',
  outlet: 'Purified Air Outlet (Cleaned, Cooled)',
  coupling: 'Quick-Disconnect Coupling',
} as const;
