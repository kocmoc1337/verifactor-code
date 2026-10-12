// Applies script/i18n-ru.json to the TUI sources (and tests that assert on the same text).
// Only display positions are rewritten: known display props and JSX text, never bare identifiers.
// Usage: bun script/i18n-apply.ts
import { Glob } from "bun"

const root = new URL("../packages/tui/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")
const dictionary: Record<string, string> = await Bun.file(new URL("./i18n-ru.json", import.meta.url)).json()
const skip = [/storybook/, /mini[\\/]demo\.ts$/, /^src[\\/]config[\\/]/]
const props =
  /\b(title|description|message|placeholder|label|category|hint|footer|text|detail|confirmLabel|cancelLabel|emptyText|subtitle|heading)(\s*[:=]\s*)"([^"\\]*(?:\\.[^"\\]*)*)"/g
const jsx = />(\s*)([^<>{}\n]*[A-Za-z][^<>{}\n]*?)(\s*)</g

let changed = 0
for (const pattern of ["src/**/*.{ts,tsx}", "test/**/*.{ts,tsx}"]) {
  for await (const file of new Glob(pattern).scan(root)) {
    if (skip.some((rule) => rule.test(file))) continue
    const path = root + file
    const source = await Bun.file(path).text()
    const next = source
      .replace(props, (all, prop, sep, text) => (dictionary[text] ? `${prop}${sep}"${dictionary[text]}"` : all))
      .replace(jsx, (all, before, text, after) =>
        file.endsWith(".tsx") && dictionary[text] ? `>${before}${dictionary[text]}${after}<` : all,
      )
    if (next === source) continue
    await Bun.write(path, next)
    changed++
    console.log(file)
  }
}
console.log(`files changed: ${changed}`)
