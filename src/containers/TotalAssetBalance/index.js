import React, { useContext, useMemo } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { TokenBalanceContext, ZkAccountContext, PoolContext, BalanceVisibilityContext } from 'contexts';
import { useTokenMapPrices } from '../../hooks';
import { ReactComponent as EyeIcon } from 'assets/eye.svg';
import { ReactComponent as EyeClosedIcon } from 'assets/eye-off.svg';
import Skeleton from 'components/Skeleton';

export default () => {
  const { isVisible, toggleVisibility } = useContext(BalanceVisibilityContext);
  const { balance } = useContext(TokenBalanceContext);
  const { balance: zkAccountBalance, isLoadingState } = useContext(ZkAccountContext);
  const { currentPool } = useContext(PoolContext);
  const { priceMap } = useTokenMapPrices();

  const totalUsdValue = useMemo(() => {
    if (!balance || !zkAccountBalance || !priceMap || !currentPool) return null;

    const tokenPrice = priceMap.get(currentPool.tokenSymbol);
    if (!tokenPrice) return null;

    const balanceInToken = parseFloat(ethers.utils.formatUnits(balance, currentPool.tokenDecimals));
    const zkBalanceInToken = parseFloat(ethers.utils.formatUnits(zkAccountBalance, currentPool.tokenDecimals));
    const totalInToken = balanceInToken + zkBalanceInToken;
    const usdValue = totalInToken * tokenPrice;

    return usdValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [balance, zkAccountBalance, priceMap, currentPool]);

  return (
    <Container>
      <Label>Total asset value</Label>
      <ValueRow>
        {isLoadingState ? <Skeleton width={100} height={48} /> : (<>
          <IconWrapper onClick={toggleVisibility}>
            {isVisible ? <StyledEyeIcon /> : <StyledEyeClosedIcon />}
          </IconWrapper>
          <Value>{isVisible ? totalUsdValue : '••••••••'}</Value> </>)
        }
      </ValueRow>
      <Separator />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const Label = styled.span`
  font-size: 14px;
  font-weight: ${props => props.theme.text.weight.normal};
  color: ${props => props.theme.text.color.secondary};
`;

const ValueRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Value = styled.span`
  font-size: 48px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.primary};
  line-height: 1.2;
`;

const IconWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
`;

const StyledEyeIcon = styled(EyeIcon)`
  width: 32px;
  height: 32px;
`;

const StyledEyeClosedIcon = styled(EyeClosedIcon)`
  width: 32px;
  height: 32px;
`;

const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${props => props.theme.color.grey || '#E5E5E5'};
  margin-top: 8px;
`;
