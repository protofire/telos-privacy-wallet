import React from 'react';
import styled from 'styled-components';
import Link from 'components/Link';

import { ReactComponent as TwitterIcon } from 'assets/twitter.svg';
import { ReactComponent as TelegramIcon } from 'assets/telegram.svg';
import { ReactComponent as MirrorIcon } from 'assets/mirror.svg';
import { ReactComponent as GithubIcon } from 'assets/github.svg';

export default () => {

  const resources = [
    { icon: TwitterIcon, href: 'https://x.com/HelloTelos' },
    { icon: TelegramIcon, href: 'https://t.me/HelloTelos' },
    { icon: MirrorIcon, href: 'https://www.telos.net/blog' },
    { icon: GithubIcon, href: 'https://github.com/telosnetwork' },
  ];

  return (
    <Column>
      <Row>
        <InnerRow>
          {resources.map((resource, index) => (
            <CustomLink key={index} href={resource.href} target="">
              {React.createElement(resource.icon, {})}
            </CustomLink>
          ))}
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
