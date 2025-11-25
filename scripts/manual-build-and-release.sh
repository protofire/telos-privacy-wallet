#!/bin/bash
#
# Manual Build and Release Script for zkTelos Wallet
#
# This script builds Electron apps locally (Windows) and on EC2 (Linux),
# then uploads them to a GitHub draft release.
#
# Usage:
#   ./scripts/manual-build-and-release.sh [version]
#
# Example:
#   ./scripts/manual-build-and-release.sh v0.0.2
#
# Prerequisites:
#   - Node.js 20.x
#   - Yarn
#   - Rust toolchain (for Windows)
#   - NSIS installed (for Windows)
#   - gh CLI authenticated
#   - SSH access to EC2 instance

set -e  # Exit on error

# Configuration
VERSION="${1:-v0.0.1}"
EC2_HOST="${EC2_HOST:-ubuntu@3.150.55.197}"  # Set EC2_HOST environment variable to override (default is shared instance)
EC2_KEY="${EC2_KEY}"  # REQUIRED: Set EC2_KEY environment variable to your own SSH key path
REPO="protofire/telos-privacy-wallet"
GH_USER="${GH_USER}"  # REQUIRED: Set GH_USER environment variable to your GitHub account

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

    # Check NSIS (Windows only)
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        if ! command -v makensis &> /dev/null && [ ! -f "/c/Program Files (x86)/NSIS/makensis.exe" ]; then
            log_error "NSIS not found. Please install NSIS: winget install NSIS.NSIS"
            exit 1
        fi
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
    if [ -z "$EC2_KEY" ] || [ "$EC2_KEY" = "$HOME/.ssh/protofire_vpn" ]; then
        log_error "EC2_KEY environment variable must be set to your own SSH key"
        log_error "Example: export EC2_KEY=\"\$HOME/.ssh/my-ec2-key\""
        log_error "Contact your team administrator for the EC2 SSH key"
        exit 1
    fi

    if [ ! -f "$EC2_KEY" ]; then
        log_error "SSH key not found at $EC2_KEY"
        exit 1
    fi

    log_info "All prerequisites met!"
}

# Build Windows locally
build_windows() {
    log_info "Building Windows Electron app..."

    # Ensure NSIS is in PATH
    export PATH="/c/Program Files (x86)/NSIS:$PATH"

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_info "Installing dependencies..."
        yarn install
    fi

    # Build zkbob-client-js
    log_info "Building zkbob-client-js..."
    yarn workspace zkbob-client-js build

    # Build React app
    log_info "Building React app..."
    cd apps/zktelos-wallet
    export NODE_OPTIONS=--max-old-space-size=8192
    npx react-app-rewired build

    # Build Electron
    log_info "Building Windows Electron installers (this may take several minutes)..."
    npx electron-builder --win

    cd ../..

    log_info "Windows build complete!"
    log_info "Artifacts: apps/zktelos-wallet/dist/*.exe"
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

        # Build Electron for Linux
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

# Create GitHub release
create_release() {
    log_info "Creating GitHub draft release..."

    # Switch to team account if needed (set GH_USER environment variable to override)
    if [ -n "$GH_USER" ]; then
        gh auth switch --user "$GH_USER" 2>/dev/null || true
    fi

    # Create release
    RELEASE_NOTES="## zkTelos Wallet ${VERSION}

Built locally due to GitHub Actions billing limits.

### Downloads

**Windows:**
- \`zkTelos Wallet-${VERSION}-win.exe\` - NSIS installer for all architectures
- \`zkTelos Wallet-${VERSION}-win-x64.exe\` - Portable executable for x64
- \`zkTelos Wallet-${VERSION}-win-arm64.exe\` - Portable executable for ARM64

**Linux:**
- \`zkTelos Wallet-${VERSION}.AppImage\` - Portable application (no installation required)
- \`zktelos-wallet_${VERSION}_amd64.deb\` - Debian/Ubuntu package

### Build Details
- Built with Rust addon support
- Node.js $(node --version)
- Electron 27.0.0
- Build Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

🦀 Built with Rust | ⚡ Powered by Electron"

    RELEASE_URL=$(gh release create "$VERSION" \
        apps/zktelos-wallet/dist/*.exe \
        dist-linux/*.AppImage \
        dist-linux/*.deb \
        --draft \
        --repo "$REPO" \
        --title "$VERSION - Manual Build" \
        --notes "$RELEASE_NOTES")

    log_info "Draft release created: $RELEASE_URL"
    log_info ""
    log_info "Next steps:"
    log_info "1. Review the release at $RELEASE_URL"
    log_info "2. Test the artifacts"
    log_info "3. Publish the release when ready"
}

# Main execution
main() {
    log_info "=== zkTelos Wallet Manual Build & Release ==="
    log_info "Version: $VERSION"
    log_info ""

    check_prerequisites

    # Build Windows
    log_info ""
    log_info "Step 1/3: Building Windows artifacts..."
    build_windows

    # Build Linux
    log_info ""
    log_info "Step 2/3: Building Linux artifacts on EC2..."
    build_linux_ec2

    # Create release
    log_info ""
    log_info "Step 3/3: Creating GitHub release..."
    create_release

    log_info ""
    log_info "${GREEN}✓ Build and release complete!${NC}"
}

# Run main function
main
