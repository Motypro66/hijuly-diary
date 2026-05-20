# 一键开启 GitHub Pages（Deploy from branch）
# 用法（PowerShell）：
#   $env:GH_TOKEN = "github_pat_xxxx"
#   .\scripts\enable-github-pages.ps1

$ErrorActionPreference = "Stop"
$Owner = "Motypro66"
$Repo = "Ircz-diary"

if (-not $env:GH_TOKEN) {
  Write-Host ""
  Write-Host "需要 GitHub Token。请先到：" -ForegroundColor Yellow
  Write-Host "https://github.com/settings/tokens?type=beta" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "创建 Fine-grained token："
  Write-Host "  - Repository access: Only $Repo"
  Write-Host "  - Permissions: Contents (Read), Pages (Read and write), Administration (Read)"
  Write-Host ""
  Write-Host "然后运行："
  Write-Host '  $env:GH_TOKEN = "粘贴你的token"' -ForegroundColor Green
  Write-Host "  .\scripts\enable-github-pages.ps1"
  exit 1
}

$headers = @{
  Authorization = "Bearer $($env:GH_TOKEN)"
  Accept        = "application/vnd.github+json"
  "X-GitHub-Api-Version" = "2022-11-28"
}

$body = @{
  build_type = "legacy"
  source     = @{
    branch = "main"
    path   = "/"
  }
} | ConvertTo-Json -Depth 3

$uri = "https://api.github.com/repos/$Owner/$Repo/pages"

Write-Host "正在开启 Pages（main / root）..."

try {
  $r = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body -ContentType "application/json"
  Write-Host "成功！" -ForegroundColor Green
  Write-Host "网址: https://$($Owner.ToLower()).github.io/$Repo/"
  Write-Host "地图: https://$($Owner.ToLower()).github.io/$Repo/map.html"
  $r | ConvertTo-Json
} catch {
  if ($_.Exception.Response.StatusCode.value__ -eq 409) {
    Write-Host "Pages 已存在，尝试更新配置..." -ForegroundColor Yellow
    $r2 = Invoke-RestMethod -Uri $uri -Method Put -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "更新成功！" -ForegroundColor Green
    Write-Host "网址: https://$($Owner.ToLower()).github.io/$Repo/map.html"
    $r2 | ConvertTo-Json
  } else {
    Write-Host "失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message }
    exit 1
  }
}

Write-Host ""
Write-Host "请等 1-3 分钟后打开地图链接。用完后可到 GitHub 删除此 Token。" -ForegroundColor Yellow
