import React, { useContext, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';

import Card from 'components/Card';
import LatestTransactions from 'components/LatestTransactions';
import PublicAccount from 'components/PublicAccount';
import PrivateAccount from 'components/PrivateAccount';
import Link from 'components/Link';
import Skeleton from 'components/Skeleton';
import Button from 'components/Button';
import InfoTooltip from 'components/InfoTooltip';

import { ZkAccountContext, PoolContext, WalletContext, ModalContext } from 'contexts';

import { ShieldCheckIcon, WalletIcon } from 'lucide-react';

export default () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { availablePools } = useContext(PoolContext);
  const { address: account } = useContext(WalletContext);
  const { openWalletModal } = useContext(ModalContext);
  const {
    histories, zkAccount, pendingDirectDepositsByPool,
    isLoadingZkAccount, isLoadingHistory,
  } = useContext(ZkAccountContext);

  const isLoading = isLoadingZkAccount || isLoadingHistory;

  // Combine histories from all pools (off-chain operation)
  const allTransactions = useMemo(() => {
    if (!histories) return [];

    const combined = [];

    availablePools.forEach(pool => {
      const poolAlias = pool.alias;
      const poolHistory = histories[poolAlias] || [];
      const pendingDeposits = (pendingDirectDepositsByPool && pendingDirectDepositsByPool[poolAlias]) || [];

      const poolTransactions = pendingDeposits.concat(poolHistory).map(tx => ({
        ...tx,
        poolAlias,
        pool,
      }));

      combined.push(...poolTransactions);
    });

    return combined.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [histories, pendingDirectDepositsByPool, availablePools]);

  const last3Actions = allTransactions.slice(0, 3);
  const hasTransactions = last3Actions.length > 0;

  const handleViewAll = () => {
    history.push('/history' + location.search);
  };

  if (isLoading && !zkAccount) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton width="480px" height="80px" />
        <Skeleton width="480px" height="200px" />
      </div>
    );
  }

  return (
    <ContentContainer>

      {/* Private Account — hero, always first */}
      <CardsContainer>
        <Card
          title={t('home.privateAccount')}
          icon={<ShieldCheckIcon />}
          titleStyle={{ fontSize: '16px', fontWeight: 'bold' }}
          titleTooltip={t('tooltips.privateAccount')}
        >
          <PrivateAccount />

          {/* Recent Activity — merged at the bottom of the private card */}
          {zkAccount && hasTransactions && (
            <ActivitySection>
              <ActivityHeader>
                <ActivityTitle>{t('home.latestTransactions')}</ActivityTitle>
                <ViewAllLink onClick={handleViewAll}>
                  {t('latestAction.viewAll')}
                </ViewAllLink>
              </ActivityHeader>
              <LatestTransactions
                transactions={last3Actions}
                zkAccount={zkAccount}
              />
            </ActivitySection>
          )}
        </Card>
      </CardsContainer>

      {/* Connected Wallet — only shown once a private account exists */}
      {zkAccount && <WalletCard>
        <WalletCardHeader>
          <WalletCardIcon><WalletIcon size={15} /></WalletCardIcon>
          <WalletCardTitle>{t('home.connectedWallet')}</WalletCardTitle>
          <InfoTooltip text={t('tooltips.connectedWallet')} />
        </WalletCardHeader>
        {account ? (
          <PublicAccount />
        ) : (
          <ConnectWalletPrompt>
            <ConnectHint>{t('home.connectWalletHint')}</ConnectHint>
            <Button small onClick={openWalletModal}>{t('buttonText.connectWallet')}</Button>
          </ConnectWalletPrompt>
        )}
      </WalletCard>}

    </ContentContainer>
  );
};

/* ── Wallet card (secondary) ───────────────────────────────────────────── */

const WalletCard = styled.div`
  background-color: ${props => props.theme.color.white};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.color.darkGrey};
  padding: 16px;
  width: 540px;
  max-width: 100%;
  box-sizing: border-box;

  @media only screen and (max-width: 560px) {
    width: fill-available;
    margin: 8px 0;
  }
`;

const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${props => props.theme.color.white};
  border-radius: 8px;
  border: 2px solid ${props => props.theme.border.card};

  @media only screen and (max-width: 560px) {
    margin: 15px 0;
  }
`;

const WalletCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const WalletCardIcon = styled.span`
  display: flex;
  align-items: center;
  color: ${props => props.theme.text.color.secondary};
`;

const WalletCardTitle = styled.span`
  font-size: 14px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ConnectWalletPrompt = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media only screen and (max-width: 560px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ConnectHint = styled.span`
  font-size: 14px;
  color: ${props => props.theme.text.color.secondary};
`;

/* ── Activity section inside the private card ──────────────────────────── */

const ActivitySection = styled.div`
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid ${props => props.theme.color.darkGrey};
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ActivityTitle = styled.span`
  color: ${props => props.theme.card.title.color};
  font-size: 14px;
  font-weight: ${props => props.theme.text.weight.bold};
`;

const ViewAllLink = styled(Link)`
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
`;

/* ── Page layout ───────────────────────────────────────────────────────── */

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media only screen and (max-width: 560px) {
    gap: 0;
  }
`;
