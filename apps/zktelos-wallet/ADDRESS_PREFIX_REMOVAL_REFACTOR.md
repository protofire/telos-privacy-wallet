# Address Prefix Removal Refactor - Technical Documentation

## Overview

This document describes the technical considerations, implications, and implementation strategy for removing address prefixes from zkBob shielded addresses in the Telos Privacy Wallet. The primary goal is to simplify the user experience by using naked addresses (base58 strings without prefixes) while maintaining security and preventing user confusion.

## Current Architecture

### Address Format Types

The zkbob-client-js library supports three address formats:

1. **Pool-Specific**: `prefix:base58address` (e.g., `0zk-pusd-testnet:ABC123...`)
   - PoolId is encoded in the checksum
   - Generated via `generateAddress()` → `zpState().generateAddress()`
   - Only valid for the pool that generated it

2. **Generic**: `zkbob:base58address` (e.g., `zkbob:ABC123...`)
   - PoolId is NOT encoded in the checksum
   - Generated via `generateUniversalAddress()` → `zpState().generateUniversalAddress()`
   - Works across all pools

3. **Naked**: `base58address` (e.g., `ABC123...`)
   - Currently only supported for Polygon USDC pool (backward compatibility)
   - Format detection happens during parsing

### Key Files

#### Core Library Files
- `node_modules/zkbob-client-js/src/client.ts` - Main client implementation
  - Lines 511-524: Address generation methods
  - Lines 526-557: Address format detection (`checkShieldedAddressFormat`)
  - Lines 559-569: Address verification (`verifyShieldedAddress`)
  - Lines 581-619: Address parsing (`addressInfo`)

- `node_modules/zkbob-client-js/src/client-provider.ts` - Provider base class
  - Lines 413-426: Address prefix resolution (`addressPrefix`)
  - Lines 365-380: PoolId retrieval from contract

- `node_modules/zkbob-client-js/src/state.ts` - State management
  - Lines 296-305: Address assembly (`assembleAddress`)
  - Lines 312-314: Address parsing (`parseAddress`)
  - Lines 278-284: Address verification methods

- `node_modules/zkbob-client-js/src/address-prefixes.ts` - Prefix definitions
  - Line 3: `GENERIC_ADDRESS_PREFIX = 'zkbob'`
  - Line 4: `PREFIXED_ADDR_REGEX` - Regex for prefixed addresses
  - Line 5: `NAKED_ADDR_REGEX` - Regex for naked addresses
  - Lines 8-66: `hardcodedPrefixes` array

#### Application Files
- `src/config/index.js` - Pool configuration
  - Lines 42-70: Pool definitions with `addressPrefix` property
  - Line 86: `extraPrefixes: []` configuration

- `src/contexts/ZkAccountContext/index.js` - Account context
  - Lines 419-422: `generateAddress()` wrapper
  - Lines 424-427: `verifyShieldedAddress()` wrapper

- `src/pages/Transfer/SingleTransfer/index.js` - Transfer UI
  - Lines 50-57: Address validation logic

- `src/pages/Transfer/MultiTransfer/index.js` - Multi-transfer UI
  - Lines 47-61: Address validation in CSV parsing

- `patches/zkbob-client-js+6.0.0.patch` - Current patch for custom prefixes

## Technical Analysis

### How PoolId Affects Address Validation

**Critical Finding**: The poolId is encoded in the checksum of pool-specific addresses. This means:

1. **Address Generation**: When `generateAddress()` is called, it uses `zpState().generateAddress()` which creates an address with the current pool's poolId encoded in the checksum.

2. **Address Validation**: When `verifyShieldedAddress()` is called:
   - **Current behavior**: Only validates checksum correctness via `state.verifyShieldedAddress()` → `worker.verifyShieldedAddress()` → WASM `validateAddress()`
   - **Problem**: The worker/WASM layer only validates checksum format, NOT that the encoded poolId matches the current pool
   - **For naked addresses**: We need to parse the address first to extract the poolId, then verify it matches the current pool before validating checksum
   - For generic addresses: Uses `verifyUniversalShieldedAddress()` which validates without poolId

