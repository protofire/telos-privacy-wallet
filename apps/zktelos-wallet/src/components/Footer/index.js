import { useContext, createElement } from 'react';
import styled from 'styled-components';
import Link from 'components/Link';
import appPackage from '../../../package.json';

import { ReactComponent as TwitterIcon } from 'assets/twitter.svg';
import { ReactComponent as TelegramIcon } from 'assets/telegram.svg';
import { ReactComponent as MirrorIcon } from 'assets/mirror.svg';
import { ReactComponent as GithubIcon } from 'assets/github.svg';
import { ReactComponent as TelosIcon } from 'assets/telos-icon.svg';
import { SupportIdContext } from '../../contexts';
import { useTranslation } from 'react-i18next';

const FEATURE_FORM_URL = 'https://forms.gle/4FvP87CAFr5dWjqC7';
const GITHUB_REPO = 'https://github.com/protofire/telos-privacy-wallet';

export default () => {
  const { supportId } = useContext(SupportIdContext);
  const { t } = useTranslation();
  const resources = [
    { icon: TelosIcon, href: 'https://www.telos.net/' },
    { icon: TwitterIcon, href: 'https://x.com/HelloTelos' },
    { icon: TelegramIcon, href: 'https://t.me/HelloTelos' },
    { icon: MirrorIcon, href: 'https://www.telos.net/blog' },
    { icon: GithubIcon, href: 'https://github.com/telosnetwork' },
  ];

  const bugReportUrl = `${GITHUB_REPO}/issues/new?title=${encodeURIComponent(`[Bug] `)}&body=${encodeURIComponent(
    `**Version:** v${appPackage.version}\n**Support ID:** ${supportId}\n**Browser:** ${navigator.userAgent}\n\n**Describe the bug:**\n\n**Steps to reproduce:**\n1. \n2. \n\n**Expected behavior:**\n`
  )}`;

  const featureSuggestUrl = FEATURE_FORM_URL;

  return (
    <Column>
      <Row>
        <InnerRow>
          {resources.map((resource, index) => (
            <CustomLink key={index} href={resource.href} target="">
              {createElement(resource.icon, {})}
            </CustomLink>
          ))}
        </InnerRow>
      </Row>
      <Row>
        <InnerRow>
          <Text>v{appPackage.version}</Text>
          <TextRow>
            <Text style={{ marginRight: 4 }}>{t('common.supportId')}:</Text>
            <Text>{supportId}</Text>
          </TextRow>
        </InnerRow>
      </Row>
      <Row>
        <InnerRow>
          <FeedbackLink href={bugReportUrl} target="">{t('footer.reportBug')}</FeedbackLink>
          <Separator>·</Separator>
          <FeedbackLink href={featureSuggestUrl} target="">{t('footer.suggestFeature')}</FeedbackLink>
        </InnerRow>
      </Row>
    </Column>
  );
};

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const InnerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  & > * {
    margin: 7px 10px 0;
  }
`;

const CustomLink = styled(Link)`
  color: #A7A2B8;
  font-size: 14px;
  font-weight: ${props => props.theme.text.weight.bold};
`;

const Text = styled.span`
  font-size: 14px;
  color: #A7A2B8;
  font-weight: ${props => props.theme.text.weight.bold};
  line-height: 20px;
  text-align: center;
`;

const TextRow = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

const FeedbackLink = styled(Link)`
  font-size: 13px;
  color: #A7A2B8;
  font-weight: ${props => props.theme.text.weight.normal};
  opacity: 0.8;
  &:hover {
    opacity: 1;
    text-decoration: underline;
  }
`;

const Separator = styled.span`
  font-size: 13px;
  color: #A7A2B8;
  opacity: 0.5;
`;