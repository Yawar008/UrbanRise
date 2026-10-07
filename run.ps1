$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
Set-Location $root

Write-Host "Restoring backend and test dependencies..."
dotnet restore backend/backend.csproj
dotnet restore Backend.Tests/Backend.Tests.csproj

Write-Host "Installing frontend dependencies..."
npm ci --prefix frontend

Write-Host "Starting backend..."
$backend = Start-Process `
    -FilePath "dotnet" `
    -ArgumentList "run --project backend/backend.csproj" `
    -WorkingDirectory $root `
    -PassThru

try {
    Write-Host "Waiting for backend on https://localhost:7043..."

    $ready = $false

    for ($i = 0; $i -lt 60; $i++) {
        try {
            $connection = Test-NetConnection `
                -ComputerName "localhost" `
                -Port 7043 `
                -WarningAction SilentlyContinue

            if ($connection.TcpTestSucceeded) {
                $ready = $true
                break
            }
        }
        catch {
        }

        Start-Sleep -Seconds 1
    }

    if (-not $ready) {
        throw "Backend did not become available on port 7043."
    }

    Write-Host "Backend is ready."
    Write-Host "Starting frontend..."

    npm --prefix frontend run dev

}
finally {
    if ($backend -and -not $backend.HasExited) {
        Write-Host "Stopping backend..."
        Stop-Process -Id $backend.Id -Force
    }
}
