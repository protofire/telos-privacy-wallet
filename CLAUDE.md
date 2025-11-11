# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

zkTelos Wallet - A privacy-focused wallet application forked from [zkBob UI](https://github.com/zkBob/zkbob-ui), rebranded for the Telos ecosystem. The project supports private transactions using zero-knowledge proofs and is being developed as both a web application and Electron desktop application.

**Project Goals:**
- Rebrand zkBob UI for Telos ecosystem
- Maintain web version functionality
- Create cross-platform desktop applications (macOS, Windows, Linux) via Electron
- Preserve privacy features and zkBob protocol integration

## Development Commands

### Local Development
```bash
# Install dependencies
yarn

# Start development server (web)
yarn start

# Run tests
yarn test
```

### Electron Desktop Builds
```bash
# Build for production (all platforms)
yarn electron:build:prod

# Platform-specific builds
yarn electron:build:mac
yarn electron:build:win
yarn electron:build:linux
```

### Environment Configuration
Create a `.env` file with:
```
REACT_APP_CONFIG=dev          # or "prod"
REACT_APP_BUILD_TARGET=        # set to "electron" for desktop builds
REACT_APP_WALLETCONNECT_PROJECT_ID=<your-project-id>
```

## Architecture Overview

### Core Context System
The application uses React Context for state management with specialized contexts:

- **ZkAccountContext** (`src/contexts/ZkAccountContext/`): Manages zero-knowledge account state, private transactions, and zkBob client integration. This is the heart of privacy functionality.
- **WalletContext** (`src/contexts/WalletContext/`): Handles EVM wallet connections via wagmi, provider management, and blockchain interactions.
- **PoolContext** (`src/contexts/PoolContext/`): Manages liquidity pool configurations across different chains (Polygon, Optimism, Sepolia).
- **TransactionModalContext**: Controls transaction UI flows and status updates.
- **ModalContext**: Centralized modal management.

### zkBob Client Integration
The app integrates `zkbob-client-js` library for privacy operations:
- Zero-knowledge proof generation for deposits/withdrawals/transfers
- Private address management with encrypted storage
- Multi-pool support with different tokens (USDC, ETH, BOB)
- Relayer communication for private transaction submission

### Configuration System (`src/config/index.js`)
Centralized configuration that switches between `prod` and `dev` environments based on `REACT_APP_CONFIG`:

**Key Configuration Elements:**
- **Pool Definitions**: Each pool has chainId, poolAddress, tokenAddress, relayerUrls/proxyUrls, deposit schemes
- **SNARK Parameters**: Downloaded from s3 bucket: https://telos-privacy-params.s3.us-east-2.amazonaws.com/
- **Chain RPC URLs**: Telos Testnet (41)
- **Current Pools**:
  - Production: Nothing yet
  - Development: 0zk-pusd-testnet, 0zk-wtelos-testnet
- **Address Prefixes**: Each pool has unique prefix starting with '0zk-' then followed by the pool name and network name.

- Added a patch to zkbob-client-js to support the new address prefixes under the folder `patches/zkbob-client-js+6.0.0.patch`

### Page Structure (`src/pages/`)
- **Welcome**: Onboarding for new users
- **Home**: Main dashboard with private and public balances
- **Deposit**: Convert public tokens to private balance
- **Transfer**: Private peer-to-peer transfers
- **Withdraw**: Convert private balance back to public tokens
- **History**: Transaction history viewer
- **Payment**: Payment link handler

### Electron Integration (`electron/main.js`)
Dual-mode application supporting both web and desktop execution:

**Custom Protocol Handler (`app://`):**
- Maps `app://` URLs to local filesystem
- Serves React build from `../build/` directory
- Required for loading large .wasm and .bin files locally

**Security Configuration:**
- Injects COEP/COOP headers for WebAssembly/SharedArrayBuffer support
- `contextIsolation: true`, `nodeIntegration: false` for security
- Certificate error handling (accepts all - development only)
- WalletConnect WebSocket debugging and monitoring

**Development vs Production:**
- Development: Loads `http://localhost:3000`
- Production: Loads `app://local/index.html` from bundled build
- DevTools auto-open in development mode
- Custom user agent for compatibility

### Build System (`config-overrides.js`)
Uses `react-app-rewired` to customize Create React App webpack configuration:

**Critical Webpack Modifications:**
- **WebAssembly Support**: `asyncWebAssembly: true`, `topLevelAwait: true` for zkBob SNARK libraries
- **Node.js Polyfills**: Provides browser-compatible versions of crypto, stream, buffer, http, https, os, url
- **Buffer Global**: Injects Buffer global via ProvidePlugin (required by crypto libraries)
- **WASM/Binary Assets**: Custom asset rules for `.wasm` and `.bin` files
- **Dev Server Headers**: Adds COEP/COOP headers for local development SharedArrayBuffer support
- **Sentry Integration**: Uploads source maps if environment variables configured

## Key Technical Considerations

### Privacy Operations
- All private operations go through ZkAccountContext
- Encrypted local storage for seed phrases (AES encryption)
- Multi-step transaction flows with proof generation
- Transaction status tracking via TX_STATUSES constants

### Multi-Chain Support
- Pool selection determines active blockchain
- Dynamic RPC provider management
- Network switching via WalletContext
- Chain-specific block explorers in NETWORKS constant

### Token Standards
- Support for different deposit schemes: `permit`, `permit2`, `usdc`
- Native token handling (ETH) vs. ERC20 tokens
- Token migrations tracked in pool configurations

### WebAssembly Requirements
- SNARK proof generation requires WebAssembly
- SharedArrayBuffer requires specific security headers
- Different asset loading for web vs. Electron (see config.isElectron())

## Testing Notes
- React Testing Library setup included
- Test files use `.test.js` suffix
- Jest configuration in package.json eslintConfig
