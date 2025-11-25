import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Dropdown from 'components/Dropdown';
import OptionButtonDefault from 'components/OptionButton';

import { ReactComponent as DropdownIconDefault } from 'assets/dropdown.svg';

import { NETWORKS } from 'constants';

import config from 'config';

import { ModalContext } from 'contexts';

const chainIds = Object.keys(config.chains).map(chainId => Number(chainId));

const Content = () => {
  const { t } = useTranslation();
  const handleClick = useCallback(chainId => {
    const external = config.chains[chainId]?.external;
    if (external) window.open(external);
  }, []);

  return (
    <Container>
      <Title>{t('networks.title')}</Title>
      {chainIds.map(chainId => (
        <OptionButton
          key={chainId}
          onClick={() => handleClick(chainId)}
          className="active"
        >
          <RowSpaceBetween>
            <Row>
              <NetworkIcon src={NETWORKS[chainId].icon} />
              {NETWORKS[chainId].name}
            </Row>
            {config.chains[chainId]?.external && (
              <Row>
                <DropdownIcon style={{ transform: 'rotate(270deg)' }} />
              </Row>
            )}
          </RowSpaceBetween>
        </OptionButton>
      ))}
    </Container>
  );
};

export default ({ children }) => {
  const { isNetworkDropdownOpen, openNetworkDropdown, closeNetworkDropdown } = useContext(ModalContext);
  return (
    <Dropdown
      width={310}
      placement="bottomLeft"
      isOpen={isNetworkDropdownOpen}
      open={openNetworkDropdown}
      close={closeNetworkDropdown}
      content={() => (
        <Content />
      )}
    >
      {children}
    </Dropdown>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  & > :last-child {
    margin-bottom: 0;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const RowSpaceBetween = styled(Row)`
  justify-content: space-between;
  width: 100%;
`;

const Title = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.text.color.secondary};
  margin-bottom: 20px;
`;

const NetworkIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 10px;
`;

const OptionButton = styled(OptionButtonDefault)`
  padding: 0 12px;
  font-weight: ${props => props.theme.text.weight.bold};
  &.active {
    background-color: ${props => props.theme.walletConnectorOption.background[props.disabled ? 'default' : 'hover']};
    border: 1px solid ${props => props.theme.walletConnectorOption.border[props.disabled ? 'default' : 'hover']};
  }
`;

const OptionButtonSmall = styled(OptionButton)`
  flex: 0 0 calc(50% - 2px);
  height: 40px;
  border: 0;
  &:hover {
    border: 0;
  }
  &.active {
    background-color: ${props => props.theme.walletConnectorOption.background[props.disabled ? 'default' : 'hover']};
    border: 0;
  }
  &:nth-child(odd) {
    margin-right: 2px;
  }
  &:nth-child(even) {
    margin-left: 2px;
  }
`;

const DropdownIcon = styled(DropdownIconDefault)`
  margin-left: 10px;
`;
