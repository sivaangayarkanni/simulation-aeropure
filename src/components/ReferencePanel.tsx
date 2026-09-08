interface Props {
  open: boolean;
  onClose: () => void;
  mode?: 'lightbox' | 'split';
}

export function ReferencePanel({ open, onClose, mode = 'lightbox' }: Props) {
  if (!open && mode === 'lightbox') return null;

  if (mode === 'split') {
    return (
      <aside className="reference-split panel">
        <div className="ref-head">
          <h2>Concept Diagram</h2>
          <span className="ref-sub">Source of truth · public/concept-diagram.png</span>
        </div>
        <div className="ref-frame">
          <img
            src="/concept-diagram.png"
            alt="MODULAR MULTI-STAGE EXHAUST FILTRATION SYSTEM: AeroPure™ Concept — ENGINEERED FOR MODULAR SERVICE"
          />
        </div>
      </aside>
    );
  }

  return (
    <div className="lightbox" role="dialog" aria-label="Concept diagram lightbox" onClick={onClose}>
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-bar">
          <strong>MODULAR MULTI-STAGE EXHAUST FILTRATION SYSTEM · AeroPure™ Concept</strong>
          <button type="button" className="btn icon" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <img
          src="/concept-diagram.png"
          alt="AeroPure modular multi-stage exhaust filtration engineering diagram"
        />
        <p className="lightbox-caption">ENGINEERED FOR MODULAR SERVICE</p>
      </div>
    </div>
  );
}
