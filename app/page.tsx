"use client"

import { useEffect, useState } from "react"
import Canvas from "@/components/Canvas"
import HUDAudio from "@/components/HUDAudio"
import HUDMetrics from "@/components/HUDMetrics"
import HUDRegistry from "@/components/HUDRegistry"
import HUDSchema from "@/components/HUDSchema"
import { stagePresets } from "@/lib/operators/stagePresets"
import type { RegistryEntry, SimMetrics } from "@/lib/state/types"

function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000_000)
}

type Telemetry = {
  tick: number
  metrics: SimMetrics
  registryEntries: RegistryEntry[]
  eventCount: number
  anchors: Array<{ id: string; position: [number, number] }>
}

type PaletteMode = "default" | "deep-sea" | "chrome" | "flame"

type RenderControls = {
  fieldResolutionMin: number
  fieldResolutionMax: number
  rippleGain: number
  rippleFrequency: number
  vignetteStrength: number
}

const EMPTY_METRICS: SimMetrics = {
  totalEnergy: 0,
  budget: 0,
  conservedDelta: 0,
  livingInvariants: 0,
  entropySpread: 0,
  dominanceIndex: 0,
  basinOccupancyStability: 0,
  alignmentScore: 0,
  containmentRadius: 1,
  containmentWorldClamps: 0,
  containmentProbeClamps: 0,
  containmentNearBoundaryPct: 0
}

const DEFAULT_SEED = 424242

export default function Home() {
  const selectedPreset = stagePresets[stagePresets.length - 1]
  const [seedInput, setSeedInput] = useState(() => String(DEFAULT_SEED))
  const [activeSeed, setActiveSeed] = useState(DEFAULT_SEED)
  const [telemetry, setTelemetry] = useState<Telemetry>({
    tick: 0,
    metrics: EMPTY_METRICS,
    registryEntries: [],
    eventCount: 0,
    anchors: []
  })
  const [paletteMode, setPaletteMode] = useState<PaletteMode>("default")
  const [renderControls, setRenderControls] = useState<RenderControls>({
    fieldResolutionMin: 2,
    fieldResolutionMax: 8,
    rippleGain: 1,
    rippleFrequency: 0.5,
    vignetteStrength: 1
  })

  const anchorSummary =
    telemetry.anchors.length > 0
      ? telemetry.anchors
          .map((anchor) => `${anchor.id}(${anchor.position[0].toFixed(2)}, ${anchor.position[1].toFixed(2)})`)
          .join(" · ")
      : "waiting for telemetry"

  useEffect(() => {
    const nextSeed = randomSeed()
    setSeedInput(String(nextSeed))
    setActiveSeed(nextSeed)
  }, [])

  function applySeedFromInput() {
    const parsed = Number.parseInt(seedInput, 10)
    if (!Number.isFinite(parsed)) return
    setActiveSeed(parsed)
  }

  async function copySeed() {
    try {
      await navigator.clipboard.writeText(String(activeSeed))
    } catch {
      // Clipboard can be unavailable in some browser contexts.
    }
  }

  function updateControl<K extends keyof RenderControls>(key: K, value: number) {
    setRenderControls((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <main className="shell">
      <aside className="bottom-dock">
        <details className="panel-drop">
          <summary>Constitution</summary>
          <div className="drop-content">
            <p className="description">
              Active Constitution: <strong>ØVEL x Void Architecture</strong>
            </p>
            <p className="description">Invariant: ØVEL</p>

            <label>
              Seed (record/replay)
              <input
                value={seedInput}
                onChange={(event) => setSeedInput(event.target.value)}
                inputMode="numeric"
                aria-label="Simulation seed"
              />
            </label>

            <label>
              Energy Palette
              <select
                value={paletteMode}
                onChange={(event) => setPaletteMode(event.target.value as PaletteMode)}
                aria-label="Energy palette"
              >
                <option value="default">Default</option>
                <option value="deep-sea">Deep Sea</option>
                <option value="chrome">Chrome</option>
                <option value="flame">Flame</option>
              </select>
            </label>

            <div className="button-row">
              <button type="button" onClick={applySeedFromInput}>
                Apply Seed
              </button>
              <button type="button" onClick={copySeed}>
                Copy Active Seed
              </button>
            </div>

            <HUDAudio
              telemetry={{
                tick: telemetry.tick,
                metrics: telemetry.metrics,
                eventCount: telemetry.eventCount
              }}
            />

            <p className="active-seed">Active Seed: {activeSeed}</p>
            <p className="active-seed">Tick: {telemetry.tick}</p>
            <p className="active-seed">Events this frame: {telemetry.eventCount}</p>
            <p className="active-seed">Anchor Lattice: {telemetry.anchors.length} fixed anchors (configured set)</p>
            <p className="active-seed">Anchor Map: {anchorSummary}</p>
          </div>
        </details>

        <details className="panel-drop panel-registry">
          <summary>Registry</summary>
          <div className="drop-content">
            <HUDRegistry entries={telemetry.registryEntries} tick={telemetry.tick} />
          </div>
        </details>

        <details className="panel-drop">
          <summary>Render</summary>
          <div className="drop-content">
            <label>
              Field Res Min ({renderControls.fieldResolutionMin})
              <input
                type="range"
                min={2}
                max={8}
                step={1}
                value={renderControls.fieldResolutionMin}
                onChange={(event) => updateControl("fieldResolutionMin", Number(event.target.value))}
              />
            </label>
            <label>
              Field Res Max ({renderControls.fieldResolutionMax})
              <input
                type="range"
                min={4}
                max={12}
                step={1}
                value={renderControls.fieldResolutionMax}
                onChange={(event) => updateControl("fieldResolutionMax", Number(event.target.value))}
              />
            </label>
            <label>
              Ripple Gain ({renderControls.rippleGain.toFixed(2)})
              <input
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={renderControls.rippleGain}
                onChange={(event) => updateControl("rippleGain", Number(event.target.value))}
              />
            </label>
            <label>
              Ripple Frequency ({renderControls.rippleFrequency.toFixed(2)})
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.05}
                value={renderControls.rippleFrequency}
                onChange={(event) => updateControl("rippleFrequency", Number(event.target.value))}
              />
            </label>
            <label>
              Vignette Strength ({renderControls.vignetteStrength.toFixed(2)})
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={renderControls.vignetteStrength}
                onChange={(event) => updateControl("vignetteStrength", Number(event.target.value))}
              />
            </label>
          </div>
        </details>

        <details className="panel-drop">
          <summary>Legend</summary>
          <div className="drop-content">
            <HUDSchema />
          </div>
        </details>

        <details className="panel-drop">
          <summary>Metrics</summary>
          <div className="drop-content">
            <HUDMetrics metrics={telemetry.metrics} />
          </div>
        </details>
      </aside>
      <Canvas
        preset={selectedPreset}
        seed={activeSeed}
        paletteMode={paletteMode}
        renderControls={renderControls}
        onTelemetry={setTelemetry}
      />
    </main>
  )
}
