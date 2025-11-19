import React, { useContext } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';

import Card from 'components/Card';
import LatestTransactions from 'components/LatestTransactions';
import PublicAccount from 'components/PublicAccount';
import PrivateAccount from 'components/PrivateAccount';
import Link from 'components/Link';
import Button from 'components/Button';
import Skeleton from 'components/Skeleton';

import { PoolContext, ZkAccountContext, WalletContext, ModalContext } from 'contexts';

import shieldIcon from 'assets/shield.svg';
import globeIcon from 'assets/globe.svg';

export default () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { address: account } = useContext(WalletContext);
  const { openCreateAccountModal } = useContext(ModalContext);
  const {
    history: fullHistory, zkAccount, pendingDirectDeposits,
    isLoadingZkAccount, isLoadingHistory,
  } = useContext(ZkAccountContext);
  const { currentPool } = useContext(PoolContext);

  const isLoading = isLoadingZkAccount || isLoadingHistory;

  const last3Actions = pendingDirectDeposits.concat(fullHistory).slice(0, 3);
  const isLatest5HistoryEmpty = last3Actions.length === 0;

  const handleViewAll = () => {
    history.push('/history' + location.search);
  };

  return (
    <ContentContainer>
      {(!account && !zkAccount) && (
        <CardsContainer>
          <Card title={t('home.titleOffline')}>
            <EmptyPortfolioContainer>
              <EmptyPortfolioText>{t('home.description')}</EmptyPortfolioText>
              <ConnectWalletButton onClick={openCreateAccountModal} data-ga-id="connect-wallet-home">
                {t('common.createPrivateAccount')}
              </ConnectWalletButton>
            </EmptyPortfolioContainer>
          </Card>
        </CardsContainer>
      )}

      {(isLoading && !zkAccount) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Skeleton width="480px" height="150px" />
          <Skeleton width="480px" height="150px" />
          <Skeleton width="480px" height="150px" />
        </div>
      )}

      {zkAccount && (
        <>
          <CardsContainer>
            <Card
              title={t('home.privateAccount')}
              icon={shieldIcon}
              titleStyle={{ fontSize: '16px', fontWeight: 'bold' }}
            >
              <PrivateAccount />
            </Card>
          </CardsContainer>

          <CardsContainer>
            <Card
              title={t('home.publicAccount')}
              icon={globeIcon}
              titleStyle={{ fontSize: '16px', fontWeight: 'bold' }}
            >
              <PublicAccount />
            </Card>
          </CardsContainer>

          <CardsContainer>
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
                  currentPool={currentPool}
                />
              )}
            </Card>
          </CardsContainer>
        </>)}
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
    margin: 30px 0;
  }
`;


const EmptyPortfolioContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
`;

const EmptyPortfolioText = styled.span`
  font-size: 14px;
  color: ${props => props.theme.text.color.secondary};
  text-align: left;
  line-height: 1.5;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ConnectWalletButton = styled(Button)`
  background: ${props => props.theme.color.telosGradientSoft};
  color: rgb(149 126 223 / 90%);
  border: 1px solid rgb(149 126 223 / 40%);
  padding: 16px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.color.telosGradient};
    color: ${props => props.theme.color.white};
    transition: all 0.3s ease;
    transform: scale(1.05);
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  }
`;
