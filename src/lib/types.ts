export type SimStatus = 'running' | 'paused' | 'idle';

export interface ControlsState {
  status: SimStatus;
  inletTempC: number; // 80–350
  contaminationLoad: number; // 0–1
  fanSpeedPct: number; // 0–100
  serviceMode: boolean;
}

export interface Concentrations {
  largeDust: number; // µg/m³ proxy for coarse dust
  pm10: number;
  pm25: number;
  fine: number;
  odorIndex: number; // VOC / odor 0–100
}

export type PollutantKey = keyof Concentrations;

export interface LayerCaptureRates {
  largeDust: number; // 0–1 fractional capture this layer
  pm10: number;
  pm25: number;
  fine: number;
  odorIndex: number;
}

export interface LayerMetrics {
  id: string;
  name: string;
  role: string;
  poreClass: string;
  color: string;
  capture: LayerCaptureRates;
  serviceLifePct: number; // remaining life 0–100
}

export interface StageMetrics {
  id: string;
  name: string;
  tempC: number;
  conc: Concentrations;
  pressureDropPa: number;
  removalEfficiency: number; // 0–1 overall for this stage
  layers?: LayerMetrics[];
}

export interface SystemMetrics {
  inletTempC: number;
  outletTempC: number;
  deltaT: number;
  inletConc: Concentrations;
  outletConc: Concentrations;
  filtrationEfficiencyPct: number;
  pressureDropPa: number;
  airflowM3h: number;
  fanRpm: number;
  stages: StageMetrics[];
  elapsedSec: number;
  filterLoadingPct: number; // 0–100 clogging from runtime
  oilCoolantTempC: number; // circulating lubricant oil temp
  oilServiceLifePct: number;
  charcoalServiceLifePct: number;
  syntheticServiceLifePct: number;
}

export interface StageLayer {
  id: string;
  name: string;
  role: string;
  poreClass: string;
  color: string;
  /** Base capture fractions when media is fresh */
  baseCapture: LayerCaptureRates;
  /** Nominal service life in sim-hours before 0% */
  lifeHours: number;
}

export interface StageDef {
  id: string;
  stageNumber: number;
  name: string;
  shortName: string;
  diagramLabel: string;
  phase: 1 | 2;
  phaseLabel: string;
  description: string;
  layers?: StageLayer[];
  cooling?: 'oil' | 'fan';
  callout?: string;
  moduleName: string;
}
