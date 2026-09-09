/**
 * Vercel serverless simulation backend surface.
 * GET  -> default scenario params + a computed tick snapshot
 * POST -> { inletTemp, contamination, fanSpeed } -> outlet metrics
 *
 * Mirrors the educational physics in src/lib/physics.ts (simplified, self-contained).
 */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;

function inletConcentrations(load) {
  return {
    largeDust: lerp(30, 1200, load),
    pm10: lerp(20, 850, load),
    pm25: lerp(10, 420, load),
    fine: lerp(5, 280, load),
    odorIndex: lerp(5, 95, load),
  };
}

function applyCapture(c, capture, health = 1) {
  const h = clamp(health, 0.15, 1);
  return {
    largeDust: c.largeDust * (1 - capture.largeDust * h),
    pm10: c.pm10 * (1 - capture.pm10 * h),
    pm25: c.pm25 * (1 - capture.pm25 * h),
    fine: c.fine * (1 - capture.fine * h),
    odorIndex: c.odorIndex * (1 - capture.odorIndex * h),
  };
}

function overallRemoval(inlet, outlet) {
  const keys = ['largeDust', 'pm10', 'pm25', 'fine', 'odorIndex'];
  let removed = 0;
  let total = 0;
  for (const k of keys) {
    total += inlet[k];
    removed += inlet[k] - outlet[k];
  }
  if (total <= 0) return 1;
  return clamp(removed / total, 0, 1);
}

function computeTick({ inletTemp = 220, contamination = 0.65, fanSpeed = 55, elapsedSec = 0 }) {
  const fanFrac = clamp(fanSpeed, 0, 100) / 100;
  const load = clamp(contamination, 0, 1);
  const inletTempC = clamp(inletTemp, 80, 350);
  const fanRpm = Math.round(lerp(800, 4200, fanFrac));
  const loadingFrac = clamp(elapsedSec / 900, 0, 1) * (0.4 + load * 0.6);
  const filterLoadingPct = loadingFrac * 100;

  const airflowM3h =
    lerp(180, 920, fanFrac) *
    (0.88 + 0.12 * (1 - load * 0.25)) *
    (1 - loadingFrac * 0.18);

  let conc = inletConcentrations(load);
  const inletConc = { ...conc };
  let temp = inletTempC;
  let pressureDropPa = 45 + loadingFrac * 80;

  const oilHealth = clamp(1 - elapsedSec / 2400, 0.25, 1);
  const charcoalHealth = clamp(1 - elapsedSec / 1800, 0.2, 1);
  const syntheticHealth = clamp(1 - elapsedSec / 1600, 0.2, 1);

  const oilEffectiveness = (0.42 + 0.1 * (1 - load * 0.2)) * oilHealth;
  temp = temp - (temp - 35) * oilEffectiveness;
  pressureDropPa += 28 + loadingFrac * 12;
  conc = applyCapture(conc, { largeDust: 0.04, pm10: 0.02, pm25: 0.01, fine: 0.005, odorIndex: 0.03 });
  const stage1Temp = temp;

  conc = applyCapture(
    conc,
    { largeDust: 0.72, pm10: 0.62, pm25: 0.4, fine: 0.3, odorIndex: 0.52 },
    charcoalHealth,
  );
  temp = temp - 3 * (temp > 60 ? 1 : 0.3);
  pressureDropPa += (95 + load * 40) * (1 + loadingFrac * 0.55);

  const fanCoolFrac = (0.18 + 0.45 * fanFrac) * (0.9 + 0.1 * oilHealth);
  temp = temp - (temp - 28) * fanCoolFrac;
  pressureDropPa += 35 + fanFrac * 55;
  conc = applyCapture(conc, { largeDust: 0.01, pm10: 0.01, pm25: 0.01, fine: 0.01, odorIndex: 0.01 });

  conc = applyCapture(
    conc,
    { largeDust: 0.85, pm10: 0.88, pm25: 0.9, fine: 0.86, odorIndex: 0.78 },
    syntheticHealth,
  );
  temp = temp - 1.5;
  pressureDropPa += (140 + load * 60 + fanFrac * 25) * (1 + loadingFrac * 0.7);

  const outletTempC = clamp(temp, 18, inletTempC);
  const oilCoolantTempC = clamp(
    38 + (inletTempC - stage1Temp) * 0.55 + load * 8 + filterLoadingPct * 0.12,
    30,
    160,
  );

  return {
    inletTempC,
    outletTempC,
    deltaT: inletTempC - outletTempC,
    inletConc,
    outletConc: conc,
    filtrationEfficiencyPct: overallRemoval(inletConc, conc) * 100,
    pressureDropPa,
    airflowM3h,
    fanRpm,
    elapsedSec,
    filterLoadingPct,
    oilCoolantTempC,
    oilServiceLifePct: oilHealth * 100,
    charcoalServiceLifePct: charcoalHealth * 100,
    syntheticServiceLifePct: syntheticHealth * 100,
  };
}

const DEFAULTS = {
  status: 'running',
  inletTempC: 220,
  contaminationLoad: 0.65,
  fanSpeedPct: 55,
  serviceMode: false,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    const snapshot = computeTick({
      inletTemp: DEFAULTS.inletTempC,
      contamination: DEFAULTS.contaminationLoad,
      fanSpeed: DEFAULTS.fanSpeedPct,
      elapsedSec: 0,
    });
    res.status(200).json({
      ok: true,
      engine: 'aeropure-sim-state',
      defaults: DEFAULTS,
      snapshot,
      scenario: {
        name: 'AeroPure modular multi-stage default',
        notes:
          'Educational physics mirror of client simEngine. Client remains authoritative for live tick; this validates outlet metrics.',
      },
    });
    return;
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};
    const inletTemp = Number(body.inletTemp ?? body.inletTempC ?? DEFAULTS.inletTempC);
    const contamination = Number(body.contamination ?? body.contaminationLoad ?? DEFAULTS.contaminationLoad);
    const fanSpeed = Number(body.fanSpeed ?? body.fanSpeedPct ?? DEFAULTS.fanSpeedPct);
    const elapsedSec = Number(body.elapsedSec ?? 0);

    const metrics = computeTick({ inletTemp, contamination, fanSpeed, elapsedSec });
    res.status(200).json({
      ok: true,
      controls: { inletTemp, contamination, fanSpeed, elapsedSec },
      metrics,
    });
    return;
  }

  res.status(405).json({ ok: false, error: 'Method not allowed' });
};
