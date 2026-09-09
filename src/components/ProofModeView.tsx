import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SystemMetrics } from '../lib/types';
import {
  POLLUTANT_META,
  PROOF_STEPS,
  buildProofPack,
  type ProofStepSnapshot,
} from '../lib/proofSteps';
import { ParticleMicroscope } from './proof/ParticleMicroscope';
import { ProofCharts } from './proof/ProofCharts';
import { ProofSchematic } from './proof/ProofSchematic';
import { CutawayViz } from './CutawayViz';
import type { ControlsState } from '../lib/types';

type Speed = 0.5 | 1 | 1.5;

interface Props {
  metrics: SystemMetrics;
  controls: ControlsState;
  fanAngle: number;
  oilFlowPhase: number;
  heatShimmerPhase: number;
  oilCoolantTempC: number;
}

const STEP_MS = 3200;

export function ProofModeView({
  metrics,
  controls,
  fanAngle,
  oilFlowPhase,
  heatShimmerPhase,
  oilCoolantTempC,
}: Props) {
  const pack = useMemo(() => buildProofPack(metrics), [metrics]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<Speed>(1);

  const n = pack.steps.length;
  const snap: ProofStepSnapshot = pack.steps[Math.min(stepIndex, n - 1)] ?? pack.steps[0];

  const go = useCallback(
    (dir: -1 | 1) => {
      setStepIndex((i) => {
        const next = i + dir;
        if (next < 0) return 0;
        if (next >= n) {
          setPlaying(false);
          return n - 1;
        }
        return next;
      });
    },
    [n],
  );

  const restart = useCallback(() => {
    setStepIndex(0);
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const ms = STEP_MS / speed;
    const t = window.setTimeout(() => {
      setStepIndex((i) => {
        if (i >= n - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, ms);
    return () => window.clearTimeout(t);
  }, [playing, speed, stepIndex, n]);

  const stageId = snap.step.stageId;

  return (
    <div className="proof-view">
      <header className="proof-hero glass">
        <div>
          <p className="proof-kicker">PROOF MODE · STAGE-BY-STAGE FILTRATION</p>
          <h2>Deep filtration proof-of-concept</h2>
          <p>
            Walk air through AeroPure one layer at a time — thermal sinks, charcoal nano media, alloy
            fan, and six synthetic grades — with live numbers from the physics model.
          </p>
        </div>
        <div className="proof-overall">
          <div className="proof-stat">
            <span>Overall η</span>
            <strong>{pack.overall.efficiencyPct.toFixed(1)}%</strong>
          </div>
          <div className="proof-stat">
            <span>ΔT</span>
            <strong>{pack.overall.deltaT.toFixed(1)} °C</strong>
          </div>
          <div className="proof-stat">
            <span>Outlet T</span>
            <strong>{metrics.outletTempC.toFixed(0)} °C</strong>
          </div>
        </div>
      </header>

      {/* Walkthrough controls */}
      <section className="proof-controls glass">
        <div className="proof-transport">
          <button type="button" className="btn" onClick={() => go(-1)} disabled={stepIndex <= 0}>
            Prev
          </button>
          <button
            type="button"
            className={`btn primary`}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <button type="button" className="btn" onClick={() => go(1)} disabled={stepIndex >= n - 1}>
            Next
          </button>
          <button type="button" className="btn" onClick={restart}>
            Restart
          </button>
        </div>
        <div className="proof-speed" role="group" aria-label="Walkthrough speed">
          {([0.5, 1, 1.5] as Speed[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`btn shell-mode ${speed === s ? 'active' : ''}`}
              onClick={() => setSpeed(s)}
            >
              {s}x
            </button>
          ))}
        </div>
        <div className="proof-step-meta">
          <span className="proof-step-num">
            Step {stepIndex + 1} / {n}
          </span>
          <strong>{snap.step.title}</strong>
        </div>
      </section>

      {/* Step rail */}
      <nav className="proof-rail" aria-label="Proof steps">
        {PROOF_STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`proof-rail-btn ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'done' : ''}`}
            onClick={() => {
              setStepIndex(i);
              setPlaying(false);
            }}
            title={s.title}
          >
            <span className="rail-idx">{i + 1}</span>
            <span className="rail-label">{s.shortTitle}</span>
          </button>
        ))}
      </nav>

      {/* Focus schematic + cutaway */}
      <ProofSchematic
        focusId={snap.step.focusId}
        snap={snap}
        fanRpm={pack.overall.fanRpm}
        oilTempC={pack.overall.oilCoolantTempC}
      />

      <div className="proof-cutaway-wrap glass">
        <div className="proof-cutaway-label">
          Module cutaway · highlighting{' '}
          <strong>{snap.step.shortTitle}</strong>
        </div>
        <div className="proof-cutaway-inner">
          <CutawayViz
            metrics={metrics}
            controls={controls}
            selectedStageId={stageId}
            onSelectStage={() => {}}
            fanAngle={fanAngle}
            oilFlowPhase={oilFlowPhase}
            heatShimmerPhase={heatShimmerPhase}
            oilCoolantTempC={oilCoolantTempC}
          />
        </div>
      </div>

      {/* Captions + live numbers */}
      <section className="proof-caption-grid">
        <article className="proof-caption glass">
          <h3>Plain language</h3>
          <p>{snap.step.plainCaption}</p>
          {snap.step.role && <p className="role-tag">Role: {snap.step.role}</p>}
        </article>
        <article className="proof-caption glass tech">
          <h3>Technical</h3>
          <p>{snap.step.techCaption}</p>
        </article>
        <article className="proof-caption glass numbers">
          <h3>Live physics</h3>
          <ul className="proof-live-list">
            {Object.entries(snap.extras).map(([k, v]) => (
              <li key={k}>
                <span>{k}</span>
                <strong>{v}</strong>
              </li>
            ))}
            <li>
              <span>Before → After dust</span>
              <strong>
                {snap.conc.before.largeDust.toFixed(0)} → {snap.conc.after.largeDust.toFixed(0)}
              </strong>
            </li>
            <li>
              <span>Before → After PM2.5</span>
              <strong>
                {snap.conc.before.pm25.toFixed(0)} → {snap.conc.after.pm25.toFixed(0)}
              </strong>
            </li>
            <li>
              <span>Cumulative η</span>
              <strong>{(snap.cumulativeEfficiency * 100).toFixed(1)}%</strong>
            </li>
          </ul>
        </article>
      </section>

      {/* Particle microscope */}
      <section className="proof-microscope">
        <h3 className="proof-section-title">Particle microscope</h3>
        <div className="proof-scope-split">
          <ParticleMicroscope
            title="Inlet cloud"
            subtitle="System inlet — hot, particulate-laden"
            conc={pack.overall.inletConc}
            tone="hot"
            running={playing || controls.status === 'running'}
          />
          <div className="proof-scope-arrow" aria-hidden>
            <span>→</span>
            <small>after this step</small>
          </div>
          <ParticleMicroscope
            title="Current stage outlet"
            subtitle={`Cumulative after: ${snap.step.shortTitle}`}
            conc={snap.conc.after}
            tone={stepIndex >= n - 1 ? 'cool' : 'mid'}
            running={playing || controls.status === 'running'}
          />
        </div>
        <div className="proof-ba-table glass">
          <h4>Before → after concentrations</h4>
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Before</th>
                <th>After</th>
                <th>Removed</th>
                <th>Capture</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(POLLUTANT_META) as (keyof typeof POLLUTANT_META)[]).map((k) => (
                <tr key={k}>
                  <td>
                    <i className="swatch" style={{ background: POLLUTANT_META[k].color }} />
                    {POLLUTANT_META[k].label}
                  </td>
                  <td>
                    {snap.conc.before[k].toFixed(1)} {POLLUTANT_META[k].unit}
                  </td>
                  <td>
                    {snap.conc.after[k].toFixed(1)} {POLLUTANT_META[k].unit}
                  </td>
                  <td>{snap.conc.removed[k].toFixed(1)}</td>
                  <td>{(snap.conc.removalFrac[k] * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Charts */}
      <section>
        <h3 className="proof-section-title">Per-layer proof charts</h3>
        <ProofCharts pack={pack} activeStepIndex={stepIndex} />
      </section>

      {/* Outlet summary callout when on last step */}
      {stepIndex === n - 1 && (
        <section className="proof-outlet-summary glass">
          <h3>Purified outlet — proof summary</h3>
          <div className="proof-outlet-grid">
            <div>
              <span>Filtration efficiency</span>
              <strong>{pack.overall.efficiencyPct.toFixed(1)}%</strong>
            </div>
            <div>
              <span>Cooling ΔT</span>
              <strong>{pack.overall.deltaT.toFixed(1)} °C</strong>
            </div>
            <div>
              <span>Outlet dust</span>
              <strong>{pack.overall.outletConc.largeDust.toFixed(1)} µg/m³</strong>
            </div>
            <div>
              <span>Outlet PM2.5</span>
              <strong>{pack.overall.outletConc.pm25.toFixed(1)} µg/m³</strong>
            </div>
            <div>
              <span>Outlet odor</span>
              <strong>{pack.overall.outletConc.odorIndex.toFixed(1)}</strong>
            </div>
            <div>
              <span>Fan / Oil</span>
              <strong>
                {pack.overall.fanRpm} RPM · {pack.overall.oilCoolantTempC.toFixed(0)} °C
              </strong>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
