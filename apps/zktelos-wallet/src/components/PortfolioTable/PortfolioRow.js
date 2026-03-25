import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { EllipsisIcon } from 'lucide-react';

import BalanceDisplay from 'components/BalanceDisplay';
import Skeleton from 'components/Skeleton';
import Tooltip from 'components/Tooltip';
import Dropdown from 'components/Dropdown';
import OptionButtonDefault from 'components/OptionButton';
import { BalanceVisibilityContext } from 'contexts';
import { calculateValue, formatPrice, formatValue, formatFullValue } from './formatters';
import { formatNumber } from '../../utils';

const PortfolioRow = ({
  asset,
  icon,
  balance,
  price,
  tokenDecimals,
  isLoading,
  actions,
}) => {
  const { t } = useTranslation();
  const { isVisible } = useContext(BalanceVisibilityContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const value = useMemo(() => calculateValue(balance, price, tokenDecimals), [balance, price, tokenDecimals]);
  const formattedBalance = formatNumber(balance, tokenDecimals, 2);
  const formattedPrice = formatPrice(price);
  const formattedValue = useMemo(() => formatValue(value), [value]);
  const fullValue = formatFullValue(value);
  const fullBalance = formatNumber(balance, tokenDecimals, 18);

  if (!balance || balance.isZero()) {
    return null;
  }

  const renderedActions = actions?.filter(action => !action.hidden) || [];

  return (
    <TableRow>
      <AssetCell>
        <TokenIcon src={icon} />
        <AssetName>{asset}</AssetName>
      </AssetCell>
      <PriceCell>{isLoading ? <Skeleton width={50} height={16} /> : formattedPrice}</PriceCell>
      <BalanceCell>
        {isLoading ? (
          <Skeleton width={60} height={16} />
        ) : (
          <Tooltip content={fullBalance} placement="top" delay={0} trigger={['hover']}>
            <span>
              <BalanceDisplay value={formattedBalance} />
            </span>
          </Tooltip>
        )}
      </BalanceCell>
      <ValueCell>
        {isLoading ? (
          <Skeleton width={70} height={16} />
        ) : (
          isVisible ? (
            <Tooltip content={fullValue} placement="top" delay={0} trigger={['hover']}>
              <span>
                <BalanceDisplay value={formattedValue} />
              </span>
            </Tooltip>
          ) : (
            <span>
              <BalanceDisplay value={formattedValue} />
            </span>
          )
        )}
      </ValueCell>
      <ValueCell style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {renderedActions.length > 0 ? (
          <Dropdown
            width={180}
            style={{ padding: '12px' }}
            isOpen={isDropdownOpen}
            open={() => setIsDropdownOpen(true)}
            close={() => setIsDropdownOpen(false)}
            fullscreen={false}
            placement="bottomRight"
            content={() => (
              <ActionDropdownContainer>
                {renderedActions.map(action => (
                  <DropdownOptionButton
                    key={action.id}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      action.onClick?.();
                    }}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </DropdownOptionButton>
                ))}
              </ActionDropdownContainer>
            )}
          >
            <ActionButton disabled={renderedActions.every(item => item.disabled)}>
              <DotsIcon />
            </ActionButton>
          </Dropdown>
        ) : (
          <PlainDepositButton disabled>{t('buttonText.deposit')}</PlainDepositButton>
        )}
      </ValueCell>
    </TableRow>
  );
};

const TableRow = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.color.grey || '#E5E5E5'};
  }
`;

const AssetCell = styled.td`
  padding: 8px 12px;
  vertical-align: middle;

  @media only screen and (max-width: 560px) {
    padding: 4px 0px;
  }
`;

const TokenIcon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

const AssetName = styled.span`
  font-size: 14px;
  font-weight: ${props => props.theme.text.weight.normal};
  color: ${props => props.theme.text.color.primary};
  text-transform: uppercase;
  position: relative;
  bottom: 5px;
  margin-left: 8px;
`;

const PriceCell = styled.td`
  font-size: 14px;
  color: ${props => props.theme.text.color.primary};
  text-align: center;
  padding: 8px 12px;
  vertical-align: middle;
`;

const BalanceCell = styled.td`
  font-size: 14px;
  color: ${props => props.theme.text.color.primary};
  text-align: center;
  padding: 8px 12px;
  vertical-align: middle;
`;

const ValueCell = styled.td`
  font-size: 14px;
  color: ${props => props.theme.text.color.primary};
  text-align: right;
  font-weight: ${props => props.theme.text.weight.normal};
  padding: 8px 12px;
  vertical-align: middle;
`;

const PlainDepositButton = styled.button`
  background: ${props => props.theme.color.telosGradientSoft};
  border: 1px solid ${props => props.theme.color.black};
  font-weight: ${props => props.theme.text.weight.bold};
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
  color: ${props => props.theme.text.color.black};
  box-shadow: ${props => props.theme.color.black} 2px 2px 0 0;
  cursor: pointer;
  opacity: ${props => props.disabled ? 0.5 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
`;

const ActionButton = styled.button`
  background: ${props => props.theme.button.background};
  border: 1px solid ${props => props.theme.color.black};
  font-weight: ${props => props.theme.text.weight.bold};
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
  color: ${props => props.theme.text.color.black};
  box-shadow: ${props => props.theme.color.black} 2px 2px 0 0;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const ActionDropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DropdownOptionButton = styled(OptionButtonDefault)`
  height: 48px;
  padding: 0 16px;
  margin-bottom: 0;
  justify-content: center;
`;

const DotsIcon = styled(EllipsisIcon)`
  width: 16px;
  height: 16px;
  color: ${props => props.theme.icon.color.default};
  &:hover {
    color: ${props => props.theme.icon.color.hover};
  }
`;

export default PortfolioRow;

