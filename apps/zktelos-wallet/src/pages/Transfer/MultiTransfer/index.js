import React, { useState, useCallback, useContext, forwardRef, useImperativeHandle, useEffect } from 'react';
import styled from 'styled-components';
import { TxType } from 'zkbob-client-js';
import { ethers } from 'ethers';
import * as Sentry from '@sentry/react';
import { useTranslation } from 'react-i18next';

import AccountSetUpButton from 'containers/AccountSetUpButton';
import MultitransferDetailsModal from 'components/MultitransferDetailsModal';

import Button from 'components/Button';
import ButtonLoading from 'components/ButtonLoading';
import TextEditor from 'components/TextEditor';
import ConfirmTransactionModal from 'components/ConfirmTransactionModal';

import { ReactComponent as CrossIcon } from 'assets/red-cross.svg';

import { PoolContext, ZkAccountContext } from 'contexts';

import { formatNumber } from 'utils';
import { useFee } from 'hooks';

const parseCSVRow = (row) => {
  const trimmedRow = row.trim();
  let address, amount, memo;

  if (trimmedRow.includes('"')) {
    const quotedMatch = trimmedRow.match(/^([^,]+),([^,]+)(?:,"([^"]*)")?$/);
    if (quotedMatch) {
      address = quotedMatch[1].trim();
      amount = quotedMatch[2].trim();
      memo = quotedMatch[3] ? quotedMatch[3].trim() : '';
    } else {
      const rowData = trimmedRow.replace(/^,+|,+$/g, '').split(',').map(item => item.trim().replace(/^"|"$/g, ''));
      [address, amount, memo] = rowData;
    }
  } else {
    const rowData = trimmedRow.replace(/^,+|,+$/g, '').split(',').map(item => item.trim());
    [address, amount, memo] = rowData;
  }

  return { address, amount, memo };
};

