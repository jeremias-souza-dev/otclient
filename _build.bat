@echo off
cd /d "C:\Users\jerem\Downloads\dragonball\otclient-mobile"
call "C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\Tools\VsDevCmd.bat" -arch=x64
set PATH=C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\CommonExtensions\Microsoft\CMake\Ninja;%PATH%
cmake --build build/windows-release --parallel 2
