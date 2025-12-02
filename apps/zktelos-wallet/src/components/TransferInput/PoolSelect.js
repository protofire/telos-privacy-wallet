import React, { useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';

import Dropdown from 'components/Dropdown';
import OptionButton from 'components/OptionButton';

import { TOKENS_ICONS } from 'constants';
import { ReactComponent as DropdownIconDefault } from 'assets/dropdown.svg';

const PoolSelect = ({ options, selectedAlias, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = useMemo(
    () => options.find(option => option.alias === selectedAlias) || options[0],
    [options, selectedAlias],
  );

  const handleSelect = useCallback(alias => {
    onSelect?.(alias);
    setIsOpen(false);
  }, [onSelect]);

  return (
    <Dropdown
      width={180}
      placement="bottomRight"
      fullscreen={false}
      isOpen={isOpen}
      open={() => setIsOpen(true)}
      close={() => setIsOpen(false)}
      style={{ padding: 12 }}
      content={() => (
        <Container>
          {options.map(option => (
            <OptionButtonStyled
              key={option.alias}
              onClick={() => handleSelect(option.alias)}
              className={option.alias === selected.alias ? 'active' : ''}
            >
              <TokenRow>
                <TokenIcon src={TOKENS_ICONS[option.icon || option.tokenSymbol]} />
                {option.label || option.tokenSymbol}
              </TokenRow>
            </OptionButtonStyled>
          ))}
        </Container>
      )}
    >
      <Selected>
        <TokenIcon src={TOKENS_ICONS[selected.icon || selected.tokenSymbol]} />
        {selected.label || selected.tokenSymbol}
        <DropdownIcon />
      </Selected>
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

const TokenRow = styled.div`
  display: flex;
  align-items: center;
`;

const TokenIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;

const Selected = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  margin-left: 15px;
`;

const DropdownIcon = styled(DropdownIconDefault)`
  margin-left: 4px;
`;

const OptionButtonStyled = styled(OptionButton)`
  height: 48px;
  padding: 0 12px;
  border: 1px solid ${props => props.theme.walletConnectorOption.background.default};
  &.active {
    background-color: ${props => props.theme.walletConnectorOption.background.hover};
    border: 1px solid ${props => props.theme.walletConnectorOption.border.hover};
  }
`;

export default PoolSelect;

