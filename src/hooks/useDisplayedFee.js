import { useMemo } from 'react';
import { ethers } from 'ethers';

import useTokenPrices from './useTokenPrices';
import { formatNumber } from 'utils';

export default (currentPool, fee) => {
  const { priceMap } = useTokenPrices();

  return useMemo(() => {
    let displayedFee = `${formatNumber(fee, currentPool.tokenDecimals)} ${currentPool.tokenSymbol}`;
    if (currentPool.isNative && priceMap) {
      const tokenPrice = priceMap.get(currentPool.tokenSymbol);
      if (tokenPrice) {
        const price = ethers.utils.parseEther(tokenPrice.toString());
        displayedFee += ` ($${formatNumber(fee.mul(price).div(ethers.constants.WeiPerEther), currentPool.tokenDecimals)})`;
      }
    }
    return displayedFee;
  }, [fee, priceMap, currentPool]);
};
