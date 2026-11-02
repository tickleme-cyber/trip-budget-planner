@echo off
setlocal
title Java OOP Unit Tests

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

if not exist "java\bin" mkdir "java\bin"

dir /s /b java\src\*.java > java\sources.txt
"%JAVAC%" -d java\bin @java\sources.txt
if errorlevel 1 (
    if exist java\sources.txt del java\sources.txt
    echo [ERROR] Compilation failed.
    exit /b 1
)
if exist java\sources.txt del java\sources.txt

"%JAVA%" -cp java\bin com.tripbudget.TestOOP
