import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';


import { HomeIcon, MoveDownLeftIcon, MoveUpRightIcon, ArrowRightLeftIcon, ListCheckIcon, Settings } from 'lucide-react';

export default ({ tabs, activeTab, onTabClick, showBadge }) => {
  const { t } = useTranslation();

  const getTabIcon = (tabName) => {
    const iconMap = {
      'Home': HomeIcon,
      'Deposit': MoveDownLeftIcon,
      'Withdraw': MoveUpRightIcon,
      'Transfer': ArrowRightLeftIcon,
      'History': ListCheckIcon,
      'Settings': Settings,
    };
    return iconMap[tabName];
  };

  return (
    <MenuContainer>
      {tabs.map((tab, index) => {
        const TabIcon = getTabIcon(tab.name);
        return (
          <MenuItem
            key={index}
            active={activeTab === index}
            onClick={() => onTabClick(index)}
            $showBadge={showBadge && tab.badge}
            data-ga-id={`tab-${tab.name.toLowerCase()}`}
            data-tour={tab.dataTour}
          >
            <TabIcon size={16} />
            <MenuText>{t(tab.i18nKey)}</MenuText>
          </MenuItem>
        );
      })}
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
  
  @media only screen and (max-width: 768px) {
    width: fill-available;
    max-width: 240px;
  }

  @media only screen and (max-width: 560px) {
    width: auto;
    max-width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
`;

const MenuItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${props => props.active ? props.theme.button.background : 'transparent'};
  border: ${props => props.active ? `1px solid ${props.theme.button.primary.border.color}` : 'none'};
  color: ${props => props.theme.text.color[props.active ? 'primary' : 'secondary']};
  font-weight: normal;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    color: ${props => props.theme.icon.color.default};
  }
  
  &:hover {
    background: ${props => props.active ? props.theme.button.background : 'rgba(0, 0, 0, 0.02)'};
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
  }
`;

const MenuText = styled.span`
  font-size: 16px;
  white-space: nowrap;
  
  @media only screen and (max-width: 560px) {
    display: none;
  }
`;
