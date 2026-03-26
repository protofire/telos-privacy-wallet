import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { ethers } from 'ethers';

import { RefreshCcwIcon, ShieldCheckIcon, EyeOffIcon, ZapIcon, DownloadIcon, InboxIcon } from 'lucide-react'
import { ZkAccountContext, PoolContext, ModalContext } from 'contexts';
import { useTokenMapPrices } from 'hooks';
import { TOKENS_ICONS } from 'constants';

import { ZkAvatar, ZkName } from 'components/ZkAccountIdentifier';
import AddressWithCopy from 'components/AdressWithCopy';
import PortfolioTable from 'components/PortfolioTable';
import { sortRowsByAsset } from 'components/PortfolioTable/formatters';
import Button from 'components/Button';

export default () => {
  const { t } = useTranslation();
  const { priceMap, isLoading: isLoadingPrices } = useTokenMapPrices();
  const history = useHistory();
  const location = useLocation();
  const { setCurrentPool, availablePools } = useContext(PoolContext);
  const { openCreateAccountModal } = useContext(ModalContext);

  const {
    zkAccount,
    balances,
    zkClients,
    isLoadingState: isLoadingBalance,
  } = useContext(ZkAccountContext);
  const [shieldedAddresses, setShieldedAddresses] = useState({});

  const isLoading = isLoadingBalance || isLoadingPrices;

  const handleWithdraw = useCallback((poolAlias) => {
    const pool = availablePools.find(p => p.alias === poolAlias);
    const tokenSymbol = pool?.tokenSymbol;
    const queryParams = new URLSearchParams(location.search);
    if (tokenSymbol) {
      queryParams.set('to', tokenSymbol);
    }
    setCurrentPool(poolAlias);
    const queryString = queryParams.toString();
    history.push(`/withdraw${queryString ? `?${queryString}` : ''}`);
  }, [history, location, setCurrentPool, availablePools]);

  const handleTransfer = useCallback((poolAlias) => {
    const pool = availablePools.find(p => p.alias === poolAlias);
    const tokenSymbol = pool?.tokenSymbol;
    const queryParams = new URLSearchParams(location.search);
    if (tokenSymbol) {
      queryParams.set('to', tokenSymbol);
    }
    setCurrentPool(poolAlias);
    const queryString = queryParams.toString();
    history.push(`/transfer${queryString ? `?${queryString}` : ''}`);
  }, [history, location, setCurrentPool, availablePools]);

  const tableRows = useMemo(() => {
    if (!balances) return [];

    const rows = availablePools.map(pool => {
      const poolAlias = pool.alias;
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
            label: t('withdraw.title'),
            onClick: () => handleWithdraw(poolAlias),
          },
          {
            id: 'transfer',
            label: t('transfer.title'),
            onClick: () => handleTransfer(poolAlias),
          },
        ],
      };
    });

    return sortRowsByAsset(rows);
  }, [balances, priceMap, t, handleWithdraw, handleTransfer, availablePools]);

  const hasAnyBalance = useMemo(() => {
    return tableRows.some(row => row.balance && row.balance.gt(0));
  }, [tableRows]);

  // Generate addresses for pools in active chain
  const generateAndStoreAddresses = useCallback(async () => {
    if (!zkAccount || !zkClients) return;

    const addressPromises = availablePools.map(async (pool) => {
      const poolAlias = pool.alias;
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
  }, [zkAccount, zkClients, availablePools]);

  useEffect(() => {
    if (!zkAccount) return;
    generateAndStoreAddresses();
  }, [zkAccount, generateAndStoreAddresses]);

  if (!zkAccount) {
    return (
      <LandingContainer>
        <LandingHero>
          <LandingHeadline>{t('home.landing.headline')}</LandingHeadline>
          <LandingSubtitle>{t('home.landing.subtitle')}</LandingSubtitle>
        </LandingHero>

        <FeatureList>
          <FeatureItem>
            <FeatureIconWrapper><ShieldCheckIcon size={18} /></FeatureIconWrapper>
            <FeatureText>
              <FeatureTitle>{t('home.landing.feature1Title')}</FeatureTitle>
              <FeatureDesc>{t('home.landing.feature1Desc')}</FeatureDesc>
            </FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIconWrapper><EyeOffIcon size={18} /></FeatureIconWrapper>
            <FeatureText>
              <FeatureTitle>{t('home.landing.feature2Title')}</FeatureTitle>
              <FeatureDesc>{t('home.landing.feature2Desc')}</FeatureDesc>
            </FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIconWrapper><ZapIcon size={18} /></FeatureIconWrapper>
            <FeatureText>
              <FeatureTitle>{t('home.landing.feature3Title')}</FeatureTitle>
              <FeatureDesc>{t('home.landing.feature3Desc')}</FeatureDesc>
            </FeatureText>
          </FeatureItem>
        </FeatureList>

        <LandingCTA>
          <Button onClick={openCreateAccountModal}>
            {t('common.createPrivateAccount')}
          </Button>
        </LandingCTA>
      </LandingContainer>
    );
  };

  const addressRows = (
    availablePools.map(pool => {
      const address = shieldedAddresses[pool.alias];
      return (
        <AddressRow key={pool.alias}>
          <TokenLabel>{pool.tokenSymbol}:</TokenLabel>
          <AddressWrapper>
            {address ? (
              <AddressWithCopy
                prefixIcon={<RefreshCcwIcon width={16} height={16} />}
                onPrefixClick={generateAndStoreAddresses}
                formatType="full"
                $noBorder
                $fontSize="13px"
                $height="auto"
                $borderRadius="0"
                $maxWidth="100%"
                $padding="0"
                $background="transparent"
              >
                {address}
              </AddressWithCopy>
            ) : (
              <ShieldedAddress>{t('common.generatingAddress')}</ShieldedAddress>
            )}
          </AddressWrapper>
        </AddressRow>
      );
    })
  );

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
        </HeaderContent>
      </HeaderContainer>

      {hasAnyBalance ? (
        <>
          <PortfolioTable rows={tableRows} isLoading={isLoading} />
          <ReceiveSection>
            <ReceiveSectionHeader>
              <InboxIcon size={15} />
              <ReceiveSectionTitle>{t('common.emptyState.receiveTitle')}</ReceiveSectionTitle>
            </ReceiveSectionHeader>
            <ReceiveSectionDesc>{t('common.emptyState.receiveDesc')}</ReceiveSectionDesc>
            <AddressesContainer>{addressRows}</AddressesContainer>
          </ReceiveSection>
        </>
      ) : (
        <EmptyStateGrid>
          <EmptyCard>
            <EmptyCardIconWrapper><DownloadIcon size={20} /></EmptyCardIconWrapper>
            <EmptyCardTitle>{t('common.emptyState.depositTitle')}</EmptyCardTitle>
            <EmptyCardDesc>{t('common.emptyState.depositDesc')}</EmptyCardDesc>
            <Button onClick={() => history.push('/deposit')} small>
              {t('buttonText.deposit')}
            </Button>
          </EmptyCard>
          <EmptyCard>
            <EmptyCardIconWrapper><InboxIcon size={20} /></EmptyCardIconWrapper>
            <EmptyCardTitle>{t('common.emptyState.receiveTitle')}</EmptyCardTitle>
            <EmptyCardDesc>{t('common.emptyState.receiveDesc')}</EmptyCardDesc>
            <AddressesContainer>{addressRows}</AddressesContainer>
          </EmptyCard>
        </EmptyStateGrid>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
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
  width: 100%;
`;

const AddressWrapper = styled.div`
  flex: 1;
  min-width: 0;
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

/* ── Empty state — two-card grid ─────────────────────────────────────────── */

const EmptyStateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media only screen and (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.color.darkGrey};
  background: ${props => props.theme.modal.background};
`;

const EmptyCardIconWrapper = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: ${props => props.theme.networkLabel.background};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.icon.color.default};
  flex-shrink: 0;
`;

const EmptyCardTitle = styled.span`
  font-size: 14px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.primary};
`;

const EmptyCardDesc = styled.span`
  font-size: 13px;
  color: ${props => props.theme.text.color.secondary};
  line-height: 1.5;
  flex: 1;
`;

/* ── Receive section (funded state) ─────────────────────────────────────── */

const ReceiveSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.color.darkGrey};
  background: ${props => props.theme.modal.background};
  margin-top: 8px;
`;

const ReceiveSectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.icon.color.default};
`;

const ReceiveSectionTitle = styled.span`
  font-size: 13px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.primary};
`;

const ReceiveSectionDesc = styled.span`
  font-size: 12px;
  color: ${props => props.theme.text.color.secondary};
  line-height: 1.5;
`;

/* ── Landing / welcome state ─────────────────────────────────────────────── */

const LandingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 8px 0 4px;
`;

const LandingHero = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LandingHeadline = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: ${props => props.theme.text.weight.extraBold};
  color: ${props => props.theme.text.color.primary};
  line-height: 1.2;
`;

const LandingSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${props => props.theme.text.color.secondary};
  line-height: 1.6;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

const FeatureIconWrapper = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: ${props => props.theme.networkLabel.background};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.icon.color.default};
`;

const FeatureText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const FeatureTitle = styled.span`
  font-size: 14px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.primary};
`;

const FeatureDesc = styled.span`
  font-size: 13px;
  color: ${props => props.theme.text.color.secondary};
  line-height: 1.5;
`;

const LandingCTA = styled.div`
  display: flex;

  & > * {
    width: 100%;
  }
`;