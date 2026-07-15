#!/bin/bash
set -e
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
export ANDROID_HOME="$HOME/android-sdk"
export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/29.0.13599879"
export VCPKG_ROOT="$HOME/vcpkg"
export VCPKG_MAX_CONCURRENCY=3

cd "$PROJECT_DIR"
if [ ! -d luajit-src/src ]; then
    git clone https://github.com/LuaJIT/LuaJIT.git luajit-src
    cd luajit-src && git checkout d0e88930ddde28ff662503f9f20facf34f7265aa && cd ..
fi

chmod +x setup_android_deps_arm64.sh
./setup_android_deps_arm64.sh
