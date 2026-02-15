"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { APP_REGISTRY } from "@/lib/appRegistry"
import P5Background from "@/components/P5Background"

type WindowItem = {
  id: string
  appId: string
  title: string
  source: string
  x: number
  y: number
  width: number
  height: number
  color: string
  vx: number
  vy: number
  zIndex: number
}

type DragState = {
  type: "drag" | "resize"
  windowId: string
  startPointerX: number
  startPointerY: number
  startX: number
  startY: number
  startWidth: number
}

const BASE_SIZE = 360
const MIN_SIZE = 16
const MAX_INITIAL_FACES = 4
const SPAWN_RATIO_PERCENT = clamp(
  Number(process.env.NEXT_PUBLIC_SPAWN_RATIO_PERCENT ?? "100"),
  1,
  100
)

function makeWindowId() {
  return `w-${Math.random().toString(36).slice(2, 9)}`
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function randomScale() {
  return Math.floor(Math.random() * 100) + 1
}

function sizeFromScale(scale: number) {
  return Math.max(MIN_SIZE, Math.round(BASE_SIZE * (scale / 100)))
}

function pickGreyscale() {
  const value = Math.floor(Math.random() * 256)
  return `rgb(${value}, ${value}, ${value})`
}

function hashToPhase(input: string) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return ((hash >>> 0) % 360) * (Math.PI / 180)
}

function lotusSpiralPosition(index: number, stageWidth: number, stageHeight: number, width: number, height: number) {
  const golden = 2.399963229728653
  const theta = index * golden
  const radialStep = 34
  const radius = 24 + radialStep * Math.sqrt(index)
  const centerX = stageWidth / 2
  const centerY = stageHeight / 2

  const px = centerX + Math.cos(theta) * radius
  const py = centerY + Math.sin(theta) * radius * 0.82

  return {
    x: clamp(Math.round(px - width / 2), 0, Math.max(0, stageWidth - width)),
    y: clamp(Math.round(py - height / 2), 0, Math.max(0, stageHeight - height))
  }
}

function ringPosition(index: number, count: number, stageWidth: number, stageHeight: number, size: number) {
  const cx = stageWidth / 2
  const cy = stageHeight / 2
  const r = Math.max(80, Math.min(stageWidth, stageHeight) * 0.2)
  const theta = (index / Math.max(1, count)) * Math.PI * 2 - Math.PI / 2
  const x = cx + Math.cos(theta) * r - size / 2
  const y = cy + Math.sin(theta) * r - size / 2

  return {
    x: clamp(Math.round(x), 0, Math.max(0, stageWidth - size)),
    y: clamp(Math.round(y), 0, Math.max(0, stageHeight - size))
  }
}

