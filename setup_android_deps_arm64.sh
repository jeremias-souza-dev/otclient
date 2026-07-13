#!/bin/bash
set -euo pipefail
# Variant of setup_android_deps.sh restricted to arm64-v8a only (disk/time constrained build)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NDK="${ANDROID_NDK_HOME:-/home/dev/android-sdk/ndk/29.0.13599879}"
NDKBIN="$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin"
VCPKG="${VCPKG_ROOT:-/home/dev/vcpkg}"
LUAJIT_SRC="$SCRIPT_DIR/luajit-src"

declare -A ABI_MAP=(
    ["arm64-v8a"]="arm64-android"
)
declare -A CROSS_MAP=(
    ["arm64-v8a"]="aarch64-linux-android-"
)
declare -A CC_MAP=(
    ["arm64-v8a"]="aarch64-linux-android21-"
)
declare -A HOSTCC_MAP=(
    ["arm64-v8a"]="gcc"
)

build_luajit_for_abi() {
    local ABI=$1
    local TRIPLET=${ABI_MAP[$ABI]}
    local CROSS=${CROSS_MAP[$ABI]}
    local CC=${CC_MAP[$ABI]}
    local HOST_CC="${HOSTCC_MAP[$ABI]}"
    local INSTALL_DIR="$SCRIPT_DIR/android/app/libs"

    echo "=== Building LuaJIT for $ABI ($TRIPLET) ==="

    if [ ! -d "$LUAJIT_SRC/src" ]; then
        echo "ERROR: LuaJIT source not found at $LUAJIT_SRC"
        echo "Clone it: git clone https://github.com/LuaJIT/LuaJIT.git $LUAJIT_SRC"
        exit 1
    fi

    cd "$LUAJIT_SRC"
    make clean 2>/dev/null || true

    make -j"$(nproc)" amalg \
        HOST_CC="$HOST_CC" \
        CROSS="${NDKBIN}/${CROSS}" \
        STATIC_CC="${NDKBIN}/${CC}clang" \
        DYNAMIC_CC="${NDKBIN}/${CC}clang -fPIC" \
        TARGET_LD="${NDKBIN}/${CC}clang" \
        TARGET_AR="$NDKBIN/llvm-ar rcus" \
        TARGET_STRIP="$NDKBIN/llvm-strip" \
        TARGET_CFLAGS="-fPIC -DLUAJIT_UNWIND_EXTERNAL -fno-stack-protector" \
        BUILDMODE=static

    mkdir -p "$INSTALL_DIR/lib/$ABI"
    cp src/libluajit.a "$INSTALL_DIR/lib/$ABI/libluajit-5.1.a"

    mkdir -p "$INSTALL_DIR/include/luajit"
    cp src/lua.h src/lualib.h src/lauxlib.h src/luaconf.h \
       src/luajit.h "$INSTALL_DIR/include/luajit/"
    if [ -f src/luajit_rolling.h ]; then
        cp src/luajit_rolling.h "$INSTALL_DIR/include/luajit/"
    fi

    if [ ! -f "$INSTALL_DIR/include/luajit/lua.hpp" ]; then
        cat > "$INSTALL_DIR/include/luajit/lua.hpp" << 'LUAHPP'
extern "C" {
#include "lua.h"
#include "lualib.h"
#include "lauxlib.h"
}
LUAHPP
    fi

    echo "  -> $ABI OK ($(du -h "$INSTALL_DIR/lib/$ABI/libluajit-5.1.a" | cut -f1))"
}

install_vcpkg_deps() {
    local TRIPLET=$1
    echo "=== Installing vcpkg deps for $TRIPLET ==="
    cd "$SCRIPT_DIR"
    "$VCPKG/vcpkg" install --triplet "$TRIPLET" --x-manifest-root=. --allow-unsupported 2>&1 | tail -3
}

echo "============================="
echo "Step 1: Building LuaJIT (arm64-v8a only)"
echo "============================="

for ABI in "${!ABI_MAP[@]}"; do
    build_luajit_for_abi "$ABI"
done

echo ""
echo "============================="
echo "Step 2: Installing vcpkg deps (arm64-android only)"
echo "============================="
for ABI in "${!ABI_MAP[@]}"; do
    TRIPLET=${ABI_MAP[$ABI]}
    install_vcpkg_deps "$TRIPLET"
done

echo ""
echo "============================="
echo "Step 3: Generating data.zip"
echo "============================="
mkdir -p "$SCRIPT_DIR/android/app/src/main/assets"
cd "$SCRIPT_DIR"
if command -v zip &>/dev/null; then
    zip -r android/app/src/main/assets/data.zip data mods modules init.lua otclientrc.lua
elif command -v python3 &>/dev/null; then
    python3 -c "
import zipfile, os
with zipfile.ZipFile('android/app/src/main/assets/data.zip', 'w', zipfile.ZIP_DEFLATED) as zf:
    for item in ['data', 'mods', 'modules']:
        for root, dirs, files in os.walk(item):
            for f in files:
                zf.write(os.path.join(root, f))
    for f in ['init.lua', 'otclientrc.lua']:
        if os.path.exists(f):
            zf.write(f)
"
else
    echo "ERROR: neither zip nor python3 available to create data.zip"
    exit 1
fi
echo "data.zip created: $(du -h android/app/src/main/assets/data.zip | cut -f1)"

echo ""
echo "============================="
echo "arm64-v8a dependencies installed!"
echo "============================="
echo "LuaJIT libs:"
ls -la "$SCRIPT_DIR/android/app/libs/lib/"*/libluajit-5.1.a
echo ""
echo "Now run: cd android && OTCLIENT_ANDROID_ABIS=arm64-v8a ./gradlew assembleRelease"
