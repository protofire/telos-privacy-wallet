# Changelog

All notable changes to zkTelos Wallet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
