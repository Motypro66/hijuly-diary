# Fix mapsQuery / isFood / region in posts.json
$ErrorActionPreference = "Stop"
$jsonPath = Join-Path $PSScriptRoot "..\data\posts.json"
$posts = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

function Set-Prop($obj, [string]$name, $value) {
    if ($obj.PSObject.Properties[$name]) { $obj.$name = $value }
    else { $obj | Add-Member -NotePropertyName $name -NotePropertyValue $value }
}

function Remove-Prop($obj, [string]$name) {
    if ($obj.PSObject.Properties[$name]) { $obj.PSObject.Properties.Remove($name) }
}

function Clean-Text([string]$s) {
    if (-not $s) { return "" }
    $s = $s -replace '📍', ''
    return ($s -replace '^\[打卡R\]\s*', '' -replace '^\-\s*', '' -replace '\-\s*$', '').Trim()
}

function Extract-MapsFromBody([string]$body) {
    if (-not $body) { return $null }

    if ($body -match '(?ms)(?:^|\r?\n)📍\s*(.+?)\r?\n([^\r\n#@]+(?:\r?\n[^\r\n#@]+)?)') {
        $name = Clean-Text $Matches[1]
        $addr = ($Matches[2] -replace '\r?\n', ', ').Trim().TrimEnd(',')
        if ($addr -match '^(Jalan|Lot|G-|No\.|[\d])') {
            return @{ placeName = $name; address = $addr; mapsQuery = "$name, $addr" }
        }
        if ($name -match '[，,]') {
            $short = ($name -split '[，,]' | Select-Object -First 1).Trim()
            return @{ placeName = $short; address = ""; mapsQuery = "$name, Malaysia" }
        }
        return @{ placeName = $name; address = ""; mapsQuery = "$name, Malaysia" }
    }

    if ($body -match '(?ms)(?:^|\r?\n)\[打卡R\](.+?)(?:\r?\n([^\r\n#@]+))?') {
        $name = Clean-Text $Matches[1]
        $next = if ($Matches[2]) { $Matches[2].Trim() } else { "" }
        if ($next -match '^(Jalan|Lot|G-|No\.|[\d]|Menara|Level|L\d)') {
            return @{ placeName = $name; address = $next; mapsQuery = "$name, $next" }
        }
        return @{ placeName = $name; address = ""; mapsQuery = "$name, Malaysia" }
    }

    if ($body -match '(?m)^-\s*(.+?)-\s*$') {
        $name = Clean-Text $Matches[1]
        return @{ placeName = $name; address = ""; mapsQuery = "$name, Malaysia" }
    }
    return $null
}

$nonFoodIds = @(
    'p-665fd4850000000015013a0c',
    'p-66348881000000001e022408',
    'p-66436ac5000000001e02c7e7',
    'p-66c0df76000000000503acaf',
    'p-6698d281000000000a025bb6'
)

$regionFix = @{
    'p-671b8c550000000016022a48' = 'jb'
    'p-68023fe30000000009039499' = 'kv'
    'p-668d34d2000000000a025c38' = 'klang'
    'p-68a87f7b000000001d02f439' = 'kv'
}

$manualMaps = @{
    'p-661a2677000000001b00dde0' = @{ placeName = '麻辣客栈'; mapsQuery = '麻辣客栈 SS15 Subang Jaya, Malaysia' }
    'p-661d01d4000000001c00a611' = @{ placeName = '人人食堂'; mapsQuery = '人人食堂 Subang Jaya, Malaysia' }
}

foreach ($p in $posts) {
    Remove-Prop $p 'lat'
    Remove-Prop $p 'lng'

    if ($nonFoodIds -contains $p.id) {
        Set-Prop $p 'isFood' $false
        if ($p.id -eq 'p-665fd4850000000015013a0c') { Set-Prop $p 'category' 'other' }
        elseif ($p.id -eq 'p-66436ac5000000001e02c7e7') { Set-Prop $p 'category' 'haowu' }
        else { Set-Prop $p 'category' 'haokang' }
    }

    if ($regionFix.ContainsKey($p.id)) {
        Set-Prop $p 'region' $regionFix[$p.id]
    }

    $extracted = Extract-MapsFromBody $p.body
    if ($extracted) {
        Set-Prop $p 'placeName' $extracted.placeName
        if ($extracted.address) { Set-Prop $p 'address' $extracted.address }
        Set-Prop $p 'mapsQuery' $extracted.mapsQuery
    }

    if ($manualMaps.ContainsKey($p.id)) {
        $m = $manualMaps[$p.id]
        Set-Prop $p 'placeName' $m.placeName
        Set-Prop $p 'mapsQuery' $m.mapsQuery
    }

    if ($p.placeName) { Set-Prop $p 'placeName' (Clean-Text $p.placeName) }
    if ($p.address) { Set-Prop $p 'address' (($p.address -replace 'Kuala Lumpu\b', 'Kuala Lumpur').Trim()) }
    if ($p.mapsQuery) {
        $mq = Clean-Text (($p.mapsQuery -replace 'Kuala Lumpu\b', 'Kuala Lumpur'))
        if ($p.address -and $p.placeName -and $mq -notmatch [regex]::Escape($p.address)) {
            $mq = "$($p.placeName), $($p.address)"
        }
        Set-Prop $p 'mapsQuery' $mq
    }

    if ($p.id -eq 'p-68023fe30000000009039499') {
        Set-Prop $p 'location' 'Klang Valley · Kepong'
    }
}

$ua = "hijuly-diary/4.6 (contact@example.com)"
foreach ($p in ($posts | Where-Object { $_.mapsQuery })) {
    Remove-Prop $p 'lat'
    Remove-Prop $p 'lng'
    $q = [uri]::EscapeDataString($p.mapsQuery)
    Start-Sleep -Milliseconds 1100
    try {
        $res = Invoke-RestMethod -Uri "https://nominatim.openstreetmap.org/search?q=$q&format=json&limit=1" -Headers @{ "User-Agent" = $ua }
        if ($res -and @($res).Count -gt 0) {
            Set-Prop $p 'lat' ([double]$res[0].lat)
            Set-Prop $p 'lng' ([double]$res[0].lon)
        }
    } catch {
        Write-Warning "Geocode failed for $($p.id)"
    }
}

$posts | ConvertTo-Json -Depth 10 | Set-Content $jsonPath -Encoding UTF8
$food = ($posts | Where-Object { $_.isFood }).Count
$maps = ($posts | Where-Object { $_.mapsQuery }).Count
$geo = ($posts | Where-Object { $_.lat }).Count
Write-Host "Done. Food=$food Maps=$maps Geocoded=$geo"