3. **Cross-Pool Usage**: If an address is generated in Pool A (poolId 1) and used in Pool B (poolId 2):
   - The base58 string is syntactically valid
   - **Without poolId check**: The checksum validation might pass if the address format is correct, but the address belongs to the wrong pool
   - **With poolId check**: We parse the address, extract poolId (1), compare with current pool (2), and reject if mismatch
   - The checksum validation will also FAIL because the encoded poolId (1) doesn't match the current pool's poolId (2)

### Current Naked Address Support

The code currently has limited support for naked addresses:

```typescript
// client.ts:547-554
} else if (NAKED_ADDR_REGEX.test(address)) {
  if (!forCurrentPool || ((await this.addressPrefix()).poolId == 0 && this.pool().chainId == 137)) {
    // addresses without any prefix are accepted for Polygon USDC pool only
    format = ShieldedAddressFormat.Generic;
  }
}
```

And in parsing:

```typescript
// client.ts:596-605
} else {
  components = await this.zpState().parseAddress(address).catch(handleAddressError);
  if (components) {
    if (components.format == 'generic') {
      components.pool_id = '0';
    } else {
      components = undefined; // Rejects pool-specific naked addresses
    }
  }
}
```

**Problem**: The code only accepts naked addresses as Generic format, rejecting pool-specific naked addresses.

## Refactor Requirements

### Primary Goal
Remove address prefixes entirely and use naked addresses (base58 strings only).

### Required Changes

#### 1. Modify Address Generation
**File**: `node_modules/zkbob-client-js/src/client.ts`

```typescript
// Current (lines 511-513)
public async generateAddress(): Promise<string> {
  const prefix = (await this.addressPrefix()).prefix;
  return `${prefix}:${await this.zpState().generateAddress()}`;
}

// Proposed
public async generateAddress(): Promise<string> {
  return await this.zpState().generateAddress(); // Return naked address
}
```

#### 2. Modify Address Format Detection
**File**: `node_modules/zkbob-client-js/src/client.ts`

```typescript
// Current (lines 547-554)
} else if (NAKED_ADDR_REGEX.test(address)) {
  if (!forCurrentPool || ((await this.addressPrefix()).poolId == 0 && this.pool().chainId == 137)) {
    format = ShieldedAddressFormat.Generic;
  }
}

// Proposed - Accept naked addresses for Telos pools
} else if (NAKED_ADDR_REGEX.test(address)) {
  // Accept as PoolSpecific for Telos pools
  const poolId = await this.poolId();
  if (poolId === 1 || poolId === 2) { // Telos testnet pools
    format = ShieldedAddressFormat.PoolSpecific;
  } else {
    format = ShieldedAddressFormat.Generic; // Fallback for other pools
  }
}
```

#### 3. Modify Address Verification
**File**: `node_modules/zkbob-client-js/src/client.ts`

**Critical**: The `verifyShieldedAddress()` method needs to verify poolId match for naked addresses, as `state.verifyShieldedAddress()` and the worker only validate checksum, not poolId.

