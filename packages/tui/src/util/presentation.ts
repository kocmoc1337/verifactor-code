import { pixelLogo } from "../pixel-logo"

const reset = "\x1b[0m"
const bold = "\x1b[1m"
const dim = "\x1b[90m"
const accent = "\x1b[38;2;255;95;31m"

function wordmark(pad = "") {
  return pixelLogo.wordmark.map(
    (line) =>
      pad +
      line
        .map((cell) => {
          if (!cell.tone) return " "
          return `${cell.tone === "accent" ? accent : bold}${cell.char}${reset}`
        })
        .join(""),
  )
}

export function sessionEpilogue(input: { title: string; sessionID?: string }) {
  const weak = (text: string) => `${dim}${text.padEnd(10, " ")}${reset}`
  return [
    ...wordmark("  "),
    "",
    `  ${weak("Session")}${bold}${input.title}${reset}`,
    `  ${weak("Continue")}${bold}opencode -s ${input.sessionID}${reset}`,
    "",
  ].join("\n")
}