export default forwardRef((props, ref) => {
  const { t } = useTranslation();
  const {
    zkAccount, isLoadingState, transferMulti,
    estimateFee, verifyShieldedAddressWithPoolInfo,
  } = useContext(ZkAccountContext);
  const { currentPool } = useContext(PoolContext);
  const [data, setData] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [memos, setMemos] = useState({});
  const [errors, setErrors] = useState([]);
  const [errorType, setErrorType] = useState(null);
  const [wrongPoolAddresses, setWrongPoolAddresses] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(ethers.constants.Zero);
  const {
    fee, relayerFee, numberOfTxs, isLoadingFee,
  } = useFee(parsedData, TxType.Transfer);

  const validate = useCallback(async () => {
    try {
      setParsedData([]);
      setErrorType(null);
      setWrongPoolAddresses([]);
      let errors = [];
      const wrongPools = [];
      const rows = data.split('\n');
      const memosMap = {};
      const parsedData = await Promise.all(rows.map(async (row, index) => {
        try {
          const { address, amount, memo } = parseCSVRow(row);

          if (!address || !amount) throw Error;

          const addressValidation = await verifyShieldedAddressWithPoolInfo(address);
          if (!addressValidation.isValid || !(Number(amount) > 0)) {
            if (addressValidation.poolInfo) {
              wrongPools.push({ index, pool: addressValidation.poolInfo.tokenSymbol });
            }
            throw Error;
          }

          if (memo && memo.length > 0) {
            memosMap[address] = memo;
          }

          return { address, amount: ethers.utils.parseUnits(amount, currentPool.tokenDecimals) };
        } catch (err) {
          errors.push(index);
          return null;
        }
      }));

      setMemos(memosMap);
      setErrors(errors);
      setWrongPoolAddresses(wrongPools);
      if (errors.length > 0) {
        setErrorType(wrongPools.length > 0 ? 'wrong_pool' : 'syntax');
        return;
      }

      const dupes = {};
      parsedData.forEach((item, index) => {
        dupes[item.address] = dupes[item.address] || [];
        dupes[item.address].push(index);
      });
      const dupeLines = Object.values(dupes).reduce((acc, curr) => curr.length > 1 ? acc.concat(curr) : acc, []);
      setErrors(dupeLines);
      if (dupeLines.length > 0) {
        setErrorType('duplicates');
        return;
      }

      const { insufficientFunds } = await estimateFee(parsedData.map(item => item.amount), TxType.Transfer);

      setTotalAmount(parsedData.reduce((acc, curr) => acc.add(curr.amount), ethers.constants.Zero));

      if (insufficientFunds) {
        setErrorType('insufficient_funds');
        return;
      }

      setParsedData(parsedData);
      setIsConfirmModalOpen(true);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error, { tags: { method: 'MultiTransfer.validate' } });
    }
  }, [data, estimateFee, verifyShieldedAddressWithPoolInfo, currentPool.tokenDecimals]);

  useImperativeHandle(ref, () => ({
    handleFileUpload(event) {
      try {
        const reader = new FileReader();
        reader.onload = function () {
          setData(reader.result.replace(/\n+$/, ''));
          event.target.value = null;
        }
        reader.readAsText(event.target.files[0]);
      } catch (error) {
        console.error(error);
        Sentry.captureException(error, { tags: { method: 'MultiTransfer.handleFileUpload' } });
      }
    }
  }));

  const onTransfer = useCallback(() => {
    setIsConfirmModalOpen(false);
    setData('');
    setMemos({});
    transferMulti(parsedData, relayerFee, memos);
  }, [parsedData, transferMulti, relayerFee, memos]);

  const openDetailsModal = useCallback(() => {
    setIsConfirmModalOpen(false);
    setIsDetailsModalOpen(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setIsConfirmModalOpen(true);
    setIsDetailsModalOpen(false);
  }, []);

  useEffect(() => {
    setData('');
    setMemos({});
    setParsedData([]);
    setErrors([]);
    setErrorType(null);
    setWrongPoolAddresses([]);
  }, [currentPool.alias]);

  return (
    <>
      <Text>{t('multitransfer.instruction', { symbol: currentPool.tokenSymbol })}</Text>
      <TextEditor
        value={data}
        onChange={setData}
        placeholder={`M7dg2KkZuuSK8CU7N5pLMyuSCc1RoagsRWhH5yux1thVyUk57mpYrT2k6jh21cB, 100.75, "Optional memo"`}
        errorLines={errors}
        error={errorType}
      />
      {!!errorType &&
        <ErrorRow>
          <CrossIcon />
          <Error>
            {(() => {
              if (errorType === 'wrong_pool') {
                const uniquePools = [...new Set(wrongPoolAddresses.map(wp => wp.pool))];
                return t('multitransfer.errors.wrongPool', {
                  count: wrongPoolAddresses.length,
                  pools: uniquePools.join(', ')
                });
              } else if (errorType === 'syntax') {
                return t('multitransfer.errors.syntax', { count: errors.length });
              } else if (errorType === 'duplicates') {
                return t('multitransfer.errors.duplicates');
              } else if (errorType === 'insufficient_funds') {
                return t('multitransfer.errors.insufficientBalance', {
                  amount: formatNumber(totalAmount.add(fee), currentPool.tokenDecimals, 9),
                  symbol: currentPool.tokenSymbol,
                  fee: formatNumber(fee, currentPool.tokenDecimals),
                });
              }
            })()}
          </Error>
        </ErrorRow>
      }
      {(() => {
        if (!zkAccount) return <AccountSetUpButton />
        else if (isLoadingState) return <ButtonLoading />
        else if (!data) return <Button disabled>{t('buttonText.proceed')}</Button>
        else return <Button onClick={validate} data-ga-id="initiate-operation-multitransfer">{t('buttonText.proceed')}</Button>;
      })()}
      <ConfirmTransactionModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={onTransfer}
        isMultitransfer={true}
        transfers={parsedData}
        openDetails={openDetailsModal}
        fee={fee}
        isLoadingFee={isLoadingFee}
        numberOfTxs={numberOfTxs}
        type="multitransfer"
        currentPool={currentPool}
        memos={memos}
      />
      <MultitransferDetailsModal
        isOpen={isDetailsModalOpen}
        onBack={closeDetailsModal}
        transfers={parsedData}
        zkAccount={zkAccount}
        currentPool={currentPool}
        memos={memos}
      />
    </>
  );
});

const Text = styled.span`
  font-size: 14px;
  color: ${props => props.theme.card.note.color};
  font-weight: ${props => props.theme.text.weight.normal};
  padding: 0 10px;
  margin-top: 10px;
`;

const Error = styled.span`
  font-size: 14px;
  color: ${props => props.theme.text.color.error};
  font-weight: ${props => props.theme.text.weight.normal};
  margin-left: 7px;
`;

const ErrorRow = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;
`;
