export const TX_STATUSES = {
  APPROVE_TOKENS: 'approve_tokens',
  APPROVED: 'approved',
  SIGN_MESSAGE: 'sign_message',
  CONFIRM_TRANSACTION: 'confirm_transaction',
  WAITING_FOR_TRANSACTION: 'waiting_for_transaction',
  GENERATING_PROOF: 'generating_proof',
  WAITING_FOR_RELAYER: 'waiting_for_relayer',
  DEPOSITED: 'deposited',
  TRANSFERRED: 'transferred',
  TRANSFERRED_MULTI: 'transferred_multi',
  WITHDRAWN: 'withdrawn',
  REJECTED: 'rejected',
  SUSPICIOUS_ACCOUNT_DEPOSIT: 'suspicious_account_deposit',
  SUSPICIOUS_ACCOUNT_WITHDRAWAL: 'suspicious_account_withdrawal',
  WRONG_NETWORK: 'wrong_network',
  SWITCH_NETWORK: 'switch_network',
  SENT: 'sent',
  PREPARING_TRANSACTION: 'preparing_transaction',
};

export const NETWORKS = {
  40: {
    name: 'Telos',
    icon: require('assets/telos.svg').default,
    nativeSymbol: 'TLOS',
    blockExplorerUrls: {
      address: 'https://teloscan.io/address/%s',
      tx: 'https://teloscan.io/tx/%s',
    },
  },
  41: {
    name: 'Telos Testnet',
    icon: require('assets/telos.svg').default,
    nativeSymbol: 'TLOS',
    blockExplorerUrls: {
      address: 'https://testnet.teloscan.io/address/%s',
      tx: 'https://testnet.teloscan.io/tx/%s',
    },
  },
};

const UNKNOWN_TOKEN_ICON = require('assets/unknown.svg').default;

const TOKENS_ICONS_BASE = {
  'ETH': require('assets/eth.svg').default,
  'WETH': require('assets/weth.png'),
  'USDM': require('assets/usdc.svg').default,
  'USDC': require('assets/usdc.svg').default,
  'USDC.e': require('assets/usdc.svg').default,
  'USDT': require('assets/usdt.png'),
  'USDT*': require('assets/usdt.png'),
  'TLOS': require('assets/telos.svg').default,
  'STLOS': require('assets/sTLOS.svg').default,
  'WTLOS': require('assets/wTLOS.svg').default,
};

export const TOKENS_ICONS = new Proxy(TOKENS_ICONS_BASE, {
  get(target, prop, receiver) {
    if (typeof prop === 'string' && Object.prototype.hasOwnProperty.call(target, prop)) {
      return Reflect.get(target, prop, receiver);
    }
    return UNKNOWN_TOKEN_ICON;
  },
});

export const CONNECTORS_ICONS = {
  'MetaMask': require('assets/metamask.svg').default,
  'WalletConnect': require('assets/walletconnect.svg').default,
  'WalletConnectLegacy': require('assets/walletconnect.svg').default,
};

export const INCREASED_LIMITS_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  RESYNC: 'resync',
};

export const PERMIT2_CONTRACT_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';

export const SUPPORT_URL = 'https://discord.com/channels/1095673887389392916/1112786753133220042';
