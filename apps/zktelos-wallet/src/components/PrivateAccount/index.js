import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';

import { ReactComponent as RenewSVGIcon } from 'assets/renew.svg';
import { ReactComponent as SpinnerIcon } from 'assets/spinner.svg';
import { ZkAccountContext, PoolContext } from 'contexts';
import { useTokenMapPrices } from 'hooks';
import { TOKENS_ICONS } from 'constants';
import { formatNumber } from 'utils';

import { ZkAvatar, ZkName } from 'components/ZkAccountIdentifier';
import AddressWithCopy from 'components/AdressWithCopy';
import Skeleton from 'components/Skeleton';
import BalanceDisplay from 'components/BalanceDisplay';

const PrivatePortfolioRow = ({ asset, icon, balance, price, tokenDecimals, isLoading }) => {
  const value = useMemo(() => {
    if (!balance || !price) return null;
    const balanceInToken = parseFloat(ethers.utils.formatUnits(balance, tokenDecimals));
    return balanceInToken * price;
  }, [balance, price, tokenDecimals]);

  const formattedBalance = balance ? formatNumber(balance, tokenDecimals, 2) : '0';
  const formattedPrice = price ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--';
  const formattedValue = value ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--';

  if (!balance || balance.isZero()) {
    return null;
  }

  return (
    <TableRow>
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
      <ValueCell>
        <TBDText>TBD</TBDText>
      </ValueCell>
    </TableRow>
  );
};

export default () => {
  const { t } = useTranslation();
  const { currentPool } = useContext(PoolContext);
  const { priceMap, isLoading: isLoadingPrices } = useTokenMapPrices();

  const {
    zkAccount,
    balance: poolBalance,
    isLoadingState: isLoadingBalance,
    generateAddress,
  } = useContext(ZkAccountContext);
  const [shieldedAddress, setShieldedAddress] = useState('');

  const isLoading = isLoadingBalance || isLoadingPrices;
  const poolTokenPrice = priceMap?.get(currentPool?.tokenSymbol) || null;
  // For private account, we currently only show the pool token
  const tokenSymbol = currentPool?.tokenSymbol;

  const generateAndStoreAddress = useCallback(async () => {
    const address = await generateAddress();
    setShieldedAddress(address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generateAddress, currentPool]);

  const getRefreshIcon = () => {
    if (isLoadingBalance) {
      return <SpinnerIcon width={18} height={18} />;
    }
    return <RenewIcon width={18} height={18} />;
  }

  useEffect(() => {
    if (!zkAccount) return;
    generateAndStoreAddress();
  }, [zkAccount, generateAndStoreAddress]);

  if (!zkAccount) return null;

  return (
    <Container>
      <HeaderContainer>
        <ZkAvatar seed={zkAccount} size={46} />
        <HeaderContent>
          <HeaderTitle>
            <AccountName>
              <ZkName seed={zkAccount} />
            </AccountName>
          </HeaderTitle>
          {shieldedAddress ? (
            <AddressWithCopy
              prefixIcon={getRefreshIcon()}
              onPrefixClick={generateAndStoreAddress}
              $noBorder
              $fontSize="14px"
              $height="auto"
              $borderRadius="0"
              $maxWidth="300px"
              $padding="0"
              $background="transparent"
            >
              {shieldedAddress}
            </AddressWithCopy>
          ) : (
            <ShieldedAddress>{t('common.generatingAddress')}</ShieldedAddress>
          )}
        </HeaderContent>
      </HeaderContainer>

      <Table>
        <colgroup>
          <Col style={{ width: '25%' }} />
          <Col style={{ width: '18%' }} />
          <Col style={{ width: '18%' }} />
          <Col style={{ width: '18%' }} />
          <Col style={{ width: '21%' }} />
        </colgroup>
        <thead>
          <HeaderRow>
            <AssetHeader scope="col">{t('portfolio.asset')}</AssetHeader>
            <PriceHeader scope="col">{t('portfolio.price')}</PriceHeader>
            <BalanceHeader scope="col">{t('portfolio.balance')}</BalanceHeader>
            <ValueHeader scope="col">{t('portfolio.value')}</ValueHeader>
            <ActionHeader scope="col"></ActionHeader>
          </HeaderRow>
        </thead>
        <tbody>
          <PrivatePortfolioRow
            asset={tokenSymbol}
            icon={TOKENS_ICONS[tokenSymbol]}
            balance={poolBalance}
            price={poolTokenPrice}
            tokenDecimals={currentPool?.tokenDecimals || 18}
            isLoading={isLoading}
          />
        </tbody>
      </Table>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const RenewIcon = styled(RenewSVGIcon)`
  cursor: pointer;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
`;

const HeaderTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const AccountName = styled.span`
  font-size: 16px;
  color: ${props => props.theme.text.color.primary};
`;

const ShieldedAddress = styled.span`
  font-size: 14px;
  color: ${props => props.theme.color.black};
  line-height: 16px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Col = styled.col``;

const HeaderRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.color.grey || '#E5E5E5'};
`;

const AssetHeader = styled.th`
  font-size: 12px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.primary};
  text-transform: uppercase;
  text-align: left;
  padding: 8px 8px 8px 0;
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

const ActionHeader = styled(AssetHeader)`
  text-align: right;
`;

const TableRow = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.color.grey || '#E5E5E5'};
  }
`;

const AssetCell = styled.td`
  padding: 8px 12px;
  vertical-align: middle;
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
  position: relative;
  bottom: 5px;
  margin-left: 8px;
`;

const PriceCell = styled.td`
  font-size: 14px;
  color: ${props => props.theme.text.color.primary};
  text-align: center;
  padding: 8px 12px;
  vertical-align: middle;
`;

const BalanceCell = styled.td`
  font-size: 14px;
  color: ${props => props.theme.text.color.primary};
  text-align: center;
  padding: 8px 12px;
  vertical-align: middle;
`;

const ValueCell = styled.td`
  font-size: 14px;
  color: ${props => props.theme.text.color.primary};
  text-align: right;
  font-weight: ${props => props.theme.text.weight.normal};
  padding: 8px 12px;
  vertical-align: middle;
`;

const TBDText = styled.span`
  font-size: 14px;
  color: ${props => props.theme.text.color.secondary};
  font-weight: ${props => props.theme.text.weight.bold};
`;
