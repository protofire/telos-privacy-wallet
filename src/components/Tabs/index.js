import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ReactComponent as BashIcon } from 'assets/bash.svg';

export default ({ tabs, activeTab, onTabClick, showBadge }) => {
  const { t } = useTranslation();
  return (
    <MenuContainer>
      {tabs.map((tab, index) =>
        <MenuItem
          key={index}
          active={activeTab === index}
          onClick={() => onTabClick(index)}
          $showBadge={showBadge && tab.badge}
          data-ga-id={`tab-${tab.name.toLowerCase()}`}
          data-tour={tab.dataTour}
        >
          <IconWrapper><BashIcon /></IconWrapper>
          <MenuText>{t(tab.i18nKey)}</MenuText>
        </MenuItem>
      )}
    </MenuContainer>
  );
}

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  width: 240px;
  background-color: ${props => props.theme.color.white};
  border-radius: 8px;
  border: 2px solid ${props => props.theme.color.black};
`;

const MenuItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${props => props.active ? props.theme.color.telosGradientSoft : 'transparent'};
  border-bottom: ${props => props.active ? `1px solid ${props.theme.color.black}` : 'none'};
  color: ${props => props.theme.text.color[props.active ? 'primary' : 'secondary']};
  font-weight: normal;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? props.theme.color.telosGradientSoft : 'rgba(0, 0, 0, 0.02)'};
    color: ${props => props.theme.text.color.primary};
  }

  &::after {
    content: '';
    display: ${props => props.$showBadge ? 'block' : 'none'};
    position: absolute;
    top: 12px;
    right: 12px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #E53E3E;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  width: 24px;
  height: 24px;
`;

const MenuText = styled.span`
  font-size: 16px;
  white-space: nowrap;
`;
