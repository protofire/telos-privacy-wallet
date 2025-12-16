import React, { useContext, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';

import Card from 'components/Card';
import Spinner from 'components/Spinner';
import Pagination from 'components/Pagination';
import HistoryItem from 'components/HistoryItem';
import { actions, getSign } from 'components/HistoryItem';
import Button from 'components/Button';
import AccountSetUpButton from 'containers/AccountSetUpButton';

import { ZkAccountContext, PoolContext } from 'contexts';
import { useWindowDimensions } from 'hooks';

export default () => {
  const { t } = useTranslation();
  const {
    histories, zkAccount, pendingDirectDepositsByPool,
    isLoadingZkAccount, isLoadingHistory,
  } = useContext(ZkAccountContext);
  const { availablePools } = useContext(PoolContext);
  const { width } = useWindowDimensions();
  const isMobile = width <= 500;

  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const isLoading = isLoadingZkAccount || isLoadingHistory;
  const title = t('history.title');

  const items = useMemo(() => {
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

  const isHistoryEmpty = items.length === 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [zkAccount]);


  const exportData = () => {
    const headers = ['amount', 'from', 'to', 'toYourself', 'commitment', 'extraInfo', 'failed', 'fee', 'from', 'txHash', 'type', 'state', 'failureReason', 'timestamp'];
    let csvContent = items.map(item => {
      let result = item.actions.map(action => {

        return [
          getSign(item) + action.amount.toString(),
          action.from,
          action.to,
          action.isLoopback.toString(),
          item.commitment,
          item.extraInfo,
          item.failed.toString(),
          item.fee,
          item.from,
          item.txHash,
          actions[item.type].name,
          // eslint-disable-next-line eqeqeq
          item.state == 2 ? "finalized" : "pending",
          item.failureReason,
          item.timestamp
        ].join(',')
      }).join('\n');
      return result;
    }).join('\n');

    const blob = new Blob([headers.join(',') + '\n' + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <ContentContainer>
      <Card title={!isHistoryEmpty ? title : null} titleStyle={{ marginBottom: 22 }}>
        {((isLoading && isHistoryEmpty) || isHistoryEmpty || !zkAccount) && (
          <Title>{title}</Title>
        )}
        {(isLoading && isHistoryEmpty) && (
          <Spinner size={60} />
        )}
        {(!isLoading && isHistoryEmpty) && (
          <Description>
            <Trans i18nKey="history.empty" />
          </Description>
        )}
        {(!isLoading && !zkAccount) && (
          <AccountSetUpButton />
        )}
        {!isHistoryEmpty && (
          <>
            {items.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item, index) =>
              <HistoryItem key={index} item={item} zkAccount={zkAccount} isMobile={isMobile} />
            )}
            {items.length > pageSize && (
              <Pagination
                currentPage={currentPage}
                numberOfPages={Math.ceil(items.length / pageSize)}
                setCurrentPage={setCurrentPage}
              />
            )}
          </>
        )}
      </Card>
      {!isHistoryEmpty &&
        <ExportButtonContainer>
          <ExportButton onClick={exportData}>
            Export to CSV
          </ExportButton>
        </ExportButtonContainer>}
    </ContentContainer>
  );
};

const Title = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.text.color.primary};
  font-weight: ${({ theme }) => theme.text.weight.bold};
  text-align: center;
`;

const Description = styled.span`
  font-size: 14px;
  line-height: 22px;
  color: ${({ theme }) => theme.text.color.secondary};
  text-align: center;
`;

const ExportButton = styled(Button)`
  width: 100%;
  padding: 10px 20px;
`;

const ExportButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 5px;
  margin-bottom: 25px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${props => props.theme.color.white};
  border-radius: 8px;
  border: 2px solid ${props => props.theme.color.black};

  @media only screen and (max-width: 560px) {
    margin: 15px 0;
    min-width: 350px;
  }

  @media only screen and (max-width: 350px) {
    min-width: 280px;
  }
`;