```typescript
// Current (lines 559-569)
public async verifyShieldedAddress(address: string): Promise<boolean> {
  switch (await this.checkShieldedAddressFormat(address)) {
    case ShieldedAddressFormat.PoolSpecific:
      return this.zpState().verifyShieldedAddress(address);
    case ShieldedAddressFormat.Generic:
      return this.zpState().verifyUniversalShieldedAddress(address);
  }
  return false;
}

// Proposed - Verify poolId for naked addresses
public async verifyShieldedAddress(address: string): Promise<boolean> {
  const format = await this.checkShieldedAddressFormat(address);
  
  switch (format) {
    case ShieldedAddressFormat.PoolSpecific:
      // For naked addresses, verify poolId matches current pool
      if (NAKED_ADDR_REGEX.test(address)) {
        try {
          const components = await this.zpState().parseAddress(address);
          if (components.format === 'pool') {
            const currentPoolId = await this.poolId();
            // Verify poolId matches
            if (components.pool_id !== currentPoolId.toString()) {
              return false; // Address belongs to different pool
            }
          }
        } catch (error) {
          return false; // Invalid address format
        }
      }
      // Then validate checksum
      return this.zpState().verifyShieldedAddress(address);
      
    case ShieldedAddressFormat.Generic:
      return this.zpState().verifyUniversalShieldedAddress(address);
  }
  
  return false;
}
```

**Why this is needed**: 
- `state.verifyShieldedAddress()` only validates checksum correctness
- `worker.verifyShieldedAddress()` calls WASM `validateAddress()` which only checks checksum
- Neither method verifies that the encoded poolId matches the current pool
- Without this check, addresses from Pool A would validate as "correct" in Pool B (same poolId) even though they belong to different pools

#### 4. Modify Address Parsing
**File**: `node_modules/zkbob-client-js/src/client.ts`

```typescript
// Current (lines 596-605)
} else {
  components = await this.zpState().parseAddress(address).catch(handleAddressError);
  if (components) {
    if (components.format == 'generic') {
      components.pool_id = '0';
    } else {
      components = undefined; // Rejects pool-specific
    }
  }
}

// Proposed - Accept both formats
} else {
  components = await this.zpState().parseAddress(address).catch(handleAddressError);
  if (components) {
    if (components.format == 'generic') {
      components.pool_id = await this.poolId().toString();
    }
    // Accept pool format - poolId already encoded in address
  }
}
```

#### 5. Modify Address Assembly
**File**: `node_modules/zkbob-client-js/src/state.ts`

```typescript
// Current (lines 296-305)
public async assembleAddress(d: string, p_d: string): Promise<string> {
  let addr;
  if (this.addressPrefix) {
    addr = await this.worker.assembleAddress(this.stateId, forceDecimal(d), forceDecimal(p_d));
  } else {
    addr = await this.worker.assembleUniversalAddress(this.stateId, forceDecimal(d), forceDecimal(p_d));
  }
  return `${this.addressPrefix ?? GENERIC_ADDRESS_PREFIX}:${addr}`;
}

// Proposed
public async assembleAddress(d: string, p_d: string): Promise<string> {
  const addr = await this.worker.assembleAddress(this.stateId, forceDecimal(d), forceDecimal(p_d));
  return addr; // Return naked address
}
```

#### 6. Update Patch File
**File**: `patches/zkbob-client-js+6.0.0.patch`

- Set `hardcodedPrefixes` to empty array `[]`
- Optionally ignore `PREFIXED_ADDR_REGEX` and `GENERIC_ADDRESS_PREFIX` (or keep for backward compatibility)

#### 7. CRITICAL: Fix Address Parsing in Network Layer
**Problem**: Several critical locations assume addresses have prefixes, causing deposits and transfers to fail when using naked addresses.

**Affected Files**:

1. **`node_modules/zkbob-client-js/src/networks/evm/index.ts`** (lines 531, 547)
   ```typescript
   // Current - FAILS with naked addresses
   const zkAddrBytes = `0x${Buffer.from(bs58.decode(zkAddress.substring(zkAddress.indexOf(':') + 1))).toString('hex')}`;
   
   // Proposed - Handle both formats
   function extractBase58Address(address: string): string {
     const colonIndex = address.indexOf(':');
     if (colonIndex === -1) {
       // Naked address - return as is
       return address;
     }
     // Prefixed address - return part after colon
     return address.substring(colonIndex + 1);
   }
   const zkAddrBytes = `0x${Buffer.from(bs58.decode(extractBase58Address(zkAddress))).toString('hex')}`;
   ```

