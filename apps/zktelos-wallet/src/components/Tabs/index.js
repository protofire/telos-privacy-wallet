import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { ReactComponent as MenuDepositIcon } from 'assets/menu_deposit.svg';
import { ReactComponent as MenuWithdrawIcon } from 'assets/menu_withdraw.svg';
import { ReactComponent as MenuTransferIcon } from 'assets/menu_transfer.svg';
import { ReactComponent as MenuTransactionsIcon } from 'assets/menu_transactions.svg';
import { ReactComponent as MenuHomeIcon } from 'assets/menu_home.svg';

export default ({ tabs, activeTab, onTabClick, showBadge }) => {
  const { t } = useTranslation();

  const getTabIcon = (tabName) => {
    const iconMap = {
      'Home': MenuHomeIcon,
      'Deposit': MenuDepositIcon,
      'Withdraw': MenuWithdrawIcon,
      'Transfer': MenuTransferIcon,
      'History': MenuTransactionsIcon,
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
            <IconWrapper><TabIcon width={14} height={14} /></IconWrapper>
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
  max-width: 240px;
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
  border: ${props => props.active ? `1px solid rgb(149 126 223 / 40%)` : 'none'};
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

const MenuText = styled.span`
  font-size: 16px;
  white-space: nowrap;
`;

const IconWrapper = styled.div`
  width: 16px;
  height: 16px;
  transition: all 0.2s ease;
`;