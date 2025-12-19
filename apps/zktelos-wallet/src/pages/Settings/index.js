import React, { useContext } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon } from 'lucide-react';

import Card from 'components/Card';
import ThemeContext from 'contexts/ThemeContext';
import LanguageContext from 'contexts/LanguageContext';
import { ZkAccountContext, ModalContext } from 'contexts';

const Settings = () => {
  const { t } = useTranslation();
  const { themePreference, setThemePreference } = useContext(ThemeContext);
  const { changeLanguage } = useContext(LanguageContext);
  const { zkAccount } = useContext(ZkAccountContext);
  const {
    openSeedPhraseModal,
  } = useContext(ModalContext);

  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'ru', label: 'Русский' },
    { code: 'zh', label: '中文' },
  ];

  const themes = [
    { code: 'light', label: 'Light' },
    { code: 'dark', label: 'Dark' },
    { code: 'system', label: 'System' },
  ];


  return (
    <CardContainer>
      <Card title={t('common.settings')} icon={<SettingsIcon />}>
        <Section>
          <SectionTitle>{t('common.language')}</SectionTitle>
          <ButtonGroup>
            {languages.map(lang => (
              <OptionButton
                key={lang.code}
                active={currentLang === lang.code}
                onClick={() => changeLanguage(lang.code)}
              >
                {lang.label}
              </OptionButton>
            ))}
          </ButtonGroup>
        </Section>
        <Section>
          <SectionTitle>{t('common.theme')}</SectionTitle>
          <ButtonGroup>
            {themes.map(item => (
              <OptionButton
                key={item.code}
                active={themePreference === item.code}
                onClick={() => setThemePreference(item.code)}
              >
                {item.label}
              </OptionButton>
            ))}
          </ButtonGroup>
        </Section>
        {zkAccount && (
          <Section>
            <SectionTitle>{t('common.zkAccount')}</SectionTitle>
            <ButtonGroup>
              <OptionButton onClick={openSeedPhraseModal}>
                {t('buttonText.showSecretPhrase')}
              </OptionButton>
              {/* <OptionButton onClick={hasPassword ? openDisablePasswordModal : openChangePasswordModal}>
                {hasPassword ? t('buttonText.disablePin') : t('buttonText.setPin')}
              </OptionButton> */}
            </ButtonGroup>
          </Section>
        )}
      </Card>
    </CardContainer>
  );
};

export default Settings;


const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${props => props.theme.color.white};
  border-radius: 8px;
  border: 2px solid ${props => props.theme.color.black};

  @media only screen and (max-width: 560px) {
    margin: 15px 0;
  }
`;

const Section = styled.div`
  margin-bottom: 24px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.text.color.primary};
  margin-bottom: 12px;
  margin-top: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const OptionButton = styled.button`
  background: ${props => props.active ? props.theme.button.primary.background.default : 'transparent'};
  color: ${props => props.active ? props.theme.button.primary.text.color.default : props.theme.text.color.primary};
  border: 1px solid ${props => props.theme.button.primary.background.default};
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;
