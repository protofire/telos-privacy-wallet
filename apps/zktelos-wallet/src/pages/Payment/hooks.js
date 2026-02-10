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
export function usePayment(amount, fee, pool, zkAddress, currency) {
  const { openTxModal, setTxStatus, setTxHash, setTxError, setCsvLink } = useContext(TransactionModalContext);
  const { t } = useTranslation();
  const { address: account, chain, signer, switchNetwork } = useContext(WalletContext);

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

      // 2. Approve token for ZkBobPay contract
      setTxStatus(TX_STATUSES.APPROVE_TOKENS);
      const tokenContract = new ethers.Contract(
        pool.tokenAddress,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        signer,
      );
      const approveTx = await tokenContract.approve(pool.paymentContractAddress, amount.add(fee));
      await approveTx.wait();

      // 3. Call ZkBobPay.pay()
      setTxStatus(TX_STATUSES.CONFIRM_TRANSACTION);
      const paymentABI = ['function pay(bytes,address,uint256,uint256,bytes,address,bytes,bytes) external payable'];
      const paymentContract = new ethers.Contract(pool.paymentContractAddress, paymentABI, signer);

      const decodedZkAddress = ethers.utils.hexlify(
        ethers.utils.base58.decode(zkAddress.split(':')[1])
      );
      const depositAmount = amount.add(fee);

      const tx = await paymentContract.pay(
        decodedZkAddress,               // _zkAddress
        pool.tokenAddress,              // _inToken (same as pool token = no swap)
        depositAmount,                  // _inAmount
        depositAmount,                  // _depositAmount (same, no swap)
        '0x',                           // _permit (empty, using approve)
        ethers.constants.AddressZero,   // _router (not used)
        '0x',                           // _routerData (not used)
        '0x',                           // _note (empty)
        { gasLimit: 2000000 },
      );

      setTxStatus(TX_STATUSES.WAITING_FOR_TRANSACTION);
      await tx.wait();
      setTxHash(tx.hash);

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
          NETWORKS[pool.chainId].blockExplorerUrls.tx.replace('%s', tx.hash),
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
    chain, pool, account, signer,
    openTxModal, setTxStatus, setTxError, switchNetwork,
    zkAddress, fee, amount, setTxHash, t, setCsvLink,
    currency,
  ]);

  return { send };
}
