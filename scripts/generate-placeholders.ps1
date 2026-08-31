Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $projectRoot "public\images"
$sourceDirectories = @(
  (Join-Path $projectRoot "app"),
  (Join-Path $projectRoot "components"),
  (Join-Path $projectRoot "data")
)

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot "RECURSOS\logo.jpg") -Destination (Join-Path $projectRoot "public\logo.jpg") -Force

$imageNames = foreach ($sourceDirectory in $sourceDirectories) {
  Get-ChildItem -LiteralPath $sourceDirectory -Recurse -File -Include *.ts, *.tsx |
    ForEach-Object {
      $source = Get-Content -Raw -LiteralPath $_.FullName
      [regex]::Matches($source, '/images/(?<name>[a-z0-9-]+\.jpg)') |
        ForEach-Object { $_.Groups["name"].Value }
    }
}

$imageNames = $imageNames | Sort-Object -Unique

foreach ($imageName in $imageNames) {
  $isHero = $imageName -eq "hero-puerta-seccional.jpg"
  $width = if ($isHero) { 1600 } else { 1200 }
  $height = if ($isHero) { 1000 } else { 900 }
  $bitmap = New-Object System.Drawing.Bitmap($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $bounds = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
  $background = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $bounds,
    [System.Drawing.Color]::FromArgb(7, 21, 39),
    [System.Drawing.Color]::FromArgb(28, 66, 99),
    22
  )
  $graphics.FillRectangle($background, $bounds)

  $wallBrush = New-Object System.Drawing.SolidBrush(
    [System.Drawing.Color]::FromArgb(225, 27, 40, 57)
  )
  $doorBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Rectangle([int]($width * 0.34), [int]($height * 0.25), [int]($width * 0.53), [int]($height * 0.57))),
    [System.Drawing.Color]::FromArgb(83, 99, 113),
    [System.Drawing.Color]::FromArgb(35, 45, 57),
    90
  )
  $building = [System.Drawing.Point[]]@(
    (New-Object System.Drawing.Point([int]($width * 0.18), [int]($height * 0.28))),
    (New-Object System.Drawing.Point([int]($width * 0.82), [int]($height * 0.16))),
    (New-Object System.Drawing.Point([int]($width * 0.92), [int]($height * 0.78))),
    (New-Object System.Drawing.Point([int]($width * 0.18), [int]($height * 0.78)))
  )
  $graphics.FillPolygon($wallBrush, $building)

  $doorRectangle = New-Object System.Drawing.Rectangle(
    [int]($width * 0.34),
    [int]($height * 0.32),
    [int]($width * 0.49),
    [int]($height * 0.46)
  )
  $graphics.FillRectangle($doorBrush, $doorRectangle)

  $linePen = New-Object System.Drawing.Pen(
    [System.Drawing.Color]::FromArgb(80, 180, 210, 231),
    2
  )
  for ($line = 1; $line -le 7; $line++) {
    $lineY = [int]($doorRectangle.Y + ($doorRectangle.Height / 8) * $line)
    $graphics.DrawLine(
      $linePen,
      $doorRectangle.X,
      $lineY,
      $doorRectangle.Right,
      $lineY
    )
  }

  $accentPen = New-Object System.Drawing.Pen(
    [System.Drawing.Color]::FromArgb(78, 163, 240),
    6
  )
  $graphics.DrawLine(
    $accentPen,
    [int]($width * 0.18),
    [int]($height * 0.28),
    [int]($width * 0.82),
    [int]($height * 0.16)
  )

  $overlayBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $bounds,
    [System.Drawing.Color]::FromArgb(215, 7, 21, 39),
    [System.Drawing.Color]::FromArgb(12, 7, 21, 39),
    0
  )
  $graphics.FillRectangle($overlayBrush, $bounds)

  $smallFont = New-Object System.Drawing.Font("Arial", 18, [System.Drawing.FontStyle]::Bold)
  $nameFont = New-Object System.Drawing.Font("Arial", 27, [System.Drawing.FontStyle]::Bold)
  $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(242, 255, 255, 255))
  $blueBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(78, 163, 240))
  $labelX = [int]($width * 0.065)
  $labelY = [int]($height * 0.72)

  $graphics.DrawString("FOTO REAL PENDIENTE", $smallFont, $blueBrush, $labelX, $labelY)
  $readableName = [System.IO.Path]::GetFileNameWithoutExtension($imageName).Replace("-", " ").ToUpperInvariant()
  $nameArea = New-Object System.Drawing.RectangleF(
    $labelX,
    [int]($labelY + 35),
    [int]($width * 0.62),
    [int]($height * 0.18)
  )
  $graphics.DrawString($readableName, $nameFont, $whiteBrush, $nameArea)

  $outputPath = Join-Path $outputDirectory $imageName
  $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)

  $smallFont.Dispose()
  $nameFont.Dispose()
  $whiteBrush.Dispose()
  $blueBrush.Dispose()
  $accentPen.Dispose()
  $linePen.Dispose()
  $overlayBrush.Dispose()
  $doorBrush.Dispose()
  $wallBrush.Dispose()
  $background.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

Write-Output ("Generated {0} placeholders and copied the official logo." -f $imageNames.Count)
