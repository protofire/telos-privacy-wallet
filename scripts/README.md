# Manual Build Scripts

This directory contains scripts for building and releasing zkTelos Wallet when GitHub Actions is unavailable due to billing limits.

## Quick Start

```bash
# From repository root
./scripts/manual-build-and-release.sh v0.0.2
```

## Prerequisites

### All Platforms
- **Node.js 20.x**: https://nodejs.org/
- **Yarn**: `npm install -g yarn`
- **Rust**: https://rustup.rs/
- **GitHub CLI**: https://cli.github.com/
- **SSH key**: Your own SSH key configured for EC2 access (set `EC2_KEY` environment variable)

### Windows Additional
- **NSIS**: `winget install NSIS.NSIS`

### First Time Setup

1. **Install GitHub CLI and authenticate:**
   ```bash
   gh auth login
   ```

2. **Configure SSH key for EC2:**
   - **Important**: You must have your own SSH key configured for EC2 access
   - Request EC2 SSH key from your team administrator
   - Set the `EC2_KEY` environment variable to point to your key:
     ```bash
     export EC2_KEY="$HOME/.ssh/your-ec2-key"
     ```
   - Test connection:
     ```bash
     ssh -i "$EC2_KEY" ubuntu@3.150.55.197
     ```

3. **Make script executable:**
   ```bash
   chmod +x scripts/manual-build-and-release.sh
   ```

4. **Optional: Configure environment variables** (for custom EC2 host or GitHub account):
   ```bash
   export EC2_HOST="ubuntu@your-instance-ip"
   export EC2_KEY="$HOME/.ssh/your-key-path"
   export GH_USER="your-github-account"
   ```

## Configuration via Environment Variables

The script uses environment variables to configure settings. **You MUST configure your SSH key:**

```bash
# REQUIRED: Set your SSH key path (ask team admin for EC2 key)
export EC2_KEY="$HOME/.ssh/your-ec2-key"

# REQUIRED: Set your GitHub account
export GH_USER="your-github-account"

# OPTIONAL: Override EC2 host (default is shared instance)
# export EC2_HOST="ubuntu@your-ec2-ip"

# Then run the script
./scripts/manual-build-and-release.sh v0.0.2
```

**Important Notes:**
- `EC2_KEY`: **No default** - You must set this to your own SSH key path
- `GH_USER`: **No default** - You must set this to your GitHub account
- `EC2_HOST`: Default is `ubuntu@3.150.55.197` (shared instance)

**Minimal Setup Example:**
```bash
export EC2_KEY="$HOME/.ssh/my-ec2-key"
export GH_USER="my-github-account"
./scripts/manual-build-and-release.sh v0.0.2
```

## Usage

### Basic Usage
```bash
./scripts/manual-build-and-release.sh v0.0.2
```

### What the Script Does

1. **Checks Prerequisites** - Verifies all required tools are installed
2. **Builds Windows** - Compiles Windows installers locally (requires NSIS)
3. **Builds Linux** - Compiles Linux packages on EC2 instance
4. **Creates Release** - Uploads all artifacts to GitHub draft release

### Build Artifacts

The script produces:

**Windows (built locally):**
- `apps/zktelos-wallet/dist/zkTelos Wallet-{version}-win.exe` (~520 MB)
- `apps/zktelos-wallet/dist/zkTelos Wallet-{version}-win-x64.exe` (~219 MB)
- `apps/zktelos-wallet/dist/zkTelos Wallet-{version}-win-arm64.exe` (~302 MB)

**Linux (built on EC2, downloaded locally):**
- `dist-linux/zkTelos Wallet-{version}.AppImage` (~396 MB)
- `dist-linux/zktelos-wallet_{version}_amd64.deb` (~241 MB)

## Manual Build Steps (without script)

### Windows Build

```bash
# Install dependencies
yarn install

# Build zkbob-client-js
yarn workspace zkbob-client-js build

# Build React app
cd apps/zktelos-wallet
export NODE_OPTIONS=--max-old-space-size=8192
npx react-app-rewired build

# Build Windows Electron (requires NSIS in PATH)
export PATH="/c/Program Files (x86)/NSIS:$PATH"
npx electron-builder --win
```

### Linux Build (on EC2)

```bash
# REQUIRED: Set your SSH key path (ask team admin if you don't have one)
export EC2_KEY="$HOME/.ssh/your-ec2-key"

# EC2 instance (shared across team)
EC2_HOST="ubuntu@3.150.55.197"

# Transfer code to EC2
git archive --format=tar HEAD | ssh -i "$EC2_KEY" "$EC2_HOST" \
  "mkdir -p ~/telos-privacy-wallet && cd ~/telos-privacy-wallet && tar -xf -"

# SSH to EC2 and build
ssh -i "$EC2_KEY" "$EC2_HOST"
cd ~/telos-privacy-wallet
source ~/.cargo/env
yarn install
yarn workspace zkbob-client-js build
yarn electron:build:linux

# Download artifacts
scp -i "$EC2_KEY" "$EC2_HOST":~/telos-privacy-wallet/apps/zktelos-wallet/dist/*.AppImage ./dist-linux/
scp -i "$EC2_KEY" "$EC2_HOST":~/telos-privacy-wallet/apps/zktelos-wallet/dist/*.deb ./dist-linux/
```

### Create GitHub Release

```bash
# Configure GitHub account (or set GH_USER environment variable)
GH_USER="amandravillis-protofire"

# Switch to team account (optional)
gh auth switch --user "$GH_USER"

# Create draft release
gh release create v0.0.2 \
  apps/zktelos-wallet/dist/*.exe \
  dist-linux/*.AppImage \
  dist-linux/*.deb \
  --draft \
  --repo protofire/telos-privacy-wallet \
  --title "v0.0.2 - Manual Build" \
  --notes "Release notes here..."
```

## Troubleshooting

### "NSIS not found"
**Windows:** Install NSIS via `winget install NSIS.NSIS`

### "Rust not found"
Install Rust toolchain: https://rustup.rs/

### "Could not resolve to a Repository"
You're authenticated as the wrong GitHub user. Switch accounts or set the GH_USER environment variable:
```bash
export GH_USER="amandravillis-protofire"
gh auth switch --user "$GH_USER"
```

### "Permission denied (publickey)"
Your SSH key doesn't have access to the EC2 instance. Contact the team admin.

### Electron build stalls silently
This is normal during ASAR packaging of large WASM files. Wait 5-10 minutes.

### "Network timeout" during yarn install
Increase timeout:
```bash
yarn config set network-timeout 600000
yarn install
```

## Build Times

Typical build times on decent hardware:

- **Windows yarn install:** ~9 minutes (first time), ~1 minute (cached)
- **Windows Electron build:** ~5-8 minutes
- **Linux EC2 build:** ~10-15 minutes (includes code transfer)
- **GitHub release upload:** ~2-3 minutes (1.1GB total)

**Total time:** ~30-40 minutes for complete build + release

## EC2 Instance Details

- **Instance:** telos-relayer-testnet
- **Type:** c5.2xlarge (8 vCPU, 16GB RAM)
- **IP:** 3.150.55.197
- **User:** ubuntu
- **Working Dir:** ~/telos-privacy-wallet

## Support

For issues with this script, contact the Telos team or check:
- GitHub Actions workflow: `.github/workflows/build-electron-native.yml`
- Project docs: `../CLAUDE.md`
