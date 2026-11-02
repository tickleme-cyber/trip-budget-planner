# PowerShell Launcher for TripBudget Java Application
$ErrorActionPreference = "Stop"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Trip Budget Planner - Java Desktop Application   " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot
Set-Location $WorkspaceRoot

$CandidateJavac = @(
    "C:\Users\skand\.antigravity\extensions\redhat.java-1.54.0-win32-x64\jre\21.0.10-win32-x86_64\bin\javac.exe",
    "C:\Users\skand\.antigravity-ide\extensions\redhat.java-1.58.0-win32-x64\jre\25.0.4.1-win32-x86_64\bin\javac.exe",
    "C:\Users\skand\.antigravity-ide\extensions\redhat.java-1.56.0-win32-x64\jre\21.0.12.1-win32-x86_64\bin\javac.exe"
)

$JavacPath = $CandidateJavac | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $JavacPath) {
    $JavacPath = (Get-Command javac -ErrorAction SilentlyContinue).Source
}

if ($JavacPath) {
    $JavaPath = Join-Path (Split-Path $JavacPath) "java.exe"
} else {
    $JavaPath = (Get-Command java -ErrorAction SilentlyContinue).Source
}

if (-not $JavacPath) {
    Write-Error "JDK compiler (javac.exe) not found. Please install JDK 17+ or add it to PATH."
    exit 1
}

Write-Host "[1/3] Using JDK Compiler: $JavacPath" -ForegroundColor Green

# Create bin directory
$BinDir = Join-Path $WorkspaceRoot "java\bin"
$SrcDir = Join-Path $WorkspaceRoot "java\src"

if (-not (Test-Path $BinDir)) {
    New-Item -ItemType Directory -Path $BinDir -Force | Out-Null
}

# Collect source files
$SourceFiles = (Get-ChildItem -Path $SrcDir -Filter "*.java" -Recurse).FullName
Write-Host "[2/3] Compiling $($SourceFiles.Count) Java source files..." -ForegroundColor Yellow

& $JavacPath -d $BinDir $SourceFiles
Write-Host "[2/3] Compilation SUCCESS!" -ForegroundColor Green

Write-Host "[3/3] Launching TripBudget Application GUI..." -ForegroundColor Cyan
Start-Process -FilePath $JavaPath -ArgumentList "-cp `"$BinDir`" com.tripbudget.Main"
Write-Host "[DONE] TripBudget GUI is now running!" -ForegroundColor Green
