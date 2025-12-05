#!/bin/bash
set -e

echo "=== zkTelos Wallet Universal Build Script (Local) ==="
echo "Ensuring Rust targets are installed..."
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin

echo ""
echo "Step 1: Building React App..."
# We need to ensure the React build exists before packaging
# Using the clean build:win script since it doesn't have NODE_OPTIONS hardcoded
# (which is fine here, but just to be safe and clean)
export NODE_OPTIONS=--max-old-space-size=8192
yarn workspace zktelos-wallet react-app-rewired build

# ---------------------------------------------------------
# Build for Intel (x64)
# ---------------------------------------------------------
echo ""
echo "Step 2: Building Rust Library for Intel (x64)..."
# Force the target architecture for the Rust build
export CARGO_BUILD_TARGET=x86_64-apple-darwin
# Rebuild the node addon for this architecture
yarn workspace libzkbob-rs-node build-release

echo "Step 3: Packaging Electron for Intel (x64)..."
# Invoke electron-builder directly to package ONLY for x64
# This uses the currently built (x64) Rust addon
yarn workspace zktelos-wallet electron-builder --mac --x64

# ---------------------------------------------------------
# Build for Apple Silicon (arm64)
# ---------------------------------------------------------
echo ""
echo "Step 4: Building Rust Library for Apple Silicon (arm64)..."
export CARGO_BUILD_TARGET=aarch64-apple-darwin
yarn workspace libzkbob-rs-node build-release

echo "Step 5: Packaging Electron for Apple Silicon (arm64)..."
# Invoke electron-builder directly to package ONLY for arm64
# This uses the currently built (arm64) Rust addon
yarn workspace zktelos-wallet electron-builder --mac --arm64

echo ""
echo "=== Build Complete! ==="
echo "Artifacts are in apps/zktelos-wallet/dist/"
ls -lh apps/zktelos-wallet/dist/*.dmg

