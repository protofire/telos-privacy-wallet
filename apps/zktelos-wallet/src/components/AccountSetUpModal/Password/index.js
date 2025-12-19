import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

import Button from 'components/Button';
import Input from 'components/Input';

const MIN_PASSWORD_LENGTH = 6;

const hasMinimumLength = (password) => {
  return password && password.length >= MIN_PASSWORD_LENGTH;
};

const hasUppercase = (password) => {
  return /[A-Z]/.test(password);
};

const hasLowercase = (password) => {
  return /[a-z]/.test(password);
};

const hasDigit = (password) => {
  return /[0-9]/.test(password);
};

const hasSpecialCharacter = (password) => {
  return /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
};

const validatePassword = (password) => {
  return {
    length: hasMinimumLength(password),
    uppercase: hasUppercase(password),
    lowercase: hasLowercase(password),
    digit: hasDigit(password),
    specialCharacter: hasSpecialCharacter(password)
  };
};

const isPasswordValid = (validation) => {
  return Object.values(validation).every(rule => rule === true);
};

const passwordsMatch = (password, passwordConfirmation) => {
  return password === passwordConfirmation;
};

export default ({ confirmPassword }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    specialCharacter: false
  });
  const [matchError, setMatchError] = useState(false);

  const handlePasswordChange = useCallback(e => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setMatchError(false);
    setPasswordValidation(validatePassword(newPassword));
  }, []);

  const handlePasswordConfirmationChange = useCallback(e => {
    setPasswordConfirmation(e.target.value);
    setMatchError(false);
  }, []);

  const confirm = useCallback(() => {
    const validation = validatePassword(password);
    const matchError = !passwordsMatch(password, passwordConfirmation);

    setPasswordValidation(validation);
    setMatchError(matchError);

    if (isPasswordValid(validation) && !matchError) {
      confirmPassword(password);
    }
    history.replace(history.location.pathname);
  }, [password, passwordConfirmation, confirmPassword, history]);

  const handleKeyPress = useCallback(event => {
    if (event.key === 'Enter') {
      confirm();
    }
  }, [confirm]);

  const hasAnyError = !isPasswordValid(passwordValidation) || matchError;

  return (
    <Container onKeyPress={handleKeyPress}>
      <Description>
        <Trans i18nKey="accountSetupModal.createPassword.description" />
      </Description>
      <Input
        type="password"
        placeholder={t('password.placeholder1')}
        value={password}
        onChange={handlePasswordChange}
        error={hasAnyError}
      />
      <Input
        type="password"
        placeholder={t('password.placeholder2')}
        value={passwordConfirmation}
        onChange={handlePasswordConfirmationChange}
        error={hasAnyError}
      />
      <RulesContainer>
        <Rule $error={!passwordValidation.length}>{t('password.rule1')}</Rule>
        <Rule $error={!passwordValidation.uppercase}>{t('password.rule2')}</Rule>
        <Rule $error={!passwordValidation.lowercase}>{t('password.rule3')}</Rule>
        <Rule $error={!passwordValidation.digit}>{t('password.rule4')}</Rule>
        <Rule $error={!passwordValidation.specialCharacter}>{t('password.rule5')}</Rule>
        <Rule $error={matchError}>{t('password.rule6')}</Rule>
      </RulesContainer>
      <Button onClick={confirm} data-ga-id="password-confirm">{t('buttonText.verify')}</Button>
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

const RulesContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 25px;
`;

const Rule = styled.span`
  font-size: 14px;
  color: ${props => props.theme.text.color[props.$error ? 'error' : 'secondary']};
  position: relative;
  margin-bottom: 8px;
  &::before {
    content: ".";
    position: absolute;
    left: -12px;
    top: -10px;
    font-size: 20px;
  }
  &:last-child {
    margin-bottom: 0;
  }
`;