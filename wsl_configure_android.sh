#!/bin/bash
# One-time setup for building otclient for Android inside WSL2 Ubuntu.
# Idempotent: safe to re-run if it fails partway through.
#
# Installs: base build deps, Android SDK/NDK 29, vcpkg (native WSL clone),
# cross-compiles LuaJIT for x86_64 (the ABI Android Studio's emulator uses),
# installs the vcpkg C++ deps for x64-android, and bundles data.zip.
#
# See como-complitar.txt for the full story of why each step exists.
set -euo pipefail

PROJECT_DIR="/mnt/d/dbo/otclient"
NDK_VERSION="29.0.13599879"
LUAJIT_COMMIT="d0e88930ddde28ff662503f9f20facf34f7265aa"

export ANDROID_HOME="$HOME/android-sdk"
export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/$NDK_VERSION"
export VCPKG_ROOT="$HOME/vcpkg"

echo "============================="
echo "Step 0: Base build dependencies"
echo "============================="
if ! dpkg -s openjdk-17-jdk >/dev/null 2>&1; then
    sudo apt-get update -y
    sudo apt-get install -y openjdk-17-jdk unzip curl git python3 zip build-essential gcc-multilib g++-multilib
else
    echo "already installed, skipping"
fi

echo ""
echo "============================="
echo "Step 1: Android SDK + NDK $NDK_VERSION"
echo "============================="
if [ ! -d "$ANDROID_NDK_HOME" ]; then
    mkdir -p "$ANDROID_HOME"
    if [ ! -f "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
        cd /tmp
        curl -sL "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o cmdtools.zip
        unzip -qo cmdtools.zip -d "$ANDROID_HOME/cmdline-tools-tmp"
        mkdir -p "$ANDROID_HOME/cmdline-tools/latest"
        mv "$ANDROID_HOME/cmdline-tools-tmp/cmdline-tools/"* "$ANDROID_HOME/cmdline-tools/latest/"
        rm -rf "$ANDROID_HOME/cmdline-tools-tmp" cmdtools.zip
    fi
    yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$ANDROID_HOME" --licenses > /dev/null 2>&1 || true
    yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$ANDROID_HOME" \
        "ndk;$NDK_VERSION" \
        "platforms;android-36" \
        "build-tools;35.0.0"
else
    echo "already installed at $ANDROID_NDK_HOME, skipping"
fi

echo ""
echo "============================="
echo "Step 2: vcpkg (native WSL clone)"
echo "============================="
if [ ! -x "$VCPKG_ROOT/vcpkg" ]; then
    rm -rf "$VCPKG_ROOT"
    git clone --depth 1 https://github.com/microsoft/vcpkg.git "$VCPKG_ROOT"
    (cd "$VCPKG_ROOT" && git fetch --unshallow && ./bootstrap-vcpkg.sh -disableMetrics)
else
    echo "already bootstrapped at $VCPKG_ROOT, skipping"
fi

echo ""
echo "============================="
echo "Step 3: LuaJIT source (pinned commit)"
echo "============================="
if [ ! -d "$PROJECT_DIR/luajit-src/src" ]; then
    git clone https://github.com/LuaJIT/LuaJIT.git "$PROJECT_DIR/luajit-src"
    (cd "$PROJECT_DIR/luajit-src" && git checkout "$LUAJIT_COMMIT")
else
    echo "already cloned at $PROJECT_DIR/luajit-src, skipping"
fi

echo ""
echo "============================="
echo "Step 4: LuaJIT cross-compile + vcpkg deps (x64-android) + data.zip"
echo "============================="
chmod +x "$PROJECT_DIR/setup_android_deps_x86_64.sh"
"$PROJECT_DIR/setup_android_deps_x86_64.sh"

echo ""
echo "============================="
echo "Android setup complete!"
echo "============================="
echo "Now run _build.android.bat to build the APK."
