// Finds code that still compares against an English string the dictionary translated.
// Usage: bun script/i18n-check.ts
import { Glob } from "bun"

const root = new URL("../packages/tui/src/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")
const dictionary: Record<string, string> = await Bun.file(new URL("./i18n-ru.json", import.meta.url)).json()
const keys = new Set(Object.keys(dictionary))
const comparison = /(===|!==|==|!=|case)\s*"([^"]+)"|"([^"]+)"\s*(===|!==)/g

for await (const file of new Glob("**/*.{ts,tsx}").scan(root)) {
  const lines = (await Bun.file(root + file).text()).split("\n")
  lines.forEach((line, index) => {
    for (const match of line.matchAll(comparison)) {
      const text = match[2] ?? match[3]
      if (text && keys.has(text)) console.log(`${file}:${index + 1}: ${line.trim()}`)
    }
  })
}
