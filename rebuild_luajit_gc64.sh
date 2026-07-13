#!/bin/bash
set -euo pipefail
export ANDROID_HOME="$HOME/android-sdk"
export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/29.0.13599879"
NDKBIN="$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin"
SCRIPT_DIR=/mnt/d/dbo/otclient
LUAJIT_SRC="$SCRIPT_DIR/luajit-src"
INSTALL_DIR="$SCRIPT_DIR/android/app/libs"

cd "$LUAJIT_SRC"
make clean 2>/dev/null || true

make -j"$(nproc)" amalg \
    HOST_CC="gcc" \
    CROSS="${NDKBIN}/x86_64-linux-android-" \
    STATIC_CC="${NDKBIN}/x86_64-linux-android21-clang" \
    DYNAMIC_CC="${NDKBIN}/x86_64-linux-android21-clang -fPIC" \
    TARGET_LD="${NDKBIN}/x86_64-linux-android21-clang" \
    TARGET_AR="$NDKBIN/llvm-ar rcus" \
    TARGET_STRIP="$NDKBIN/llvm-strip" \
    TARGET_CFLAGS="-fPIC -DLUAJIT_UNWIND_EXTERNAL -fno-stack-protector" \
    BUILDMODE=static

mkdir -p "$INSTALL_DIR/lib/x86_64"
cp src/libluajit.a "$INSTALL_DIR/lib/x86_64/libluajit-5.1.a"
echo "LuaJIT rebuilt with GC64: $(du -h "$INSTALL_DIR/lib/x86_64/libluajit-5.1.a" | cut -f1)"
