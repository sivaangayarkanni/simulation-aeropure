/**
 * AeroPure product knowledge base — grounded exclusively in the MSME Idea Hackathon 6.0 deck.
 * Source: public/product-deck.txt / product-deck.pdf
 * Agents MUST cite section ids; never invent conflicting specs.
 */

export interface KnowledgeSection {
  id: string;
  title: string;
  keywords: string[];
  content: string;
}

export interface AgentDef {
  id: string;
  name: string;
  role: string;
  specialty: string;
  accent: string;
  suggestedPrompts: string[];
  sectionIds: string[];
}

export const PRODUCT_META = {
  title:
    'AeroPure — Transforming Vehicle Exhaust into Clean Air through Dynamic Flow Management and Nano-Scale Molecular Capture',
  shortTitle: 'AeroPure',
  theme: 'Automotive technology',
  event: 'MSME Idea Hackathon 6.0',
  subTheme: 'Smart and Sustainable MSMEs',
  author: {
    name: 'Sivaangayarkanni S',
    designation: 'UG student',
    organization: 'Sri Eshwar College of Engineering',
    location: 'Coimbatore',
  },
  tagline:
    'Modular Filtration, Zero Compromise: Smart Exhaust Purification for Vehicles and MSME.',
  engineeredFor: 'ENGINEERED FOR MODULAR SERVICE',
  sdg: [3, 9, 11] as const,
  trl: 3,
  cogsInr: { min: 5700, max: 8700 },
  lifetimeYears: 10,
} as const;

