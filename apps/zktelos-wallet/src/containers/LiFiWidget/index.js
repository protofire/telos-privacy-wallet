import React, {useContext, useMemo} from 'react';
import {LiFiWidget} from '@lifi/widget';

import {PoolContext} from 'contexts';
import {useWindowDimensions} from 'hooks';
import ThemeContext from 'contexts/ThemeContext';
import {useTheme} from 'styled-components';

export default () => {
  const {currentPool} = useContext(PoolContext);
  const {theme: themeName} = useContext(ThemeContext);

  const {card, color, input} = useTheme();


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
    };
  }, [currentPool.chainId, currentPool.tokenAddress, themeName, width, card.background, color.blue, color.purple, input.background.primary]);

  return (
    <LiFiWidget config={widgetConfig} />
  );
};
