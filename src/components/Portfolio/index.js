import React, { useContext, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';

import { TokenBalanceContext, ZkAccountContext, PoolContext, WalletContext } from 'contexts';
import { useTokenMapPrices } from 'hooks';
import { TOKENS_ICONS } from 'constants';
import { formatNumber } from 'utils';
import Skeleton from 'components/Skeleton';
import BalanceDisplay from 'components/BalanceDisplay';

const PortfolioRow = ({ asset, icon, balance, price, tokenDecimals, isLoading }) => {
  const value = useMemo(() => {
    if (!balance || !price) return null;
    const balanceInToken = parseFloat(ethers.utils.formatUnits(balance, tokenDecimals));
    return balanceInToken * price;
  }, [balance, price, tokenDecimals]);

  const formattedBalance = balance ? formatNumber(balance, tokenDecimals, 2) : '0';
  const formattedPrice = price ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--';
  const formattedValue = value ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--';

  return (
    <Row>
      <AssetCell>
        <TokenIcon src={icon} />
        <AssetName>{asset}</AssetName>
      </AssetCell>
      <PriceCell>{isLoading ? <Skeleton width={50} height={16} /> : formattedPrice}</PriceCell>
      <BalanceCell>
        {isLoading ? (
          <Skeleton width={60} height={16} />
        ) : (
          <BalanceDisplay value={formattedBalance} hiddenPlaceholder="••••••" />
        )}
      </BalanceCell>
      <ValueCell>
        {isLoading ? (
          <Skeleton width={70} height={16} />
        ) : (
          <BalanceDisplay value={formattedValue} hiddenPlaceholder="••••••" />
        )}
      </ValueCell>
    </Row>
  );
};

export default () => {
  const { t } = useTranslation();
  const { address: account } = useContext(WalletContext);
  const { nativeBalance, balance: publicTokenBalance, isLoadingBalance } = useContext(TokenBalanceContext);
  const { balance: zkAccountBalance, isLoadingState, zkAccount } = useContext(ZkAccountContext);
  const { currentPool } = useContext(PoolContext);
  const { priceMap, isLoading: isLoadingPrices } = useTokenMapPrices();

  const tlosPrice = priceMap?.get('TLOS') || null;
  const poolTokenPrice = priceMap?.get(currentPool?.tokenSymbol) || null;

  const totalPusdBalance = useMemo(() => {
    if (!publicTokenBalance && !zkAccountBalance) return ethers.constants.Zero;
    const publicBal = publicTokenBalance || ethers.constants.Zero;
    const privateBal = zkAccountBalance || ethers.constants.Zero;
    return publicBal.add(privateBal);
  }, [publicTokenBalance, zkAccountBalance]);

  const isLoading = isLoadingBalance || isLoadingState || isLoadingPrices;
  const hasData = account || zkAccount;

  if (!hasData) {
    return null;
  }

  return (
    <Container>
      <Table>
        <HeaderRow>
          <AssetHeader>{t('portfolio.asset')}</AssetHeader>
          <PriceHeader>{t('portfolio.price')}</PriceHeader>
          <BalanceHeader>{t('portfolio.balance')}</BalanceHeader>
          <ValueHeader>{t('portfolio.value')}</ValueHeader>
        </HeaderRow>
        <PortfolioRow
          asset="TLOS"
          icon={TOKENS_ICONS['TLOS']}
          balance={nativeBalance}
          price={tlosPrice}
          tokenDecimals={18}
          isLoading={isLoading}
        />
        <PortfolioRow
          asset={currentPool?.tokenSymbol}
          icon={TOKENS_ICONS[currentPool?.tokenSymbol]}
          balance={totalPusdBalance}
          price={poolTokenPrice}
          tokenDecimals={currentPool?.tokenDecimals || 18}
          isLoading={isLoading}
        />
      </Table>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid ${props => props.theme.color.grey || '#E5E5E5'};
  margin-bottom: 8px;
`;

const AssetHeader = styled.span`
  font-size: 12px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.primary};
  text-transform: uppercase;
  text-align: left;
`;

const PriceHeader = styled(AssetHeader)`
  text-align: center;
`;

const BalanceHeader = styled(AssetHeader)`
  text-align: center;
`;

const ValueHeader = styled(AssetHeader)`
  text-align: right;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 8px 0;
  align-items: center;
`;

const AssetCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TokenIcon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

const AssetName = styled.span`
  font-size: 14px;
  font-weight: ${props => props.theme.text.weight.normal};
  color: ${props => props.theme.text.color.primary};
  text-transform: uppercase;
`;

const PriceCell = styled.div`
  font-size: 14px;
  color: ${props => props.theme.text.color.primary};
  text-align: center;
`;

const BalanceCell = styled.div`
  font-size: 14px;
  color: ${props => props.theme.text.color.primary};
  text-align: center;
`;

const ValueCell = styled.div`
  font-size: 14px;
  color: ${props => props.theme.text.color.primary};
  text-align: right;
  font-weight: ${props => props.theme.text.weight.normal};
`;

