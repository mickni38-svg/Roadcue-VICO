$ErrorActionPreference = 'Stop'
$sub        = '0c9615b1-5e67-4f8e-b95d-3a0a59beead6'
$rg         = 'roadcue-test-rg'
$apiVersion = '2024-03-01'

function Set-ProbesForContainerApp {
	param(
		[string]$AppName,
		[int]$HttpPort
	)

	Write-Host "`n=== Retter probes for $AppName (port $HttpPort) ===" -ForegroundColor Cyan
	$url = "https://management.azure.com/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.App/containerApps/${AppName}?api-version=$apiVersion"

	$current = az rest --method get --url $url -o json | ConvertFrom-Json

	$newProbes = @(
		@{
			type                = 'Liveness'
			httpGet             = @{ path = '/health'; port = $HttpPort; scheme = 'HTTP' }
			initialDelaySeconds = 15
			periodSeconds       = 30
			timeoutSeconds      = 5
			failureThreshold    = 3
			successThreshold    = 1
		},
		@{
			type                = 'Startup'
			tcpSocket           = @{ port = $HttpPort }
			initialDelaySeconds = 5
			periodSeconds       = 5
			timeoutSeconds      = 3
			failureThreshold    = 30
			successThreshold    = 1
		}
	)

	$current.properties.template.containers[0].probes = $newProbes

	$body = @{
		properties = @{
			template = $current.properties.template
		}
	} | ConvertTo-Json -Depth 25 -Compress

	$bodyFile = New-TemporaryFile
	Set-Content -Path $bodyFile -Value $body -Encoding utf8

	az rest --method patch --url $url --body "@$bodyFile" --headers "Content-Type=application/json" -o none

	Remove-Item $bodyFile
	Write-Host "PATCH sendt for $AppName" -ForegroundColor Green
}

Set-ProbesForContainerApp -AppName 'roadcue-api-test'  -HttpPort 8080
Set-ProbesForContainerApp -AppName 'roadcue-vico-test' -HttpPort 8000

Write-Host "`nVenter 30s og verificerer status..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

foreach ($app in 'roadcue-api-test', 'roadcue-vico-test') {
	$url = "https://management.azure.com/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.App/containerApps/${app}?api-version=$apiVersion"
	$r = az rest --method get --url $url -o json | ConvertFrom-Json
	$latest = $r.properties.latestRevisionName
	$ready  = $r.properties.latestReadyRevisionName
	$ok     = $latest -eq $ready
	$color  = if ($ok) { 'Green' } else { 'Yellow' }
	Write-Host ("{0,-24}  latest={1}  ready={2}" -f $app, $latest, $ready) -ForegroundColor $color
}
