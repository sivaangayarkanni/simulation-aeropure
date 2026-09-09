import type { ControlsState, SystemMetrics } from '../lib/types';
import { PORTS, STAGES } from '../lib/stages';

interface Props {
  controls: ControlsState;
  metrics: SystemMetrics;
  onChange: (patch: Partial<ControlsState>) => void;
  onReplaceCartridges: () => void;
}

export function ServiceModeView({
  controls,
  metrics,
  onChange,
  onReplaceCartridges,
}: Props) {
  const active = controls.serviceMode;

  return (
    <div className="service-view">
      <div className="service-hero glass">
        <h2>Service Mode — ENGINEERED FOR MODULAR SERVICE</h2>
        <p>
          Self-sealing docking and quick-disconnect couplings enable hazard-free cartridge swaps in
          minutes — no toxic exposure, no welded teardowns. Ideal for fleets and MSME genset
          operators.
        </p>
        <div className="control-row buttons">
          <button
            type="button"
            className={`btn ${active ? 'service-on' : 'primary'}`}
            onClick={() => onChange({ serviceMode: !active })}
          >
            {active ? 'Exit Service Mode' : 'Enter Service Mode'}
          </button>
          <button
            type="button"
            className="btn service-on"
            disabled={!active}
            onClick={onReplaceCartridges}
          >
            Replace Cartridges
          </button>
        </div>
      </div>

      <div className="service-grid">
        <article className="intel-card glass">
          <h3>{PORTS.docking}</h3>
          <p>
            Inlet interface seals on undock so exhaust path stays contained during module swap.
            Highlighted in the 3D scene when Service Mode is on.
          </p>
        </article>
        <article className="intel-card glass">
          <h3>{PORTS.coupling}</h3>
          <p>
            Outlet quick-disconnect for tool-free removal of the synthetic array cartridge and
            fan assembly access.
          </p>
        </article>
        {STAGES.map((s) => {
          const life =
            s.id === 'stage1'
              ? metrics.oilServiceLifePct
              : s.id === 'stage2'
                ? metrics.charcoalServiceLifePct
                : s.id === 'stage4'
                  ? metrics.syntheticServiceLifePct
                  : 100;
          return (
            <article key={s.id} className="intel-card glass">
              <h3>
                {s.shortName}
                <span className="life-pill">{life.toFixed(0)}% life</span>
              </h3>
              <p>{s.moduleName}</p>
              <p className="muted">{s.description}</p>
              <div className="life-bar">
                <div className="life-fill" style={{ width: `${life}%` }} />
              </div>
            </article>
          );
        })}
        <article className="intel-card glass">
          <h3>IoT alerts (deck)</h3>
          <p>
            Real-time sensor diagnostics track filter saturation and temperature, alerting before
            efficiency drops — premium IoT dashboard is a revenue stream for fleet managers.
          </p>
          <ul className="compact">
            <li>Filter load: {metrics.filterLoadingPct.toFixed(1)}%</li>
            <li>ΔP: {metrics.pressureDropPa.toFixed(0)} Pa</li>
            <li>Oil coolant: {metrics.oilCoolantTempC.toFixed(1)} °C</li>
          </ul>
        </article>
      </div>
    </div>
  );
}
