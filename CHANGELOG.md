# Changelog

All notable changes to zkTelos Wallet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.4] - 2025-12-12

### Added

- **Dark Theme**: Implemented dark/light theme toggle with persistent user preference (#36)
- **Settings Page**: New dedicated settings page for account management and preferences (#37)
- **Pool Selector Component**: Enhanced pool selection interface with improved UX
- **Portfolio Table**: New portfolio view with formatted balance display
- x64 macOS build script for Intel-based Macs

### Changed

- **Security Enhancement**: Replaced password authentication with PIN-based system for improved security (#38)
- **Seed Phrase Management**: Moved seed phrase display and management to Settings page (#37)
- **Network Switching**: Automatic chain switching on wallet connection (#39)
- **CI/CD Improvements**: Enhanced workflow configurations with proper environment variables

### Fixed

- Fixed copy to clipboard functionality for public addresses (#40)
- Fixed CI workflow missing environment variables
- Improved address copying with better visual feedback


## [0.0.3] - 2025-12-05

### Added

- **Unified Pool Experience**: Implemented Proof of Concept for a unified pool interaction flow (#32)

### Changed

- **Mobile UX**: Extensive adjustments to mobile UI, card layouts, and responsiveness
- Improved error messaging for invalid addresses
- Updated fee endpoint configuration (#33)
- Updated menu text literals

### Removed

- Removed "Wrap" functionality
- Removed legacy zkBob references and external links
- Removed "zkRandom" name generation features

### Fixed

- Fixed End-to-End (E2E) test suite (#34)

## [0.0.2] - 2025-11-25

### Added

- Native Rust library integration for improved performance on macOS and Linux (#28)
- New Home page dashboard (#18)
- Onboarding tutorial and interactive tour for new users
- Wrap/Unwrap functionality for public accounts
- USD balance display for Global and zkAccount views (#13, #16)
- Support for wTelos pool
- Dropdown action menu for private accounts
- Web deployment scripts for S3
- New application logo
- Linux (.deb) and Windows x64 (.exe) installer support

### Changed

- **UI/UX Redesign**: Moved navigation menu to the left sidebar, updated content card styles, and standardized on squared buttons
- Deposit mechanism updated to use "approve" scheme instead of permit
- Updated transfer parameters and token permit logic
- Improved privacy features: Added ability to toggle visibility of balances
- Updated Relayer configuration for Telos integration
- Removed adress prefixes for the private accounts

### Fixed

- Duplicate "Connect" buttons appearing on mobile view
- Hardcoded deposit fee calculation logic
- Address formatting issues on the Home page
- Translation updates and missing keys
- Build warnings and unused component cleanup
- Issues with localhost API calls

### Technical Details

- Node.js v22.12.0
- Electron 27.0.0
- Integrated native Rust library for cryptographic operations

## [0.0.1] - 2025-11-11

### Added

- Initial release of zkTelos Wallet
- Cross-platform Electron desktop application support (macOS, Windows, Linux)
- Telos Testnet (chainId 41) integration
- WalletConnect support for mobile wallet connections
- Privacy-focused transactions using zero-knowledge proofs
- Support for Telos-specific address prefixes (0zk-pusd-testnet, 0zk-wtelos-testnet)
- Custom protocol handler (`app://`) for Electron builds
- WebAssembly support for SNARK proof generation
- Transaction history viewer
- Payment link handler
- Deposit, transfer, and withdraw functionality

### Fixed

- WalletConnect compatibility issue with unsupported chains in mobile wallets
- Linux build failure by adding required author field in package.json
- Chain configuration to only expose supported networks during WalletConnect connection

### Changed

- Rebranded from zkBob UI to zkTelos Wallet for Telos ecosystem
- Updated configuration system to support Telos Testnet
- Modified zkbob-client-js with custom patch for Telos address prefixes
- SNARK parameters sourced from Telos-specific S3 bucket

### Technical Details

- Electron 27.0.0
- React 18.2.0
- wagmi 0.12.1
- zkbob-client-js 6.0.0
- Custom webpack configuration for WebAssembly and Node.js polyfills
- Security headers (COEP/COOP) for SharedArrayBuffer support

## [Unreleased]

### Planned

- Production pool support
- Additional token support
- Enhanced privacy features
- Performance optimizations
