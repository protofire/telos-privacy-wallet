import React, { useContext } from 'react';
import styled from 'styled-components';
import { BalanceVisibilityContext } from 'contexts';

const BalanceDisplay = ({
  value,
  hiddenPlaceholder = '••••••',
  fontSize,
  fontWeight,
  color,
  style,
  className
}) => {
  const { isVisible } = useContext(BalanceVisibilityContext);

  return (
    <StyledBalance
      $fontSize={fontSize}
      $fontWeight={fontWeight}
      $color={color}
      style={style}
      className={className}
    >
      {isVisible ? value : hiddenPlaceholder}
    </StyledBalance>
  );
};

const StyledBalance = styled.span`
  font-size: ${props => props.$fontSize || 'inherit'};
  font-weight: ${props => props.$fontWeight || 'inherit'};
  color: ${props => props.$color || 'inherit'};
`;

export default BalanceDisplay;

