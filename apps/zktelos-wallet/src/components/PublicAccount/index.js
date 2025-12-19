import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ethers } from 'ethers';

import { RefreshCcwIcon } from 'lucide-react';
import Link from 'components/Link';
import AddressWithCopy from 'components/AdressWithCopy';
import OptionButtonDefault from 'components/OptionButton';
import PortfolioTable from 'components/PortfolioTable';
import { sortRowsByAsset } from 'components/PortfolioTable/formatters';

import { CONNECTORS_ICONS, TOKENS_ICONS, NETWORKS } from 'constants';
import { TokenBalanceContext, PoolContext, WalletContext, ModalContext } from 'contexts';
import { useTokenMapPrices } from 'hooks';

export default () => {
  const { t } = useTranslation();
  const { address: account, connector, disconnect } = useContext(WalletContext);
  const { nativeBalance, balances, isLoadingBalance } = useContext(TokenBalanceContext);
  const { setCurrentPool, availablePools, activeChainId } = useContext(PoolContext);
  const { priceMap, isLoading: isLoadingPrices } = useTokenMapPrices();
  const { openWalletModal, openWrapModal } = useContext(ModalContext);
  const history = useHistory();
  const location = useLocation();

  const nativeSymbol = NETWORKS[activeChainId]?.nativeSymbol || 'ETH';
  const nativePrice = priceMap?.get(nativeSymbol) || null;
  const isLoading = isLoadingBalance || isLoadingPrices;

  const handleChangeWallet = () => {
    openWalletModal();
  }

  const handleLogout = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  const goToDeposit = useCallback((tokenSymbol) => {
    const queryParams = new URLSearchParams(location.search);
    if (tokenSymbol) {
      queryParams.set('to', tokenSymbol);
    }
    const queryString = queryParams.toString();
    history.push(`/deposit${queryString ? `?${queryString}` : ''}`);
  }, [history, location]);

  const tableRows = useMemo(() => {
    const rows = [];

    // Show native balance only if there's a native pool in the active chain
    const hasNativePool = availablePools.some(p => p.isNative);
    if (hasNativePool && nativeBalance && !nativeBalance.isZero()) {
      rows.push({
        key: `${nativeSymbol}-native`,
        asset: nativeSymbol,
        icon: TOKENS_ICONS[nativeSymbol],
        balance: nativeBalance,
        price: nativePrice,
        tokenDecimals: 18,
        actions: [
          {
            id: 'deposit',
            label: t('deposit.title'),
            onClick: () => goToDeposit(nativeSymbol),
          },
        ],
      });
    }

    if (balances) {
      const poolRows = availablePools.map(pool => {
        const poolAlias = pool.alias;
        const balance = balances[poolAlias] || ethers.constants.Zero;
        const tokenPrice = priceMap?.get(pool.tokenSymbol) || null;
        const isNative = pool.isNative;
        const tokenSymbol = `${isNative ? 'W' : ''}${pool.tokenSymbol}`;
        const unwrapDisabled = !balance || balance.isZero();

        return {
          key: poolAlias,
          asset: tokenSymbol,
          icon: TOKENS_ICONS[tokenSymbol],
          balance,
          price: tokenPrice,
          tokenDecimals: pool.tokenDecimals || 18,
          actions: [
            {
              id: 'deposit',
              label: t('deposit.title'),
              onClick: () => {
                setCurrentPool(poolAlias);
                goToDeposit(tokenSymbol);
              },
            },
            isNative ? {
              id: 'unwrap',
              label: t('buttonText.unwrap'),
              onClick: () => {
                setCurrentPool(poolAlias);
                openWrapModal('unwrap');
              },
              disabled: unwrapDisabled,
            } : { id: 'unwrap-disabled', hidden: true },
          ],
        };
      });

      rows.push(...poolRows);
    }

    return sortRowsByAsset(rows);
  }, [balances, priceMap, nativeBalance, nativePrice, nativeSymbol, t, setCurrentPool, goToDeposit, openWrapModal, availablePools]);

  const hasAnyBalance = useMemo(() => {
    return tableRows.some(row => row.balance && row.balance.gt(0));
  }, [tableRows]);

  return (
    <Container>
      <HeaderContainer>
        {connector && <WalletConnectorIcon src={CONNECTORS_ICONS[connector.name]} />}
        <HeaderContent>
          <HeaderTitle>
            <AccountName>{connector?.name}</AccountName>
            <OptionButton onClick={handleLogout}>
              {t('buttonText.logout')}
            </OptionButton>
          </HeaderTitle>
          <AddressWithCopy
            prefixIcon={<RefreshCcwIcon width={16} height={16} />}
            onPrefixClick={handleChangeWallet}
            formatType="0x"
            $noBorder
            $fontSize="14px"
            $height="auto"
            $borderRadius="0"
            $maxWidth="250px"
            $padding="0"
            $background="transparent"
          >
            {account}
          </AddressWithCopy>
        </HeaderContent>
      </HeaderContainer>
      {hasAnyBalance ?
        (
          <PortfolioTable rows={tableRows} isLoading={isLoading} />
        ) : (
          <EmptyState>
            <EmptyStateTitle>{t('common.emptyState.title')}</EmptyStateTitle>
            <EmptyStateDescription>{t('common.emptyState.fundEvm')}</EmptyStateDescription>
            < Link type="link" href="https://www.telos.net/buy" target="_blank" noreferrer small>
              {t('common.emptyState.buy')}
            </Link>
          </EmptyState>
        )}
    </Container>
  );
};


const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const WalletConnectorIcon = styled.img`
  width: 46px;
  height: 46px;
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

const OptionButton = styled(OptionButtonDefault)`
  padding: 6px;
  margin: 0;
  height: auto;
  font-size: 14px;
  width: auto;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${props => props.theme.modal.background};
  padding: 8px;
  gap: 8px;
`;

const EmptyStateTitle = styled.span`
  font-size: 16px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.primary};
`;

const EmptyStateDescription = styled.span`
  font-size: 14px;
  color: ${props => props.theme.text.color.secondary};
`;
