import type { StageDef, StageMetrics } from '../lib/types';

interface Props {
  stage: StageDef | null;
  metrics: StageMetrics | null;
  onClose: () => void;
}

function pct(v: number) {
  return `${(v * 100).toFixed(0)}%`;
}

export function DetailDrawer({ stage, metrics, onClose }: Props) {
  if (!stage) return null;

  return (
    <aside className="detail-drawer open" role="dialog" aria-label={`${stage.name} details`}>
      <div className="drawer-head">
        <div>
          <span className="stage-pill">Stage {stage.stageNumber}</span>
          <span className="phase-pill">Phase {stage.phase}</span>
          <h2>{stage.diagramLabel}</h2>
          <p className="phase-line">{stage.phaseLabel}</p>
        </div>
        <button type="button" className="btn icon" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <p className="drawer-desc">{stage.description}</p>
      {stage.callout && <div className="callout diagram-callout">{stage.callout}</div>}

      {metrics && (
        <div className="drawer-metrics">
          <div>
            <span>Stage Temp</span>
            <strong>{metrics.tempC.toFixed(1)} °C</strong>
          </div>
          <div>
            <span>ΔP</span>
            <strong>{metrics.pressureDropPa.toFixed(0)} Pa</strong>
          </div>
          <div>
            <span>Removal</span>
            <strong>{(metrics.removalEfficiency * 100).toFixed(1)}%</strong>
          </div>
          <div>
            <span>Large Dust out</span>
            <strong>{metrics.conc.largeDust.toFixed(1)} µg/m³</strong>
          </div>
          <div>
            <span>PM10 out</span>
            <strong>{metrics.conc.pm10.toFixed(1)} µg/m³</strong>
          </div>
          <div>
            <span>PM2.5 out</span>
            <strong>{metrics.conc.pm25.toFixed(1)} µg/m³</strong>
          </div>
          <div>
            <span>Fine out</span>
            <strong>{metrics.conc.fine.toFixed(1)} µg/m³</strong>
          </div>
          <div>
            <span>VOC-odor out</span>
            <strong>{metrics.conc.odorIndex.toFixed(1)}</strong>
          </div>
        </div>
      )}

      {stage.cooling === 'oil' && (
        <div className="callout">
          CIRCULATING, REPLACEABLE LUBRICANT OIL in cylindrical canisters + coiled heat-exchange
          tube provides primary thermal extraction (Heat Sink 1).
        </div>
      )}
      {stage.cooling === 'fan' && (
        <div className="callout">
          ALLOY FAN COOLING — alloy radial/centrifugal fan provides active cooling and drives
          airflow. RPM scales with fan speed control.
        </div>
      )}

      {(metrics?.layers ?? stage.layers) && (
        <div className="layer-list">
          <h3>
            {stage.id === 'stage2'
              ? 'CHARCOAL NANO-MATERIAL STRUCTURE (3 LAYERS)'
              : stage.id === 'stage4'
                ? 'PRECISION GRADED PORE STRUCTURE — 6 Layers'
                : 'Layers'}
          </h3>
          <ul>
            {(metrics?.layers
              ? metrics.layers
              : (stage.layers ?? []).map((l) => ({
                  id: l.id,
                  name: l.name,
                  role: l.role,
                  poreClass: l.poreClass,
                  color: l.color,
                  capture: l.baseCapture,
                  serviceLifePct: 100,
                }))
            ).map((layer) => (
              <li key={layer.id ?? layer.name}>
                <span className="swatch" style={{ background: layer.color }} />
                <div className="layer-body">
                  <strong>{layer.name}</strong>
                  <em>
                    {layer.role} · Pore class: {layer.poreClass}
                  </em>
                  {'capture' in layer && (
                    <div className="capture-grid">
                      <span>
                        Large dust <b>{pct(layer.capture.largeDust)}</b>
                      </span>
                      <span>
                        PM10 <b>{pct(layer.capture.pm10)}</b>
                      </span>
                      <span>
                        PM2.5 <b>{pct(layer.capture.pm25)}</b>
                      </span>
                      <span>
                        Fine <b>{pct(layer.capture.fine)}</b>
                      </span>
                      <span>
                        VOC-odor <b>{pct(layer.capture.odorIndex)}</b>
                      </span>
                      <span className="life">
                        Service life <b>{layer.serviceLifePct.toFixed(0)}%</b>
                      </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="module-tag">Replaceable module: {stage.moduleName}</p>
    </aside>
  );
}
