#!/bin/bash
set -e
export ANDROID_HOME="$HOME/android-sdk"
export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/29.0.13599879"
export VCPKG_ROOT="$HOME/vcpkg"
export VCPKG_MAX_CONCURRENCY=4

echo "ANDROID_HOME=$ANDROID_HOME"
echo "ANDROID_NDK_HOME=$ANDROID_NDK_HOME"
echo "VCPKG_ROOT=$VCPKG_ROOT"

cd /mnt/d/dbo/otclient
chmod +x setup_android_deps_x86_64.sh
./setup_android_deps_x86_64.sh