export const KNOWLEDGE_SECTIONS: KnowledgeSection[] = [
  {
    id: 'problem',
    title: '1. Problem',
    keywords: [
      'problem',
      'pollution',
      'traffic',
      'highway',
      'india',
      'old vehicles',
      'health',
      'environment',
      'dpf',
      'scr',
      'existing',
      'retrofit',
      'portable',
    ],
    content: `Collective vehicle pollution is the core problem — not a single vehicle. On highways pollution is less perceptible than at traffic signals, yet collective exposure remains. In India many older vehicles struggle to comply with modern emission concepts. Government spends heavily on health management, environmental management, and deforestation response.

Existing solutions are aftermath-oriented (treatment after exposure), conventional static Diesel Particulate Filters (ceramic honeycomb soot capture), and Selective Catalytic Replacement/Reduction (SCR) fluid+catalyst NOx systems — expensive and slow to replace. AeroPure does not modify engines; it is a portable external filter fitted outside the engine as a retrofit.`,
  },
  {
    id: 'customers',
    title: '2. Customer Segments',
    keywords: [
      'customer',
      'fleet',
      'logistics',
      'vehicle owner',
      'msme',
      'genset',
      'generator',
      'industrial',
      'diesel',
    ],
    content: `Segment 1 — All Vehicle Owners: commercial fleets, logistics, everyday diesel owners face urban norms, DPF clogging in stop-and-go traffic, and expensive OEM replacement. AeroPure offers cost-effective modular aftermarket with quick-disconnect couplings and real-time dashboard monitoring for hazard-free servicing and less downtime.

Segment 2 — MSME Industries: small manufacturing, commercial complexes, workshops with diesel backup generators or localized industrial exhaust need affordable PCB compliance. AeroPure is compact, low-backpressure, multi-stage — efficient particulate scrubbing and thermal management without wet-scrubber footprint or water use.`,
  },
  {
    id: 'usp',
    title: '3. Unique Value Proposition',
    keywords: [
      'usp',
      'value',
      'benefit',
      'backpressure',
      'cots',
      'modular',
      'docking',
      'pcb',
      'puc',
      'monitoring',
      'tagline',
    ],
    content: `Key benefits: (1) Preventing pollution at very low cost via affordable COTS components and replaceable modular layers. (2) Minimized engine strain & low backpressure — thermal management (heat sinks + fluid cooling) and graded pores keep exhaust flow smooth vs soot-choking static filters. (3) Rapid hazard-free modular servicing — self-sealing docking + quick-disconnect swaps in minutes without toxic exposure.

Differentiators: PCB/PUC compliance readiness; multi-stage active thermal & nano-filtration (oil-cooled heat sinks + nano charcoal + synthetic arrays) outperforming single-stage DPFs under thermal stress; real-time digital monitoring with filter saturation alerts.

Tagline: Modular Filtration, Zero Compromise: Smart Exhaust Purification for Vehicles and MSME.`,
  },
  {
    id: 'competitive',
    title: '4. Competitive Advantage',
    keywords: [
      'competitor',
      'competitive',
      'advantage',
      'size',
      'cost',
      'lifetime',
      'running cost',
      'compare',
    ],
    content: `Feature comparison vs competitors:
• Size: AeroPure small and compact vs larger competitors
• Cost of product: affordable/low vs higher
• Running cost: very low vs very high
• Lifetime: longer (~10 years) vs not applicable for many legacy systems`,
  },
  {
    id: 'solution',
    title: '5. Solution',
    keywords: [
      'solution',
      'overview',
      'sensor',
      'sdg',
      'trl',
      'fit',
      'portable',
      'membrane',
      'nano',
    ],
    content: `Product overview: (1) Multi-stage membrane & nano-filtration — oil-cooled heat sinks, nano-engineered charcoal matrices, graded synthetic arrays. (2) Real-time sensor diagnostics — particulate and temperature monitoring, saturation alerts. (3) Modular service architecture — quick-disconnect + self-sealing docking for safe layer swaps.

Problem–solution fit: easily fitted portable retrofit (no engine architecture change); eliminates urban clogging/backpressure via thermal management + graded pores; affordable modular maintenance vs expensive OEM overhauls.

SDG: 3 (Good Health), 9 (Industry/Innovation), 11 (Sustainable Cities). TRL: 3.`,
  },
  {
    id: 'charcoal-layers',
    title: 'Phase 1 Stage — 3-Layer Charcoal Nano-Material Filter',
    keywords: [
      'charcoal',
      'carbon',
      'zeolite',
      'nano membrane',
      'pore',
      'voc',
      'macro',
      'molecular sieving',
      'layer 1',
      'layer 2',
      'layer 3',
      'nanofiltration',
    ],
    content: `3-Layer Charcoal Nano-Material Filter (Nano-engineered Carbon matrix):
• Layer 1 (Coarse Carbon): large pore network — macro-particles and heavy volatile organic compounds early in the stream.
• Layer 2 (Carbon + Zeolite): medium pores — organic gas adsorption + molecular sieving for medium-sized molecules and gas-phase contaminants.
• Layer 3 (Nano Membrane): small fine pores — high-density barrier against microscopic particulates and complex chemical structures.`,
  },
  {
    id: 'synthetic-layers',
    title: 'Phase 2 Stage — 6-Layer Synthetic Array',
    keywords: [
      'synthetic',
      'pm10',
      'pm2.5',
      'electrostatic',
      'nanofiber',
      'ptfe',
      'microfiber',
      'dust',
      'odor',
      'array',
      'graded',
    ],
    content: `6-Layer Synthetic Array (Precision Graded Pore Structure):
• Layer 1 (Coarse Synthetic Mesh): mechanical pre-filter for large dust removal.
• Layer 2 (Mid / MiddleEm Microfiber): PM10 filtration — dust, pollen, larger mold spores.
• Layer 3 (Electrostatic Filter): static charge traps PM2.5 combustion particles and fine organic compounds.
• Layer 4 (Nanofiber Barrier): tight membrane stopping sub-micron pollutants via mechanical interception.
• Layer 5 (Activated Carbon + Zeolite Composite): secondary gas-phase purification — odors, chemical vapors, toxic gases.
• Layer 6 (PTFE Protective Membrane): durable chemical-resistant PTFE barrier protecting filter array integrity before clean air exits.`,
  },
  {
    id: 'stages-thermal',
    title: 'Thermal Stages & Docking',
    keywords: [
      'heat sink',
      'oil',
      'lubricant',
      'fan',
      'alloy',
      'cooling',
      'docking',
      'quick-disconnect',
      'thermal',
      'backpressure',
      'delta',
    ],
    content: `Architecture: Phase 1 Thermal & Nanofiltration (inlet) → Phase 2 Post-Treatment & Synthetic Array (outlet).

• Stage 1 Heat Sink 1 (Lubricant Oil Cooling): circulating, replaceable lubricant oil through coil/canisters — primary heat extraction.
• Charcoal nano filter (3 layers) after oil cooling.
• Stage Heat Sink 2 (Alloy Fan Cooling): alloy fan secondary cooling + flow drive.
• 6-layer synthetic array, then purified air outlet.
• Self-Sealing Docking Mechanism at inlet; Quick-Disconnect Coupling at outlet — ENGINEERED FOR MODULAR SERVICE.`,
  },
  {
    id: 'channels',
    title: '6. Channels',
    keywords: [
      'channel',
      'distribution',
      'garage',
      'aftermarket',
      'workshop',
      'b2b',
      'sales',
      'dealer',
    ],
    content: `Acquisition channels: (1) Automobile service centers & aftermarket stores during maintenance/PUC. (2) Hardware & industrial equipment suppliers for MSME gensets. (3) Automotive repair workshops & fabricators for install/swap with quick-disconnect. (4) Direct sales & B2B fleets — logistics, delivery fleets, industrial pilots.`,
  },
  {
    id: 'revenue',
    title: '7. Revenue Streams',
    keywords: [
      'revenue',
      'hardware',
      'cartridge',
      'subscription',
      'iot',
      'dashboard',
      'recurring',
      'money',
      'pricing',
    ],
    content: `Revenue: (1) Direct hardware unit sales. (2) Modular filter cartridge replacements (recurring). (3) B2B fleet maintenance subscriptions / bulk packages. (4) Value-added IoT dashboard / diagnostics upgrades — analytics and automated maintenance alerts.`,
  },
  {
    id: 'costs',
    title: '8. Cost Structure',
    keywords: [
      'cost',
      'cogs',
      'rupee',
      '₹',
      'budget',
      'production',
      'casing',
      'price',
    ],
    content: `Phase 1: Heat Sink & Lubricant Cooling ₹1,200–₹1,800; 3-Layer Charcoal (budget) ₹800–₹1,200 (Coarse Carbon ₹150–250; Carbon+Zeolite ₹300–450; Fine mesh barrier ₹350–500).

Phase 2: Alloy fan cooling ₹900–₹1,400; 6-Layer Synthetic ₹1,500–₹2,300 (mesh ₹100–150; microfiber ₹150–250; electrostatic ₹250–350; fine barrier ₹300–450; adsorption ₹400–600; protective backing ₹300–500).

External: Docking & couplings ₹700–₹1,100; Casing & assembly ₹600–₹900.

Total estimated COGS: ₹5,700 – ₹8,700 per unit (low-cost COTS production).`,
  },
  {
    id: 'kpis',
    title: '9. Key Metrics',
    keywords: ['kpi', 'metric', 'retention', 'margin', 'compliance', 'recurring'],
    content: `Customer KPIs: retention & replacement rate (cartridge returns); emission compliance success (% passing PCB/PUC tests). Financial KPIs: gross profit margin on COTS COGS; recurring revenue share from cartridges + subscriptions.`,
  },
  {
    id: 'moat',
    title: '10. Unfair Advantage',
    keywords: [
      'moat',
      'unfair',
      'advantage',
      'switching',
      'scalability',
      'proprietary',
      'ecosystem',
    ],
    content: `Strategic assets: proprietary modular architecture (self-sealing docking + quick-disconnect tool-free swaps vs welded non-serviceable filters); integrated dual-phase thermal & nano-filtration (oil heat sinks + nano-charcoal + graded synthetic) with low backpressure.

Long-term defensibility: low-cost COTS scalability (entry barrier on cost); high switching costs once fleets/MSMEs adopt modular housing and proprietary consumable cartridges.`,
  },
];

