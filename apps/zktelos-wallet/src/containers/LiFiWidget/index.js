import React, {useContext, useMemo} from 'react';
import {LiFiWidget} from '@lifi/widget';
import {EVM} from '@lifi/sdk';
import {useConfig as useWagmiConfig} from 'wagmi';
import {getConnectorClient} from 'wagmi/actions';
import {createWalletClient, custom} from 'viem';

import {PoolContext} from 'contexts';
import {useWindowDimensions} from 'hooks';
import ThemeContext from 'contexts/ThemeContext';
import {useTheme} from 'styled-components';

// Wraps a viem wallet client so that wallet_getCapabilities always returns {}
// (no capabilities). This disables EIP-5792 atomic-batch detection in the
// LI.FI SDK, preventing it from calling sendCalls which MetaMask (post-Pectra)
// wraps in a type 0x4 (EIP-7702) authorization transaction — incompatible with
// legacy gasPrice gas fields and rejected by MetaMask with code -32602.
const wrapClientNoBatching = (client) => ({
  ...client,
  request: async (args) => {
    if (args.method === 'wallet_getCapabilities') {
      return {};
    }
    return client.request(args);
  },
});

export default () => {
  const {currentPool} = useContext(PoolContext);
  const {theme: themeName} = useContext(ThemeContext);

  const {card, color, input} = useTheme();
  const wagmiConfig = useWagmiConfig();

  const {width} = useWindowDimensions();

  const widgetConfig = useMemo(() => {
    return {
      integrator: 'Telos-wallet',
      fee: 0.00075,
      variant: 'compact',
      appearance: themeName,
      disableAppearance: true,
      containerStyle: {
        backgroundColor: card.background,
        width: width > 500 ? 480 : '100%',
        maxWidth: width > 500 ? 480 : '100%',
      },
      theme: {
        typography: {
          fontFamily: 'Gilroy'
        },
        palette: {
          primary: {main: color.blue},
          secondary: {main: color.purple},
          background: {
            default: card.background,
            paper: input.background.primary,
          }
        },
        components: {
          MuiAvatar: {
            defaultProps: {
              imgProps: {crossOrigin: 'anonymous'},
            },
          },
        },
      },
      fromChain: 1,
      fromToken: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT Ethereum
      toChain: currentPool.chainId,
      toToken: currentPool.tokenAddress,
      disableTelemetry: true,
      // Custom EVM provider: bypasses wagmi's chain registry validation so
      // LI.FI can switch to any chain without it being pre-configured in wagmi.
      sdkConfig: {
        providers: [
          EVM({
            getWalletClient: async () => {
              const client = await getConnectorClient(wagmiConfig, {assertChainId: false});
              // Wrap the client to disable EIP-5792 atomic-batch capability reporting.
              // Without this, MetaMask (post-Pectra) reports atomicBatch.supported=true,
              // causing LI.FI to use sendCalls → which MetaMask wraps in a type 0x4
              // (EIP-7702) transaction but with legacy gasPrice fields — an invalid combo.
              return wrapClientNoBatching(client);
            },
            switchChain: async (chainId) => {
              // Switch via wallet RPC directly — no wagmi chain registry needed
              const currentClient = await getConnectorClient(wagmiConfig, {
                assertChainId: false,
              });
              await currentClient.request({
                method: 'wallet_switchEthereumChain',
                params: [{chainId: `0x${chainId.toString(16)}`}],
              });
              // If the target chain is in wagmi config, use its client (has full chain metadata)
              const knownChain = wagmiConfig.chains.find(c => c.id === chainId);
              if (knownChain) {
                return wrapClientNoBatching(
                  await getConnectorClient(wagmiConfig, {chainId})
                );
              }
              // For chains not in wagmi config, build a minimal viem wallet client
              // directly against window.ethereum (wallet already switched — just wrap it)
              return wrapClientNoBatching(
                createWalletClient({
                  account: currentClient.account,
                  chain: {
                    id: chainId,
                    name: `Chain ${chainId}`,
                    nativeCurrency: {decimals: 18, name: 'ETH', symbol: 'ETH'},
                    rpcUrls: {default: {http: []}},
                  },
                  transport: custom(window.ethereum),
                })
              );
            },
          }),
        ],
      },
    };
  }, [currentPool.chainId, currentPool.tokenAddress, themeName, width, card.background, color.blue, color.purple, input.background.primary, wagmiConfig]);

  return (
    <LiFiWidget config={widgetConfig} />
  );
};
