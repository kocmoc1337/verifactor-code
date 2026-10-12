// Collects user-visible English strings from the TUI sources so they can be translated in one pass.
// Usage: bun script/i18n-extract.ts > strings.json
import { Glob } from "bun"

const root = new URL("../packages/tui/src/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")
const props = /\b(title|description|message|placeholder|label|category|hint|footer|text|detail|confirmLabel|cancelLabel|emptyText|subtitle|heading)\s*[:=]\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g
const jsx = />([^<>{}\n]*[A-Za-z][^<>{}\n]*)</g
const english = /[A-Za-z]{2,}/

const found = new Map<string, Set<string>>()
const add = (value: string, file: string) => {
  const text = value.trim()
  if (!english.test(text) || /^[a-z0-9_.\-/]+$/.test(text) || /^[A-Z_]+$/.test(text)) return
  found.set(text, (found.get(text) ?? new Set()).add(file))
}

for await (const file of new Glob("**/*.{ts,tsx}").scan(root)) {
  const source = await Bun.file(root + file).text()
  for (const match of source.matchAll(props)) add(match[2]!, file)
  if (file.endsWith(".tsx")) for (const match of source.matchAll(jsx)) add(match[1]!, file)
}

console.log(
  JSON.stringify(
    Object.fromEntries([...found].sort(([a], [b]) => a.localeCompare(b)).map(([text, files]) => [text, [...files]])),
    null,
    1,
  ),
)