export const AGENTS: AgentDef[] = [
  {
    id: 'thermo',
    name: 'ThermoAgent',
    role: 'Thermal & Flow Systems',
    specialty:
      'Heat Sink 1 lubricant oil cooling, Heat Sink 2 alloy fan, ΔT, backpressure, airflow',
    accent: '#ff8a4c',
    suggestedPrompts: [
      'How do Heat Sink 1 and the lubricant oil loop reduce exhaust temperature?',
      'Why does AeroPure claim lower backpressure than static DPFs?',
      'How does alloy fan speed affect ΔT and flow?',
    ],
    sectionIds: ['stages-thermal', 'usp', 'solution', 'problem'],
  },
  {
    id: 'nano',
    name: 'NanoFilterAgent',
    role: 'Filtration Science',
    specialty:
      'Charcoal + synthetic layers, pore classes, PM10/PM2.5, VOC, PTFE',
    accent: '#5eb0ff',
    suggestedPrompts: [
      'Explain the 3 charcoal layers and their pore classes.',
      'How does the 6-layer synthetic array capture PM10 and PM2.5?',
      'What does the PTFE Protective Membrane do?',
    ],
    sectionIds: ['charcoal-layers', 'synthetic-layers', 'solution', 'usp'],
  },
  {
    id: 'compliance',
    name: 'ComplianceAgent',
    role: 'Norms & Policy',
    specialty: 'PCB/PUC, SDG 3/9/11, TRL 3, India retrofit & MSME Hackathon context',
    accent: '#4ade80',
    suggestedPrompts: [
      'How does AeroPure support PCB and PUC compliance in India?',
      'Which SDGs and TRL does the deck claim?',
      'Why is a portable retrofit suited to older Indian vehicles?',
    ],
    sectionIds: ['usp', 'solution', 'problem', 'customers', 'kpis'],
  },
  {
    id: 'business',
    name: 'BusinessAgent',
    role: 'Go-to-Market',
    specialty: 'USP, COGS ₹5,700–₹8,700, revenue, competitive table, channels, moat',
    accent: '#c084fc',
    suggestedPrompts: [
      'What is the COGS range and major cost buckets?',
      'List revenue streams and distribution channels.',
      'Summarize the competitive advantage table and unfair moat.',
    ],
    sectionIds: ['usp', 'competitive', 'revenue', 'costs', 'channels', 'moat', 'kpis'],
  },
  {
    id: 'service',
    name: 'ServiceAgent',
    role: 'Modular Service & IoT',
    specialty:
      'Self-sealing docking, quick-disconnect, cartridges, IoT alerts, hazard-free swaps',
    accent: '#fbbf24',
    suggestedPrompts: [
      'How do self-sealing docking and quick-disconnect enable modular swaps?',
      'What recurring cartridge and IoT offerings exist?',
      'Walk through Service Mode for fleet technicians.',
    ],
    sectionIds: ['usp', 'stages-thermal', 'revenue', 'customers', 'moat', 'solution'],
  },
];

