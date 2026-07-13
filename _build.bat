@echo off
REM Auto-detects its own location and the Visual Studio install path, so
REM this works on any PC / drive letter without editing paths.
setlocal
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

for /f "usebackq tokens=*" %%i in (`"%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe" -latest -property installationPath`) do set VSPATH=%%i

call "%VSPATH%\Common7\Tools\VsDevCmd.bat" -arch=x64
set PATH=%VSPATH%\Common7\IDE\CommonExtensions\Microsoft\CMake\Ninja;%PATH%
cmake --build build/windows-release --parallel 2
