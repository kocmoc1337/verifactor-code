// Translates keybind descriptions (shown in /help and the command palette) using script/keybind-ru.json.
// Usage: bun script/keybind-apply.ts
const root = new URL("../packages/tui/src/config/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")
const dictionary: Record<string, string> = await Bun.file(new URL("./keybind-ru.json", import.meta.url)).json()
const numbered: [RegExp, (n: string) => string][] = [
  [/^Switch to session in quick slot (\d+)$/, (n) => `Сессия из быстрого слота ${n}`],
  [/^Switch to session tab (\d+)$/, (n) => `Вкладка сессии ${n}`],
  [/^Switch to tab (\d+)$/, (n) => `Вкладка ${n}`],
]
const translate = (text: string) => {
  if (dictionary[text]) return dictionary[text]
  for (const [pattern, make] of numbered) {
    const match = text.match(pattern)
    if (match) return make(match[1]!)
  }
}

const missing = new Set<string>()
for (const file of ["keybind.ts", "v1/keybind.ts"]) {
  const source = await Bun.file(root + file).text()
  const next = source.replace(/(keybind\("[^"]*",\s*)"([^"]+)"/g, (all, head, text) => {
    const ru = translate(text)
    if (!ru) missing.add(text)
    return ru ? `${head}"${ru}"` : all
  })
  await Bun.write(root + file, next)
}
console.log(missing.size ? `untranslated: ${[...missing].join(" | ")}` : "all keybind descriptions translated")
