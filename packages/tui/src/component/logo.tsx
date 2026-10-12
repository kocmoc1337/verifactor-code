import { RGBA, TextAttributes } from "@opentui/core"
import { createEffect, createMemo, createSignal, For, onCleanup, onMount, untrack } from "solid-js"
import { useTerminalDimensions } from "@opentui/solid"
import { useTheme } from "../context/theme"
import { useConfig } from "../config"
import { tint } from "../theme/color"
import { pixelLogo, type PixelCell } from "../pixel-logo"

// Pixel dissolve intro, as on newince.sbs: cells flash as accent squares before settling into the
// wordmark. It plays once per process; later mounts render the settled logo straight away.
const INTRO_MS = 1100
const FLASH_MS = 170
let introPlayed = false

// Deterministic per-cell noise so a cell keeps its reveal time between frames.
function noise(row: number, col: number, salt: number) {
  const value = Math.sin(row * 127.1 + col * 311.7 + salt * 74.7) * 43758.5453
  return value - Math.floor(value)
}

export function Logo() {
  const theme = useTheme()
  const config = useConfig().data
  const dimensions = useTerminalDimensions()
  const animated = () => config.animations ?? true
  const [elapsed, setElapsed] = createSignal(introPlayed || !animated() ? INTRO_MS : 0)
  const [beat, setBeat] = createSignal(0)

  onMount(() => {
    if (untrack(elapsed) >= INTRO_MS) return
    const started = performance.now()
    const timer = setInterval(() => {
      const next = Math.min(INTRO_MS, performance.now() - started)
      setElapsed(next)
      if (next < INTRO_MS) return
      introPlayed = true
      clearInterval(timer)
    }, 33)
    onCleanup(() => clearInterval(timer))
  })

  createEffect(() => {
    if (!animated()) return
    const timer = setInterval(() => setBeat((value) => value + 1), 420)
    onCleanup(() => clearInterval(timer))
  })

  const accent = () => theme.hue.accent[200]
  const layout = createMemo(() => {
    const width = dimensions().width
    if (dimensions().height < 12) return "none"
    if (width >= 70) return "full"
    if (width >= 58) return "wordmark"
    return "mascot"
  })
  const mascot = createMemo(() => {
    if (!animated()) return pixelLogo.mascot[0]!
    const step = beat()
    if (step % 13 === 12) return pixelLogo.mascot[2]!
    return pixelLogo.mascot[step % 2]!
  })

  const paint = (cell: PixelCell, row: number, col: number, fg: RGBA) => {
    const time = elapsed()
    const settled = { char: cell.char, fg: cell.tone === "accent" ? accent() : fg }
    if (time >= INTRO_MS) return settled
    const reveal = 120 + noise(row, col, 1) * (INTRO_MS - 320)
    if (time >= reveal) return settled
    const flashes = cell.tone !== undefined || noise(row, col, 2) < 0.3
    if (flashes && time >= reveal - FLASH_MS) return { char: "█", fg: accent() }
    if (noise(row, col, 3) < 0.08) return { char: "·", fg: theme.border.base }
    return { char: " ", fg }
  }

  const sprite = (rows: () => PixelCell[][], offset: number, fg: () => RGBA, bold: boolean) => (
    <box flexDirection="column" flexShrink={0}>
      <For each={rows()}>
        {(line, row) => (
          <box flexDirection="row">
            <For each={line}>
              {(cell, col) => {
                const view = () => paint(cell, row(), col() + offset, fg())
                return (
                  <text fg={view().fg} attributes={bold ? TextAttributes.BOLD : undefined} selectable={false}>
                    {view().char}
                  </text>
                )
              }}
            </For>
          </box>
        )}
      </For>
    </box>
  )

  const mascotColor = () => tint(theme.background.base, accent(), 0.85)
  const mascotView = () => sprite(mascot, 0, mascotColor, false)
  const wordmarkView = () => sprite(() => pixelLogo.wordmark, 11, () => theme.text.base, true)

  return (
    <box flexDirection="row" gap={3} alignItems="flex-end">
      {layout() === "none" ? null : layout() === "mascot" ? (
        mascotView()
      ) : layout() === "wordmark" ? (
        wordmarkView()
      ) : (
        <>
          {mascotView()}
          {wordmarkView()}
        </>
      )}
    </box>
  )
}
