@echo off
REM Builds the Android APK (x86_64, the emulator ABI). Assumes
REM _configure.android.bat already ran once (WSL Ubuntu, Android SDK/NDK,
REM vcpkg, LuaJIT, data.zip all set up). This step is incremental: safe to
REM run again as many times as needed.
REM
REM Auto-detects its own location so this works on any PC / drive letter
REM without editing paths.
setlocal enabledelayedexpansion
set SCRIPT_DIR=%~dp0
set APK_SRC=%SCRIPT_DIR%android\app\build\outputs\apk\release\app-release.apk
set APK_DEST=%SCRIPT_DIR%app-release.apk

set PROJDIR=%SCRIPT_DIR:~0,-1%
set DRIVE=%PROJDIR:~0,1%
set REST=%PROJDIR:~2%
set REST=%REST:\=/%
if /I "%DRIVE%"=="C" (set WSLDRIVE=c) else if /I "%DRIVE%"=="D" (set WSLDRIVE=d) else if /I "%DRIVE%"=="E" (set WSLDRIVE=e) else (set WSLDRIVE=%DRIVE%)
set WSLDIR=/mnt/!WSLDRIVE!!REST!

echo ============================================
echo  Build Android - otclient (x86_64)
echo ============================================
echo.

wsl -d Ubuntu -- bash -c "sed -i 's/\r$//' '%WSLDIR%/wsl_build_android.sh' && bash '%WSLDIR%/wsl_build_android.sh'"

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
