# AeroPure — Modular Multi-Stage Exhaust Filtration (v3)

Competition-ready **3D simulation**, **deck-grounded knowledge agents**, and **Vercel serverless APIs** for **AeroPure**: *Transforming Vehicle Exhaust into Clean Air through Dynamic Flow Management and Nano-Scale Molecular Capture*.

**MSME Idea Hackathon 6.0** · Smart and Sustainable MSMEs  
Author: **Sivaangayarkanni S** · UG student · Sri Eshwar College of Engineering, Coimbatore

Tagline: **Modular Filtration, Zero Compromise: Smart Exhaust Purification for Vehicles and MSME.**

## Quick start

```bash
cd /workspace/aeropure-sim
npm install
npm run dev          # http://localhost:5173  (Vite + /api/* middleware)
npm run build        # tsc -b && vite build → dist/
npm run preview      # serve dist/
```

### Deploy (Vercel)

- Static SPA from `dist/` + serverless functions in `api/`
- `vercel.json` rewrites non-API routes to `index.html`
- Parent agent: push main + Vercel redeploy (this tree is left ready)

```bash
npx vercel --prod   # or connect the GitHub repo in Vercel dashboard
```

Health check: `GET /api/health`

## Features

### 1. Awe-inspiring 3D simulation (primary view)

- `@react-three/fiber` + `@react-three/drei` + `three`
- Cutaway metallic housing, self-sealing docking, oil coil + canisters, 3 charcoal strata, spinning alloy fan, exploded/expandable 6-layer synthetic stack, quick-disconnect outlet
- Animated particles (hot dirty → cool clean), thermal glow, fan RPM tied to controls, orbit/zoom, stage click-to-focus
- Lazy-loaded WebGL chunk; graceful **2D SVG cutaway fallback** if WebGL fails
- Keyboard: **Space** start/pause · **1–4** focus stages

### 2. Deep-tech knowledge agents

| Agent | Role |
|-------|------|
| **ThermoAgent** | Heat sinks, oil cooling, backpressure, ΔT |
| **NanoFilterAgent** | Charcoal + synthetic layer science, PM10/PM2.5 |
| **ComplianceAgent** | PCB/PUC, SDG 3/9/11, TRL 3, India retrofit |
| **BusinessAgent** | USP, COGS ₹5,700–₹8,700, revenue, competitive, channels |
| **ServiceAgent** | Modular swap, docking, cartridges, IoT alerts |

- Knowledge encoded in `src/lib/knowledgeBase.ts` (client) and `api/_lib/knowledge.js` (server)
- `POST /api/agents` `{ agentId, message, simSnapshot? }` → grounded markdown + cited deck sections
- Client fallback if API unavailable; never invents conflicting specs

### 3. Production UI

- Dark industrial glassmorphism, AeroPure branding, desktop-first responsive
- Tabs: **Simulation** \| **Product Intelligence** \| **Service Mode**
- Live metrics: inlet/outlet °C, ΔT, PM classes, efficiency %, ΔP, fan RPM, filter load, oil coolant, API/Client badge
- Knowledge agents drawer with suggested prompts + agent switcher

### 4. Backend (Vercel)

| Route | Purpose |
|-------|---------|
| `GET/POST /api/sim-state` | Scenario defaults + outlet metrics validation |
| `GET/POST /api/agents` | Deck-grounded agent answers |
| `GET /api/health` | Liveness |

Local Vite mirrors these via `vite.config.ts` middleware.

## Exact stage / layer names (deck)

**Phase 1 — Thermal & Nanofiltration**

1. Heat Sink 1 (Lubricant Oil Cooling) — circulating replaceable lubricant oil  
2. 3-Layer Charcoal Nano-Material Filter  
   - L1 Coarse Carbon (large pore macro/VOC)  
   - L2 Carbon+Zeolite (medium molecular sieving)  
   - L3 Nano Membrane (fine barrier)

**Phase 2 — Post-Treatment & Synthetic Array**

3. Heat Sink 2 (Alloy Fan Cooling)  
4. 6-Layer Synthetic Array  
   - L1 Coarse Synthetic Mesh (dust)  
   - L2 Mid Microfiber (PM10)  
   - L3 Electrostatic (PM2.5)  
   - L4 Nanofiber Barrier (sub-micron)  
   - L5 Activated Carbon+Zeolite (odor/gas)  
   - L6 PTFE Protective Membrane  

Ports: Self-Sealing Docking Mechanism · Quick-Disconnect Coupling

## Project layout

```
api/
  agents.js          # knowledge agents endpoint
  sim-state.js       # sim validation
  health.js
  _lib/knowledge.js  # server knowledge mirror
src/
  App.tsx            # shell, tabs, keyboard
  components/
    scene3d/         # R3F module + particles + viewport
    AgentsPanel.tsx
    ProductIntelligence.tsx
    ServiceModeView.tsx
    …                # controls, metrics, 2D cutaway fallback
  lib/
    knowledgeBase.ts # deck RAG source of truth (client)
    stages.ts physics.ts simEngine.ts
public/
  concept-diagram.png
  product-deck.pdf
  product-deck.txt
```

## How to try

1. `npm run dev` → open Simulation tab — orbit the 3D module, raise fan speed, watch particles cool.
2. Open **Knowledge Agents** → switch to BusinessAgent → ask “What is the COGS range?” (expects ₹5,700–₹8,700 + cited Cost Structure).
3. Product Intelligence tab for problem / USP / competitive / SDG cards.
4. Service Mode tab → Enter Service Mode → Replace Cartridges.

## Model notes

See `MODEL.md`. Educational physics only — not a certified engineering model.

## Scripts

- `dev` — Vite + local `/api/*`
- `build` — typecheck + production bundle
- `preview` — serve `dist/`
- `lint` — oxlint
