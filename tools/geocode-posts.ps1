$ErrorActionPreference = "Stop"
$jsonPath = Join-Path $PSScriptRoot "..\data\posts.json"
$posts = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$ua = "hijuly-diary/4.6"

foreach ($p in $posts) {
    if (-not $p.mapsQuery -or -not $p.isFood) { continue }
    if ($p.PSObject.Properties['lat']) { $p.PSObject.Properties.Remove('lat') }
    if ($p.PSObject.Properties['lng']) { $p.PSObject.Properties.Remove('lng') }
    $q = [uri]::EscapeDataString($p.mapsQuery)
    Start-Sleep -Milliseconds 1100
    try {
        $res = Invoke-RestMethod -Uri "https://nominatim.openstreetmap.org/search?q=$q&format=json&limit=1" -Headers @{ "User-Agent" = $ua }
        if ($res -and @($res).Count -gt 0) {
            $p | Add-Member -NotePropertyName lat -NotePropertyValue ([double]$res[0].lat) -Force
            $p | Add-Member -NotePropertyName lng -NotePropertyValue ([double]$res[0].lon) -Force
            Write-Host "OK $($p.id)"
        } else {
            Write-Host "MISS $($p.id)"
        }
    } catch {
        Write-Host "FAIL $($p.id)"
    }
}

$posts | ConvertTo-Json -Depth 10 | Set-Content $jsonPath -Encoding UTF8
$geo = ($posts | Where-Object { $_.lat }).Count
Write-Host "Geocoded=$geo"
