import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ethers } from 'ethers';

import { TokenBalanceContext, ZkAccountContext, WalletContext, PoolContext } from 'contexts';

import Skeleton from 'components/Skeleton';
import BalanceDisplay from 'components/BalanceDisplay';
import Tooltip from 'components/Tooltip';

import { useTokenMapPrices } from 'hooks';
import { NETWORKS } from 'constants';

export default () => {
  const { address: account } = useContext(WalletContext)
  const { balances, nativeBalance } = useContext(TokenBalanceContext);
  const { balances: zkAccountBalances, isLoadingState, zkAccount } = useContext(ZkAccountContext);
  const { availablePools } = useContext(PoolContext);
  const { priceMap } = useTokenMapPrices();
  const { t } = useTranslation();

  const totalUsdValue = useMemo(() => {
    // Early return if priceMap is not ready
    if (!priceMap || priceMap.size === 0) return null;

    // Check if we have any balance data
    const hasBalanceData = balances && Object.keys(balances).length > 0;
    const hasZkBalanceData = zkAccountBalances && Object.keys(zkAccountBalances).length > 0;

    // If no data at all, return null (will show loading skeleton)
    if (!hasBalanceData && !hasZkBalanceData) return null;

    let totalUsd = 0;

    // Both public and shielded balances: only pools in active chain
    // This keeps the total consistent with what's shown in Public/Private Account tables
    availablePools.forEach(pool => {
      const poolAlias = pool.alias;
      const tokenPrice = priceMap.get(pool.tokenSymbol) || 0;

      // Public balance
      const publicBalance = (balances && balances[poolAlias]) || ethers.constants.Zero;
      const publicInToken = parseFloat(ethers.utils.formatUnits(publicBalance, pool.tokenDecimals));
      totalUsd += publicInToken * tokenPrice;

      // Shielded balance
      const privateBalance = (zkAccountBalances && zkAccountBalances[poolAlias]) || ethers.constants.Zero;
      const privateInToken = parseFloat(ethers.utils.formatUnits(privateBalance, pool.tokenDecimals));
      totalUsd += privateInToken * tokenPrice;
    });

    // Add native balance only if there are native pools in active chain
    if (nativeBalance && !nativeBalance.isZero()) {
      const hasNativePool = availablePools.some(p => p.isNative);
      if (hasNativePool) {
        const nativeSymbol = NETWORKS[availablePools[0]?.chainId]?.nativeSymbol || 'ETH';
        const nativePrice = priceMap.get(nativeSymbol) || 0;
        const nativeInToken = parseFloat(ethers.utils.formatUnits(nativeBalance, 18));
        const nativeUsdValue = nativeInToken * nativePrice;
        totalUsd += nativeUsdValue;
      }
    }

    return totalUsd.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [balances, zkAccountBalances, nativeBalance, priceMap, availablePools]);

  if (!account && !zkAccount) return null;

  return (
    <Container>
      <Label>Total asset value</Label>
      <ValueRow>
        {isLoadingState ? <Skeleton width={100} height={48} /> : (<>
          <Tooltip content={t('common.totalAssetBalance')} delay={0.3}>
            <span>
              <Value value={totalUsdValue} hiddenPlaceholder="••••••••" />
            </span>
          </Tooltip>
        </>)}
      </ValueRow>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-bottom: 8px;
`;

const Label = styled.span`
  font-size: 14px;
  font-weight: ${props => props.theme.text.weight.normal};
  color: ${props => props.theme.text.color.secondary};
`;

const ValueRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Value = styled(BalanceDisplay)`
  font-size: 48px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.primary};
  line-height: 1.2;
`;

