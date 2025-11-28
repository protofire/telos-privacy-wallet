import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { ethers } from 'ethers';

import { ReactComponent as RenewSVGIcon } from 'assets/renew.svg';
import { ReactComponent as SpinnerIcon } from 'assets/spinner.svg';
import { ZkAccountContext, PoolContext } from 'contexts';
import { useTokenMapPrices } from 'hooks';
import { TOKENS_ICONS } from 'constants';
import config from 'config';

import { ZkAvatar, ZkName } from 'components/ZkAccountIdentifier';
import AddressWithCopy from 'components/AdressWithCopy';
import PortfolioTable from 'components/PortfolioTable';
import { sortRowsByAsset } from 'components/PortfolioTable/formatters';

export default () => {
  const { t } = useTranslation();
  const { priceMap, isLoading: isLoadingPrices } = useTokenMapPrices();
  const history = useHistory();
  const location = useLocation();
  const { setCurrentPool } = useContext(PoolContext);

  const {
    zkAccount,
    balances,
    zkClients,
    isLoadingState: isLoadingBalance,
  } = useContext(ZkAccountContext);
  const [shieldedAddresses, setShieldedAddresses] = useState({});

  const isLoading = isLoadingBalance || isLoadingPrices;

  const handleWithdraw = useCallback((poolAlias) => {
    setCurrentPool(poolAlias);
    history.push('/withdraw' + location.search);
  }, [history, location, setCurrentPool]);

  const handleTransfer = useCallback((poolAlias) => {
    setCurrentPool(poolAlias);
    history.push('/transfer' + location.search);
  }, [history, location, setCurrentPool]);

  const tableRows = useMemo(() => {
    if (!balances) return [];

    const rows = Object.keys(config.pools).map(poolAlias => {
      const pool = config.pools[poolAlias];
      const balance = balances[poolAlias] || ethers.constants.Zero;
      const tokenPrice = priceMap?.get(pool.tokenSymbol) || null;
      const tokenSymbol = pool.tokenSymbol;

      return {
        key: poolAlias,
        asset: tokenSymbol,
        icon: TOKENS_ICONS[tokenSymbol],
        balance,
        price: tokenPrice,
        tokenDecimals: pool.tokenDecimals || 18,
        actions: [
          {
            id: 'withdraw',
            label: t('withdraw.title') + ' ' + t('withdraw.suffix'),
            onClick: () => handleWithdraw(poolAlias),
          },
          {
            id: 'transfer',
            label: t('transfer.menuTitle'),
            onClick: () => handleTransfer(poolAlias),
          },
        ],
      };
    });

    return sortRowsByAsset(rows);
  }, [balances, priceMap, t, handleWithdraw, handleTransfer]);

  const hasAnyBalance = useMemo(() => {
    return tableRows.some(row => row.balance && row.balance.gt(0));
  }, [tableRows]);

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
        <PortfolioTable rows={tableRows} isLoading={isLoading} />
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
