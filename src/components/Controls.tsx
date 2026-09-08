import type { ControlsState } from '../lib/types';

interface Props {
  controls: ControlsState;
  onChange: (patch: Partial<ControlsState>) => void;
  onReset: () => void;
  onReplaceCartridges: () => void;
}

export function Controls({ controls, onChange, onReset, onReplaceCartridges }: Props) {
  const { status, inletTempC, contaminationLoad, fanSpeedPct, serviceMode } = controls;
  const running = status === 'running';

  return (
    <section className="panel controls-panel">
      <h2>System Controls</h2>

      <div className="control-row buttons">
        <button
          type="button"
          className={`btn primary ${running ? 'active' : ''}`}
          onClick={() => onChange({ status: running ? 'paused' : 'running' })}
        >
          {running ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'}
        </button>
        <button type="button" className="btn" onClick={onReset}>
          Reset
        </button>
        <button
          type="button"
          className={`btn ${serviceMode ? 'service-on' : ''}`}
          onClick={() => onChange({ serviceMode: !serviceMode })}
          title="Highlight modular cartridges for servicing"
        >
          {serviceMode ? 'Exit Service Mode' : 'Service Mode'}
        </button>
        {serviceMode && (
          <button type="button" className="btn service-on" onClick={onReplaceCartridges}>
            Replace Cartridges
          </button>
        )}
      </div>

      <label className="slider-label">
        <span>
          Inlet Temperature <strong>{inletTempC.toFixed(0)} °C</strong>
        </span>
        <input
          type="range"
          min={80}
          max={350}
          step={1}
          value={inletTempC}
          onChange={(e) => onChange({ inletTempC: Number(e.target.value) })}
        />
        <span className="range-ends">
          <em>80</em>
          <em>350</em>
        </span>
      </label>

      <label className="slider-label">
        <span>
          Contamination Load <strong>{(contaminationLoad * 100).toFixed(0)}%</strong>
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={contaminationLoad}
          onChange={(e) => onChange({ contaminationLoad: Number(e.target.value) })}
        />
        <span className="range-ends">
          <em>Clean</em>
          <em>Heavy</em>
        </span>
      </label>

      <label className="slider-label">
        <span>
          Fan Speed (ALLOY FAN COOLING) <strong>{fanSpeedPct.toFixed(0)}%</strong>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={fanSpeedPct}
          onChange={(e) => onChange({ fanSpeedPct: Number(e.target.value) })}
        />
        <span className="range-ends">
          <em>Idle</em>
          <em>Max</em>
        </span>
      </label>

      <p className="hint">
        Heat Sink 1 (lubricant oil) + Heat Sink 2 (alloy fan) dominate cooling. Charcoal
        nano-material + 6-layer synthetic array dominate graded filtration. Service Mode undocks
        Self-Sealing Docking / cartridges — ENGINEERED FOR MODULAR SERVICE.
      </p>
    </section>
  );
}
