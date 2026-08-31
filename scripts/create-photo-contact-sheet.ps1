Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceDirectory = Join-Path $projectRoot "public\images\reales"
$outputDirectory = Join-Path $projectRoot ".visual-audit"
$outputPath = Join-Path $outputDirectory "reales-contact-sheet.jpg"

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$files = Get-ChildItem -LiteralPath $sourceDirectory -Filter "*.jpg" |
  Sort-Object Name
$columns = 6
$cellWidth = 206
$cellHeight = 238
$rows = [Math]::Ceiling($files.Count / $columns)
$canvasWidth = [int]($columns * $cellWidth)
$canvasHeight = [int]($rows * $cellHeight)
$canvas = New-Object System.Drawing.Bitmap($canvasWidth, $canvasHeight)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.Clear([System.Drawing.Color]::FromArgb(245, 247, 250))
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$font = New-Object System.Drawing.Font("Arial", 12, [System.Drawing.FontStyle]::Bold)
$labelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(10, 30, 60))
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(215, 222, 230), 1)

for ($index = 0; $index -lt $files.Count; $index++) {
  $column = $index % $columns
  $row = [Math]::Floor($index / $columns)
  $x = $column * $cellWidth
  $y = $row * $cellHeight
  $image = [System.Drawing.Image]::FromFile($files[$index].FullName)

  $targetWidth = 188
  $targetHeight = 188
  $targetX = $x + 9
  $targetY = $y + 9
  $scale = [Math]::Max($targetWidth / $image.Width, $targetHeight / $image.Height)
  $drawWidth = [int]($image.Width * $scale)
  $drawHeight = [int]($image.Height * $scale)
  $drawX = $targetX + [int](($targetWidth - $drawWidth) / 2)
  $drawY = $targetY + [int](($targetHeight - $drawHeight) / 2)

  $graphics.SetClip((New-Object System.Drawing.Rectangle($targetX, $targetY, $targetWidth, $targetHeight)))
  $graphics.DrawImage($image, $drawX, $drawY, $drawWidth, $drawHeight)
  $graphics.ResetClip()
  $graphics.DrawRectangle($borderPen, $targetX, $targetY, $targetWidth, $targetHeight)
  $graphics.DrawString($files[$index].Name, $font, $labelBrush, $x + 10, $y + 204)
  $image.Dispose()
}

$canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$borderPen.Dispose()
$labelBrush.Dispose()
$font.Dispose()
$graphics.Dispose()
$canvas.Dispose()

Write-Output $outputPath
