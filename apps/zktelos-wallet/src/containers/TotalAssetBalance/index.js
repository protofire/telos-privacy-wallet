import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ethers } from 'ethers';

import { TokenBalanceContext, ZkAccountContext, WalletContext } from 'contexts';

import Skeleton from 'components/Skeleton';
import BalanceDisplay from 'components/BalanceDisplay';
import Tooltip from 'components/Tooltip';

import { useTokenMapPrices } from 'hooks';
import config from 'config';

export default () => {
  const { address: account } = useContext(WalletContext)
  const { balances, nativeBalance } = useContext(TokenBalanceContext);
  const { balances: zkAccountBalances, isLoadingState, zkAccount } = useContext(ZkAccountContext);
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

    // Iterate over all pools and sum their USD values
    Object.keys(config.pools).forEach(poolAlias => {
      const pool = config.pools[poolAlias];
      const publicBalance = (balances && balances[poolAlias]) || ethers.constants.Zero;
      const privateBalance = (zkAccountBalances && zkAccountBalances[poolAlias]) || ethers.constants.Zero;

      const tokenPrice = priceMap.get(pool.tokenSymbol) || 0;

      const publicInToken = parseFloat(ethers.utils.formatUnits(publicBalance, pool.tokenDecimals));
      const privateInToken = parseFloat(ethers.utils.formatUnits(privateBalance, pool.tokenDecimals));
      const totalInToken = publicInToken + privateInToken;
      const usdValue = totalInToken * tokenPrice;

      totalUsd += usdValue;
    });

    // Add native TLOS balance (only once, not per pool)
    if (nativeBalance && !nativeBalance.isZero()) {
      const tlosPrice = priceMap.get('TLOS') || 0;
      const nativeInToken = parseFloat(ethers.utils.formatUnits(nativeBalance, 18));
      const nativeUsdValue = nativeInToken * tlosPrice;

      totalUsd += nativeUsdValue;
    }

    return totalUsd.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [balances, zkAccountBalances, nativeBalance, priceMap]);

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
      <Separator />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
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

const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${props => props.theme.color.grey || '#E5E5E5'};
  margin-top: 8px;
`;
