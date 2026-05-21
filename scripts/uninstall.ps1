<#
.SYNOPSIS
    Remove the Randomizer panel installed by install.ps1.

.PARAMETER AllUsers
    Remove from the all-users CEP folder under "Program Files (x86)"
    instead of the per-user folder.
#>
param(
    [switch]$AllUsers
)

$ErrorActionPreference = 'Stop'

if ($AllUsers) {
    $extensionsRoot = Join-Path ${env:CommonProgramFiles(x86)} 'Adobe\CEP\extensions'
} else {
    $extensionsRoot = Join-Path $env:APPDATA 'Adobe\CEP\extensions'
}
$dest = Join-Path $extensionsRoot 'Randomizer'

if (Test-Path -LiteralPath $dest) {
    Remove-Item -LiteralPath $dest -Recurse -Force
    Write-Host "Removed: $dest" -ForegroundColor Green
} else {
    Write-Host "Nothing installed at: $dest" -ForegroundColor Yellow
}
