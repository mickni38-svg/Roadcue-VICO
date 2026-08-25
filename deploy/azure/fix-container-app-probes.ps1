# =============================================================================
# fix-container-app-probes.ps1
#
# Retter health-probes på begge Roadcue Container Apps så de matcher
# faktisk lyttende port og eksisterende endpoints.
#
# BAGGRUND
#   roadcue-api-test  : ASP.NET Core lytter på 8080, har /health endpoint
#   roadcue-vico-test : FastAPI lytter på 8000, har /health endpoint
#
#   Begge apps blev oprettet fra "simple-hello-world" template hvor probes
#   pegede på port 80. Det matchede aldrig med de faktiske containere.
#
# FORUDSÆTNINGER
#   1. az CLI installeret
#   2. Logget ind i den TENANT hvor Roadcue-ressourcerne ligger:
#        az login --tenant mickni33hotmail.onmicrosoft.com
#   3. Container Apps extension:
#        az extension add --name containerapp --upgrade
# =============================================================================

param(
	[string]$SubscriptionId = "0c9615b1-5e67-4f8e-b95d-3a0a59beead6",
	[string]$ResourceGroup  = "roadcue-test-rg"
)

$ErrorActionPreference = "Stop"

Write-Host "Skifter til subscription $SubscriptionId..." -ForegroundColor Cyan
az account set --subscription $SubscriptionId | Out-Null

# ---------------------------------------------------------------------------
# 1. Fix roadcue-api-test  (ASP.NET Core, port 8080, /health)
# ---------------------------------------------------------------------------
Write-Host "`n=== Retter probes for roadcue-api-test ===" -ForegroundColor Yellow

$apiProbes = @'
[
  {
	"type": "Liveness",
	"httpGet": { "path": "/health", "port": 8080, "scheme": "HTTP" },
	"initialDelaySeconds": 15,
	"periodSeconds": 30,
	"timeoutSeconds": 5,
	"failureThreshold": 3
  },
  {
	"type": "Startup",
	"tcpSocket": { "port": 8080 },
	"initialDelaySeconds": 5,
	"periodSeconds": 5,
	"timeoutSeconds": 3,
	"failureThreshold": 30
  }
]
'@

$apiProbesFile = New-TemporaryFile
$apiProbes | Set-Content -Path $apiProbesFile -Encoding utf8

az containerapp update `
	--name roadcue-api-test `
	--resource-group $ResourceGroup `
	--container-name simple-hello-world-container `
	--probes "@$apiProbesFile"

Remove-Item $apiProbesFile

# ---------------------------------------------------------------------------
# 2. Fix roadcue-vico-test  (FastAPI, port 8000, /health)
# ---------------------------------------------------------------------------
Write-Host "`n=== Retter probes for roadcue-vico-test ===" -ForegroundColor Yellow

$vicoProbes = @'
[
  {
	"type": "Liveness",
	"httpGet": { "path": "/health", "port": 8000, "scheme": "HTTP" },
	"initialDelaySeconds": 15,
	"periodSeconds": 30,
	"timeoutSeconds": 5,
	"failureThreshold": 3
  },
  {
	"type": "Startup",
	"tcpSocket": { "port": 8000 },
	"initialDelaySeconds": 5,
	"periodSeconds": 5,
	"timeoutSeconds": 3,
	"failureThreshold": 30
  }
]
'@

$vicoProbesFile = New-TemporaryFile
$vicoProbes | Set-Content -Path $vicoProbesFile -Encoding utf8

az containerapp update `
	--name roadcue-vico-test `
	--resource-group $ResourceGroup `
	--container-name simple-hello-world-container `
	--probes "@$vicoProbesFile"

Remove-Item $vicoProbesFile

# ---------------------------------------------------------------------------
# 3. Verificer at nyeste revisioner bliver ready
# ---------------------------------------------------------------------------
Write-Host "`n=== Venter og verificerer status ===" -ForegroundColor Yellow
Start-Sleep -Seconds 20

foreach ($app in @("roadcue-api-test", "roadcue-vico-test")) {
	$info = az containerapp show `
		--name $app `
		--resource-group $ResourceGroup `
		--query "{latest:properties.latestRevisionName, ready:properties.latestReadyRevisionName, status:properties.runningStatus}" `
		-o json | ConvertFrom-Json

	$ok = $info.latest -eq $info.ready
	$color = if ($ok) { "Green" } else { "Red" }
	Write-Host ("{0,-24} latest={1}  ready={2}  status={3}" -f $app, $info.latest, $info.ready, $info.status) -ForegroundColor $color
}

Write-Host "`nFærdig. Test frontenden igen." -ForegroundColor Cyan
