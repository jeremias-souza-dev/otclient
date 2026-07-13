@echo off
REM One-time setup for building otclient for Android (WSL2 Ubuntu required).
REM Installs Android SDK/NDK 29, vcpkg, cross-compiles LuaJIT for x86_64
REM (the emulator ABI) and bundles data.zip. Safe to re-run if it fails
REM partway through. After this succeeds, use _build.android.bat for
REM day-to-day incremental builds.
REM
REM Auto-detects its own location so this works on any PC / drive letter
REM without editing paths.
setlocal enabledelayedexpansion
set SCRIPT_DIR=%~dp0
set SCRIPT_DIR=%SCRIPT_DIR:~0,-1%
set DRIVE=%SCRIPT_DIR:~0,1%
set REST=%SCRIPT_DIR:~2%
set REST=%REST:\=/%
if /I "%DRIVE%"=="C" (set WSLDRIVE=c) else if /I "%DRIVE%"=="D" (set WSLDRIVE=d) else if /I "%DRIVE%"=="E" (set WSLDRIVE=e) else (set WSLDRIVE=%DRIVE%)
set WSLDIR=/mnt/!WSLDRIVE!!REST!

wsl -d Ubuntu -- bash -c "sed -i 's/\r$//' '%WSLDIR%/wsl_configure_android.sh' '%WSLDIR%/setup_android_deps_x86_64.sh' && bash '%WSLDIR%/wsl_configure_android.sh'"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ============================================
    echo  SETUP FAILED - veja o erro acima
    echo ============================================
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo ============================================
echo  Setup OK - rode _build.android.bat pra compilar o APK
echo ============================================
pause
