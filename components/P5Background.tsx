"use client"

import { useEffect, useRef } from "react"
import type P5 from "p5"

export default function P5Background() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let instance: P5 | null = null
    let cancelled = false

    async function mount() {
      const module = await import("p5")
      if (cancelled || !containerRef.current) return

      const P5Ctor = module.default
      const sketch = (p: P5) => {
        const paint = () => {
          const el = containerRef.current
          if (!el) return
          const width = Math.max(1, Math.floor(el.clientWidth))
          const height = Math.max(1, Math.floor(el.clientHeight))
          p.resizeCanvas(width, height, true)
          p.background(220)
        }

        p.setup = () => {
          const el = containerRef.current
          if (!el) return
          p.createCanvas(el.clientWidth, el.clientHeight).parent(el)
          p.noLoop()
          p.background(220)
        }

        p.windowResized = paint
      }

      instance = new P5Ctor(sketch)
    }

    mount()

    return () => {
      cancelled = true
      instance?.remove()
      instance = null
    }
  }, [])

  return <div className="p5-bg" ref={containerRef} aria-hidden="true" />
}
