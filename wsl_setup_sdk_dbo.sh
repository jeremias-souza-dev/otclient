#!/bin/bash
set -e
ANDROID_HOME=$HOME/android-sdk
mkdir -p "$ANDROID_HOME"
cd /tmp
if [ ! -f "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
    curl -sL "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o cmdtools.zip
    unzip -qo cmdtools.zip -d "$ANDROID_HOME/cmdline-tools-tmp"
    mkdir -p "$ANDROID_HOME/cmdline-tools/latest"
    mv "$ANDROID_HOME/cmdline-tools-tmp/cmdline-tools/"* "$ANDROID_HOME/cmdline-tools/latest/"
    rm -rf "$ANDROID_HOME/cmdline-tools-tmp" cmdtools.zip
fi
yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$ANDROID_HOME" --licenses > /dev/null 2>&1 || true
yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$ANDROID_HOME" \
    "ndk;29.0.13599879" \
    "platforms;android-36" \
    "build-tools;35.0.0"
echo "NDK instalada:" && ls "$ANDROID_HOME/ndk/"
