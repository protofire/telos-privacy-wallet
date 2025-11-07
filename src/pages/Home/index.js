import React, { useContext } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';

import Card from 'components/Card';
import Spinner from 'components/Spinner';
import LatestTransactions from 'components/LatestTransactions';
import Link from 'components/Link';

import { PoolContext, ZkAccountContext } from 'contexts';

export default () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
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
      <CardsContainer>
        <Card title={t('home.portfolio')}>
          TODO: Portfolio
        </Card>
      </CardsContainer>

      {zkAccount && (
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
            {(isLoading && isLatest5HistoryEmpty) && (
              <Spinner size={60} />
            )}
            {!isLatest5HistoryEmpty && (
              <LatestTransactions
                transactions={last3Actions}
                zkAccount={zkAccount}
                currentPool={currentPool}
              />
            )}
          </Card>
        </CardsContainer>
      )}
    </ContentContainer>
  );
};

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  margin-bottom: 8px;
`;

const CardTitle = styled.span`
  color: ${props => props.theme.card.title.color};
  font-size: 16px;
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
  padding: 16px 12px;

  @media only screen and (max-width: 560px) {
    margin: 30px 0;
  }
`;


const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;