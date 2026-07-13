@echo off
REM Builds the Android APK (x86_64, the emulator ABI). Assumes
REM _configure.android.bat already ran once (WSL Ubuntu, Android SDK/NDK,
REM vcpkg, LuaJIT, data.zip all set up). This step is incremental: safe to
REM run again as many times as needed.
setlocal
set SCRIPT_DIR=%~dp0
set APK_SRC=%SCRIPT_DIR%android\app\build\outputs\apk\release\app-release.apk
set APK_DEST=%SCRIPT_DIR%app-release.apk

echo ============================================
echo  Build Android - otclient (x86_64)
echo ============================================
echo.

wsl -d Ubuntu -- bash -c "sed -i 's/\r$//' /mnt/d/dbo/otclient/wsl_build_android.sh && bash /mnt/d/dbo/otclient/wsl_build_android.sh"

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
