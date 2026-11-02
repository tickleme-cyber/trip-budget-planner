@echo off
setlocal
title TripBudget Planner - Java PBL Project

echo ===================================================
echo   TripBudget Planner - Java PBL Evaluation Launcher
echo ===================================================

cd /d "%~dp0"

set JAVAC=C:\Users\skand\.antigravity\extensions\redhat.java-1.54.0-win32-x64\jre\21.0.10-win32-x86_64\bin\javac.exe
set JAVA=C:\Users\skand\.antigravity\extensions\redhat.java-1.54.0-win32-x64\jre\21.0.10-win32-x86_64\bin\java.exe

if not exist "%JAVAC%" (
    set JAVAC=C:\Users\skand\.antigravity-ide\extensions\redhat.java-1.58.0-win32-x64\jre\25.0.4.1-win32-x86_64\bin\javac.exe
    set JAVA=C:\Users\skand\.antigravity-ide\extensions\redhat.java-1.58.0-win32-x64\jre\25.0.4.1-win32-x86_64\bin\java.exe
)

if not exist "%JAVAC%" (
    set JAVAC=javac
    set JAVA=java
)

echo [1/3] Using Java Compiler: "%JAVAC%"

if not exist "java\bin" (
    mkdir "java\bin"
)

echo [2/3] Compiling Java source files...
dir /s /b java\src\*.java > java\sources.txt
"%JAVAC%" -d java\bin @java\sources.txt

if errorlevel 1 (
    echo [ERROR] Compilation failed.
    pause
    exit /b 1
)

if exist java\sources.txt del java\sources.txt
echo [2/3] Compilation SUCCESS!

echo [3/3] Launching TripBudget Application GUI...
start "" "%JAVA%" -cp java\bin com.tripbudget.Main
echo [DONE] TripBudget GUI is now running!
