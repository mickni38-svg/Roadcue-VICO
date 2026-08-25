$ErrorActionPreference = 'Stop'
$sub        = '0c9615b1-5e67-4f8e-b95d-3a0a59beead6'
$rg         = 'roadcue-test-rg'
$app        = 'roadcue-api-test'
$apiVersion = '2024-03-01'

$connString = 'Server=tcp:mssql4.unoeuro.com,1433;Initial Catalog=paynsync_dk_db_VICO_TEST;User ID=paynsync_dk;Password=GwbAFyftd9Ep2agzmkRn;Encrypt=True;TrustServerCertificate=True;Connection Timeout=30;'

Write-Host "Opdaterer secret roadcue-db-connection paa $app ..." -ForegroundColor Cyan
az containerapp secret set `
	--name $app `
	--resource-group $rg `
	--secrets "roadcue-db-connection=$connString" `
	-o none

Write-Host "Starter ny revision ..." -ForegroundColor Cyan
az containerapp revision restart `
	--name $app `
	--resource-group $rg `
	--revision (az containerapp show -n $app -g $rg --query properties.latestRevisionName -o tsv) `
	-o none 2>$null

# Force a new revision by bumping a harmless annotation via update
az containerapp update -n $app -g $rg --set-env-vars "DB_SECRET_ROTATED=$(Get-Date -Format o)" -o none

Write-Host "`nVenter 45s ..." -ForegroundColor Yellow
Start-Sleep -Seconds 45

$u = "https://management.azure.com/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.App/containerApps/${app}?api-version=$apiVersion"
$r = az rest --method get --url $u -o json | ConvertFrom-Json
Write-Host ("latest={0}  ready={1}" -f $r.properties.latestRevisionName, $r.properties.latestReadyRevisionName) -ForegroundColor Green
