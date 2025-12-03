import React, { useCallback, useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import Skeleton from 'components/Skeleton';
import Select from './Select';

import { ReactComponent as InfoIconDefault } from 'assets/info.svg';

import { formatNumber } from 'utils';
import { useDisplayedFee } from 'hooks';

import { TOKENS_ICONS, HIDDEN_BALANCE_PLACEHOLDER } from 'constants';
import { BalanceVisibilityContext } from 'contexts';

export default ({
  amount,
  onChange,
  balance,
  nativeBalance,
  isLoadingBalance,
  fee,
  shielded,
  setMax,
  maxAmountExceeded,
  isLoadingFee,
  currentPool,
  isNativeSelected,
  setIsNativeSelected,
  isNativeTokenUsed,
  gaIdPostfix,
  hideFeeRow = false,
  disableNativeSelect = false,
  tokenSymbolOverride,
}) => {
  const { t } = useTranslation();
  const displayedFee = useDisplayedFee(currentPool, fee);
  const [showTooltip, setShowTooltip] = useState(false);
  const { isVisible } = useContext(BalanceVisibilityContext);
  const displayedSymbol = tokenSymbolOverride || currentPool.tokenSymbol;
  const tokenIconSrc = TOKENS_ICONS[displayedSymbol] || TOKENS_ICONS[currentPool.tokenSymbol];

  const handleAmountChange = useCallback(value => {
    if (!value || /^\d*(?:[.]\d*)?$/.test(value)) {
      onChange(value);
    }
  }, [onChange]);

  useEffect(() => {
    setShowTooltip(maxAmountExceeded);
  }, [maxAmountExceeded]);

  return (
    <Container>
      <Row>
        <Input
          placeholder={0}
          value={amount}
          onChange={e => handleAmountChange(e.target.value)}
        />
        {(!shielded && currentPool.isNative && !disableNativeSelect) ? (
          <Select
            tokenSymbol={currentPool.tokenSymbol}
            isNativeSelected={isNativeSelected}
            onTokenSelect={setIsNativeSelected}
          />
        ) : (
          <TokenContainer>
            <TokenIcon src={tokenIconSrc} />
            {displayedSymbol}
          </TokenContainer>
        )}
      </Row>
      <Row>
        {!hideFeeRow && (
          <RowWrap style={{ marginRight: 20 }}>
            <Text style={{ marginRight: 4 }}>{t('common.relayerFee')}:</Text>
            {isLoadingFee ? (
              <Skeleton width={40} />
            ) : (
              <Text>{displayedFee}</Text>
            )}
          </RowWrap>
        )}
        {(balance || isLoadingBalance) && (
          <RowFlexEnd>
            <Text style={{ marginRight: 4 }}>
              {shielded ? t('common.poolBalance') : t('common.balance')}:
            </Text>
            {isLoadingBalance ? (
              <Skeleton width={80} />
            ) : (
              <Row>
                <Text>
                  {isVisible ? formatNumber(isNativeTokenUsed ? nativeBalance : balance, currentPool.tokenDecimals) : HIDDEN_BALANCE_PLACEHOLDER}{' '}
                  {displayedSymbol}
                </Text>
                <MaxButton
                  type="link"
                  onClick={setMax}
                  tabIndex="-1"
                  data-ga-id={`max-${gaIdPostfix}`}
                >
                  {t('buttonText.max')}
                </MaxButton>
                <Tooltip
                  content={t('maxButton.tooltip', { symbol: displayedSymbol })}
                  placement="right"
                  delay={0}
                  width={180}
                  visible={showTooltip}
                  onVisibleChange={setShowTooltip}
                  trigger="hover"
                >
                  <InfoIcon />
                </Tooltip>
              </Row>
            )}
          </RowFlexEnd>
        )}
      </Row>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100px;
  background: ${props => props.theme.input.background.secondary};
  border: 1px solid ${props => props.theme.input.border.color.default};
  border-radius: 16px;
  padding: 0px 24px;
  transition : border-color 100ms ease-out;
  &:focus-within {
    border-color: ${props => props.theme.input.border.color.focus};
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RowWrap = styled(Row)`
  flex-wrap: wrap;
  line-height: 20px;
`;

const RowFlexEnd = styled(RowWrap)`
  justify-content: flex-end;
`;

const Input = styled.input`
  border: 0;
  background: transparent;
  font-size: 36px;
  color: ${props => props.theme.transferInput.text.color.placeholder};
  font-weight: ${props => props.theme.transferInput.text.weight.default};
  width: 100%;
  flex: 1;
  outline: none;
  padding: 0;
  &::placeholder {
    color: ${props => props.theme.transferInput.text.color.placeholder};
  }
  &:focus::placeholder {
    color: transparent;
  }
`;

const Text = styled.span`
  font-size: 14px;
  color: ${props => props.theme.text.color.secondary};
  font-weight: ${props => props.theme.transferInput.text.weight.small};
  line-height: 20px;
`;

const MaxButton = styled(Button)`
  margin-left: 4px;
`;

const TokenIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;

const TokenContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  color: ${props => props.theme.text.color.primary};
  padding: 10px 0;
  margin-left: 15px;
`;


const InfoIcon = styled(InfoIconDefault)`
  margin-left: 2px;
  margin-right: -2px;
  &:hover {
    & > path {
      fill: ${props => props.theme.color.purple};
    }
  }
`;
