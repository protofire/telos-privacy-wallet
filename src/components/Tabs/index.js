import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import { ReactComponent as BashIcon } from 'assets/bash.svg';
import { useTokenMapPrices } from 'hooks';
import { useContext } from 'react';
import { ZkAccountContext, PoolContext } from 'contexts';
import { ZkAvatar } from 'components/ZkAccountIdentifier';
import Skeleton from 'components/Skeleton';
import { ReactComponent as CopyIcon } from 'assets/copy.svg';
import { ReactComponent as CheckIcon } from 'assets/check.svg';
import useAutoReset from 'hooks/useAutoReset';

const shortPrivateAddress = (address) => {
  if (!address) return '';

  const parts = address.split(':');

  const prefix = parts[0];
  const shortenedPrivateAddress = parts[1].substring(0, 12);

  return `${prefix}:${shortenedPrivateAddress}`;
};



export default ({ tabs, activeTab, onTabClick, showBadge }) => {
  const { t } = useTranslation();
  const { priceMap } = useTokenMapPrices();
  const { currentPool } = useContext(PoolContext);
  const [hasCopied, setHasCopied] = useAutoReset();

  const {
    zkAccount, balance: poolBalance,
    isLoadingState,
    generateAddress,
  } = useContext(ZkAccountContext);

  const [shieldedAddress, setShieldedAddress] = useState('');


  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setHasCopied(true);
  };

  useEffect(() => {
    if (!zkAccount) return;

    const generateAndStoreAddress = async () => {
      const storedAddress = localStorage.getItem(`shielded_address_${zkAccount}`);
      if (storedAddress) {
        setShieldedAddress(storedAddress);
      } else {
        const address = await generateAddress();
        setShieldedAddress(address);
        localStorage.setItem(`shielded_address_${zkAccount}`, address);
      }
    };

    generateAndStoreAddress();
  }, [zkAccount, generateAddress]);

  const usdBalance = useMemo(() => {
    if (!poolBalance || !priceMap || !currentPool) return null;

    const price = priceMap.get(currentPool.tokenSymbol);
    if (!price) return null;

    const balanceInToken = parseFloat(ethers.utils.formatUnits(poolBalance, currentPool.tokenDecimals));
    const usdValue = balanceInToken * price;

    const usdBalance = usdValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    return Number(usdBalance).toFixed(2) < 0.01 ? '< $0.01' : usdBalance;

  }, [poolBalance, priceMap, currentPool]);

  const CopyTick = () => {
    return (
      <CopyIconContainer>
        <AnimatedIcon $show={!hasCopied} onClick={() => copyToClipboard(shieldedAddress)}>
          <CopyIcon width={16} height={16} />
        </AnimatedIcon>
        <AnimatedIcon $show={hasCopied}>
          <CheckIcon width={16} height={16} style={{ stroke: "#00D100" }} />
        </AnimatedIcon>
      </CopyIconContainer>
    );
  };

  return (
    <MenuContainer>
      {zkAccount ? (
        <WalletContainer>
          <WalletHeader>
            <ZkAvatar seed={zkAccount} size={46} />
            <WalletInfo>
              <Address>{t('common.zkAccount')}</Address>
              {isLoadingState ? <Skeleton width={100} height={16} /> : <UsdBalance>{usdBalance}</UsdBalance>}
            </WalletInfo>
          </WalletHeader>

          <AddressRow>
            <ShieldedAddress>{shortPrivateAddress(shieldedAddress) || 'Generating address...'}</ShieldedAddress> <CopyTick />
          </AddressRow>
        </WalletContainer>
      ) : null}

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

const WalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  margin-bottom: 32px;
`;

const WalletHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
`;

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;


const Address = styled.span`
  font-size: 12px;
  font-weight: ${props => props.theme.text.weight.bold};
`;

const UsdBalance = styled.span`
  font-size: 12px;
  font-weight: ${props => props.theme.text.weight.normal};
`;

const AddressRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
`;

const ShieldedAddress = styled.span`
  font-size: 12px;
  color: ${props => props.theme.color.black};
  line-height: 16px;
  margin-right: 8px;
`;

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

const CopyIconContainer = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
`;

const AnimatedIcon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$show ? 1 : 0};
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
  transition: opacity 0.3s ease-in-out;
  cursor: pointer;
`;

const MenuText = styled.span`
  font-size: 16px;
  white-space: nowrap;
`;

const IconWrapper = styled.div`
  font-size: 20px;
  width: 24px;
  height: 24px;
  transition: all 0.2s ease;
`;