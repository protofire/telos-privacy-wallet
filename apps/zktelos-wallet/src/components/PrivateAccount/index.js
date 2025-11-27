import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { ethers } from 'ethers';

import { ReactComponent as RenewSVGIcon } from 'assets/renew.svg';
import { ReactComponent as SpinnerIcon } from 'assets/spinner.svg';
import { ReactComponent as DotsIconDefault } from 'assets/dots.svg';
import { ZkAccountContext, PoolContext, BalanceVisibilityContext } from 'contexts';
import { useTokenMapPrices } from 'hooks';
import { TOKENS_ICONS } from 'constants';
import { formatNumber } from 'utils';
import config from 'config';

import { ZkAvatar, ZkName } from 'components/ZkAccountIdentifier';
import AddressWithCopy from 'components/AdressWithCopy';
import Skeleton from 'components/Skeleton';
import BalanceDisplay from 'components/BalanceDisplay';
import Tooltip from 'components/Tooltip';
import Dropdown from 'components/Dropdown';
import OptionButtonDefault from 'components/OptionButton';

const PrivatePortfolioRow = ({ poolAlias, asset, icon, balance, price, tokenDecimals, isLoading }) => {
  const { isVisible } = useContext(BalanceVisibilityContext);
  const { setCurrentPool } = useContext(PoolContext);
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);

  const value = useMemo(() => {
    if (!balance || !price) return null;
    const balanceInToken = parseFloat(ethers.utils.formatUnits(balance, tokenDecimals));
    return balanceInToken * price;
  }, [balance, price, tokenDecimals]);

  const formattedBalance = balance ? formatNumber(balance, tokenDecimals, 2) : '0';
  const formattedPrice = price ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--';

  const formattedValue = useMemo(() => {
    if (value == null) return '--';
    if (value < 0.01 && value > 0) return '< $0.01';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [value]);

  const fullValue = value ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : '--';


  const handleWithdraw = useCallback(() => {
    setIsActionDropdownOpen(false);
    setCurrentPool(poolAlias);
    history.push('/withdraw' + location.search);
  }, [history, location, setCurrentPool, poolAlias]);

  const handleTransfer = useCallback(() => {
    setIsActionDropdownOpen(false);
    setCurrentPool(poolAlias);
    history.push('/transfer' + location.search);
  }, [history, location, setCurrentPool, poolAlias]);

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
          isVisible ? (
            <Tooltip content={fullValue} placement="top" delay={0} trigger={['hover']}>
              <span>
                <BalanceDisplay value={formattedValue} hiddenPlaceholder="••••••" />
              </span>
            </Tooltip>
          ) : (
            <span>
              <BalanceDisplay value={formattedValue} hiddenPlaceholder="••••••" />
            </span>
          )
        )}
      </ValueCell>
      <ValueCell style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Dropdown
          width={180}
          style={{ padding: '12px' }}
          isOpen={isActionDropdownOpen}
          open={() => setIsActionDropdownOpen(true)}
          close={() => setIsActionDropdownOpen(false)}
          fullscreen={false}
          placement="bottomRight"
          content={() => (
            <ActionDropdownContainer>
              <OptionButton onClick={handleWithdraw}>
                {t('withdraw.title')} {t('withdraw.suffix')}
              </OptionButton>
              <OptionButton onClick={handleTransfer}>
                {t('transfer.menuTitle')}
              </OptionButton>
            </ActionDropdownContainer>
          )}
        >
          <ActionButton>
            <DotsIcon />
          </ActionButton>
        </Dropdown>
      </ValueCell>
    </TableRow>
  );
};

