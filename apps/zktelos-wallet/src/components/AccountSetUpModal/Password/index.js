import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

import Button from 'components/Button';
import PinInput from 'components/PinInput';
import usePinValidation from 'hooks/usePinValidation';

export default ({ confirmPassword, onSkip }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [pin, setPin] = useState('');

  const { validate, errorKey, resetValidation } = usePinValidation();

  const handlePinChange = useCallback(nextValue => {
    resetValidation();
    setPin(nextValue);
  }, [resetValidation]);

  const handlePinConfirmationChange = useCallback(nextValue => {
    resetValidation();
  }, [resetValidation]);

  const confirm = useCallback(() => {
    const valid = validate({ pin });
    if (valid) {
      confirmPassword(pin);
    }
    history.replace(history.location.pathname);
  }, [confirmPassword, history, pin, validate]);

  const handleKeyPress = useCallback(event => {
    if (event.key === 'Enter') {
      confirm();
    }
  }, [confirm]);

  return (
    <Container onKeyPress={handleKeyPress}>
      <Description>
        <Trans i18nKey="accountSetupModal.createPin.description" />
      </Description>
      <PinInput
        autoFocus
        value={pin}
        onChange={handlePinChange}
        error={!!errorKey}
        helperText={errorKey ? t(errorKey) : t('pin.helper')}
      />

      <Button onClick={confirm} data-ga-id="password-confirm">{t('buttonText.verify')}</Button>
      {onSkip && (
        <SkipButton onClick={onSkip} type="link">
          {t('buttonText.skip')}
        </SkipButton>
      )}
    </Container>
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

const SkipButton = styled(Button)`
  margin-top: 8px;
`;
