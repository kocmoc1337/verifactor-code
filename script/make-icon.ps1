# Рисует verifactor.ico: пиксельный персонаж (как в логотипе приложения) на тёмном фоне сайта.
# Запуск: powershell -File script\make-icon.ps1
Add-Type -AssemblyName System.Drawing

$mascot = @(
  '..####..',
  '.######.',
  '##.##.##',
  '########',
  '########',
  '.#.##.#.',
  '#......#'
)
$background = [System.Drawing.Color]::FromArgb(255, 10, 10, 10)
$tile = [System.Drawing.Color]::FromArgb(255, 28, 28, 26)
$accent = [System.Drawing.Color]::FromArgb(255, 255, 95, 31)
$out = Join-Path $PSScriptRoot '..\verifactor.ico'

function Draw-Icon([int]$size) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bitmap)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::Transparent)

  # Rounded dark tile with a subtle inner grid, like the site's pixel grid.
  $radius = [Math]::Max(2, [int]($size * 0.18))
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $radius * 2
  $path.AddArc(0, 0, $d, $d, 180, 90)
  $path.AddArc($size - $d - 1, 0, $d, $d, 270, 90)
  $path.AddArc($size - $d - 1, $size - $d - 1, $d, $d, 0, 90)
  $path.AddArc(0, $size - $d - 1, $d, $d, 90, 90)
  $path.CloseFigure()
  $g.FillPath((New-Object System.Drawing.SolidBrush $background), $path)
  $g.SetClip($path)

  # Pixel art: 8 columns x 7 rows centered in a 12-cell grid, crisp squares.
  $g.SmoothingMode = 'None'
  $cell = $size / 12.0
  if ($size -ge 48) {
    $gridBrush = New-Object System.Drawing.SolidBrush $tile
    foreach ($gy in 0..11) { foreach ($gx in 0..11) {
      if ((($gx * 7 + $gy * 13) % 9) -eq 0) {
        $g.FillRectangle($gridBrush, [float]($gx * $cell + 1), [float]($gy * $cell + 1), [float]($cell - 2), [float]($cell - 2))
      }
    } }
  }
  $brush = New-Object System.Drawing.SolidBrush $accent
  $left = 2; $top = 2.5
  for ($y = 0; $y -lt $mascot.Count; $y++) {
    for ($x = 0; $x -lt 8; $x++) {
      if ($mascot[$y][$x] -ne '#') { continue }
      $px = [Math]::Floor(($left + $x) * $cell)
      $py = [Math]::Floor(($top + $y) * $cell)
      $g.FillRectangle($brush, [float]$px, [float]$py, [float]([Math]::Ceiling($cell)), [float]([Math]::Ceiling($cell)))
    }
  }
  $g.Dispose()
  $stream = New-Object System.IO.MemoryStream
  $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
  return ,$stream.ToArray()
}

# ICO container with PNG-compressed entries (supported since Windows Vista).
$sizes = 16, 24, 32, 48, 64, 128, 256
$images = $sizes | ForEach-Object { ,(Draw-Icon $_) }
$file = New-Object System.IO.MemoryStream
$w = New-Object System.IO.BinaryWriter $file
$w.Write([uint16]0); $w.Write([uint16]1); $w.Write([uint16]$sizes.Count)
$offset = 6 + 16 * $sizes.Count
for ($i = 0; $i -lt $sizes.Count; $i++) {
  $s = $sizes[$i]; $data = $images[$i]
  $dim = if ($s -ge 256) { 0 } else { $s }
  $w.Write([byte]$dim); $w.Write([byte]$dim); $w.Write([byte]0); $w.Write([byte]0)
  $w.Write([uint16]1); $w.Write([uint16]32); $w.Write([uint32]$data.Length); $w.Write([uint32]$offset)
  $offset += $data.Length
}
foreach ($data in $images) { $w.Write([byte[]]$data) }
$w.Flush()
[System.IO.File]::WriteAllBytes($out, $file.ToArray())
# Preview PNG for checking the artwork.
[System.IO.File]::WriteAllBytes((Join-Path $PSScriptRoot '..\verifactor-icon.png'), $images[-1])
"icon: $((Resolve-Path $out).Path)"
