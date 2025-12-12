import React, { useCallback, useState, useContext } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button';
import Modal from 'components/Modal';
import { ModalContext, ZkAccountContext } from 'contexts';
import PinInput from 'components/PinInput';
import usePinValidation from 'hooks/usePinValidation';

export default () => {
  const { t } = useTranslation();
  const { isChangePasswordModalOpen, closeChangePasswordModal } = useContext(ModalContext);
  const { setPassword } = useContext(ZkAccountContext);
  const history = useHistory();
  const [newPin, setNewPin] = useState('');

  const { validate, errorKey, resetValidation } = usePinValidation();

  const handleNewPasswordChange = useCallback(e => {
    resetValidation();
    setNewPin(e);
  }, [resetValidation]);

  const closeModal = useCallback(() => {
    resetValidation();
    setNewPin('');
    closeChangePasswordModal();
  }, [closeChangePasswordModal, resetValidation]);

  const confirm = useCallback(async () => {
    const valid = validate({ pin: newPin });
    if (valid) {
      setPassword(newPin);
      closeModal();
    }
    history.replace(history.location.pathname);
  }, [
    closeModal, history, newPin, setPassword, validate,
  ]);

  const handleKeyPress = useCallback(event => {
    if (event.key === 'Enter') {
      confirm();
    }
  }, [confirm]);

  return (
    <Modal
      isOpen={isChangePasswordModalOpen}
      onClose={closeModal}
      title={t('setPinModal.title')}
    >
      <Container onKeyPress={handleKeyPress}>
        <Description>{t('setPinModal.description')}</Description>
        <PinInput
          autoFocus
          value={newPin}
          onChange={handleNewPasswordChange}
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