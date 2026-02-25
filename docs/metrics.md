# Metrics

Metrics are computed per tick in `lib/metrics/index.ts`.

## Definitions
- Total Energy: sum of non-negative dynamic invariant energy.
- Budget: configured global energy budget.
- Conserved Delta: `totalEnergy - budget`.
- Living Invariants: count of dynamic invariants still alive.
- Containment Radius: active bounded-domain radius.
- World Clamps (tick): number of worlds hard-clamped to radius this tick.
- Probe Clamps (tick): number of probes hard-clamped to radius this tick.
- Entropy Spread: normalized Shannon entropy of dynamic strengths.
- Dominance Index: top-k strength share over total strength.
- Basin Occupancy Stability: average basin persistence score from frame longevity.

These metrics support Stage 6 research by making persistence and competitive outcomes measurable.
