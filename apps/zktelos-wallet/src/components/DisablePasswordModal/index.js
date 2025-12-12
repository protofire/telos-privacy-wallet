import React, { useContext, useCallback, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Modal from 'components/Modal';
import Button from 'components/Button';
import PinInput from 'components/PinInput';

import { ModalContext, ZkAccountContext } from 'contexts';
import usePinValidation from 'hooks/usePinValidation';

export default () => {
  const { t } = useTranslation();
  const { isDisablePasswordModalOpen, closeDisablePasswordModal } = useContext(ModalContext);
  const { removePassword } = useContext(ZkAccountContext);
  const [pin, setPin] = useState('');
  const { validate, errorKey, setErrorKey, resetValidation } = usePinValidation();

  const handlePasswordChange = useCallback(e => {
    setErrorKey(null);
    setPin(e);
  }, [setErrorKey]);

  const closeModal = useCallback(() => {
    closeDisablePasswordModal();
    setPin('');
    resetValidation();
  }, [closeDisablePasswordModal, resetValidation]);

  const confirm = useCallback(() => {
    if (!validate({ pin })) {
      return;
    }
    try {
      removePassword(pin);
      closeModal();
    } catch (error) {
      setErrorKey('pin.error.invalid');
      setPin('');
    }
  }, [closeModal, pin, removePassword, setErrorKey, validate]);

  const handleKeyPress = useCallback(event => {
    if(event.key === 'Enter'){
      confirm();
    }
  }, [confirm]);

  return (
    <Modal
      isOpen={isDisablePasswordModalOpen}
      onClose={closeModal}
      title={t('disablePinModal.title')}
    >
      <Container onKeyPress={handleKeyPress}>
        <Description>
          {t('disablePinModal.description')}
        </Description>
        <PinInput
          autoFocus
          value={pin}
          onChange={handlePasswordChange}
          error={!!errorKey}
          helperText={errorKey ? t(errorKey) : t('pin.helper')}
        />
        <Button onClick={confirm}>{t('buttonText.confirm')}</Button>
      </Container>
    </Modal>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  & > * {
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const Description = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.text.color.secondary};
  line-height: 20px;
  text-align: center;
`;
