<#
.SYNOPSIS
    Install the Randomizer After Effects panel without an extension manager.

.DESCRIPTION
    A .zxp is just a renamed .zip. This script extracts it into
    %APPDATA%\Adobe\CEP\extensions\Randomizer\ and enables PlayerDebugMode
    on CSXS 10-12 so After Effects 2022+ will load the self-signed bundle.

    Use this when the aescripts ZXP Installer throws "Extension Manager
    init failed, status = -193" or Anastasiy's Extension Manager won't run.

.PARAMETER ZxpPath
    Path to the Randomizer-*.zxp file. If omitted, the script picks the
    newest Randomizer-*.zxp in the current directory.

.PARAMETER AllUsers
    Install to "Program Files (x86)\Common Files\Adobe\CEP\extensions\"
    instead of the per-user folder. Requires running PowerShell as
    administrator.

.EXAMPLE
    ./install.ps1
    ./install.ps1 -ZxpPath C:\Downloads\Randomizer-v1.0.0.zxp
    ./install.ps1 -AllUsers
#>
param(
    [string]$ZxpPath,
    [switch]$AllUsers
)

$ErrorActionPreference = 'Stop'

if (-not $ZxpPath) {
    $candidate = Get-ChildItem -Path . -Filter 'Randomizer-*.zxp' -ErrorAction SilentlyContinue |
                 Sort-Object LastWriteTime -Descending |
                 Select-Object -First 1
    if (-not $candidate) {
        Write-Host 'No Randomizer-*.zxp found in this folder.' -ForegroundColor Red
        Write-Host 'Drop the .zxp here, or run: ./install.ps1 -ZxpPath <path>' -ForegroundColor Yellow
        exit 1
    }
    $ZxpPath = $candidate.FullName
}

if (-not (Test-Path -LiteralPath $ZxpPath)) {
    Write-Host "File not found: $ZxpPath" -ForegroundColor Red
    exit 1
}

if ($AllUsers) {
    $extensionsRoot = Join-Path ${env:CommonProgramFiles(x86)} 'Adobe\CEP\extensions'
} else {
    $extensionsRoot = Join-Path $env:APPDATA 'Adobe\CEP\extensions'
}
$dest = Join-Path $extensionsRoot 'Randomizer'

Write-Host ''
Write-Host 'Randomizer manual install' -ForegroundColor Cyan
Write-Host "  Source : $ZxpPath"
Write-Host "  Target : $dest"
Write-Host ''

if (Test-Path -LiteralPath $dest) {
    Write-Host 'Removing previous install...' -ForegroundColor Yellow
    Remove-Item -LiteralPath $dest -Recurse -Force
}

$tempZip = Join-Path $env:TEMP "Randomizer-install-$([guid]::NewGuid()).zip"
$tempDir = Join-Path $env:TEMP "Randomizer-install-$([guid]::NewGuid())"

try {
    Copy-Item -LiteralPath $ZxpPath -Destination $tempZip -Force
    Expand-Archive -LiteralPath $tempZip -DestinationPath $tempDir -Force

    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    Copy-Item -Path (Join-Path $tempDir '*') -Destination $dest -Recurse -Force
    Write-Host 'Files copied.' -ForegroundColor Green
}
finally {
    if (Test-Path -LiteralPath $tempZip) { Remove-Item -LiteralPath $tempZip -Force -ErrorAction SilentlyContinue }
    if (Test-Path -LiteralPath $tempDir) { Remove-Item -LiteralPath $tempDir -Recurse -Force -ErrorAction SilentlyContinue }
}

Write-Host 'Enabling PlayerDebugMode for CSXS 10-12 (per-user)...' -ForegroundColor Cyan
foreach ($v in 10, 11, 12) {
    $key = "HKCU:\Software\Adobe\CSXS.$v"
    if (-not (Test-Path -LiteralPath $key)) { New-Item -Path $key -Force | Out-Null }
    Set-ItemProperty -LiteralPath $key -Name 'PlayerDebugMode' -Value '1' -Type String
}
Write-Host 'PlayerDebugMode set.' -ForegroundColor Green

Write-Host ''
Write-Host 'All done.' -ForegroundColor Green
Write-Host 'Open After Effects (restart it if it was already running)'
Write-Host 'and choose:  Window -> Extensions -> Randomizer'
Write-Host ''