2. **`node_modules/zkbob-client-js/src/networks/tron/index.ts`** (line 468)
   - Same issue as EVM network layer
   - Apply same `extractBase58Address()` helper function

3. **`src/pages/Payment/hooks.js`** (line 346)
   ```javascript
   // Current - FAILS with naked addresses (returns undefined)
   const decodedZkAddress = ethers.utils.hexlify(ethers.utils.base58.decode(zkAddress.split(':')[1]));
   
   // Proposed - Handle both formats
   function extractBase58Address(address) {
     const colonIndex = address.indexOf(':');
     if (colonIndex === -1) {
       return address; // Naked address
     }
     return address.substring(colonIndex + 1); // Prefixed address
   }
   const decodedZkAddress = ethers.utils.hexlify(ethers.utils.base58.decode(extractBase58Address(zkAddress)));
   ```

4. **`src/pages/Payment/index.js`** (line 175)
   ```javascript
   // Current - May fail with naked addresses
   const addressPrefix = params.address.split(':')[0];
   
   // Proposed - Handle both formats
   function extractPrefix(address) {
     const colonIndex = address.indexOf(':');
     return colonIndex === -1 ? null : address.substring(0, colonIndex);
   }
   const addressPrefix = extractPrefix(params.address);
   ```

**Why This Is Critical**:
- These locations are used during deposit processing (payment contract calls)
- They are used when creating direct deposits
- They silently fail or produce incorrect bytes if address doesn't have prefix
- This causes transactions to appear in history but fail on-chain (txHash doesn't exist on explorer)

**Solution Pattern**:
Create a helper function `extractBase58Address(address: string): string` that:
- Returns the address as-is if no colon is found (naked address)
- Returns the substring after the colon if colon is found (prefixed address)
- Use this helper in all locations that parse addresses for encoding/decoding

**Implementation Notes**:
- The helper should be added to a utility file or directly in each affected file
- For library files (`node_modules/zkbob-client-js/src/networks/`), add via patch
- For application files (`src/`), add directly to the codebase
- Test thoroughly with both prefixed and naked addresses

## Advantages

### User Experience
1. **Simpler Addresses**: Shorter, cleaner addresses without prefixes
2. **Easier to Share**: Users don't need to worry about prefix format
3. **Better QR Codes**: Smaller QR codes for naked addresses
4. **Copy-Paste Friendly**: Less chance of copying wrong prefix

### Technical
1. **Reduced Complexity**: Less string manipulation and parsing
2. **Smaller Storage**: Addresses take less space in databases
3. **Consistent Format**: All addresses follow same format regardless of pool

## Disadvantages

### Security & Validation
1. **No Visual Pool Identification**: Users can't tell which pool an address belongs to by looking at it
2. **Cross-Pool Confusion**: Addresses from one pool might appear valid in another (though checksum will fail)
3. **No Chain Identification**: Can't distinguish between testnet and mainnet addresses visually

### Technical Challenges
1. **Backward Compatibility**: Existing addresses with prefixes won't work without migration
2. **Validation Complexity**: Need to ensure checksum validation works correctly without prefix hints
3. **Error Messages**: Harder to provide helpful error messages without prefix context

## Potential Errors & Edge Cases

### Error Scenarios

1. **Cross-Pool Address Usage**
   - **Scenario**: User generates address in Pool A (PUSD, poolId 1), tries to use in Pool B (TLOS, poolId 2)
   - **Current Behavior**: Validation fails (checksum mismatch)
   - **User Impact**: Confusing error message
   - **Solution**: Clear error message explaining pool mismatch

2. **Cross-Chain Address Usage**
   - **Scenario**: User generates address in Telos Testnet (poolId 1), tries to use in Telos Mainnet (poolId 1)
   - **Current Behavior**: Validation passes (same poolId), but funds are on different chain
   - **User Impact**: Potential fund loss if user sends to wrong chain
   - **Solution**: UI must clearly indicate current chain/network

3. **Legacy Addresses with Prefixes**
   - **Scenario**: User has old addresses with prefixes stored
   - **Current Behavior**: Will fail validation if prefixes are removed
   - **User Impact**: Cannot use old addresses
   - **Solution**: Maintain backward compatibility or migration path

4. **Invalid Address Format**
   - **Scenario**: User pastes invalid base58 string
   - **Current Behavior**: Validation fails
   - **User Impact**: Unclear error message
   - **Solution**: Better error messages with format hints

### Edge Cases

1. **Empty Prefix Array**: If `hardcodedPrefixes` is empty, `addressPrefix()` will throw error
   - **Fix**: Modify `addressPrefix()` to handle empty array gracefully

2. **PoolId Collision**: Same poolId in different chains (testnet vs mainnet)
   - **Risk**: Addresses valid in both chains but funds on different chains
   - **Solution**: Use unique poolIds per chain (recommended: testnet=1,2; mainnet=3,4)

3. **Generic vs Pool-Specific**: If user generates generic address, it works in all pools
   - **Risk**: Confusion about which pool funds belong to
   - **Solution**: Always generate pool-specific addresses for Telos pools

## UI Solutions to Prevent User Confusion

### 1. Chain/Network Indicator
**Location**: `src/components/Header/index.js`, `src/components/NetworkDropdown/index.js`

- **Display**: Prominent badge showing current network (Testnet/Mainnet)
- **Color Coding**: Red for testnet, green for mainnet
- **Implementation**: Use `currentPool.chainId` to determine network

```jsx
<NetworkBadge chainId={currentPool.chainId}>
  {currentPool.chainId === 41 ? 'Testnet' : 'Mainnet'}
</NetworkBadge>
```

### 2. Pool Context in Address Display
**Location**: `src/components/Tabs/index.js`, `src/components/PaymentLinkModal/index.js`

- **Display**: Show pool name/token symbol next to address
- **Format**: `[PUSD] ABC123...` or `ABC123... (PUSD Pool)`
- **Implementation**: Use `currentPool.tokenSymbol` or `currentPool.alias`

```jsx
<AddressDisplay>
  <PoolBadge>{currentPool.tokenSymbol}</PoolBadge>
  <Address>{nakedAddress}</Address>
</AddressDisplay>
```

### 3. Address Validation Feedback
**Location**: `src/pages/Transfer/SingleTransfer/index.js`, `src/pages/Transfer/MultiTransfer/index.js`

- **Display**: Clear error messages when address validation fails
- **Messages**:
  - "Address belongs to a different pool" (poolId mismatch)
  - "Address format invalid" (syntax error)
  - "Address belongs to testnet/mainnet" (chain mismatch)
- **Implementation**: Enhance `verifyShieldedAddress()` to return error details

```jsx
const [addressError, setAddressError] = useState(null);

useEffect(() => {
  async function validateAddress(address) {
    try {
      const isValid = await verifyShieldedAddress(address);
      if (!isValid) {
        const info = await zkClient.addressInfo(address);
        if (info.pool_id !== currentPool.poolId) {
          setAddressError('Address belongs to a different pool');
        }
      }
    } catch (error) {
      setAddressError('Invalid address format');
    }
  }
  validateAddress(receiver);
}, [receiver]);
```

### 4. Address Generation Context
**Location**: `src/components/PaymentLinkModal/index.js`, `src/components/Tabs/index.js`

- **Display**: Show pool context when generating addresses
- **Format**: "Your PUSD address:" or "Generate PUSD address"
- **Implementation**: Include pool name in address generation UI

```jsx
<AddressSection>
  <Label>Your {currentPool.tokenSymbol} Address</Label>
  <Address>{generatedAddress}</Address>
  <Hint>This address is for {currentPool.tokenSymbol} on {currentPool.chainId === 41 ? 'Testnet' : 'Mainnet'}</Hint>
</AddressSection>
```

### 5. Transfer Confirmation Modal
**Location**: `src/components/ConfirmTransactionModal/index.js`

- **Display**: Show pool and network information prominently
- **Format**: 
  ```
  Transfer Details:
  From: PUSD Pool (Testnet)
  To: ABC123... (PUSD Pool)
  Amount: 100 PUSD
  ```
- **Implementation**: Include pool context in confirmation modal

```jsx
<TransferDetails>
  <Row>
    <Label>From Pool:</Label>
    <Value>{currentPool.tokenSymbol} ({currentPool.chainId === 41 ? 'Testnet' : 'Mainnet'})</Value>
  </Row>
  <Row>
    <Label>To Address:</Label>
    <Value>{receiver}</Value>
  </Row>
  <Row>
    <Label>To Pool:</Label>
    <Value>{detectedPool || 'Unknown'}</Value>
  </Row>
</TransferDetails>
```

### 6. Address Input Hints
**Location**: `src/components/MultilineInput/index.js` (if used for addresses)

- **Display**: Placeholder text with format hint
- **Format**: "Enter shielded address (base58 format)"
- **Implementation**: Context-aware placeholders

```jsx
<Input
  placeholder={`Enter ${currentPool.tokenSymbol} shielded address`}
  hint="Address should be a base58 string (62-63 characters)"
/>
```

### 7. History/Transaction Display
**Location**: `src/components/HistoryItem/index.js`, `src/components/LatestTransactions/index.js`

- **Display**: Show pool context for each transaction
- **Format**: Include pool badge/icon with addresses
- **Implementation**: Store pool context with transaction data

```jsx
<TransactionItem>
  <PoolBadge>{transaction.poolSymbol}</PoolBadge>
  <Address>{transaction.address}</Address>
  <Amount>{transaction.amount} {transaction.poolSymbol}</Amount>
</TransactionItem>
```

### 8. Settings/Preferences
**Location**: Create new `src/pages/Settings/index.js` if needed

- **Display**: Option to show/hide pool context
- **Features**:
  - Toggle address format display
  - Show pool badges
  - Network indicator preferences
- **Implementation**: User preferences stored in localStorage

## Implementation Checklist

### Phase 1: Library Modifications
- [ ] Modify `generateAddress()` to return naked address
- [ ] Update `checkShieldedAddressFormat()` to accept naked addresses
- [ ] **CRITICAL**: Modify `verifyShieldedAddress()` to verify poolId match for naked addresses
- [ ] Modify `addressInfo()` to accept pool-specific naked addresses
- [ ] Update `assembleAddress()` to return naked address
- [ ] **CRITICAL**: Fix address parsing in `networks/evm/index.ts` (createDirectDepositTx, createNativeDirectDepositTx)
- [ ] **CRITICAL**: Fix address parsing in `networks/tron/index.ts` (if using Tron)
- [ ] Update patch file to set `hardcodedPrefixes = []`

### Phase 1.5: Application Layer Fixes (CRITICAL)
- [ ] **CRITICAL**: Fix address parsing in `src/pages/Payment/hooks.js` (line 346)
- [ ] **CRITICAL**: Fix address parsing in `src/pages/Payment/index.js` (line 175)
- [ ] Create `extractBase58Address()` helper function
- [ ] Test deposits with naked addresses
- [ ] Test transfers with naked addresses

### Phase 2: Application Updates
- [ ] Update all address display components to show pool context
- [ ] Add network indicator to header
- [ ] Enhance address validation error messages
- [ ] Update transfer confirmation modals
- [ ] Add address format hints in input fields

### Phase 3: Testing
- [ ] **CRITICAL**: Test deposits with naked addresses (verify txHash appears on explorer)
- [ ] **CRITICAL**: Test transfers with naked addresses (verify txHash appears on explorer)
- [ ] Test address generation in each pool
- [ ] Test cross-pool address validation
- [ ] Test cross-chain scenarios (if applicable)
- [ ] Test backward compatibility with prefixed addresses
- [ ] Test UI components with naked addresses
- [ ] Test direct deposits (if applicable)

### Phase 4: Migration (if needed)
- [ ] Create migration script for existing addresses
- [ ] Update documentation
- [ ] User communication about format change

## PoolId Strategy

### Recommended PoolId Assignment

**Testnet (ChainId 41)**:
- PUSD Pool: `poolId = 1`
- TLOS Pool: `poolId = 2`

**Mainnet (ChainId 40)**:
- PUSD Pool: `poolId = 3`
- TLOS Pool: `poolId = 4`

**Rationale**: 
- Unique poolIds prevent cross-chain address validation
- Clear separation between testnet and mainnet
- Room for future pools (poolId 5, 6, etc.)

### Configuration Example

```javascript
// src/config/index.js
dev: {
  pools: {
    'tlos_testnet': {
      chainId: 41,
      poolAddress: '0x...',
      // poolId will be fetched from contract, should be 1
    },
    'tlos_testnet_native': {
      chainId: 41,
      poolAddress: '0x...',
      // poolId will be fetched from contract, should be 2
    }
  }
},
prod: {
  pools: {
    'tlos_mainnet': {
      chainId: 40,
      poolAddress: '0x...',
      // poolId will be fetched from contract, should be 3
    },
    'tlos_mainnet_native': {
      chainId: 40,
      poolAddress: '0x...',
      // poolId will be fetched from contract, should be 4
    }
  }
}
```

## References

### Key Code Locations

1. **Address Generation**: `node_modules/zkbob-client-js/src/client.ts:511-524`
2. **Address Validation**: `node_modules/zkbob-client-js/src/client.ts:559-569`
3. **Format Detection**: `node_modules/zkbob-client-js/src/client.ts:526-557`
4. **Address Parsing**: `node_modules/zkbob-client-js/src/client.ts:581-619`
5. **PoolId Retrieval**: `node_modules/zkbob-client-js/src/client-provider.ts:365-380`
6. **Prefix Resolution**: `node_modules/zkbob-client-js/src/client-provider.ts:413-426`
7. **State Management**: `node_modules/zkbob-client-js/src/state.ts:296-314`
8. **Prefix Definitions**: `node_modules/zkbob-client-js/src/address-prefixes.ts`
9. **CRITICAL - Network Layer**: `node_modules/zkbob-client-js/src/networks/evm/index.ts:531,547`
10. **CRITICAL - Payment Processing**: `src/pages/Payment/hooks.js:346`
11. **CRITICAL - Payment URL Parsing**: `src/pages/Payment/index.js:175`

### Application Components

1. **Account Context**: `src/contexts/ZkAccountContext/index.js`
2. **Pool Configuration**: `src/config/index.js`
3. **Transfer UI**: `src/pages/Transfer/SingleTransfer/index.js`
4. **Multi-Transfer UI**: `src/pages/Transfer/MultiTransfer/index.js`
5. **Address Display**: `src/components/Tabs/index.js`
6. **Payment Modal**: `src/components/PaymentLinkModal/index.js`

## Notes

- The poolId is fetched from the smart contract, not hardcoded in the config
- The checksum validation happens at the WASM level (libzkbob-rs-wasm-web)
- Address format detection relies on regex patterns and prefix matching
- The current implementation has special handling for Polygon (poolId 0, chainId 137)
- Generic addresses (`zkbob:...`) work across all pools but don't encode poolId

## Future Considerations

1. **Bridge Support**: If cross-chain bridges are added, generic addresses might be preferred
2. **Multi-Pool Wallets**: Users might want to manage addresses for multiple pools simultaneously
3. **Address Book**: Consider adding address book feature with pool labels
4. **QR Code Standards**: Ensure QR codes work with naked addresses
5. **Explorer Integration**: Update block explorer links to work with naked addresses

