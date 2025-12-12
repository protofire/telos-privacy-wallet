import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button';
import Modal from 'components/Modal';
import PinInput from 'components/PinInput';

export default ({
  isOpen, confirm, reset, pin, isLoading,
  onPinChange, errorKey, successMessage, isAccountSetUpModalOpen
}) => {
  const { t } = useTranslation();
  const handleKeyPress = useCallback(event => {
    if (event.key === 'Enter') {
      confirm();
    }
  }, [confirm]);

  const helper = successMessage || (errorKey ? t(errorKey) : t('pin.helper'));

  return (
    <Modal
      isOpen={isOpen}
      title={t('enterPinModal.title')}
      containerStyle={{ visibility: isAccountSetUpModalOpen ? 'hidden' : 'visible' }}
    >
      <Container onKeyPress={handleKeyPress}>
        <Description>
          {t('enterPinModal.description')}
        </Description>
        <PinInput
          autoFocus
          value={pin}
          onChange={onPinChange}
          error={!!errorKey}
          success={!!successMessage}
          helperText={helper}
          disabled={isLoading}
        />
        <Button onClick={confirm} disabled={isLoading}>
          {isLoading ? t('buttonText.signingIn') : t('buttonText.signIn')}
        </Button>
        <Button type="link" onClick={reset}>{t('enterPinModal.lostPin')}</Button>
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
