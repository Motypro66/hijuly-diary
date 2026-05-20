$site = Split-Path $PSScriptRoot -Parent
$dest = Join-Path $site 'deploy\netlify-upload'
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item -ItemType Directory -Path $dest | Out-Null
Copy-Item (Join-Path $site 'index.html'), (Join-Path $site 'map.html') -Destination $dest
foreach ($dir in @('css', 'js', 'data', 'assets')) {
    Copy-Item (Join-Path $site $dir) (Join-Path $dest $dir) -Recurse
}
Write-Host "Synced -> $dest"
