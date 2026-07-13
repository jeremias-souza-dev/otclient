#!/bin/bash
set -e
ANDROID_HOME=/root/android-sdk
mkdir -p "$ANDROID_HOME"
cd /tmp
curl -sL "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o cmdtools.zip
unzip -qo cmdtools.zip -d "$ANDROID_HOME/cmdline-tools-tmp"
mkdir -p "$ANDROID_HOME/cmdline-tools/latest"
mv "$ANDROID_HOME/cmdline-tools-tmp/cmdline-tools/"* "$ANDROID_HOME/cmdline-tools/latest/"
rm -rf "$ANDROID_HOME/cmdline-tools-tmp" cmdtools.zip
echo "cmdline-tools installed"
yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$ANDROID_HOME" "ndk;29.0.13599879" "platforms;android-36" "build-tools;35.0.0" 2>&1 | tail -15
echo "NDK dir:" && ls "$ANDROID_HOME/ndk/"