export default () => {
  const { t } = useTranslation();
  const { priceMap, isLoading: isLoadingPrices } = useTokenMapPrices();

  const {
    zkAccount,
    balances,
    zkClients,
    isLoadingState: isLoadingBalance,
  } = useContext(ZkAccountContext);
  const [shieldedAddresses, setShieldedAddresses] = useState({});

  const isLoading = isLoadingBalance || isLoadingPrices;

  // Generate token rows for all pools (only base tokens, no wrapped)
  const poolTokenRows = useMemo(() => {
    if (!balances) return [];

    const rows = Object.keys(config.pools).map(poolAlias => {
      const pool = config.pools[poolAlias];
      const balance = balances[poolAlias] || ethers.constants.Zero;
      const tokenPrice = priceMap?.get(pool.tokenSymbol) || null;
      // For private account, show base token (PUSD, TLOS) not wrapped (WTLOS)
      const tokenSymbol = pool.tokenSymbol;

      return {
        poolAlias,
        asset: tokenSymbol,
        icon: TOKENS_ICONS[tokenSymbol],
        balance,
        price: tokenPrice,
        tokenDecimals: pool.tokenDecimals || 18,
      };
    });

    return rows;
  }, [balances, priceMap]);

  // Check if there's any balance to show the table
  const hasAnyBalance = useMemo(() => {
    const hasBalance = poolTokenRows.some(row => row.balance && row.balance.gt(0));
    return hasBalance;
  }, [poolTokenRows]);

  // Generate addresses for all pools
  const generateAndStoreAddresses = useCallback(async () => {
    if (!zkAccount || !zkClients) return;

    const poolAliases = Object.keys(config.pools);
    const addressPromises = poolAliases.map(async (poolAlias) => {
      const client = zkClients[poolAlias];
      if (!client) return { poolAlias, address: null };

      try {
        const address = await client.generateAddress();
        return { poolAlias, address };
      } catch (error) {
        console.error(`Error generating address for pool ${poolAlias}:`, error);
        return { poolAlias, address: null };
      }
    });

    const results = await Promise.all(addressPromises);
    const addressesMap = {};
    results.forEach(({ poolAlias, address }) => {
      if (address) addressesMap[poolAlias] = address;
    });

    setShieldedAddresses(addressesMap);
  }, [zkAccount, zkClients]);

  const getRefreshIcon = () => {
    if (isLoadingBalance) {
      return <SpinnerIcon width={18} height={18} />;
    }
    return <RenewIcon width={18} height={18} />;
  }

  useEffect(() => {
    if (!zkAccount) return;
    generateAndStoreAddresses();
  }, [zkAccount, generateAndStoreAddresses]);

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
          <AddressesContainer>
            {Object.keys(config.pools).map(poolAlias => {
              const pool = config.pools[poolAlias];
              const address = shieldedAddresses[poolAlias];
              const tokenSymbol = pool.tokenSymbol;

              return (
                <AddressRow key={poolAlias}>
                  <TokenLabel>{tokenSymbol}:</TokenLabel>
                  {address ? (
                    <AddressWithCopy
                      prefixIcon={getRefreshIcon()}
                      onPrefixClick={generateAndStoreAddresses}
                      $noBorder
                      $fontSize="13px"
                      $height="auto"
                      $borderRadius="0"
                      $maxWidth="210px"
                      $padding="0"
                      $background="transparent"
                    >
                      {address}
                    </AddressWithCopy>
                  ) : (
                    <ShieldedAddress>{t('common.generatingAddress')}</ShieldedAddress>
                  )}
                </AddressRow>
              );
            })}
          </AddressesContainer>
        </HeaderContent>
      </HeaderContainer>

      {hasAnyBalance && (
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
            {/* All Pool Tokens (PUSD, TLOS) - no wrapped tokens */}
            {poolTokenRows.map(tokenData => (
              <PrivatePortfolioRow
                key={tokenData.poolAlias}
                poolAlias={tokenData.poolAlias}
                asset={tokenData.asset}
                icon={tokenData.icon}
                balance={tokenData.balance}
                price={tokenData.price}
                tokenDecimals={tokenData.tokenDecimals}
                isLoading={isLoading}
              />
            ))}
          </tbody>
        </Table>
      )}
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

const AddressesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const AddressRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const TokenLabel = styled.span`
  font-size: 13px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.secondary};
  text-transform: uppercase;
  min-width: 50px;
`;

const ShieldedAddress = styled.span`
  font-size: 13px;
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

const ActionButton = styled.button`
  background: ${props => props.theme.color.telosGradientSoft};
  border: 1px solid ${props => props.theme.color.black};
  font-weight: ${props => props.theme.text.weight.bold};
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
  color: ${props => props.theme.text.color.black};
  box-shadow: ${props => props.theme.color.black} 2px 2px 0 0;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const DotsIcon = styled(DotsIconDefault)`
  width: 16px;
  height: 16px;
`;

const ActionDropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  & > :last-child {
    margin-bottom: 0;
  }
`;

const OptionButton = styled(OptionButtonDefault)`
  height: 48px;
  padding: 0 16px;
  margin-bottom: 0;
`;
