import { http, createConfig, WagmiProvider } from 'wagmi';
import { telos, telosTestnet } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient();

if (!process.env.REACT_APP_WALLETCONNECT_PROJECT_ID) {
  throw new Error('REACT_APP_WALLETCONNECT_PROJECT_ID is not set');
}

const supportedChains = [telos, telosTestnet];

const connectors = [
  walletConnect({
    showQrModal: true,
    projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID,
    metadata: {
      name: 'zkTelos Wallet',
      description: 'Privacy-focused wallet for Telos',
      url: 'https://privacy.telos.protofire.io',
      icons: ['https://privacy.telos.protofire.io/logo32.png'],
    },
    qrModalOptions: {
      themeMode: 'dark',
      enableExplorer: false
    }
  })];

if (process.env.REACT_APP_BUILD_TARGET === 'web') {
  connectors.push(injected());
}

const wagmiConfig = createConfig({
  chains: supportedChains,
  ssr: false,
  syncConnectedChain: false,
  transports: {
    [telos.id]: http('https://rpc.telos.net'),
    [telosTestnet.id]: http('https://rpc.testnet.telos.net'),
  },
  connectors,
});

export default ({ children }) => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </WagmiProvider>
);
