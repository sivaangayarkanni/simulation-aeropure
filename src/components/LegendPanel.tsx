import { SYSTEM_ADVANTAGES } from '../lib/stages';
import type { SystemMetrics } from '../lib/types';

interface Props {
  metrics: SystemMetrics;
  serviceMode: boolean;
}

export function LegendPanel({ metrics, serviceMode }: Props) {
  return (
    <section className="panel legend-panel">
      <h2>Legend &amp; Summary</h2>
      <div className="legend-advantages">
        <strong>SYSTEM ADVANTAGES:</strong> {SYSTEM_ADVANTAGES}
      </div>
      <div className="legend-grid">
        <div>
          <span>Oil cartridge life</span>
          <strong>{metrics.oilServiceLifePct.toFixed(0)}%</strong>
        </div>
        <div>
          <span>Charcoal cartridge life</span>
          <strong>{metrics.charcoalServiceLifePct.toFixed(0)}%</strong>
        </div>
        <div>
          <span>Synthetic array life</span>
          <strong>{metrics.syntheticServiceLifePct.toFixed(0)}%</strong>
        </div>
        <div>
          <span>Filter loading / clog</span>
          <strong>{metrics.filterLoadingPct.toFixed(0)}%</strong>
        </div>
      </div>
      {serviceMode && (
        <p className="service-note">
          <strong>ENGINEERED FOR MODULAR SERVICE</strong> — Self-Sealing Docking, oil cartridge,
          charcoal cartridge, and synthetic array are highlighted as replaceable modules. Use
          Replace Cartridges to reset service life.
        </p>
      )}
    </section>
  );
}
