// Exact-string replacements from a JSON file: { "relative/path.ts": [["from", "to"], ...] }.
// Every "from" must occur in its file; missing ones are reported and that file is left untouched.
// Usage: bun script/replace.ts edits.json
const root = new URL("../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")
const edits: Record<string, [string, string][]> = await Bun.file(process.argv[2]!).json()

for (let [file, pairs] of Object.entries(edits)) {
  const path = root + file
  const source = await Bun.file(path).text()
  // Windows checkouts may use CRLF; match multi-line snippets in the file's own line ending.
  const eol = source.includes("\r\n") ? "\r\n" : "\n"
  pairs = pairs.map(([from, to]) => [from.replaceAll("\n", eol), to.replaceAll("\n", eol)])
  const missing = pairs.filter(([from]) => !source.includes(from))
  if (missing.length) {
    console.log(`SKIPPED ${file}: missing ${missing.map(([from]) => JSON.stringify(from)).join(", ")}`)
    continue
  }
  await Bun.write(path, pairs.reduce((text, [from, to]) => text.replaceAll(from, to), source))
  console.log(`ok ${file} (${pairs.length})`)
}
