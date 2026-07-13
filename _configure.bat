@echo off
cd /d "D:\dbo\otclient"
call "D:\Program Files\Microsoft Visual Studio\2022\Community\Common7\Tools\VsDevCmd.bat" -arch=x64
set VCPKG_ROOT=D:\dbo\vcpkg
set PATH=D:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\CommonExtensions\Microsoft\CMake\Ninja;%PATH%
cmake --preset windows-release
