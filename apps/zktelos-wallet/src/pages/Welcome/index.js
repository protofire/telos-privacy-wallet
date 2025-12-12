import React, { useContext } from 'react';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';

import Button from 'components/Button';


import { OnboardingTutorialContext } from 'contexts';
import ThemeContext from 'contexts/ThemeContext';
import welcomeImage from 'assets/telos-wallet-logo.svg';
import welcomeImageDark from 'assets/telos-wallet-logo-dark.svg';

export default () => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { startTour, completeTour } = useContext(OnboardingTutorialContext);

  return (
    <WelcomeCard>
      <Container>
        <Title>{t('welcome.title')}</Title>
        <img src={theme === 'dark' ? welcomeImageDark : welcomeImage} alt="Welcome" />
        <Description>
          <Text>
            <Trans i18nKey="welcome.content.paragraph1" />
          </Text>
          <Text>
            <Trans i18nKey="welcome.content.paragraph2" />
          </Text>
          <Text>{t('welcome.content.paragraph3')}</Text>
        </Description>
        <ButtonContainer $theme={theme}>
          <Button onClick={completeTour}>{t('welcome.skipTour')}</Button>
          <Button onClick={startTour}>{t('welcome.startTour')}</Button>
        </ButtonContainer>
      </Container>
    </WelcomeCard>
  );
};

const Title = styled.span`
  font-size: 24px;
  color: ${props => props.theme.text.color.primary};
  font-weight: ${props => props.theme.text.weight.bold};
  text-align: start;
`;

const Text = styled.span`
  font-size: 16px;
  line-height: 22px;
  color: ${props => props.theme.text.color.secondary};
  font-weight: ${props => props.theme.text.weight.normal};
  text-align: left;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 24px 20px;

  @media only screen and (max-width: 500px) {
    padding: 0 6px 12px;
  }

  img {
    width: 200px;
    height: 100px;
    object-fit: contain;
    margin: 0 auto;
  }
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0 24px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;

  button {
   padding: 1rem;
  }

  button:first-child:hover {
    background: ${props => props.theme.button.background};
    color: ${props => props.theme.color.black} !important;
  }
  
  button:last-child:hover {
    background: ${props => props.$theme === 'dark' ? props.theme.background : props.theme.color.telosGradient};
    color: ${props => props.theme.text.color.primary} !important;
  }
`;

const WelcomeCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 12px 12px;
  width: 675px;
  max-width: 100%;
  box-sizing: border-box;
  background-color: ${props => props.theme.modal.background};
  border-radius: 8px;
  border: 2px solid ${props => props.theme.color.black};
  & > * {
    margin-bottom: 12px;
  }
  & > :last-child {
    margin-bottom: 0;
  }

  @media only screen and (max-width: 560px) {
    margin-top: 15px;
    width: 100%;
  }
`;
