#!/usr/bin/env node

// Test both C++ and Rust native addons
console.log('🔧 Testing Native Addons\n');

try {
  // Test C++ addon
  console.log('📦 Testing C++ Addon...');
  const cppAddon = require('./my-native-addon');
  const cppResult = cppAddon.helloWorld('Testing from Node.js');
  console.log('  ✅', cppResult);
  console.log('');
} catch (err) {
  console.log('  ❌ C++ addon failed:', err.message);
  console.log('');
}

try {
  // Test Rust addon
  console.log('🦀 Testing Rust Addon...');
  const rustAddon = require('./my-rust-addon');
  const rustResult = rustAddon.helloWorld('Testing from Node.js');
  console.log('  ✅', rustResult);
  console.log('');
} catch (err) {
  console.log('  ❌ Rust addon failed:', err.message);
  console.log('');
}

console.log('✨ All tests completed!\n');
