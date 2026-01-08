import React, { useContext } from 'react';
import { LiFiWidget } from '@lifi/widget';
import { useTheme } from '@mui/material/styles';

import { PoolContext } from 'contexts';
import { useWindowDimensions } from 'hooks';

export default () => {
  const { currentPool } = useContext(PoolContext);
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const widgetConfig = {
    integrator: 'zkTelos',
    fee: 0.00075,
    variant: 'compact',
    appearance: theme.palette.mode,
    disableAppearance: true,
    containerStyle: {
      width: width > 500 ? 480 : '100%',
      maxWidth: width > 500 ? 480 : '100%',
    },
    theme: {
      typography: {
        fontFamily: 'Gilroy'
      },
      palette: {
        primary: { main: '#1B4DEB' },
        secondary: { main: '#754CFF' },
      },
      components: {
        MuiAvatar: {
          defaultProps: {
            imgProps: { crossOrigin: 'anonymous' },
          },
        },
      },
    },
    fromChain: 1,
    // fromToken: '0x8D97Cea50351Fb4329d591682b148D43a0C3611b', // USDC Telos
    fromToken: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT Ethereum
    toChain: currentPool.chainId,
    toToken: currentPool.tokenAddress,
    disableTelemetry: true,
  };

  return (
    <LiFiWidget config={widgetConfig} />
  );
};
