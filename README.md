# AeroPure Modular Multi-Stage Exhaust Filtration Simulation

Interactive cutaway simulation of **MODULAR MULTI-STAGE EXHAUST FILTRATION SYSTEM: AeroPure Concept** — **ENGINEERED FOR MODULAR SERVICE**.

Pure React + TypeScript (Vite). No backend.

## How to run

1. Change directory to /workspace/aeropure-sim
2. Install packages with the project package manager
3. Start the Vite development server (script name: dev)
4. Open http://localhost:5173

### Package scripts

- dev: Vite development server
- build: Typecheck (tsc -b) and production bundle to dist/
- preview: Serve production bundle
- lint: oxlint

## Diagram to UI mapping (verbatim)

Source of truth: `public/concept-diagram.png` (Concept Diagram lightbox or Split: Sim | Diagram).

- MODULAR MULTI-STAGE EXHAUST FILTRATION SYSTEM → Header H1
- AeroPure Concept → Header concept span
- ENGINEERED FOR MODULAR SERVICE → Header tagline + Service Mode banner
- Exhaust Inlet (Hot, Particulate-laden) → Pipeline top tag + SVG inlet label
- Self-Sealing Docking Mechanism → SVG docking ring + service undock
- Phase 1: Thermal & Nanofiltration Module (Inlet side) → Phase banner / top tag
- Stage 1: Heat Sink 1 (Lubricant Oil Cooling) → Cutaway S1 + drawer
- CIRCULATING, REPLACEABLE LUBRICANT OIL → S1 callout (coil + canisters)
- Stage 2: 3-Layer Charcoal Nano-Material Filter → Cutaway S2 + drawer
- Nano-engineered Carbon matrix → S2 subtitle
- Layer 1: Coarse Carbon (Large Pore) → S2 strata + drawer layer metrics
- Layer 2: Carbon+Zeolite (Medium Pore) → S2 strata + drawer
- Layer 3: Nano Membrane (Small Pore / Fine) → S2 strata + drawer
- CHARCOAL NANO-MATERIAL STRUCTURE (3 LAYERS) → Drawer callout / section title
- Phase 2: Post-Treatment & Synthetic Array (Outlet side) → Phase banner / top tag
- Stage 3: Heat Sink 2 (Alloy Fan Cooling) → Cutaway S3 + drawer
- ALLOY FAN COOLING → S3 callout; fan RPM tied to control
- Stage 4: 6-Layer Synthetic Array → Cutaway S4 exploded stack
- PRECISION GRADED PORE STRUCTURE → S4 subtitle + drawer
- Layer 1: Coarse Synthetic Mesh — Large Dust Removal → S4 + per-layer capture
- Layer 2: Mid-Size Microfiber Filter — PM10 Filtration → S4 + capture
- Layer 3: Electrostatic Filter — PM2.5 Capture → S4 + electrostatic boost
- Layer 4: Nanofiber Barrier Structure — Fine Particle Capture → S4 + capture
- Layer 5: Activated Carbon + Zeolite Composite → S4 + VOC capture
- Layer 6: PTFE Protective Membrane → S4 final barrier
- Quick-Disconnect Coupling → SVG outlet ring
- Purified Air Outlet (Cleaned, Cooled) → Pipeline top tag + SVG outlet
- Legend & Summary / SYSTEM ADVANTAGES → Legend panel + footer

## Features

- SVG metallic cutaway: docking rings, oil coil + canisters, 3 charcoal strata, spinning alloy fan, exploded 6-layer stack, outlet coupling
- Running animation: hot orange particulates shrink/disappear through filters; red to blue thermal wash; oil shimmer; fan RPM; flow chevrons
- Per-layer live contribution: Large dust / PM10 / PM2.5 / Fine / VOC-odor capture %, pore class, service life %
- Time-based filter loading; Service Mode undocks modules; Replace Cartridges resets life
- Keyboard Space = Start/Pause
- Industrial dark theme, AeroPure branding, diagram lightbox + split view

## Project layout

- src/App.tsx — shell, sim loop, keyboard, service reset
- src/components/CutawayViz.tsx — SVG engineering cutaway
- src/components/ParticleCanvas.tsx — particle + thermal animation
- src/components/Pipeline.tsx — chassis composing canvas + cutaway
- src/components/DetailDrawer.tsx — stage + per-layer metrics
- src/components/Header.tsx, Controls.tsx, MetricsPanel.tsx, LegendPanel.tsx, ReferencePanel.tsx
- src/lib/stages.ts — diagram-accurate stage/layer defs
- src/lib/physics.ts — educational cooling/filtration/clog model
- public/concept-diagram.png — engineering diagram
- MODEL.md — physics assumptions

## Model assumptions

See MODEL.md. Summary: oil + fan dominate delta-T; charcoal then synthetic graded pores dominate filtration; electrostatic boosts PM2.5; PTFE final barrier; pressure drop rises with contamination + loading.
