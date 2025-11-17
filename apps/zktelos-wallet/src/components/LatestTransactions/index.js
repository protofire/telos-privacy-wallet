import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { HistoryTransactionType } from 'zkbob-client-js';
import { useTranslation } from 'react-i18next';

import Link from 'components/Link';
import Tooltip from 'components/Tooltip';
import { ZkAvatar } from 'components/ZkAccountIdentifier';

import { shortAddress, formatNumber } from 'utils';
import { NETWORKS, TOKENS_ICONS } from 'constants';
import { useDateFromNow, useHistoricalTokenSymbol } from 'hooks';
import { actions, getSign } from 'components/HistoryItem';

import { ReactComponent as IncognitoAvatar } from 'assets/incognito-avatar.svg';

const {
  Deposit,
  TransferOut,
  Withdrawal,
  DirectDeposit,
} = HistoryTransactionType;

const TransactionItem = ({ transaction, zkAccount, currentPool }) => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
  const tokenSymbol = useHistoricalTokenSymbol(currentPool, transaction);
  const date = useDateFromNow(transaction.timestamp);
  const currentChainId = currentPool.chainId;

  const onCopy = useCallback((text, result) => {
    if (result) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, []);

  const total = transaction.actions.reduce(
    (acc, curr) => acc.add(curr.amount),
    ethers.constants.Zero
  );

  const sign = getSign(transaction);
  const isDeposit = [Deposit, DirectDeposit].includes(transaction.type);
  const isWithdrawal = transaction.type === Withdrawal;
  const isTransferOut = transaction.type === TransferOut;

  const address = isDeposit
    ? transaction.actions[0]?.from
    : transaction.actions[0]?.to;

  const isZkAddress = !isDeposit && !isWithdrawal;
  const displayAddress = isZkAddress
    ? transaction.actions[0]?.to
    : address;

  return (
    <TransactionRow>
      <Tooltip content={actions[transaction.type].name} delay={0.3}>
        <ActionLabel $error={transaction.failed}>
          {React.createElement(actions[transaction.type].icon, {})}
        </ActionLabel>
      </Tooltip>
      <TransactionContent>
        <TopRow>
          <LeftSection>
            <TokenIcon src={TOKENS_ICONS[tokenSymbol]} />
            <Amount $error={transaction.failed}>
              {sign}{' '}
              <Tooltip
                content={formatNumber(total, currentPool.tokenDecimals, 18)}
                placement="top"
              >
                <span>{formatNumber(total, currentPool.tokenDecimals, 2)}</span>
              </Tooltip>
              {' '}{tokenSymbol}
              {transaction.fee && !transaction.fee.isZero() && (
                <FeeText>
                  {' '}{t('history.fee', {
                    amount: formatNumber(transaction.fee, currentPool.tokenDecimals),
                    symbol: tokenSymbol,
                  })}
                </FeeText>
              )}
            </Amount>
          </LeftSection>
          <RightSection>
            {date && <DateText>{date}</DateText>}
            {transaction.txHash && transaction.txHash !== '0' && (
              <TxLink
                size={14}
                href={NETWORKS[currentChainId].blockExplorerUrls.tx.replace('%s', transaction.txHash)}
              >
                {t('history.viewTx')}
              </TxLink>
            )}
          </RightSection>
        </TopRow>
        <BottomRow>
          <AddressSection>
            <AddressLabel>
              {isDeposit ? t('common.from') : t('common.to')}
            </AddressLabel>
            {isZkAddress ? (
              <Tooltip
                content={displayAddress}
                delay={0.3}
                placement="bottom"
                width={300}
                style={{
                  wordBreak: 'break-all',
                  textAlign: 'center',
                }}
              >
                <Tooltip content={t('common.copied')} placement="right" visible={isCopied}>
                  <CopyToClipboard text={displayAddress} onCopy={onCopy}>
                    <ZkAddress>
                      {isTransferOut && !transaction.actions[0]?.isLoopback ? (
                        <IncognitoAvatar />
                      ) : (
                        <ZkAvatar seed={zkAccount} size={14} />
                      )}
                      <AddressText>{shortAddress(displayAddress, 18)}</AddressText>
                    </ZkAddress>
                  </CopyToClipboard>
                </Tooltip>
              </Tooltip>
            ) : (
              <AddressLink
                size={14}
                href={NETWORKS[currentChainId].blockExplorerUrls.address.replace('%s', address)}
              >
                {shortAddress(address, 18)}
              </AddressLink>
            )}
          </AddressSection>
        </BottomRow>
      </TransactionContent>
    </TransactionRow>
  );
};

export default ({ transactions, zkAccount, currentPool }) => {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  return (
    <Container>
      {transactions.map((transaction, index) => (
        <TransactionItem
          key={index}
          transaction={transaction}
          zkAccount={zkAccount}
          currentPool={currentPool}
        />
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0;
`;

const TransactionRow = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  
  &:last-of-type {
    margin-bottom: 0;
  }
`;

const ActionLabel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid ${props => props.theme.input.border.color[props.$error ? 'error' : 'default']};
  border-radius: 8px;
  width: 28px;
  height: 28px;
  box-sizing: border-box;
  cursor: pointer;
  margin-right: 8px;
  background-color: ${props => props.theme.color.white};
  flex-shrink: 0;
  ${props => props.$error && `
    & path {
      fill: ${props.theme.input.border.color.error};
    };
  `}
`;

const TransactionContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const TokenIcon = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 6px;
`;

const Amount = styled.span`
  font-size: 14px;
  color: ${props => props.theme.text.color[props.$error ? 'error' : 'primary']};
  font-weight: ${props => props.theme.text.weight.normal};
`;

const FeeText = styled.span`
  font-size: 13px;
  color: ${props => props.theme.text.color.secondary};
  opacity: 0.6;
`;

const DateText = styled.span`
  font-size: 13px;
  color: ${props => props.theme.text.color.secondary};
  opacity: 0.6;
`;

const TxLink = styled(Link)`
  font-size: 13px;
`;

const AddressSection = styled.div`
  display: flex;
  align-items: center;
`;

const AddressLabel = styled.span`
  font-size: 13px;
  color: ${props => props.theme.text.color.primary};
  margin-right: 6px;
`;

const AddressLink = styled(Link)`
  font-size: 13px;
`;

const ZkAddress = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const AddressText = styled.span`
  font-size: 13px;
  color: ${props => props.theme.text.color.primary};
  margin-left: 4px;
`;
