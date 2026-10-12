import { OptimizedBuffer, Renderable, RGBA, TextAttributes, type RenderableOptions, type RenderContext } from "@opentui/core"
import { extend, useKeyboard } from "@opentui/solid"
import { createSignal, Show } from "solid-js"
import { useTheme } from "../context/theme"
import { useConfig } from "../config"
import { tint } from "../theme/color"
import { pixelLogo, type PixelCell } from "../pixel-logo"
import { SPINNER_FRAMES } from "./spinner-frames"

// Full-screen boot sequence in the newince.sbs style: a dark tile grid with orange sparks, the pixel
// wordmark dissolving in, a pixel progress bar with Russian stage names, and a pixel dissolve that
// reveals the app underneath. Cells we skip during the exit stay transparent, so the app shows through.

const MIN_MS = 2100
const MAX_MS = 6000
const EXIT_MS = 650
const TILE_W = 4
const TILE_H = 2
const BAR = 36
const LABEL = "■ VERIFACTOR CODE · ИИ-АССИСТЕНТ В ТЕРМИНАЛЕ · 2026"
const HINT = "любая клавиша — пропустить"
const SITE = "newince.sbs"
const STAGES = [
  [0, "инициализация ядра"],
  [0.18, "загрузка темы verifactor"],
  [0.36, "подключение к серверу"],
  [0.58, "загрузка плагинов"],
  [0.82, "сборка интерфейса"],
  [1, "готово"],
] as const

let bootPlayed = false

function noise(x: number, y: number, salt: number) {
  const value = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453
  return value - Math.floor(value)
}

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const ease = (value: number) => 1 - Math.pow(1 - clamp(value), 3)

type Palette = { background: RGBA; text: RGBA; muted: RGBA; grid: RGBA; tile: RGBA; accent: RGBA }

type BootSplashOptions = RenderableOptions<BootSplashRenderable> & {
  palette?: Palette
  ready?: boolean
  onDone?: () => void
}

class BootSplashRenderable extends Renderable {
  private colors: Palette
  private isReady: boolean
  private onDone: (() => void) | undefined
  private started = performance.now()
  private exitAt: number | undefined
  private done = false
  private progress = 0
  private last = performance.now()

  constructor(ctx: RenderContext, options: BootSplashOptions) {
    super(ctx, { ...options, live: true })
    this.colors = options.palette!
    this.isReady = options.ready ?? false
    this.onDone = options.onDone
  }

  set palette(value: Palette) {
    this.colors = value
  }

  set ready(value: boolean) {
    this.isReady = value
  }

  skip() {
    this.progress = 1
    this.exitAt ??= performance.now()
  }

  protected override onUpdate(): void {
    const now = performance.now()
    const delta = Math.min(100, now - this.last)
    this.last = now
    const elapsed = now - this.started
    // The bar eases toward a time-based target but waits at 88% until the app reports ready.
    const target = Math.min(this.isReady || elapsed > MAX_MS ? 1 : 0.88, elapsed / MIN_MS)
    this.progress = Math.min(1, this.progress + (target - this.progress) * Math.min(1, delta / 140))
    if (target >= 1 && this.progress > 0.995) this.progress = 1
    if (this.progress >= 1 && elapsed >= MIN_MS) this.exitAt ??= now
    if (this.exitAt === undefined || this.done || now - this.exitAt < EXIT_MS) return
    this.done = true
    this.live = false
    this.onDone?.()
  }

  protected override renderSelf(buffer: OptimizedBuffer): void {
    if (this.done || this.width <= 0 || this.height <= 0) return
    const now = performance.now()
    const elapsed = now - this.started
    const exit = this.exitAt === undefined ? 0 : clamp((now - this.exitAt) / EXIT_MS)
    const p = this.colors
    const width = this.width
    const height = this.height

    const layout = this.layout()
    const content = new Map<number, { char: string; fg: RGBA; bold?: boolean }>()
    const put = (x: number, y: number, char: string, fg: RGBA, bold?: boolean) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return
      content.set(y * width + x, { char, fg, bold })
    }

    // Logo: each pixel cell flashes accent, then settles, at its own random moment.
    const reveal = (cells: PixelCell[][], left: number, top: number, color: RGBA, salt: number) =>
      cells.forEach((line, row) =>
        line.forEach((cell, col) => {
          if (!cell.tone) return
          const at = 250 + noise(col + salt, row, 1) * 900
          if (elapsed < at - 180) return
          const settled = elapsed >= at
          put(left + col, top + row, settled ? cell.char : "█", settled && cell.tone === "text" ? color : p.accent, settled)
        }),
      )

    if (layout.mascot) {
      const step = Math.floor(elapsed / 380)
      const frame = step % 11 === 10 ? pixelLogo.mascot[2]! : pixelLogo.mascot[step % 2]!
      // The mascot walks in from the left edge before standing beside the wordmark.
      const walk = Math.round((1 - ease((elapsed - 100) / 900)) * (layout.mascot.x + 10))
      reveal(frame, layout.mascot.x - walk, layout.top, tint(p.background, p.accent, 0.85), 40)
    }
    if (layout.wordmark) reveal(pixelLogo.wordmark, layout.wordmark.x, layout.top, p.text, 0)

    const typed = Math.floor(clamp((elapsed - 700) / 700) * LABEL.length)
    const labelX = Math.floor((width - LABEL.length) / 2)
    ;[...LABEL.slice(0, typed)].forEach((char, index) =>
      put(labelX + index, layout.top + 5, char, index === 0 ? p.accent : p.muted),
    )

