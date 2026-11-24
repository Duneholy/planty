$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$bundled = Join-Path $root 'runtime\node\node.exe'

function Test-SystemNode {
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if (-not $cmd) { return $false }
  $major = & node -p "Number(process.versions.node.split('.')[0])"
  return [int]$major -ge 18
}

if (Test-SystemNode) { exit 0 }
if (Test-Path $bundled) { exit 0 }

$ver = 'v26.13.1'
$arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'win-arm64' } else { 'win-x64' }
$url = "https://nodejs.org/dist/$ver/node-$ver-$arch.zip"
$runtime = Join-Path $root 'runtime'
New-Item -ItemType Directory -Force -Path $runtime | Out-Null
$zip = Join-Path $runtime 'node.zip'

Write-Host ""
Write-Host "  Первый запуск: скачиваю Node.js $ver."
Write-Host "  Это один раз, дальше Planty будет открываться сразу."
Write-Host ""

Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
Expand-Archive -Force -Path $zip -DestinationPath $runtime
$inner = Join-Path $runtime "node-$ver-$arch"
$dest = Join-Path $runtime 'node'
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
if (-not (Test-Path $inner)) { throw "Архив Node.js распаковался не так, как ожидалось." }
Rename-Item $inner 'node'
Remove-Item $zip
Write-Host "  Готово."
Write-Host ""
