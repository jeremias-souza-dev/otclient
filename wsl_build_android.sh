#!/bin/bash
# Incremental Android build: just runs Gradle. Run wsl_configure_android.sh
# first (once) to set up the SDK/NDK/vcpkg/LuaJIT/data.zip.
set -eo pipefail

export ANDROID_HOME="$HOME/android-sdk"
export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/29.0.13599879"
export VCPKG_ROOT="$HOME/vcpkg"
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export OTCLIENT_ANDROID_ABIS=x86_64
export CMAKE_BUILD_PARALLEL_LEVEL=2

PROJECT_DIR="/mnt/d/dbo/otclient"

if [ ! -f "$HOME/.android/debug.keystore" ]; then
    mkdir -p "$HOME/.android"
    keytool -genkey -v -keystore "$HOME/.android/debug.keystore" \
        -storepass android -alias androiddebugkey -keypass android \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -dname "CN=Android Debug,O=Android,C=US"
fi

cd "$PROJECT_DIR/android"
sed -i 's/\r$//' gradlew
chmod +x gradlew
./gradlew assembleRelease --no-daemon --max-workers=2 2>&1 | tee "$PROJECT_DIR/build_android.log"
