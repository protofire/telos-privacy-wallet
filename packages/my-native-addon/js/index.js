const EventEmitter = require('node:events')

// Load the native addon using the 'bindings' module
// This will look for the compiled .node file in various places
const bindings = require('bindings')
const native = bindings('my_addon')

// Create a nice JavaScript wrapper
class MyNativeAddon extends EventEmitter {
  constructor() {
    super()

    // Create an instance of our C++ class
    this.addon = new native.MyAddon()
  }

  // Wrap the C++ method with a nicer JavaScript API
  helloWorld(input = '') {
    if (typeof input !== 'string') {
      throw new TypeError('Input must be a string')
    }
    return this.addon.helloWorld(input)
  }
}

// Export a singleton instance
if (process.platform === 'win32' || process.platform === 'darwin' || process.platform === 'linux') {
  module.exports = new MyNativeAddon()
} else {
  // Provide a fallback for unsupported platforms
  console.warn('Native addon not supported on this platform')

  module.exports = {
    helloWorld: (input) => `Hello from JS! You said: ${input}`
  }
}