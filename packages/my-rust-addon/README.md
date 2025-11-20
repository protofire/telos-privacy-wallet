# my-rust-addon

A native Rust addon for Electron using [Neon](https://neon-bindings.com/).

## Prerequisites

- **Rust toolchain**: Install from [rustup.rs](https://rustup.rs/)
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```

- **Node.js**: Version 16 or higher

## Installation

The addon builds automatically when you run:

```bash
yarn install
```

## Development

### Build the addon

```bash
# Release build (optimized)
yarn build

# Debug build (faster compilation, includes debug symbols)
yarn build-debug
```

### Clean build artifacts

```bash
yarn clean
```

## Usage

```javascript
const myRustAddon = require('my-rust-addon');

// Call the helloWorld function
const result = myRustAddon.helloWorld('Hello from JavaScript!');
console.log(result);
// Output: "Hello from Rust! You said: Hello from JavaScript!"
```

## Structure

```
my-rust-addon/
├── Cargo.toml          # Rust project configuration
├── src/
│   └── lib.rs          # Rust source code
├── index.js            # JavaScript entry point
├── package.json        # Node.js package configuration
└── README.md           # This file
```

## How it works

1. **Rust code** (`src/lib.rs`): Contains the native implementation
2. **Neon binding**: Uses Neon to create JavaScript-compatible bindings
3. **Build process**: Compiles Rust to a native `.node` module
4. **JavaScript wrapper** (`index.js`): Provides a clean JavaScript API

## Electron Integration

This addon is configured to work with Electron. The compiled `.node` file is:
- Automatically extracted from asar archives (configured in `asarUnpack`)
- Included in the Electron app bundle
- Loaded at runtime by the main process

## Troubleshooting

### Rust not found

If you get "cargo: command not found", install Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### Build fails on Electron

The addon is automatically built for the correct Node.js version. If issues persist:
```bash
yarn clean
yarn build
```

## Performance

Rust addons typically offer:
- ✅ Better performance than JavaScript for CPU-intensive tasks
- ✅ Memory safety without garbage collection overhead
- ✅ Zero-cost abstractions
- ✅ Cross-platform compatibility

## Learn More

- [Neon Documentation](https://neon-bindings.com/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Electron Native Modules](https://www.electronjs.org/docs/latest/tutorial/using-native-node-modules)
