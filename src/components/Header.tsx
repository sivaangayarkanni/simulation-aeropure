import {
  SYSTEM_CONCEPT,
  SYSTEM_TAGLINE,
  SYSTEM_TITLE,
} from '../lib/stages';

interface Props {
  onOpenDiagram: () => void;
  splitView: boolean;
  onToggleSplit: () => void;
}

export function Header({ onOpenDiagram, splitView, onToggleSplit }: Props) {
  return (
    <header className="ap-header">
      <div className="ap-brand">
        <div className="ap-logo" aria-hidden>
          <svg viewBox="0 0 48 48" width="44" height="44">
            <defs>
              <linearGradient id="ag" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3aa0ff" />
                <stop offset="100%" stopColor="#0d4f9e" />
              </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="22" fill="url(#ag)" opacity="0.15" />
            <path d="M24 6 L38 38 H30 L26 28 H22 L18 38 H10 Z" fill="url(#ag)" />
            <path
              d="M12 20 Q24 14 36 20"
              fill="none"
              stroke="#5eb0ff"
              strokeWidth="2"
              opacity="0.8"
            />
            <path
              d="M14 24 Q24 19 34 24"
              fill="none"
              stroke="#8ec8ff"
              strokeWidth="1.5"
              opacity="0.6"
            />
          </svg>
        </div>
        <div className="ap-titles">
          <p className="ap-engineered">{SYSTEM_TAGLINE}</p>
          <h1>
            {SYSTEM_TITLE}
            <span className="ap-concept"> · {SYSTEM_CONCEPT}</span>
          </h1>
          <p className="ap-tagline">
            Purification System Simulation · AeroPure<sup>®</sup> · Interactive cutaway
          </p>
        </div>
      </div>
      <div className="ap-header-actions">
        <button type="button" className="btn" onClick={onToggleSplit}>
          {splitView ? 'Hide Diagram' : 'Split: Sim | Diagram'}
        </button>
        <button type="button" className="btn primary" onClick={onOpenDiagram}>
          Concept Diagram
        </button>
        <div className="ap-badge">CONCEPT SIM · v2.0</div>
      </div>
    </header>
  );
}
