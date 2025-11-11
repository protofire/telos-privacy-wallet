# zkTelos Wallet

A privacy-focused wallet application for the Telos ecosystem, forked from [zkBob UI](https://github.com/zkBob/zkbob-ui). zkTelos Wallet enables private transactions using zero-knowledge proofs and is available as both a web application and cross-platform desktop application.

## Features

- 🔒 **Privacy-First**: Zero-knowledge proof technology for private transactions
- 🌐 **Multi-Platform**: Web application and Electron desktop apps (macOS, Windows, Linux)
- 🔗 **WalletConnect Support**: Connect with mobile wallets via QR code
- 💰 **Multi-Token Support**: Support for PUSD, WTELOS, and more
- 📱 **Telos Testnet**: Full support for Telos Testnet (chainId 41)
- 🔐 **Secure Storage**: Encrypted local storage for seed phrases

## Installation

### Desktop Applications

Download the latest release from the [Releases](https://github.com/protofire/telos-privacy-wallet/releases) page:

- **macOS**: `zkTelos Wallet-0.0.1-mac-arm64.dmg`
- **Windows**: `zkTelos Wallet Setup 0.0.1.exe`
- **Linux**: `zkTelos Wallet-0.0.1-arm64.AppImage` or `zkTelos-wallet_0.0.1_arm64.deb`

#### macOS Installation
1. Download the `.dmg` file
2. Open the disk image
3. Drag zkTelos Wallet to Applications folder

#### Windows Installation
1. Download the `.exe` installer
2. Run the installer and follow the prompts

#### Linux Installation

**AppImage:**
```bash
chmod +x "zkTelos Wallet-0.0.1-arm64.AppImage"
./zkTelos\ Wallet-0.0.1-arm64.AppImage
```

**Debian/Ubuntu:**
```bash
sudo dpkg -i zkTelos-wallet_0.0.1_arm64.deb
```

## Development

### Prerequisites

- Node.js 16+ and Yarn
- Git

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/your-org/telos-privacy-wallet.git
cd telos-privacy-wallet
```

2. Install dependencies:
```bash
yarn
```

3. Create a `.env` file in the root directory:
```env
REACT_APP_CONFIG=dev          # or "prod"
REACT_APP_BUILD_TARGET=       # set to "electron" for desktop builds
REACT_APP_WALLETCONNECT_PROJECT_ID=<your-project-id>
REACT_APP_LOCK_TIMEOUT=100000 # optional: auto-lock timeout in milliseconds
```

4. Start the development server:
```bash
yarn start
```

The application will open at `http://localhost:3000`

### Running Tests

```bash
yarn test
```

### Building Desktop Applications

#### Build for all platforms:
```bash
yarn electron:build:prod
```

#### Platform-specific builds:
```bash
# macOS
yarn electron:build:mac

# Windows
yarn electron:build:win

# Linux
yarn electron:build:linux
```

Built applications will be available in the `dist/` directory.


## Configuration

### Environment Variables

- `REACT_APP_CONFIG`: Set to `"dev"` for development or `"prod"` for production
- `REACT_APP_BUILD_TARGET`: Set to `"electron"` when building desktop applications
- `REACT_APP_WALLETCONNECT_PROJECT_ID`: Your WalletConnect Cloud project ID
- `REACT_APP_LOCK_TIMEOUT`: Auto-lock timeout in milliseconds (default: 900000)

### Supported Networks

- **Telos Testnet** (chainId: 41) - Development environment
- **Telos Mainnet** (chainId: 40) - Production (coming soon)

## Architecture

### Core Components

- **ZkAccountContext**: Manages zero-knowledge account state and private transactions
- **WalletContext**: Handles EVM wallet connections via wagmi
- **PoolContext**: Manages liquidity pool configurations
- **TransactionModalContext**: Controls transaction UI flows

### Privacy Operations

All private operations use zero-knowledge proofs:
- **Deposit**: Convert public tokens to private balance
- **Transfer**: Private peer-to-peer transfers
- **Withdraw**: Convert private balance back to public tokens

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE_MIT) and [Apache-2.0 License](LICENSE_APACHE).

## Acknowledgments

- Built on [zkBob UI](https://github.com/zkBob/zkbob-ui)
- Powered by [zkbob-client-js](https://github.com/zkBob/zkbob-client-js)
- Developed by [Protofire](https://protofire.io)
