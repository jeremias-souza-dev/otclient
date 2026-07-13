@echo off
REM Builda o APK Android (arm64-v8a) do otclient-mobile.
REM Pressupoe que o setup ja foi feito uma vez (WSL Ubuntu, Android SDK/NDK,
REM vcpkg, LuaJIT, data.zip) - ver como-complitar.txt nesta mesma pasta.
REM Este script so roda a etapa final (Gradle assembleRelease), que e
REM incremental: pode rodar de novo quantas vezes precisar.

setlocal
set SCRIPT_DIR=%~dp0
set APK_SRC=%SCRIPT_DIR%android\app\build\outputs\apk\release\app-release.apk
set APK_DEST=%SCRIPT_DIR%app-release.apk

echo ============================================
echo  Build Android - otclient (arm64-v8a)
echo ============================================
echo.

wsl -d Ubuntu -- bash /mnt/c/Users/jerem/Downloads/dragonball/otclient-mobile/wsl_run_gradle.sh

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ============================================
    echo  BUILD FALHOU - veja o erro acima
    echo ============================================
    pause
    exit /b %ERRORLEVEL%
)

if not exist "%APK_SRC%" (
    echo.
    echo ============================================
    echo  BUILD terminou sem erro, mas o APK nao foi encontrado em:
    echo  %APK_SRC%
    echo ============================================
    pause
    exit /b 1
)

copy /Y "%APK_SRC%" "%APK_DEST%" >nul

echo.
echo ============================================
echo  BUILD OK - APK gerado com sucesso
echo  %APK_DEST%
echo ============================================
pause
