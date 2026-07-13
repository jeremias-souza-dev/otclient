@echo off
setlocal
set SCRIPT_DIR=%~dp0
call "%SCRIPT_DIR%_build.bat" > "%SCRIPT_DIR%build_windows.log" 2>&1
