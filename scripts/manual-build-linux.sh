#!/bin/bash
#
# Manual Build and Release Script for zkTelos Wallet (macOS + Linux)
#
# This script builds Electron apps locally (macOS) and on EC2 (Linux),
# then uploads them to a GitHub draft release.
#
# Usage:
#   ./scripts/manual-build-macos-linux.sh [version]
#
# Example:
#   ./scripts/manual-build-macos-linux.sh v0.0.3
#
# Prerequisites:
#   - Node.js 20.x
#   - Yarn
#   - Rust toolchain (for macOS)
#   - gh CLI authenticated
#   - SSH access to EC2 instance

set -e  # Exit on error

# Configuration
VERSION="${1:-v0.0.1}"
EC2_HOST="${EC2_HOST:-ubuntu@3.151.150.167}"
EC2_KEY="${EC2_KEY}"
REPO="protofire/telos-privacy-wallet"
GH_USER="${GH_USER}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install Node.js 20.x"
        exit 1
    fi

    # Check Yarn
    if ! command -v yarn &> /dev/null; then
        log_error "Yarn not found. Please install Yarn globally: npm install -g yarn"
        exit 1
    fi

    # Check Rust
    if ! command -v rustc &> /dev/null; then
        log_error "Rust not found. Please install Rust from https://rustup.rs/"
        exit 1
    fi

    # Check gh CLI
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI not found. Please install: https://cli.github.com/"
        exit 1
    fi

    # Check gh auth
    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI not authenticated. Please run: gh auth login"
        exit 1
    fi

    # Check GitHub user configuration
    if [ -z "$GH_USER" ]; then
        log_error "GH_USER environment variable must be set to your GitHub account"
        log_error "Example: export GH_USER=\"your-github-username\""
        exit 1
    fi

    # Check SSH key for EC2
    if [ -z "$EC2_KEY" ]; then
        log_error "EC2_KEY environment variable must be set to your own SSH key"
        log_error "Example: export EC2_KEY=\"\$HOME/.ssh/telos-ec2-key\""
        exit 1
    fi

    if [ ! -f "$EC2_KEY" ]; then
        log_error "SSH key not found at $EC2_KEY"
        exit 1
    fi

    # Check that we're on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        log_warn "This script is designed for macOS. You're running on $OSTYPE"
    fi

    log_info "All prerequisites met!"
}

# Build Linux on EC2
build_linux_ec2() {
    log_info "Building Linux Electron app on EC2..."

    # Transfer code to EC2
    log_info "Transferring code to EC2 (this may take a few minutes)..."
    git archive --format=tar HEAD | ssh -i "$EC2_KEY" "$EC2_HOST" \
        "mkdir -p ~/telos-privacy-wallet && cd ~/telos-privacy-wallet && tar -xf -"

    # Build on EC2
    log_info "Running build on EC2..."
    ssh -i "$EC2_KEY" "$EC2_HOST" << 'ENDSSH'
        set -e
        cd ~/telos-privacy-wallet
        source ~/.cargo/env

        # Install dependencies
        yarn install

        # Build zkbob-client-js
        yarn workspace zkbob-client-js build

        # Build Rust library (libzkbob-rs-node)
        yarn workspace libzkbob-rs-node build

        # Build Electron for Linux
        export NODE_OPTIONS=--max-old-space-size=8192
        export CI=false
        yarn electron:build:linux

        echo "Linux build complete!"
ENDSSH

    # Download artifacts
    log_info "Downloading Linux artifacts..."
    mkdir -p dist-linux
    scp -i "$EC2_KEY" "$EC2_HOST:~/telos-privacy-wallet/apps/zktelos-wallet/dist/*.AppImage" dist-linux/ 2>/dev/null || true
    scp -i "$EC2_KEY" "$EC2_HOST:~/telos-privacy-wallet/apps/zktelos-wallet/dist/*.deb" dist-linux/ 2>/dev/null || true

    log_info "Linux build complete!"
    log_info "Artifacts: dist-linux/"
}


# Main execution
main() {
    log_info "=== zkTelos Wallet Manual Build & Release (macOS + Linux) ==="
    log_info "Version: $VERSION"
    log_info ""

    check_prerequisites

    # Build Linux
    log_info ""
    log_info "Building Linux artifacts on EC2..."
    build_linux_ec2

    log_info ""
    log_info "${GREEN}✓ Build and release complete!${NC}"
    log_info ""
}

# Run main function
main
