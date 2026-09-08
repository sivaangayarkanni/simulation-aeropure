import type { SystemMetrics } from '../lib/types';

interface Props {
  metrics: SystemMetrics;
}

function Metric({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: 'hot' | 'cold' | 'good' | 'warn';
}) {
  return (
    <div className={`metric ${accent ?? ''}`}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">
        {value}
        {unit ? <small>{unit}</small> : null}
      </span>
    </div>
  );
}

export function MetricsPanel({ metrics }: Props) {
  const { inletConc, outletConc } = metrics;

  return (
    <section className="panel metrics-panel">
      <h2>Live Metrics</h2>
      <div className="metrics-grid">
        <Metric label="Inlet Temp" value={metrics.inletTempC.toFixed(1)} unit="°C" accent="hot" />
        <Metric label="Outlet Temp" value={metrics.outletTempC.toFixed(1)} unit="°C" accent="cold" />
        <Metric label="ΔT" value={metrics.deltaT.toFixed(1)} unit="°C" accent="good" />
        <Metric
          label="Filtration Eff."
          value={metrics.filtrationEfficiencyPct.toFixed(1)}
          unit="%"
          accent="good"
        />
        <Metric label="Pressure Drop" value={metrics.pressureDropPa.toFixed(0)} unit="Pa" />
        <Metric label="Airflow" value={metrics.airflowM3h.toFixed(0)} unit="m³/h" />
        <Metric label="Fan RPM" value={metrics.fanRpm.toLocaleString()} unit="rpm" />
        <Metric label="Runtime" value={metrics.elapsedSec.toFixed(0)} unit="s" />
      </div>

      <h3>Particulate &amp; VOC Concentrations</h3>
      <div className="conc-table">
        <div className="conc-head">
          <span />
          <span>Inlet</span>
          <span>Outlet</span>
        </div>
        <div className="conc-row">
          <span>Large Dust</span>
          <span>{inletConc.largeDust.toFixed(0)} µg/m³</span>
          <span className="out">{outletConc.largeDust.toFixed(1)} µg/m³</span>
        </div>
        <div className="conc-row">
          <span>PM10</span>
          <span>{inletConc.pm10.toFixed(0)} µg/m³</span>
          <span className="out">{outletConc.pm10.toFixed(1)} µg/m³</span>
        </div>
        <div className="conc-row">
          <span>PM2.5</span>
          <span>{inletConc.pm25.toFixed(0)} µg/m³</span>
          <span className="out">{outletConc.pm25.toFixed(1)} µg/m³</span>
        </div>
        <div className="conc-row">
          <span>Fine</span>
          <span>{inletConc.fine.toFixed(0)} µg/m³</span>
          <span className="out">{outletConc.fine.toFixed(1)} µg/m³</span>
        </div>
        <div className="conc-row">
          <span>VOC-odor</span>
          <span>{inletConc.odorIndex.toFixed(0)}</span>
          <span className="out">{outletConc.odorIndex.toFixed(1)}</span>
        </div>
      </div>
    </section>
  );
}