export default function DesktopShell() {
  const stageRef = useRef<HTMLDivElement>(null)
  const nextZRef = useRef(1)
  const spawnCountRef = useRef(0)
  const bootedRef = useRef(false)
  const interactionRef = useRef<DragState | null>(null)

  const [stageSize, setStageSize] = useState({ width: 1280, height: 720 })
  const [windows, setWindows] = useState<WindowItem[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function spawnBatchCount(base: number) {
    return Math.max(1, Math.round(base * (SPAWN_RATIO_PERCENT / 100)))
  }

  function buildWindow(index: number): WindowItem {
    const app = APP_REGISTRY[index % APP_REGISTRY.length]
    const scale = randomScale()
    const size = sizeFromScale(scale)
    const point = lotusSpiralPosition(index, stageSize.width, stageSize.height, size, size)

    return {
      id: makeWindowId(),
      appId: app.id.toLowerCase(),
      title: app.id.toLowerCase(),
      source: app.source,
      x: point.x,
      y: point.y,
      width: size,
      height: size,
      color: pickGreyscale(),
      vx: 0,
      vy: 0,
      zIndex: 1
    }
  }

  useEffect(() => {
    function syncSize() {
      const el = stageRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setStageSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) })
    }

    syncSize()
    window.addEventListener("resize", syncSize)
    return () => window.removeEventListener("resize", syncSize)
  }, [])

  useEffect(() => {
    let raf = 0

    const tick = () => {
      const t = performance.now() * 0.001
      setWindows((prev) => {
        if (prev.length === 0) return prev

        const activeId = interactionRef.current?.windowId ?? null
        const next = prev.map((w) => ({ ...w }))
        const sun = {
          x: stageSize.width * 0.5,
          y: stageSize.height * 0.5
        }

        for (let i = 0; i < next.length; i += 1) {
          const a = next[i]
          const aActive = a.id === activeId
          const acx = a.x + a.width / 2
          const acy = a.y + a.height / 2

          for (let j = i + 1; j < next.length; j += 1) {
            const b = next[j]
            const bActive = b.id === activeId
            const bcx = b.x + b.width / 2
            const bcy = b.y + b.height / 2
            const dx = bcx - acx
            const dy = bcy - acy
            const dist = Math.max(1, Math.hypot(dx, dy))
            const minGap = (a.width + b.width) / 2 + 4

            if (dist < minGap) {
              const repel = (minGap - dist) * 0.015
              const ux = dx / dist
              const uy = dy / dist
              if (!aActive) {
                a.vx -= ux * repel
                a.vy -= uy * repel
              }
              if (!bActive) {
                b.vx += ux * repel
                b.vy += uy * repel
              }
            } else {
              const attract = Math.min(0.06, (dist - minGap) * 0.0009)
              const ux = dx / dist
              const uy = dy / dist
              if (!aActive) {
                a.vx += ux * attract
                a.vy += uy * attract
              }
              if (!bActive) {
                b.vx -= ux * attract
                b.vy -= uy * attract
              }
            }

            if (!aActive && !bActive && dist < 190) {
              const cell = Math.max(40, Math.round((a.width + b.width) * 0.25))
              if (Math.abs(dx) >= Math.abs(dy)) {
                const snapX = acx + Math.sign(dx || 1) * cell
                b.vx += (snapX - bcx) * 0.0045
                b.vy += (acy - bcy) * 0.0045
              } else {
                const snapY = acy + Math.sign(dy || 1) * cell
                b.vx += (acx - bcx) * 0.0045
                b.vy += (snapY - bcy) * 0.0045
              }
            }
          }
        }

        for (const w of next) {
          if (w.id === activeId) continue

          const cx = w.x + w.width / 2
          const cy = w.y + w.height / 2
          const p = hashToPhase(w.id)
          const dx = cx - sun.x
          const dy = cy - sun.y
          const dist = Math.max(1, Math.hypot(dx, dy))
          const ux = dx / dist
          const uy = dy / dist
          const ringIndex = (Math.floor((p / (Math.PI * 2)) * 7) + 7) % 7
          const targetRadius = 140 + ringIndex * 34
          const radialError = dist - targetRadius
          const spin = Math.sin(p) >= 0 ? 1 : -1
          const swirlStrength = 0.42 / (1 + dist * 0.012)
          const pulse = Math.sin(t * 1.4 + p) * 0.02

          w.vx += -ux * radialError * 0.012
          w.vy += -uy * radialError * 0.012
          w.vx += -uy * swirlStrength * spin
          w.vy += ux * swirlStrength * spin
          w.vx += ux * pulse
          w.vy += uy * pulse

          w.vx *= 0.91
          w.vy *= 0.91
          w.x = clamp(w.x + w.vx, 0, Math.max(0, stageSize.width - w.width))
          w.y = clamp(w.y + w.vy, 0, Math.max(0, stageSize.height - w.height))
        }

        return next
      })

      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [stageSize.width, stageSize.height])

  function spawnBatch() {
    if (APP_REGISTRY.length === 0) return
    setWindows((prev) => {
      const batch = spawnBatchCount(APP_REGISTRY.length)
      const next = [...prev]
      for (let i = 0; i < batch; i += 1) {
        const index = spawnCountRef.current
        const created = buildWindow(index)
        spawnCountRef.current += 1
        nextZRef.current += 1
        next.push({ ...created, zIndex: nextZRef.current })
      }
      return next
    })
  }

  function seedInitialFour() {
    const count = Math.min(spawnBatchCount(MAX_INITIAL_FACES), APP_REGISTRY.length)
    if (count === 0) return

    const seeded: WindowItem[] = []
    for (let i = 0; i < count; i += 1) {
      const seededWindow = buildWindow(i)
      const size = seededWindow.width
      const point = ringPosition(i, count, stageSize.width, stageSize.height, size)
      seeded.push({
        ...seededWindow,
        x: point.x,
        y: point.y,
        zIndex: i + 1
      })
    }

    spawnCountRef.current = count
    nextZRef.current = count + 1
    setWindows(seeded)
    setSelectedId(seeded[0]?.id ?? null)
  }

  useEffect(() => {
    if (bootedRef.current) return
    bootedRef.current = true
    seedInitialFour()
  }, [stageSize.width, stageSize.height])

  function focusWindow(windowId: string) {
    const z = nextZRef.current + 1
    nextZRef.current = z
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, zIndex: z } : w)))
  }

  function beginInteraction(event: React.PointerEvent, windowItem: WindowItem, type: "drag" | "resize") {
    event.preventDefault()
    event.stopPropagation()

    focusWindow(windowItem.id)
    setSelectedId(windowItem.id)
    interactionRef.current = {
      type,
      windowId: windowItem.id,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: windowItem.x,
      startY: windowItem.y,
      startWidth: windowItem.width
    }

    setWindows((prev) => prev.map((w) => (w.id === windowItem.id ? { ...w, vx: 0, vy: 0 } : w)))

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", endInteraction)
  }

  function onPointerMove(event: PointerEvent) {
    const active = interactionRef.current
    if (!active) return

    const deltaX = event.clientX - active.startPointerX
    const deltaY = event.clientY - active.startPointerY

    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== active.windowId) return w

        if (active.type === "drag") {
          return {
            ...w,
            x: clamp(active.startX + deltaX, 0, Math.max(0, stageSize.width - w.width)),
            y: clamp(active.startY + deltaY, 0, Math.max(0, stageSize.height - w.height)),
            vx: 0,
            vy: 0
          }
        }

        const delta = Math.max(deltaX, deltaY)
        const nextSize = clamp(active.startWidth + delta, MIN_SIZE, Math.min(stageSize.width, stageSize.height))
        return {
          ...w,
          width: nextSize,
          height: nextSize,
          vx: 0,
          vy: 0
        }
      })
    )
  }

  function endInteraction() {
    interactionRef.current = null
    window.removeEventListener("pointermove", onPointerMove)
    window.removeEventListener("pointerup", endInteraction)
  }

  const sortedWindows = useMemo(() => [...windows].sort((a, b) => a.zIndex - b.zIndex), [windows])
  const selectedWindow = useMemo(() => windows.find((w) => w.id === selectedId) ?? null, [selectedId, windows])

  return (
    <main className="desktop-shell">
      <section
        ref={stageRef}
        className="stage"
        aria-label="Window stage"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            spawnBatch()
          }
        }}
      >
        <P5Background />
        {sortedWindows.map((windowItem) => {
          const highlighted = hoveredId === windowItem.id || selectedId === windowItem.id
          return (
            <article
              key={windowItem.id}
              className={`window${selectedId === windowItem.id ? " is-selected" : ""}`}
              style={{
                left: `${windowItem.x}px`,
                top: `${windowItem.y}px`,
                width: `${windowItem.width}px`,
                height: `${windowItem.height}px`,
                zIndex: windowItem.zIndex,
                background: windowItem.color
              }}
              onPointerEnter={() => setHoveredId(windowItem.id)}
              onPointerLeave={() => setHoveredId((current) => (current === windowItem.id ? null : current))}
              onPointerDown={() => {
                focusWindow(windowItem.id)
                setSelectedId(windowItem.id)
              }}
            >
              <div
                className="content"
                onPointerDown={(event) => {
                  const target = event.target as HTMLElement
                  if (target.dataset.dragzone === "1") {
                    beginInteraction(event, windowItem, "drag")
                  }
                }}
              >
                <div className="drag-zone" data-dragzone="1" />
                {highlighted ? <span className="face-id">{windowItem.appId}</span> : null}
                <button
                  type="button"
                  className="resize"
                  aria-label="Resize window"
                  onPointerDown={(event) => beginInteraction(event, windowItem, "resize")}
                />
              </div>
            </article>
          )
        })}

        {selectedWindow ? (
          <aside className="repo-panel" aria-label="Selected face preview">
            <div className="repo-head">
              <span>{selectedWindow.title}</span>
              <a href={selectedWindow.source} target="_blank" rel="noreferrer">
                Open
              </a>
            </div>
            <iframe title={`${selectedWindow.title} preview`} src={selectedWindow.source} loading="lazy" />
          </aside>
        ) : null}
      </section>
    </main>
  )
}
