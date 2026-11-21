# Маленький локальный сервер для «Инея»: раздаёт папку игры на http://localhost:4717/.
# Нужен, чтобы браузер запомнил разрешение на микрофон (для файла с диска он спрашивает каждый раз).
# Слушает только этот компьютер (localhost), наружу ничего не открывает.
param([int]$Port = 4717, [switch]$NoOpen)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path.TrimEnd("\")
$url = "http://localhost:$Port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
try {
  $listener.Start()
} catch {
  # Порт занят. Скорее всего, игра уже запущена в другом окне — просто открываем её.
  $alive = $false
  try {
    $probe = Invoke-WebRequest -Uri ($url + "index.html") -UseBasicParsing -TimeoutSec 3
    $alive = $probe.Content -match "js/relay.js"
  } catch { }
  if ($alive) {
    Write-Host "  Игра уже запущена: $url"
    if (-not $NoOpen) { Start-Process $url }
    exit 0
  }
  Write-Host "  Не получилось занять порт $Port. Закрой программу, которая его держит, и запусти ещё раз."
  exit 1
}

Write-Host ""
Write-Host "  ИНЕЙ запущен: $url"
Write-Host "  Не закрывай это окно, пока играешь. Закроешь окно — игра остановится."
Write-Host ""
if (-not $NoOpen) { Start-Process $url }

$mime = @{
  ".html" = "text/html; charset=utf-8"; ".js" = "text/javascript; charset=utf-8"; ".css" = "text/css; charset=utf-8"
  ".json" = "application/json; charset=utf-8"; ".svg" = "image/svg+xml"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"
  ".png" = "image/png"; ".webp" = "image/webp"; ".ico" = "image/x-icon"; ".mp3" = "audio/mpeg"; ".woff2" = "font/woff2"
}

try {
  while ($listener.IsListening) {
    $task = $listener.GetContextAsync()
    while (-not $task.Wait(250)) { }
    $ctx = $task.Result
    $res = $ctx.Response
    try {
      $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
      if ($rel -eq "") { $rel = "index.html" }
      $full = [IO.Path]::GetFullPath((Join-Path $root $rel))
      $inside = $full.StartsWith($root + "\", [StringComparison]::OrdinalIgnoreCase)
      $hidden = ($rel -split "[\\/]") | Where-Object { $_.StartsWith(".") }
      if (-not $inside -or $hidden -or -not (Test-Path -LiteralPath $full -PathType Leaf)) {
        $res.StatusCode = 404
      } else {
        $bytes = [IO.File]::ReadAllBytes($full)
        $ext = [IO.Path]::GetExtension($full).ToLower()
        if ($mime.ContainsKey($ext)) { $res.ContentType = $mime[$ext] } else { $res.ContentType = "application/octet-stream" }
        $res.Headers["Cache-Control"] = "no-cache"
        $res.ContentLength64 = $bytes.Length
        if ($ctx.Request.HttpMethod -ne "HEAD") { $res.OutputStream.Write($bytes, 0, $bytes.Length) }
      }
    } catch {
      try { $res.StatusCode = 500 } catch { }
    } finally {
      try { $res.Close() } catch { }
    }
  }
} finally {
  $listener.Stop()
}
