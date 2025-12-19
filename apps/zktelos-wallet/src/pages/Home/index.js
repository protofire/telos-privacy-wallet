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

import { ZkAccountContext, PoolContext, WalletContext, ModalContext } from 'contexts';

import { ShieldCheckIcon, GlobeIcon } from 'lucide-react';

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

      // Add poolAlias metadata to each transaction
      const poolTransactions = pendingDeposits.concat(poolHistory).map(tx => ({
        ...tx,
        poolAlias,
        pool,
      }));

      combined.push(...poolTransactions);
    });

    // Sort by timestamp (most recent first)
    return combined.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [histories, pendingDirectDepositsByPool, availablePools]);

  const last3Actions = allTransactions.slice(0, 3);
  const isLatest5HistoryEmpty = last3Actions.length === 0;

  const handleViewAll = () => {
    history.push('/history' + location.search);
  };

  if (isLoading && !zkAccount) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton width="480px" height="150px" />
        <Skeleton width="480px" height="150px" />
        <Skeleton width="480px" height="150px" />
      </div>
    );
  }

  return (
    <ContentContainer>
      <CardsContainer>
        <Card
          title={t('home.privateAccount')}
          icon={<ShieldCheckIcon />}
          titleStyle={{ fontSize: '16px', fontWeight: 'bold' }}
        >
          <PrivateAccount />
        </Card>
      </CardsContainer>

      {zkAccount && <CardsContainer>
        <Card
          title={t('home.publicAccount')}
          icon={<GlobeIcon />}
          titleStyle={{ fontSize: '16px', fontWeight: 'bold' }}
        >
          {account && <PublicAccount />}
          {!account &&
            <ConnectWalletWrapper>
              <Button onClick={openWalletModal} style={{ padding: '8px' }}>{t('buttonText.connectWallet')}</Button></ConnectWalletWrapper>
          }
        </Card>
      </CardsContainer>
      }

      {zkAccount && (<CardsContainer>
        <Card>
          <CardHeader>
            <CardTitle>{t('home.latestTransactions')}</CardTitle>
            {!isLatest5HistoryEmpty && (
              <ViewAllLink onClick={handleViewAll}>
                {t('latestAction.viewAll')}
              </ViewAllLink>
            )}
          </CardHeader>
          {!isLatest5HistoryEmpty && (
            <LatestTransactions
              transactions={last3Actions}
              zkAccount={zkAccount}
            />
          )}
        </Card>
      </CardsContainer>)}
    </ContentContainer>
  );
};

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CardTitle = styled.span`
  color: ${props => props.theme.card.title.color};
  font-size: 16px;
  font-weight: bold;
`;

const ViewAllLink = styled(Link)`
  font-size: 16px;
  cursor: pointer;
  text-decoration: underline;
`;

const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${props => props.theme.color.white};
  border-radius: 8px;
  border: 2px solid ${props => props.theme.color.black};

  @media only screen and (max-width: 560px) {
    margin: 15px 0;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media only screen and (max-width: 560px) {
    gap: 0;
  }
`;

const ConnectWalletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
`;