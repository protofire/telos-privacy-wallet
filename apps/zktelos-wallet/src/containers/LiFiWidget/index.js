import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import styled from 'styled-components';
import {LiFiWidget} from '@lifi/widget';
import {EVM} from '@lifi/sdk';
import {useConfig as useWagmiConfig} from 'wagmi';
import {getConnectorClient} from 'wagmi/actions';
import {createWalletClient, custom} from 'viem';
import {useTranslation} from 'react-i18next';
import {EyeOffIcon} from 'lucide-react';

import {PoolContext} from 'contexts';
import {useWindowDimensions} from 'hooks';
import ThemeContext from 'contexts/ThemeContext';
import {light as lightTheme, dark as darkTheme} from 'styles/ThemeConstants';

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

// The key MUI uses to persist the widget's color scheme in localStorage.
const LIFI_MODE_KEY = 'li.fi-widget-mode';

export default () => {
  const {currentPool} = useContext(PoolContext);
  const {theme: themeName, setThemePreference} = useContext(ThemeContext);
  const {t} = useTranslation();
  const wagmiConfig = useWagmiConfig();
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  const {width} = useWindowDimensions();

  // Pre-set the widget's localStorage mode synchronously in the render body so
  // that MUI's CssVarsProvider reads the correct value on initialization.
  // MUI reads localStorage during render (before any useEffect runs), so this
  // must be outside a hook to guarantee ordering.
  localStorage.setItem(LIFI_MODE_KEY, themeName);

  // Ref so MutationObserver / storage callbacks always see the current themeName
  // without re-subscribing on every render.
  const themeNameRef = useRef(themeName);
  useEffect(() => { themeNameRef.current = themeName; }, [themeName]);

  // App → widget: when themeName changes while the widget is already mounted,
  // dispatch a StorageEvent so MUI's localStorageManager.subscribe handler fires
  // and calls setMode() from inside its own CssVarsProvider context.
  // (The widget's internal ThemeProvider calls setMode() *outside* MuiThemeProvider,
  // making it a no-op. The StorageEvent path is the one that actually works.)
  useEffect(() => {
    window.dispatchEvent(new StorageEvent('storage', {
      key: LIFI_MODE_KEY,
      newValue: themeName,
      oldValue: null,
      storageArea: window.localStorage,
      url: window.location.href,
    }));
  }, [themeName]);

  // Widget → app: MUI applies the active color scheme as a CSS class ('light' or
  // 'dark') on <html> (document.documentElement). Observe class mutations to detect
  // when the user changes appearance inside the widget and sync back to the app.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const html = document.documentElement;
      const mode = html.classList.contains('dark') ? 'dark'
        : html.classList.contains('light') ? 'light'
        : null;
      if (mode && mode !== themeNameRef.current) {
        setThemePreference(mode);
      }
    });

    observer.observe(document.documentElement, {attributes: true, attributeFilter: ['class']});
    return () => observer.disconnect();
  }, [setThemePreference]);

  const widgetConfig = useMemo(() => {
    const activeTheme = themeName === 'dark' ? darkTheme : lightTheme;
    return {
      integrator: 'Telos-wallet',
      fee: 0.00075,
      variant: 'compact',
      appearance: themeName,
      containerStyle: {
        backgroundColor: activeTheme.card.background,
        width: width > 500 ? 480 : '100%',
        maxWidth: width > 500 ? 480 : '100%',
      },
      theme: {
        typography: {
          fontFamily: 'Gilroy'
        },
        // Use colorSchemes so the widget has correct palette values for both
        // light and dark independently. The `appearance` prop + StorageEvent
        // mechanism controls which scheme is active.
        colorSchemes: {
          light: {
            palette: {
              primary: {main: lightTheme.color.blue},
              secondary: {main: lightTheme.color.purple},
              background: {
                default: lightTheme.card.background,
                paper: lightTheme.input.background.primary,
              },
            },
          },
          dark: {
            palette: {
              primary: {main: darkTheme.color.blue},
              secondary: {main: darkTheme.color.purple},
              background: {
                default: darkTheme.card.background,
                paper: darkTheme.input.background.primary,
              },
            },
          },
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
  }, [currentPool.chainId, currentPool.tokenAddress, themeName, width, wagmiConfig]);

  return (
    <WidgetWrapper>
      {!noticeDismissed && (
        <PublicNotice>
          <NoticeBody>
            <EyeOffIcon size={14} style={{flexShrink: 0, marginTop: 2}} />
            <NoticeText>{t('lifi.publicNotice')}</NoticeText>
          </NoticeBody>
          <AcknowledgeButton onClick={() => setNoticeDismissed(true)}>
            {t('lifi.publicNoticeAck')}
          </AcknowledgeButton>
        </PublicNotice>
      )}
      <LiFiWidget config={widgetConfig} />
    </WidgetWrapper>
  );
};

const WidgetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const PublicNotice = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 14px;
  margin: 8px 24px 4px;
  border-radius: 10px;
  background: ${props => props.theme.networkLabel.background};
  border: 1px solid ${props => props.theme.color.darkGrey};
`;

const NoticeBody = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: ${props => props.theme.icon.color.default};
`;

const NoticeText = styled.span`
  font-size: 13px;
  color: ${props => props.theme.text.color.secondary};
  line-height: 1.5;
`;

const AcknowledgeButton = styled.button`
  align-self: flex-end;
  background: none;
  border: 1px solid ${props => props.theme.color.darkGrey};
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.primary};
  cursor: pointer;
  &:hover {
    background: ${props => props.theme.color.darkGrey}44;
  }
`;