    const barX = Math.floor((width - BAR - 6) / 2)
    const barY = layout.top + 7
    const filled = Math.round(this.progress * BAR)
    for (let index = 0; index < BAR; index++) {
      const lit = index < filled
      const head = lit && index === filled - 1 && this.progress < 1
      put(barX + index, barY, lit ? (head ? "▌" : "█") : "·", lit ? p.accent : p.grid)
    }
    const percent = `${Math.round(this.progress * 100)}`.padStart(3) + "%"
    ;[...percent].forEach((char, index) => put(barX + BAR + 2 + index, barY, char, p.text, true))

    const stage = STAGES.findLast(([from]) => this.progress >= from)![1]
    const spinner = this.progress >= 1 ? "■" : SPINNER_FRAMES[Math.floor(elapsed / 80) % SPINNER_FRAMES.length]!
    const status = `${spinner} ${stage}${this.progress >= 1 ? "" : "…"}`
    ;[...status].forEach((char, index) => put(barX + index, barY + 2, char, index === 0 ? p.accent : p.muted))

    if (height > 4) {
      ;[...HINT].forEach((char, index) => put(2 + index, height - 2, char, p.grid))
      ;[...SITE].forEach((char, index) => put(width - SITE.length - 2 + index, height - 2, char, p.grid))
    }

    const gridIn = ease(elapsed / 400)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Exit dissolve: cells drop out in random order, flashing accent just before they go.
        const threshold = noise(Math.floor(x / 2), y, 9)
        if (exit > 0 && exit >= threshold) continue
        const flashing = exit > 0 && exit >= threshold - 0.08

        const item = content.get(y * width + x)
        const center = y >= layout.top - 1 && y <= layout.top + 10 && x >= layout.left - 2 && x <= layout.right + 2
        const background = flashing ? p.accent : center ? p.background : this.tileColor(x, y, elapsed, gridIn)
        if (item && !flashing) {
          buffer.setCell(this.screenX + x, this.screenY + y, item.char, item.fg, background, item.bold ? TextAttributes.BOLD : 0)
          continue
        }
        const dot = !center && x % TILE_W === 0 && y % TILE_H === 0 && gridIn > 0.5
        buffer.setCell(this.screenX + x, this.screenY + y, dot && !flashing ? "·" : " ", p.grid, background)
      }
    }
  }

  // Tiles twinkle like the site's pixel grid: most stay dark, a few glow grey, rare ones spark accent.
  private tileColor(x: number, y: number, elapsed: number, gridIn: number) {
    const p = this.colors
    const tileX = Math.floor(x / TILE_W)
    const tileY = Math.floor(y / TILE_H)
    const period = 1400 + noise(tileX, tileY, 2) * 2600
    const phase = ((elapsed + noise(tileX, tileY, 3) * period) % period) / period
    const pulse = Math.max(0, Math.sin(phase * Math.PI * 2))
    const kind = noise(tileX, tileY, 4)
    if (kind > 0.965) return tint(p.background, p.accent, pulse * 0.9 * gridIn)
    if (kind > 0.8) return tint(p.background, p.tile, pulse * gridIn)
    return p.background
  }

  private layout() {
    const width = this.width
    const full = width >= 70
    const wordmarkOnly = !full && width >= 58
    const blockWidth = full ? 65 : wordmarkOnly ? 54 : 8
    const left = Math.floor((width - Math.max(blockWidth, LABEL.length)) / 2)
    const blockLeft = Math.floor((width - blockWidth) / 2)
    const top = Math.max(1, Math.floor((this.height - 11) / 2))
    return {
      top,
      left: Math.min(left, blockLeft),
      right: Math.max(left + LABEL.length, blockLeft + blockWidth),
      mascot: full || !wordmarkOnly ? { x: blockLeft } : undefined,
      wordmark: full || wordmarkOnly ? { x: blockLeft + (full ? 11 : 0) } : undefined,
    }
  }
}

declare module "@opentui/solid" {
  interface OpenTUIComponents {
    boot_splash: typeof BootSplashRenderable
  }
}

extend({ boot_splash: BootSplashRenderable })

export function BootSplash(props: { ready: () => boolean }) {
  const theme = useTheme()
  const config = useConfig().data
  // bun test sets NODE_ENV=test; the splash would cover every frame a test inspects.
  const [visible, setVisible] = createSignal(
    !bootPlayed && (config.animations ?? true) && (process.env.NODE_ENV !== "test" || !!process.env.SPLASH_TEST),
  )
  let splash: BootSplashRenderable | undefined
  bootPlayed = true

  useKeyboard((event) => {
    if (!visible() || !splash) return
    splash.skip()
    event.preventDefault()
  })

  return (
    <Show when={visible()}>
      <boot_splash
        ref={(value: BootSplashRenderable) => (splash = value)}
        position="absolute"
        zIndex={6000}
        left={0}
        top={0}
        width="100%"
        height="100%"
        ready={props.ready()}
        palette={{
          background: theme.background.base,
          text: theme.text.base,
          muted: theme.text.muted,
          grid: theme.border.base,
          tile: theme.background.raised.high,
          accent: theme.hue.accent[200],
        }}
        onDone={() => setVisible(false)}
      />
    </Show>
  )
}
