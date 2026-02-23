# Constitutional Field

Constitutional Field is a deterministic, browser-based simulation of constrained emergence.

The active runtime identity is:
- **Constitution:** `ØVEL x Void Architecture`
- **Invariant:** `ØVEL`

The law stays fixed; dynamic invariants compete within it.

## What It Does

- Simulates probes, basins, and dynamic invariants inside a bounded field.
- Tracks births, promotions, suppression, starvation, and deaths.
- Enforces budgeted energy competition under alignment control.
- Renders a layered visual system (field, probes, trails, scaffold memory, invariants, axes).
- Exposes live HUD panels: Constitution, Registry, Legend, Metrics.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Canvas 2D rendering

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Production build:

```bash
npm run build
npm run start
```

## Runtime Model

The simulation state is centralized in `lib/state/types.ts` and created by `createSimulationState()` in `lib/sim/engine.ts`.

Core state domains:
- `anchors`: fixed constitutional anchors (`B`, `Ci`)
- `invariants`: all entities (anchors + dynamic invariants)
- `probes`: moving particles used for basin detection and intake pressure
- `basins`: clustered persistence zones from probe density
- `globals`: tick, seed, budget, viewport/world bounds, constitution hash
- `registry`: identity and lifecycle history for each invariant
- `metrics`: per-tick system diagnostics
- `events`: typed lifecycle/system events

## Operator Pipeline

Operators are composable laws, not UI modes.

- Operator contract: `lib/operators/types.ts`
- Composition: `lib/operators/compose.ts`
- Presets: `lib/operators/stagePresets.ts`

Current app runtime always uses the final preset (`stagePresets[last]`) from `app/page.tsx`, while stages remain available as compositional structure in code.

Major operators:
- Closure (anchors + boundary law)
- Oscillation (energy field enabled)
- Basin detection (probe dynamics + clustering)
- Emergent promotion (basin -> dynamic invariant)
- Competitive ecosystem (local suppression and decay)
- Selection pressure (global budget distribution)
- Budget regulator (alignment-informed feedback control)

## HUD Panels

- **Constitution**: identity, seed replay/copy, tick, event count
- **Registry**: top-energy invariants with age phase + bars
- **Legend**: visual schema for all rendered symbols
- **Metrics**: alignment score + key diagnostics

All panels are bottom-docked dropdowns in `app/page.tsx` and styled in `app/globals.css`.

## Metrics

Computed in `lib/metrics/index.ts`:
- Total Energy
- Budget
- Conserved Delta (`totalEnergy - budget`)
- Living Invariants
- Entropy Spread
- Dominance (top-k)
- Basin Stability
- Alignment Score

Alignment classification and control profile are in `lib/alignment/controller.ts`.

## Events and Registry

Event types are defined in `lib/events/types.ts` and emitted during operator execution.

Registry tracking (`lib/invariants/registry.ts`) stores:
- identity and lineage links
- birth/death ticks
- sampled energy and position histories
- peak strength
- territory outcomes (wins/kills)

## Constraints

Validation is run each tick in `lib/constraints/validate.ts`.

Checks include:
- bounded domain
- finite numeric values
- finite non-negative budget
- constitution hash immutability

Violations are surfaced as suppression events.

## Rendering Notes

Canvas rendering lives in `components/Canvas.tsx` and includes:
- full-window field raster
- red/white center XY axis
- probe heads + persistent white trails
- secondary scaffold network from remembered trail points
- basin density circles
- anchor/dynamic invariant glyphs and labels

## Primary Tuning Knobs

Most frequent tuning points:
- `initialBudget` in `lib/sim/engine.ts`
- `targetProbes`, `MAX_PROBE_TRAIL_POINTS`, respawn radius in `lib/operators/stagePresets.ts`
- promotion thresholds (`basin.frames`, `basin.count`, `maxInvariants`) in `lib/operators/stagePresets.ts`
- regulator gains and thresholds in `lib/alignment/controller.ts` and `budgetRegulatorOperator`
- trail falloff / scaffold constants / visual force radii in `components/Canvas.tsx`

## Documentation

- `docs/operators.md`
- `docs/stages.md`
- `docs/metrics.md`

## Repository Hygiene

Editor artifacts are intentionally ignored (for IDE-free workflow), including:
- `.idea/`
- `*.iml`

## License

No license file is currently defined in this repository.
