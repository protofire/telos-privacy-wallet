import React, { useState, useContext, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { useTranslation, Trans } from 'react-i18next';
import * as Sentry from '@sentry/react';

import Card from 'components/Card';
import Button from 'components/Button';
import Limits from 'components/Limits';
import TransferInput from 'components/TransferInput';
import TransactionModal from 'components/TransactionModal';

import WalletModal from 'containers/WalletModal';

import Header from './Header';
import ConfirmationModal from './ConfirmationModal';

import ModalContext, { ModalContextProvider } from 'contexts/ModalContext';
import SupportIdContext, { SupportIdContextProvider } from 'contexts/SupportIdContext';
import TransactionModalContext, { TransactionModalContextProvider } from 'contexts/TransactionModalContext';
import { LanguageContextProvider } from 'contexts/LanguageContext';
import WalletContext, { WalletContextProvider } from 'contexts/WalletContext';
import TokenBalanceContext, { TokenBalanceContextProvider } from 'contexts/TokenBalanceContext';
import PoolContext from 'contexts/PoolContext';

import config from 'config';

import { formatNumber, minBigNumber } from 'utils';
import { useLimitsAndFees, usePayment } from './hooks';

const pools = Object.values(config.pools).map((pool, index) =>
  ({ ...pool, alias: Object.keys(config.pools)[index] })
);

const Payment = ({ pool }) => {
  const { t } = useTranslation();
  const { supportId } = useContext(SupportIdContext);
  const params = useParams();
  const currency = pool.isNative ? 'WTLOS' : pool.tokenSymbol;

  const { address: account, currentChainId, switchNetwork } = useContext(WalletContext);
  const { isLoadingBalance, balances } = useContext(TokenBalanceContext);

  const balance = useMemo(() => {
    if (!account) return ethers.constants.Zero;
    return balances[pool.alias];
  }, [balances, pool.alias, account]);

  const [displayedAmount, setDisplayedAmount] = useState('');
  const amount = useMemo(
    () => ethers.utils.parseUnits(displayedAmount || '0', pool?.tokenDecimals),
    [displayedAmount, pool],
  );

  const { limit, isLoadingLimit, fee, isLoadingFee } = useLimitsAndFees(pool);
  const zkAddress = params.address;
  const { send } = usePayment(amount, fee, pool, zkAddress, currency);

  const { txStatus, isTxModalOpen, closeTxModal, txAmount, txHash, txError, csvLink } = useContext(TransactionModalContext);
  const {
    openWalletModal,
    openPaymentConfirmationModal, closePaymentConfirmationModal,
  } = useContext(ModalContext);

  // Max amount exceeded check (same logic as Deposit)
  const maxAmountExceeded = useMemo(() => {
    try {
      return !balance.isZero() && (amount.add(fee).gt(balance) || amount.gt(limit));
    } catch {
      return false;
    }
  }, [amount, balance, fee, limit]);

  // Set max amount
  const setMax = useCallback(() => {
    try {
      let max = ethers.constants.Zero;
      if (balance.gt(fee)) {
        max = minBigNumber(balance.sub(fee), limit);
      }
      setDisplayedAmount(ethers.utils.formatUnits(max, pool.tokenDecimals));
    } catch (error) {
      console.error(error);
      Sentry.captureException(error, { tags: { method: 'Payment.setMax' } });
    }
  }, [fee, limit, balance, pool.tokenDecimals]);

  const onSend = () => {
    setDisplayedAmount('');
    send();
    closePaymentConfirmationModal();
  };

  const isWrongNetwork = currentChainId !== pool.chainId;

  return (
    <>
      <Layout>
        <Header pool={pool} />
        <PaymentContent>
          <Title>{t('payment.title', { symbol: currency })}</Title>
          <Card>
            <TransferInput
              amount={displayedAmount}
              onChange={setDisplayedAmount}
              balance={account ? balance : null}
              isLoadingBalance={isLoadingBalance}
              fee={fee}
              isLoadingFee={isLoadingFee}
              shielded={false}
              setMax={setMax}
              maxAmountExceeded={maxAmountExceeded}
              currentPool={pool}
              isNativeSelected={false}
              setIsNativeSelected={() => { }}
              isNativeTokenUsed={false}
              gaIdPostfix="payment"
              disableNativeSelect={true}
              tokenSymbolOverride={pool.tokenSymbol}
            />
            {(() => {
              if (!account)
                return <Button onClick={openWalletModal}>{t('buttonText.connectWallet')}</Button>;

              if (isWrongNetwork)
                return <Button onClick={() => switchNetwork(pool.chainId)}>{t('buttonText.switchNetwork')}</Button>;

              if (amount.isZero())
                return <Button disabled>{t('buttonText.enterAmount')}</Button>;

              if (amount.add(fee).gt(balance || ethers.constants.Zero))
                return <Button disabled>{t('buttonText.insufficientBalance', { symbol: pool.tokenSymbol })}</Button>;

              if (amount.gt(limit))
                return <Button disabled>{t('buttonText.amountExceedsLimit')}</Button>;

              return <Button onClick={openPaymentConfirmationModal}>{t('buttonText.send')}</Button>;
            })()}
          </Card>
          <Limits
            loading={isLoadingLimit}
            limits={[{
              name: <Trans i18nKey="payment.limit" />,
              value: limit,
            }]}
            currentPool={{ ...pool, tokenSymbol: currency }}
          />
        </PaymentContent>
      </Layout>
      <WalletModal />
      <ConfirmationModal
        onConfirm={onSend}
        amount={displayedAmount}
        symbol={currency}
        tokenAmount={amount.add(fee)}
        token={{ symbol: pool.tokenSymbol, decimals: pool.tokenDecimals }}
        receiver={zkAddress}
        sender={account}
        fee={formatNumber(fee, pool?.tokenDecimals)}
      />
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={closeTxModal}
        status={txStatus}
        amount={txAmount}
        error={txError}
        supportId={supportId}
        currentPool={pool}
        txHash={txHash}
        csvLink={csvLink}
      />
    </>
  );
}

function extractPoolAndRecipientFromParams(param) {
  const [poolTokenSymbol, zkAddress] = param.split(':');
  const pool = Object.values(pools).find(pool => pool.tokenSymbol === poolTokenSymbol);
  return { pool, zkAddress };
}

export default () => {
  const params = useParams();
  const { pool } = extractPoolAndRecipientFromParams(params.address);

  if (!pool) {
    return <div>Invalid payment link or payment not available for this pool.</div>;
  }

  return (
    <PoolContext.Provider value={{ currentPool: pool }}>
      <WalletContextProvider>
        <TokenBalanceContextProvider>
          <SupportIdContextProvider>
            <TransactionModalContextProvider>
              <ModalContextProvider>
                <LanguageContextProvider>
                  <Payment pool={pool} />
                </LanguageContextProvider>
              </ModalContextProvider>
            </TransactionModalContextProvider>
          </SupportIdContextProvider>
        </TokenBalanceContextProvider>
      </WalletContextProvider>
    </PoolContext.Provider>
  );
};

const Layout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 14px 40px 40px;
  justify-content: space-between;
  gap: 40px;
  @media only screen and (max-width: 560px) {
    padding: 21px 7px 28px;
  }
  @media only screen and (max-width: 800px) {
    padding-bottom: 80px;
  }
`;

const PaymentContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  margin: 0 auto;
`;

const Title = styled.span`
  font-size: 24px;
  line-height: 32px;
  color: ${props => props.theme.text.color.primary};
  font-weight: ${props => props.theme.text.weight.bold};
  margin-bottom: 24px;
  @media only screen and (max-width: 560px) {
    display: none;
  }
`;
