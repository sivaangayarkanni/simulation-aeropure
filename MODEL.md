# AeroPure simulation model assumptions

Concept simulation only — not a certified engineering model.

## Cooling (oil + fan dominate)

- Stage 1 Heat Sink 1 (Lubricant Oil Cooling): CIRCULATING, REPLACEABLE LUBRICANT OIL extracts heat toward an oil-loop sink (~35C). Effectiveness reduced by fouling proxy and oil cartridge age.
- Stage 3 Heat Sink 2 (Alloy Fan Cooling): ALLOY FAN COOLING scales with fan speed (0-100% -> ~800-4200 RPM).
- Charcoal / synthetic media contribute only minor thermal mass losses.

## Filtration (charcoal + synthetic dominate by pore class)

- Inlet: Large dust, PM10, PM2.5, Fine, VOC-odor scale with contamination load.
- Stage 2 3-Layer Charcoal Nano-Material Filter: Coarse Carbon (Large Pore), Carbon+Zeolite (Medium Pore), Nano Membrane (Small Pore / Fine).
- Stage 4 6-Layer Synthetic Array PRECISION GRADED PORE STRUCTURE: Coarse Synthetic Mesh, Mid-Size Microfiber Filter, Electrostatic Filter (PM2.5 boost), Nanofiber Barrier Structure, Activated Carbon + Zeolite Composite, PTFE Protective Membrane.
- Stages 1 and 3 contribute negligible filtration.

## Hydraulics and service life

- Pressure drop rises with contamination and time-based filter loading.
- Service Mode highlights Self-Sealing Docking and replaceable cartridges. Replace Cartridges resets media age.

## Particle animation

Particles spawn at Exhaust Inlet. Removal follows stage survival curves. Colors morph red to blue along the thermal path.


## Simulation engine

Client `SimEngine` (`src/lib/simEngine.ts`) runs a fixed-timestep (1/60s) rAF loop: start/pause/reset, evolves media age, oil coolant temperature, fan angle, and flow phases. UI consumes snapshot state each frame. Optional Vercel `/api/sim-state` validates outlet metrics; local Vite falls back to the client engine.
