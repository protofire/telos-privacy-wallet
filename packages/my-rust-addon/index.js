const EventEmitter = require('node:events');

// Load the native Rust addon
let addon;
try {
  addon = require('./index.node');
} catch (err) {
  console.error('Failed to load Rust addon:', err.message);
  // Provide a fallback implementation
  addon = {
    helloWorld: (input) => `Hello from JS fallback! You said: ${input}`
  };
}

// Create a nice JavaScript wrapper
class MyRustAddon extends EventEmitter {
  constructor() {
    super();
  }

  // Wrap the Rust function with a nicer JavaScript API
  helloWorld(input = '') {
    if (typeof input !== 'string') {
      throw new TypeError('Input must be a string');
    }
    return addon.helloWorld(input);
  }
}

// Export a singleton instance
if (process.platform === 'win32' || process.platform === 'darwin' || process.platform === 'linux') {
  module.exports = new MyRustAddon();
} else {
  // Provide a fallback for unsupported platforms
  console.warn('Rust addon not supported on this platform');

  module.exports = {
    helloWorld: (input) => `Hello from JS fallback! You said: ${input}`
  };
}
