import { PRODUCT_META } from '../lib/knowledgeBase';

export function ProductIntelligence() {
  return (
    <div className="intel-grid">
      <article className="intel-card glass">
        <h3>Problem</h3>
        <p>
          Collective vehicle pollution — especially visible at traffic signals — drives government
          health and environmental costs. Older Indian vehicles struggle with modern norms. Existing
          static DPFs and SCR are expensive aftermath tech. AeroPure is a <strong>portable external
          retrofit</strong> with no engine modification.
        </p>
      </article>

      <article className="intel-card glass">
        <h3>Customers</h3>
        <ul>
          <li>
            <strong>Vehicle owners / fleets / logistics</strong> — urban norms, DPF clogging,
            OEM cost, downtime.
          </li>
          <li>
            <strong>MSME industries</strong> — diesel gensets / industrial exhaust needing PCB
            compliance without wet-scrubber footprint.
          </li>
        </ul>
      </article>

      <article className="intel-card glass accent">
        <h3>USP</h3>
        <p className="tagline-quote">“{PRODUCT_META.tagline}”</p>
        <ul>
          <li>Low-cost COTS modular layers</li>
          <li>Low backpressure + dual-phase thermal management</li>
          <li>Self-sealing docking + quick-disconnect hazard-free swaps</li>
          <li>PCB / PUC compliance posture</li>
          <li>Multi-stage thermal + nano capture</li>
          <li>Real-time digital monitoring</li>
        </ul>
      </article>

      <article className="intel-card glass">
        <h3>Competitive edge</h3>
        <table className="intel-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>AeroPure</th>
              <th>Competitor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Size</td>
              <td>Small &amp; compact</td>
              <td>Larger</td>
            </tr>
            <tr>
              <td>Cost</td>
              <td>Affordable / low</td>
              <td>Higher</td>
            </tr>
            <tr>
              <td>Running cost</td>
              <td>Very low</td>
              <td>Very high</td>
            </tr>
            <tr>
              <td>Lifetime</td>
              <td>~{PRODUCT_META.lifetimeYears} years</td>
              <td>N/A</td>
            </tr>
          </tbody>
        </table>
      </article>

      <article className="intel-card glass">
        <h3>Cost structure (COGS)</h3>
        <p className="big-stat">
          ₹{PRODUCT_META.cogsInr.min.toLocaleString('en-IN')} – ₹
          {PRODUCT_META.cogsInr.max.toLocaleString('en-IN')}
          <small> per unit</small>
        </p>
        <ul className="compact">
          <li>Heat Sink 1 oil module ₹1,200–1,800</li>
          <li>Charcoal ×3 ₹800–1,200</li>
          <li>Alloy fan ₹900–1,400</li>
          <li>Synthetic ×6 ₹1,500–2,300</li>
          <li>Docking / casing ₹1,300–2,000</li>
        </ul>
      </article>

      <article className="intel-card glass">
        <h3>Revenue &amp; channels</h3>
        <p>
          Hardware units · cartridge replacements · B2B fleet subscriptions · IoT dashboard
          upgrades. Channels: service centers, industrial suppliers, workshops, direct B2B fleets.
        </p>
      </article>

      <article className="intel-card glass">
        <h3>SDG &amp; TRL</h3>
        <div className="sdg-row">
          {PRODUCT_META.sdg.map((n) => (
            <span key={n} className="sdg-pill">
              SDG {n}
            </span>
          ))}
          <span className="sdg-pill trl">TRL {PRODUCT_META.trl}</span>
        </div>
        <p>
          {PRODUCT_META.event} · {PRODUCT_META.subTheme}. Author:{' '}
          {PRODUCT_META.author.name}, {PRODUCT_META.author.designation},{' '}
          {PRODUCT_META.author.organization}, {PRODUCT_META.author.location}.
        </p>
      </article>

      <article className="intel-card glass">
        <h3>Unfair advantage</h3>
        <ul>
          <li>Modular moat — self-sealing docking + quick-disconnect</li>
          <li>Dual-phase thermal + nano filtration in one compact unit</li>
          <li>COTS scalability keeps COGS low</li>
          <li>Switching costs via proprietary cartridge ecosystem</li>
        </ul>
      </article>

      <article className="intel-card glass diagram-card">
        <h3>Concept diagram</h3>
        <a href="/concept-diagram.png" target="_blank" rel="noreferrer">
          <img src="/concept-diagram.png" alt="AeroPure modular multi-stage concept diagram" />
        </a>
        <p>
          Full deck:{' '}
          <a href="/product-deck.pdf" target="_blank" rel="noreferrer">
            product-deck.pdf
          </a>{' '}
          ·{' '}
          <a href="/product-deck.txt" target="_blank" rel="noreferrer">
            product-deck.txt
          </a>
        </p>
      </article>
    </div>
  );
}
