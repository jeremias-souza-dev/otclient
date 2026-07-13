#!/bin/bash
set -eo pipefail
PROJECT_DIR=/mnt/c/Users/jerem/Downloads/dragonball/otclient-mobile
export ANDROID_HOME=/root/android-sdk
export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/29.0.13599879"
export VCPKG_ROOT=/root/vcpkg
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export OTCLIENT_ANDROID_ABIS=arm64-v8a
export CMAKE_BUILD_PARALLEL_LEVEL=1

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
./gradlew assembleRelease --no-daemon --max-workers=1 2>&1 | tee "$PROJECT_DIR/build_android.log"
