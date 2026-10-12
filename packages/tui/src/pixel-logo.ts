// Pixel-art sources for the verifactor wordmark and mascot.
// "#" is a text pixel, "@" an accent pixel, "." empty. Two pixel rows fold into one terminal row
// through half blocks, so a pixel is roughly square on a 1:2 terminal cell.

export type PixelTone = "text" | "accent"
export type PixelCell = { char: string; tone?: PixelTone }

// 8 pixel rows per glyph: 3 rows of ascender space, 5 rows of x-height.
const glyphs: Record<string, string[]> = {
  v: [".....", ".....", ".....", "#...#", "#...#", ".#.#.", ".#.#.", "..#.."],
  e: [".....", ".....", ".....", ".###.", "#...#", "#####", "#....", ".####"],
  r: ["....", "....", "....", "#.##", "##..", "#...", "#...", "#..."],
  i: [".", "#", ".", "#", "#", "#", "#", "#"],
  f: ["....", "..##", ".#..", "####", ".#..", ".#..", ".#..", ".#.."],
  a: [".....", ".....", ".....", ".###.", "....#", ".####", "#...#", ".####"],
  c: [".....", ".....", ".....", ".####", "#....", "#....", "#....", ".####"],
  t: ["....", ".#..", ".#..", "####", ".#..", ".#..", ".#..", "..##"],
  o: [".....", ".....", ".....", ".###.", "#...#", "#...#", "#...#", ".###."],
  ".": ["..", "..", "..", "..", "..", "..", "@@", "@@"],
}

function compose(word: string) {
  return Array.from({ length: 8 }, (_, row) => [...word].map((char) => glyphs[char]![row]).join("."))
}

export const mascotFrames = [
  ["..####..", ".######.", "##.##.##", "########", "########", ".#.##.#.", "#......#", "........"],
  ["..####..", ".######.", "##.##.##", "########", "########", ".#.##.#.", ".#....#.", "........"],
  ["..####..", ".######.", "########", "########", "########", ".#.##.#.", "#......#", "........"],
]

export function fold(pixels: readonly string[]): PixelCell[][] {
  const width = Math.max(...pixels.map((row) => row.length))
  return Array.from({ length: Math.ceil(pixels.length / 2) }, (_, row) =>
    Array.from({ length: width }, (_, col): PixelCell => {
      const top = pixels[row * 2]?.[col] ?? "."
      const bottom = pixels[row * 2 + 1]?.[col] ?? "."
      const tone = top === "@" || bottom === "@" ? "accent" : top === "#" || bottom === "#" ? "text" : undefined
      const char = top !== "." && bottom !== "." ? "█" : top !== "." ? "▀" : bottom !== "." ? "▄" : " "
      return { char, tone }
    }),
  )
}

export const pixelLogo = {
  wordmark: fold(compose("verifactor.")),
  mascot: mascotFrames.map(fold),
}
