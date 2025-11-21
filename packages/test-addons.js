#!/usr/bin/env node

// Test Rust native addon
console.log('🔧 Testing Rust Native Addon\n');

try {
  console.log('🦀 Loading Rust addon...');
  const rustProver = require('./libzkbob-rs-node');

  console.log('✅ Addon loaded successfully\n');

  // Test helloWorld function
  console.log('📝 Testing helloWorld function...');
  const result = rustAddon.helloWorld('Testing from Node.js');
  console.log('  Result:', result);
  console.log('  ✅ Function works!\n');

  console.log('✨ All tests passed!\n');
} catch (err) {
  console.log('❌ Test failed:', err.message);
  console.log('Stack:', err.stack);
  process.exit(1);
}
