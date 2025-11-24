import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';

import Modal from 'components/Modal';
import TransferInput from 'components/TransferInput';
import Button from 'components/Button';
import { ModalContext, TokenBalanceContext, PoolContext, ZkAccountContext } from 'contexts';
import { useWrapToken } from 'hooks';

const ZERO = ethers.constants.Zero;

export default () => {
  const { t } = useTranslation();
  const {
    isWrapModalOpen,
    closeWrapModal,
    wrapModalMode = 'wrap',
  } = useContext(ModalContext);
  const { nativeBalance, balance: poolTokenBalance, isLoadingBalance, updateBalance } = useContext(TokenBalanceContext);
  const { currentPool } = useContext(PoolContext);
  const { updatePoolData } = useContext(ZkAccountContext);
  const {
    wrap,
    unwrap,
    isWrapping,
    isUnwrapping,
  } = useWrapToken();

  const [amountInput, setAmountInput] = useState('');

  const tokenSymbol = currentPool?.tokenSymbol || '';
  const wrappedSymbol = `W${tokenSymbol}`;
  const availableBalance = wrapModalMode === 'wrap'
    ? nativeBalance || ZERO
    : poolTokenBalance || ZERO;
  const tokenDecimals = currentPool?.tokenDecimals || 18;

  const parsedAmount = useMemo(() => {
    if (!amountInput) return ZERO;
    try {
      return ethers.utils.parseUnits(amountInput, tokenDecimals);
    } catch (error) {
      return null;
    }
  }, [amountInput, tokenDecimals]);

  const hasBalance = availableBalance && !availableBalance.isZero();
  const isBusy = wrapModalMode === 'wrap' ? isWrapping : isUnwrapping;

  const amountError = useMemo(() => {
    if (!amountInput) return '';
    if (parsedAmount === null) {
      return t('wrapModal.invalidAmount');
    }
    if (parsedAmount.eq(ZERO)) {
      return t('wrapModal.invalidAmount');
    }
    if (parsedAmount.gt(availableBalance)) {
      return t('wrapModal.exceedsBalance');
    }
    return '';
  }, [amountInput, parsedAmount, availableBalance, t]);

  const isSubmitDisabled = Boolean(
    !parsedAmount ||
    parsedAmount.eq(ZERO) ||
    parsedAmount === null ||
    parsedAmount.gt(availableBalance) ||
    isBusy
  );

  const title = wrapModalMode === 'wrap'
    ? t('wrapModal.wrapTitle', { symbol: tokenSymbol })
    : t('wrapModal.unwrapTitle', { symbol: wrappedSymbol });

  const handleClose = () => {
    if (isBusy) return;
    closeWrapModal();
  };

  const handleAmountChange = useCallback(value => {
    if (!value || /^\d*(?:[.]\d*)?$/.test(value)) {
      setAmountInput(value);
    }
  }, []);

  const handleMax = useCallback(() => {
    if (!hasBalance || !availableBalance) return;
    setAmountInput(ethers.utils.formatUnits(availableBalance, tokenDecimals));
  }, [availableBalance, hasBalance, tokenDecimals]);

  const handleSubmit = async () => {
    if (isSubmitDisabled || parsedAmount === null) return;
    try {
      if (wrapModalMode === 'wrap') {
        await wrap(parsedAmount);
      } else {
        await unwrap(parsedAmount);
      }
      setAmountInput('');
      updateBalance?.();
      updatePoolData?.();
      closeWrapModal();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isWrapModalOpen) {
      setAmountInput('');
    }
  }, [isWrapModalOpen, wrapModalMode]);

  return (
    <Modal
      isOpen={isWrapModalOpen}
      onClose={handleClose}
      title={title}
      width={420}
    >
      <Content>
        <TransferInput
          amount={amountInput}
          onChange={handleAmountChange}
          balance={availableBalance}
          nativeBalance={availableBalance}
          isLoadingBalance={isLoadingBalance}
          fee={ZERO}
          shielded={wrapModalMode === 'unwrap'}
          setMax={handleMax}
          maxAmountExceeded={false}
          isLoadingFee={false}
          hideFeeRow
          disableNativeSelect
          tokenSymbolOverride={wrapModalMode === 'wrap' ? tokenSymbol : wrappedSymbol}
          currentPool={currentPool}
          isNativeSelected={!wrapModalMode || wrapModalMode === 'wrap'}
          setIsNativeSelected={() => { }}
          isNativeTokenUsed={!wrapModalMode || wrapModalMode === 'wrap'}
          gaIdPostfix={`wrap-${wrapModalMode}`}
        />
        {amountError && <ErrorText>{amountError}</ErrorText>}
        <SubmitButton
          onClick={handleSubmit}
          disabled={isSubmitDisabled || !hasBalance}
        >
          {isBusy
            ? t('wrapModal.processing')
            : wrapModalMode === 'wrap'
              ? t('buttonText.wrap')
              : t('buttonText.unwrap')}
        </SubmitButton>
      </Content>
    </Modal>
  );
};

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: ${props => props.theme.color.red};
`;

const SubmitButton = styled(Button)`
  width: 100%;
  height: 48px;
  font-size: 16px;
`;