export function getAgent(id: string): AgentDef | undefined {
  return AGENTS.find((a) => a.id === id);
}

function scoreSection(section: KnowledgeSection, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  for (const kw of section.keywords) {
    if (q.includes(kw.toLowerCase())) score += 2;
  }
  const words = q.split(/\W+/).filter((w) => w.length > 3);
  for (const w of words) {
    if (section.content.toLowerCase().includes(w)) score += 1;
    if (section.title.toLowerCase().includes(w)) score += 1.5;
  }
  return score;
}

export function retrieveSections(
  agentId: string,
  message: string,
  limit = 4,
): KnowledgeSection[] {
  const agent = getAgent(agentId);
  const pool = agent
    ? KNOWLEDGE_SECTIONS.filter((s) => agent.sectionIds.includes(s.id))
    : KNOWLEDGE_SECTIONS;
  const ranked = [...pool]
    .map((s) => ({ s, score: scoreSection(s, message) }))
    .sort((a, b) => b.score - a.score);
  const top = ranked.filter((r) => r.score > 0).slice(0, limit).map((r) => r.s);
  if (top.length === 0) {
    return pool.slice(0, Math.min(3, pool.length));
  }
  return top;
}

export interface AgentAnswer {
  agentId: string;
  agentName: string;
  markdown: string;
  citedSections: { id: string; title: string }[];
  source: 'api' | 'client';
}

export function answerFromKnowledge(
  agentId: string,
  message: string,
  simSnapshot?: Record<string, unknown> | null,
  source: 'api' | 'client' = 'client',
): AgentAnswer {
  const agent = getAgent(agentId) ?? AGENTS[0];
  const sections = retrieveSections(agent.id, message);
  const cited = sections.map((s) => ({ id: s.id, title: s.title }));

  const simBlock =
    simSnapshot && typeof simSnapshot === 'object'
      ? `\n\n**Live sim context (educational):** ${summarizeSim(simSnapshot)}`
      : '';

  const body = sections
    .map((s) => `### ${s.title}\n${s.content.trim()}`)
    .join('\n\n');

  const markdown = [
    `**${agent.name}** — ${agent.role}`,
    '',
    `_Grounded in AeroPure deck sections: ${cited.map((c) => c.title).join('; ')}._`,
    '',
    `Regarding: *${message.trim() || 'overview'}*`,
    '',
    body,
    simBlock,
    '',
    `---`,
    `*Source of truth: MSME Idea Hackathon 6.0 product deck · ${PRODUCT_META.author.name}, ${PRODUCT_META.author.organization}. Specs not in the deck are not invented.*`,
  ]
    .filter((line) => line !== undefined)
    .join('\n');

  return {
    agentId: agent.id,
    agentName: agent.name,
    markdown,
    citedSections: cited,
    source,
  };
}

function summarizeSim(snap: Record<string, unknown>): string {
  const parts: string[] = [];
  const num = (k: string, label: string, unit = '') => {
    const v = snap[k];
    if (typeof v === 'number' && Number.isFinite(v)) {
      parts.push(`${label} ${v.toFixed(1)}${unit}`);
    }
  };
  num('inletTempC', 'inlet', '°C');
  num('outletTempC', 'outlet', '°C');
  num('deltaT', 'ΔT', '°C');
  num('filtrationEfficiencyPct', 'eff', '%');
  num('pressureDropPa', 'ΔP', ' Pa');
  num('fanRpm', 'fan', ' rpm');
  num('filterLoadingPct', 'load', '%');
  return parts.length ? parts.join(' · ') : 'snapshot attached';
}
