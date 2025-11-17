import React, { useContext, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';

import { TokenBalanceContext, PoolContext, WalletContext } from 'contexts';
import { useTokenMapPrices } from 'hooks';
import { TOKENS_ICONS } from 'constants';
import { formatNumber } from 'utils';
import Skeleton from 'components/Skeleton';
import BalanceDisplay from 'components/BalanceDisplay';
import { CONNECTORS_ICONS } from 'constants';
import { useHistory } from 'react-router-dom';

const PortfolioRow = ({ asset, icon, balance, price, tokenDecimals, isLoading }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const value = useMemo(() => {
    if (!balance || !price) return null;
    const balanceInToken = parseFloat(ethers.utils.formatUnits(balance, tokenDecimals));
    return balanceInToken * price;
  }, [balance, price, tokenDecimals]);

  const formattedBalance = balance ? formatNumber(balance, tokenDecimals, 2) : '0';
  const formattedPrice = price ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--';
  const formattedValue = value ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--';
  const onDepositClick = () => {
    history.push('/deposit');
  };
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
        <PlainDepositButton onClick={onDepositClick}>{t('buttonText.deposit')}</PlainDepositButton>
      </ValueCell>
    </TableRow>
  );
};

export default () => {
  const { t } = useTranslation();
  const { address: account, connector } = useContext(WalletContext);
  const { nativeBalance, balance: poolTokenBalance, isLoadingBalance } = useContext(TokenBalanceContext);
  const { currentPool } = useContext(PoolContext);
  const { priceMap, isLoading: isLoadingPrices } = useTokenMapPrices();

  const tlosPrice = priceMap?.get('TLOS') || null;
  const poolTokenPrice = priceMap?.get(currentPool?.tokenSymbol) || null;

  const isLoading = isLoadingBalance || isLoadingPrices;
  const hasData = account
  const isNative = currentPool.isNative;
  const tokenSymbol = `${isNative ? 'W' : ''}${currentPool?.tokenSymbol}`;

  if (!hasData) {
    return null;
  }

  return (
    <Container>
      <AddressRow>
        {connector && <SubtitleText> Connected via {connector.name} <WalletConnectorIcon src={CONNECTORS_ICONS[connector.name]} /> </SubtitleText>}
      </AddressRow>
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
          <PortfolioRow
            asset="TLOS"
            icon={TOKENS_ICONS['TLOS']}
            balance={nativeBalance}
            price={tlosPrice}
            tokenDecimals={18}
            isLoading={isLoading}
          />
          <PortfolioRow
            asset={tokenSymbol}
            icon={TOKENS_ICONS[tokenSymbol]}
            balance={poolTokenBalance}
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


const PlainDepositButton = styled.button`
  background: ${props => props.theme.color.telosGradientSoft};
  border: 1px solid ${props => props.theme.color.black};
  font-weight: ${props => props.theme.text.weight.bold};
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
  color: ${props => props.theme.text.color.black};
  box-shadow: ${props => props.theme.color.black} 2px 2px 0 0;
  cursor: pointer;
`;

const AddressRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
`;

const SubtitleText = styled.span`
  font-size: 14px;
  font-weight: ${props => props.theme.text.weight.normal};
  color: ${props => props.theme.text.color.primary};
`;

const WalletConnectorIcon = styled.img`
  width: 12px;
  height: 12px;
  margin-left: 4px;
`;
