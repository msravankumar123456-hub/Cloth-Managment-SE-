# Run this script in PowerShell as Administrator to enable custom local hostnames:
# team.8, team8.local, and loopmex.local

$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$entry = "127.0.0.1 team.8 team8.local loopmex.local"

$content = Get-Content $hostsPath -Raw
if ($content -notmatch "team\.8|team8\.local|loopmex\.local") {
    Add-Content -Path $hostsPath -Value "`n# Loopmex Local Dev Domains`n$entry"
    Write-Host "Successfully added local domains to hosts file!" -ForegroundColor Green
} else {
    Write-Host "Local domain entry already exists in hosts file." -ForegroundColor Yellow
}
