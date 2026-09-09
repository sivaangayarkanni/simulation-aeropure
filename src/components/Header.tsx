import { PRODUCT_META } from '../lib/knowledgeBase';
import { SYSTEM_CONCEPT, SYSTEM_TAGLINE, SYSTEM_TITLE } from '../lib/stages';

type TabId = 'simulation' | 'proof' | 'intelligence' | 'service';

interface Props {
  onOpenDiagram: () => void;
  onToggleAgents: () => void;
  agentsOpen: boolean;
  tab: TabId;
  onTab: (t: TabId) => void;
}

export function Header({ onOpenDiagram, onToggleAgents, agentsOpen, tab, onTab }: Props) {
  return (
    <header className="ap-header">
      <div className="ap-brand">
        <div className="ap-logo" aria-hidden>
          <svg viewBox="0 0 48 48" width="44" height="44">
            <defs>
              <linearGradient id="ag" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="45%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>
              <linearGradient id="agHot" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="22" fill="url(#ag)" opacity="0.2" />
            <path d="M24 6 L38 38 H30 L26 28 H22 L18 38 H10 Z" fill="url(#ag)" />
            <path
              d="M12 20 Q24 14 36 20"
              fill="none"
              stroke="#fb923c"
              strokeWidth="2"
              opacity="0.85"
            />
            <path
              d="M14 24 Q24 19 34 24"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
              opacity="0.75"
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
            {PRODUCT_META.tagline}
          </p>
        </div>
      </div>

      <nav className="ap-tabs" aria-label="Primary">
        {(
          [
            ['simulation', 'Simulation'],
            ['proof', 'Proof Mode'],
            ['intelligence', 'Product Intelligence'],
            ['service', 'Service Mode'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab-btn ${tab === id ? 'active' : ''}`}
            onClick={() => onTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="ap-header-actions">
        <button type="button" className={`btn ${agentsOpen ? 'primary' : ''}`} onClick={onToggleAgents}>
          {agentsOpen ? 'Hide Agents' : 'Knowledge Agents'}
        </button>
        <button type="button" className="btn" onClick={onOpenDiagram}>
          Concept Diagram
        </button>
        <div className="ap-badge">MSME Hackathon 6.0 · v3</div>
      </div>
    </header>
  );
}
