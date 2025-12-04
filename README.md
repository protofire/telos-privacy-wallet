# zkTelos Wallet

A privacy-focused wallet application for the Telos ecosystem, forked from [zkBob UI](https://github.com/zkBob/zkbob-ui). zkTelos Wallet enables private transactions using zero-knowledge proofs and is available as both a web application and cross-platform desktop application.

## Features

- 🔒 **Privacy-First**: Zero-knowledge proof technology for private transactions
- 🌐 **Multi-Platform**: Web application and Electron desktop apps (macOS, Windows, Linux)
- 🔗 **WalletConnect Support**: Connect with mobile wallets via QR code
- 💰 **Multi-Token Support**: Support for ERC20 tokens and native tokens

## Project Structure

This project is a **monorepo** managed with Yarn Workspaces, containing:

```
    telos-privacy-wallet/
    ├── apps/
    │   └── zktelos-wallet/          # Main zkTelos Wallet application
    │       ├── src/                  # React application source code
    │       ├── public/               # Static assets
    │       ├── electron/             # Electron desktop app configuration
    │       └── package.json
    ├── packages/
    │   ├── zkbob-client-js/         # Forked zkBob client library (local)
    │   │   ├── src/                  # TypeScript source code
    │   │   ├── lib/                  # Compiled JavaScript output
    │   │   └── package.json
    │   └── libzkbob-rs-node/        # Rust bindings for zkBob (Neon)
    │       ├── src/                  # Rust source code
    │       └── package.json
    ├── package.json                  # Root workspace configuration
    └── yarn.lock
```

### Workspaces
  - **`apps/zktelos-wallet`**: The main React application (web and Electron)
- **`packages/zkbob-client-js`**: A local fork of the zkBob client library with custom modifications for Telos
- **`packages/libzkbob-rs-node`**: Node.js bindings for the zkBob Rust library

## Installation

### Desktop Applications

Download the latest release from the [Releases](https://github.com/protofire/telos-privacy-wallet/releases) page to get the desktop applications.

- **macOS**
- **Windows**
- **Linux**

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

- **Node.js 18+** (recommended: Node.js 18.x or higher)
- **Yarn 1.x** (Classic Yarn)
- Git

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/protofire/telos-privacy-wallet.git
   cd telos-privacy-wallet
   ```

2. **Install dependencies** (from the root directory):
   ```bash
   yarn
   ```
   
   This will install dependencies for all workspaces.


### Development Commands

**All commands should be run from the root directory** unless otherwise specified.

#### Start Development Server

Start the web application in development mode:
```bash
yarn start
```

The application will open at `http://localhost:3000`

#### Development with Hot Reload for zkbob-client-js

To develop with automatic recompilation of the `zkbob-client-js` package:
```bash
yarn dev
```

This runs both:
- `yarn watch:zkbob` - Watches and rebuilds `zkbob-client-js` on changes
- `yarn start` - Starts the React development server

#### Build Commands

**Build the web application:**
```bash
yarn build
```

This builds the production-ready web application to `apps/zktelos-wallet/build/`

**Build the zkbob-client-js package:**
```bash
yarn build:zkbob
```

**Watch zkbob-client-js for changes:**
```bash
yarn watch:zkbob
```

#### Desktop Application Builds

**Build for all platforms:**
```bash
yarn electron:build:prod
```

**Platform-specific builds:**
```bash
# macOS
yarn electron:build:mac

# Windows
yarn electron:build:win

# Linux
yarn electron:build:linux
```

Built applications will be available in the `apps/zktelos-wallet/dist/` directory.

#### Running Tests

**E2E Tests:**
See [e2e-ci-cd/README.md](e2e-ci-cd/README.md) for instructions on running end-to-end tests with Playwright.

#### Working with zkbob-client-js

The `zkbob-client-js` package is a local fork of the zkBob client library, located in `packages/zkbob-client-js/`.

#### Making Changes to zkbob-client-js

1. **Edit the source code** in `packages/zkbob-client-js/src/`

2. **Build the package** (from root):
   ```bash
   yarn build:zkbob
   ```
   
   Or watch for changes:
   ```bash
   yarn watch:zkbob
   ```

3. **Changes are immediately available** in `zktelos-wallet` thanks to Yarn Workspaces

#### Adding Dependencies

**To add dependencies to the main app:**
```bash
yarn workspace zktelos-wallet add <package-name>
```

**To add dependencies to zkbob-client-js:**
```bash
yarn workspace zkbob-client-js add <package-name>
```

**To add dev dependencies:**
```bash
yarn workspace zktelos-wallet add -D <package-name>
yarn workspace zkbob-client-js add -D <package-name>
```

### Workspace-Specific Commands

You can also run commands directly in a workspace:

```bash
# From root, run a command in a specific workspace
yarn workspace zktelos-wallet <command>
yarn workspace zkbob-client-js <command>

# Example: Run tests only for the app
yarn workspace zktelos-wallet test
```

## Configuration

### Environment Variables

- `REACT_APP_CONFIG`: Set to `"dev"` for development or `"prod"` for production
- `REACT_APP_BUILD_TARGET`: Set to `"electron"` when building desktop applications
    - `REACT_APP_WALLETCONNECT_PROJECT_ID`: Your WalletConnect Cloud project ID
    - `REACT_APP_LOCK_TIMEOUT`: Auto-lock timeout in milliseconds (default: 900000)

    **Sentry Configuration (Optional):**
    - `REACT_APP_SENTRY_PUBLIC_KEY`: Sentry Public Key
    - `REACT_APP_SENTRY_PRIVATE_KEY`: Sentry Private Key
    - `REACT_APP_SENTRY_PROJECT_ID`: Sentry Project ID

    Sentry integration includes tracking of a unique `support_id` (generated in `SupportIdContext`) and user IP address (via ipapi.co) for troubleshooting.

    ### Supported Networks

- **Telos Testnet** (chainId: 41) - Development environment
- **Telos Mainnet** (chainId: 40) - Production (coming soon)
- 
## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE_MIT) and [Apache-2.0 License](LICENSE_APACHE).

## Acknowledgments

- Built on [zkBob UI](https://github.com/zkBob/zkbob-ui)
- Powered by [zkbob-client-js](https://github.com/zkBob/zkbob-client-js)
- Developed by [Protofire](https://protofire.io)
