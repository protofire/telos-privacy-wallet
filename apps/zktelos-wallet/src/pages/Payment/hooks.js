import { useEffect, useState, useContext, useCallback } from 'react';
import * as Sentry from '@sentry/react';
import { ethers, BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';

import SupportIdContext from 'contexts/SupportIdContext';
import TransactionModalContext from 'contexts/TransactionModalContext';
import WalletContext from 'contexts/WalletContext';

import zp from 'contexts/ZkAccountContext/zp';

import { TX_STATUSES, NETWORKS } from 'constants';

import { formatNumber } from 'utils';

/**
 * Fetches limits and fees using zkClient (created without login).
 * - Fee: directDepositFee from DDQueue contract (converted to wei)
 * - Limit: dd.singleOperation from pool/sequencer (converted to wei)
 */
export function useLimitsAndFees(pool) {
  const { supportId } = useContext(SupportIdContext);
  const [zkClient, setZkClient] = useState(null);
  const [limit, setLimit] = useState(ethers.constants.Zero);
  const [isLoadingLimit, setIsLoadingLimit] = useState(true);
  const [fee, setFee] = useState(ethers.constants.Zero);
  const [isLoadingFee, setIsLoadingFee] = useState(true);

  useEffect(() => {
    if (!supportId || !pool || zkClient) return;
    async function create() {
      const client = await zp.createClient(pool.alias, supportId);
      setZkClient(client);
    }
    create();
  }, [supportId, pool, zkClient]);

  const updateLimit = useCallback(async () => {
    setIsLoadingLimit(true);
    let limit = ethers.constants.Zero;
    try {
      const data = await zkClient.getLimits();
      const wei = await zkClient.shieldedAmountToWei(data.dd.components.singleOperation);
      limit = BigNumber.from(wei);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error, { tags: { method: 'Payment.useZkClient.updateLimit' } });
    }
    setLimit(limit);
    setIsLoadingLimit(false);
  }, [zkClient]);

  const updateFee = useCallback(async () => {
    setIsLoadingFee(true);
    let fee = ethers.constants.Zero;
    try {
      const data = await zkClient.directDepositFee();
      const wei = await zkClient.shieldedAmountToWei(data);
      fee = BigNumber.from(wei);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error, { tags: { method: 'Payment.useZkClient.updateFee' } });
    }
    setFee(fee);
    setIsLoadingFee(false);
  }, [zkClient]);

  useEffect(() => {
    if (!zkClient) return;
    updateLimit();
    updateFee();
  }, [zkClient, updateLimit, updateFee]);

  return { limit, isLoadingLimit, fee, isLoadingFee };
}

/**
 * Simplified payment hook using ZkBobPay.pay() with same token (no swap/router).
 * The pool token is used directly — no LiFi, no router.
 */
export function usePayment(amount, fee, pool, zkAddress, currency, isNativeTokenUsed) {
  const { openTxModal, setTxStatus, setTxHash, setTxError, setCsvLink } = useContext(TransactionModalContext);
  const { t } = useTranslation();
  const { address: account, chain, switchNetwork, callContract, waitForTransaction } = useContext(WalletContext);

  const send = useCallback(async () => {
    openTxModal();
    try {
      // 1. Ensure correct network
      if (chain.id !== pool.chainId) {
        setTxStatus(TX_STATUSES.SWITCH_NETWORK);
        try {
          await switchNetwork();
        } catch (error) {
          console.error(error);
          Sentry.captureException(error, { tags: { method: 'Payment.send.switchNetwork' } });
          setTxStatus(TX_STATUSES.WRONG_NETWORK);
          return;
        }
      }

      const depositAmount = amount.add(fee);

      // 2. Approve token for ZkBobPay contract (skip for native)
      if (!isNativeTokenUsed) {
        setTxStatus(TX_STATUSES.APPROVE_TOKENS);
        const approveTx = await callContract(
          pool.tokenAddress,
          ['function approve(address spender, uint256 amount) returns (bool)'],
          'approve',
          [pool.paymentContractAddress, depositAmount],
          true // isSend
        );
        await waitForTransaction(approveTx);
      }

      // 3. Call ZkBobPay.pay()
      setTxStatus(TX_STATUSES.CONFIRM_TRANSACTION);
      const paymentABI = ['function pay(bytes,address,uint256,uint256,bytes,address,bytes,bytes) external payable'];

      const decodedZkAddress = ethers.utils.hexlify(
        ethers.utils.base58.decode(zkAddress.split(':')[1])
      );

      const txHash = await callContract(
        pool.paymentContractAddress,
        paymentABI,
        'pay',
        [
          decodedZkAddress,                                         // _zkAddress
          isNativeTokenUsed ? ethers.constants.AddressZero : pool.tokenAddress, // _inToken
          depositAmount,                                            // _inAmount
          depositAmount,                                            // _depositAmount
          '0x',                                                     // _permit
          ethers.constants.AddressZero,                             // _router
          '0x',                                                     // _routerData
          '0x'                                                      // _note
        ],
        true, // isSend
        isNativeTokenUsed ? depositAmount : 0 // value
      );

      setTxStatus(TX_STATUSES.WAITING_FOR_TRANSACTION);
      await waitForTransaction(txHash);
      setTxHash(txHash);

      // 4. Generate CSV receipt
      const rows = [
        [
          t('paymentStatement.amount', { symbol: currency }),
          t('common.sender'),
          t('common.recipient'),
          t('paymentStatement.fee', { symbol: currency }),
          t('common.link'),
        ],
        [
          ethers.utils.formatUnits(amount, pool.tokenDecimals),
          account,
          zkAddress,
          ethers.utils.formatUnits(fee, pool.tokenDecimals),
          NETWORKS[pool.chainId].blockExplorerUrls.tx.replace('%s', txHash),
        ],
      ];
      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
      setCsvLink(encodeURI(csvContent));

      setTxStatus(TX_STATUSES.SENT);
    } catch (error) {
      let message = error?.message;
      if (message?.includes('user rejected transaction')) {
        message = 'User rejected transaction.';
      }
      console.error(error);
      Sentry.captureException(error, { tags: { method: 'Payment.usePayment.send' } });
      setTxError(message);
      setTxStatus(TX_STATUSES.REJECTED);
    }
  }, [
    chain, pool, account,
    openTxModal, setTxStatus, setTxError, switchNetwork,
    zkAddress, fee, amount, setTxHash, t, setCsvLink,
    currency, isNativeTokenUsed, callContract, waitForTransaction,
  ]);

  return { send };
}
