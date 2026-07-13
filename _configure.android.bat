@echo off
REM One-time setup for building otclient for Android (WSL2 Ubuntu required).
REM Installs Android SDK/NDK 29, vcpkg, cross-compiles LuaJIT for x86_64
REM (the emulator ABI) and bundles data.zip. Safe to re-run if it fails
REM partway through. After this succeeds, use _build.android.bat for
REM day-to-day incremental builds.
wsl -d Ubuntu -- bash -c "sed -i 's/\r$//' /mnt/d/dbo/otclient/wsl_configure_android.sh /mnt/d/dbo/otclient/setup_android_deps_x86_64.sh && bash /mnt/d/dbo/otclient/wsl_configure_android.sh"
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
