// Brings TUI test expectations in line with the Russian UI: exact English string literals that the
// translations changed are replaced with their Russian text.
// Usage: bun script/i18n-tests.ts [edits.json ...]  (edits files are the replace.ts batches used for the UI)
import { Glob } from "bun"

const root = new URL("../packages/tui/test/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")
const literal = /(["'`])((?:(?!\1)[^\\\n]|\\.)+)\1/g
const strings = (code: string) => [...code.matchAll(literal)].map((match) => match[2]!)

const full: Record<string, string> = {
  ...(await Bun.file(new URL("./i18n-ru.json", import.meta.url)).json()),
  ...(await Bun.file(new URL("./keybind-ru.json", import.meta.url)).json()),
}
// Strings from shared util/ modules also reach the (untranslated) mini mode.
const shared: Record<string, string> = {}
for (const path of process.argv.slice(2)) {
  const edits: Record<string, [string, string][]> = await Bun.file(path).json()
  for (const [file, pairs] of Object.entries(edits))
    for (const [from, to] of pairs) {
      const before = strings(from)
      const after = strings(to)
      if (before.length !== after.length) continue
      before.forEach((text, index) => {
        if (text === after[index] || text.includes("${") || !/[A-Za-z]{2}/.test(text)) return
        full[text] = after[index]!
        if (file.includes("/util/")) shared[text] = after[index]!
      })
    }
}

// Fragments that tests look for with includes()/toContain() rather than as whole strings.
const fragments: Record<string, string> = await Bun.file(new URL("./i18n-fragments.json", import.meta.url)).json()
for (const [en, ru] of Object.entries(fragments)) full[en] ??= ru

let changed = 0
for await (const file of new Glob("**/*.{ts,tsx}").scan(root)) {
  const dictionary = /^mini[\\/]/.test(file) ? shared : full
  const source = await Bun.file(root + file).text()
  const next = source.replace(literal, (all, quote, text) => {
    const ru = dictionary[text]
    if (!ru || (quote === "`" && text.includes("${"))) return all
    return `${quote}${ru}${quote}`
  })
  if (next === source) continue
  await Bun.write(root + file, next)
  changed++
}
console.log(`test files changed: ${changed}`)
