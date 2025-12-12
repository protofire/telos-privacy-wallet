import { WagmiConfig, configureChains, createClient } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from '@wagmi/core/providers/public'
// import { telos, telosTestnet } from 'wagmi/chains';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import config from '../config'

// Custom definitions because telos and telosTestnet from this version of wagmi are not up to date
const telosTestnet = {
  id: 41,
  name: 'Telos Testnet',
  network: 'telosTestnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Telos',
    symbol: 'TLOS',
  },
  rpcUrls: {
    public: { http: ['https://rpc.testnet.telos.net'] },
    default: { http: ['https://rpc.testnet.telos.net'] },
  },
  blockExplorers: {
    default: {
      name: 'Teloscan (testnet)',
      url: 'https://testnet.teloscan.io/',
    },
  },
  testnet: true,
}

const telos = {
  id: 40,
  name: 'Telos',
  network: 'telos',
  nativeCurrency: {
    decimals: 18,
    name: 'Telos',
    symbol: 'TLOS',
  },
  rpcUrls: {
    default: { http: ['https://rpc.telos.net'] },
  },
  blockExplorers: {
    default: {
      name: 'Teloscan',
      url: 'https://www.teloscan.io/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 246530709,
    },
  },
}

const getRpcByPriority = (priority) => {

  return (chain) => {
    // eslint-disable-next-line eqeqeq
    if (!Object.keys(config.chains).find((chainId) => chainId == chain.id)) {
      return publicProvider(chain);
    }

    const selectedChain = config.chains[chain.id];
    const len = selectedChain?.rpcUrls.length;
    let res;
    if (len > priority - 1) {
      res = ({ http: selectedChain.rpcUrls[priority] })
    } else {
      res = ({ http: selectedChain.rpcUrls[priority % len] }) //if config is shorter than current prioirity (up to 3) , we just wrap and start from the beginning
    };
    return res;
  }

}

const networks = process.env.REACT_APP_CONFIG === 'dev' ? [telosTestnet] : [telos];

const { chains, provider, webSocketProvider } = configureChains(
  networks,
  [
    jsonRpcProvider({
      priority: 0,
      rpc: getRpcByPriority(0)
    }),
    jsonRpcProvider({
      priority: 1,
      rpc: getRpcByPriority(1)
    }),
    jsonRpcProvider({
      priority: 2,
      rpc: getRpcByPriority(2)
    }),
    jsonRpcProvider({
      priority: 3,
      rpc: getRpcByPriority(3)
    })
  ],
);

const injected = new InjectedConnector({
  chains,
  options: {
    name: 'MetaMask',
  },
});

const walletConnect = new WalletConnectConnector({
  chains,
  options: {
    qrcode: true,
    projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID,
    name: 'zkTelos',
    relayUrl: 'wss://relay.walletconnect.org',
    metadata: {
      projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID,
    }
  },
});

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
  connectors: [injected, walletConnect],
});

export default ({ children }) => (
  <WagmiConfig client={client}>
    {children}
  </WagmiConfig>
);
