import React from 'react';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';

import Button from 'components/Button';
import CopyTextButton from 'components/CopyTextButton';
import SeedPhrase from 'components/SeedPhrase';

const getUrl = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  if (!baseUrl) return '';
  try {
    return new URL(baseUrl).toString();
  } catch {
    return baseUrl;
  }
};

export default ({ mnemonic, next }) => {
  const { t } = useTranslation();
  const url = getUrl();
  return (
    <Container>
      <Description>
        {t('accountSetupModal.createWithSecret.description')}
      </Description>
      <Warning>
        <Trans
          i18nKey="accountSetupModal.createWithSecret.warning"
          values={{ url }}
          tOptions={{ interpolation: { escapeValue: false } }}
          components={{
            url: <span className="warningUrl" />,
            br: <br />,
          }}
        />
      </Warning>
      <SeedPhrase value={mnemonic} />
      <CopyTextButton text={mnemonic} style={{ alignSelf: 'center' }}>
        {t('accountSetupModal.createWithSecret.copy')}
      </CopyTextButton>
      <Button onClick={next}>{t('buttonText.continue')}</Button>
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

const Warning = styled.div`
  background: ${({ theme }) => theme.warning.background};
  border: 1px solid ${({ theme }) => theme.warning.border};
  color: ${({ theme }) => theme.warning.text.color};
  border-radius: 16px;
  padding: 16px 24px;
  font-size: 14px;
  line-height: 20px;
  margin-left: -7px;
  margin-right: -7px;
  text-align: left;

  & .warningUrl {
    font-weight: 700;
    white-space: nowrap;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: bottom;
  }
`;
