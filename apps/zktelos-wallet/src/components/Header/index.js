import React, { useContext, useCallback } from 'react';
import styled from 'styled-components';
// import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';

import ButtonDefault from 'components/Button';
import { ZkAvatar, ZkName } from 'components/ZkAccountIdentifier';
import ZkAccountDropdown from 'components/ZkAccountDropdown';
import NetworkDropdown from 'components/NetworkDropdown';
import SpinnerDefault from 'components/Spinner';
// import Skeleton from 'components/Skeleton';
// import BalanceDisplay from 'components/BalanceDisplay';

import { EyeIcon, EyeOffIcon, RefreshCcwIcon, ChevronDownIcon, MoonIcon, SunIcon } from 'lucide-react';

import { BalanceVisibilityContext } from 'contexts';
import ThemeContext from 'contexts/ThemeContext';

import logo from 'assets/telos-wallet-logo.svg';
import logoDark from 'assets/telos-wallet-logo-dark.svg';

// import { formatNumber } from 'utils';
import { NETWORKS } from 'constants';
import { useWindowDimensions } from 'hooks';
import { useHistory } from 'react-router-dom';

import {
  ZkAccountContext, ModalContext,
  TokenBalanceContext, PoolContext,
  WalletContext,
} from 'contexts';

// const { parseUnits } = ethers.utils;

// const formatBalance = (balance, tokenDecimals, isMobile) => {
//   const decimals = (isMobile && balance.gte(parseUnits('1000', tokenDecimals))) ? 0 : null;
//   return formatNumber(balance, tokenDecimals, decimals);
// };

// const BalanceSkeleton = isMobile => (
//   <Skeleton
//     width={isMobile ? 60 : 80}
//     style={{ marginLeft: isMobile ? 5 : 0 }}
//   />
// );

export default ({ empty }) => {
  const { t } = useTranslation();
  const { address: account } = useContext(WalletContext);
  const { updateBalance, isLoadingBalance } = useContext(TokenBalanceContext);
  const history = useHistory();
  const {
    zkAccount, isLoadingZkAccount,
    updatePoolData, isPoolSwitching, isLoadingState,
  } = useContext(ZkAccountContext);
  const { openAccessAccountModal, openSwapModal } = useContext(ModalContext);
  const { isVisible, toggleVisibility } = useContext(BalanceVisibilityContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currentPool } = useContext(PoolContext);

  const refresh = useCallback(e => {
    e.stopPropagation();
    updateBalance();
    updatePoolData();
  }, [updateBalance, updatePoolData]);

  const { width } = useWindowDimensions();

  const isMobile = width <= 800;

  if (empty) {
    return (
      <Row>
        <LogoSection>
          <img src={theme === 'dark' ? logoDark : logo} alt="Welcome" />
        </LogoSection>
      </Row>
    );
  }

  const networkDropdown = (
    <NetworkDropdown>
      <NetworkDropdownButton $refreshing={isPoolSwitching || isLoadingState} data-tour="supported-tokens">
        <NetworkIcon src={NETWORKS[currentPool.chainId].icon} />
        <NetworkLabel>{NETWORKS[currentPool.chainId].name}</NetworkLabel>
        {isPoolSwitching ? (
          <Spinner size={12} style={{ marginLeft: 10 }} />
        ) : (
          <DropdownIcon />
        )}
      </NetworkDropdownButton>
    </NetworkDropdown>
  );

  // const walletDropdown = account ? (
  //   <WalletDropdown>
  //     <AccountDropdownButton $refreshing={isLoadingBalance}>
  //       <Row>
  //         {connector && <Icon src={CONNECTORS_ICONS[connector.name]} />}
  //         <Address>{shortAddress(account)}</Address>
  //         {isLoadingBalance ? (
  //           <BalanceSkeleton isMobile={isMobile} />
  //         ) : (
  //           <>
  //             <Balance>
  //               <BalanceDisplay
  //                 value={`${formatBalance(
  //                   currentPool.isNative ? nativeBalance.add(balance) : balance,
  //                   currentPool.tokenDecimals,
  //                   isMobile
  //                 )} ${currentPool.tokenSymbol}${currentPool.isNative ? '*' : ''}`}
  //               />
  //             </Balance>
  //             <DropdownIcon />
  //           </>
  //         )}
  //       </Row>
  //     </AccountDropdownButton>
  //   </WalletDropdown>
  // ) : (
  //   <Button small onClick={openWalletModal} data-ga-id="wallet-header" data-tour="create-zkaccount">
  //     {t('buttonText.connectWallet')}
  //   </Button>
  // );

  const zkAccountDropdown = zkAccount ? (
    <ZkAccountDropdown>
      <AccountDropdownButton $refreshing={isLoadingState} data-ga-id="zkaccount-profile">
        <Row>
          <ZkAvatar seed={zkAccount} size={16} />
          <Address><ZkName seed={zkAccount} /></Address>
          <DropdownIcon />
        </Row>
      </AccountDropdownButton>
    </ZkAccountDropdown>
  ) : (
    <Button
      small
      loading={isLoadingZkAccount}
      contrast
      disabled={isLoadingZkAccount}
      onClick={openAccessAccountModal}
      data-ga-id="zkaccount-header"
      data-tour="create-zkaccount"
    >
      {isLoadingZkAccount ? (isMobile ? t('buttonText.loading') : t('buttonText.loadingZkAccount')) : t('common.accessPrivateAccount')}
    </Button>
  );

  return (
    <>
      <Row>
        <LogoSection>
          <img src={theme === 'dark' ? logoDark : logo} alt="wallet logo" onClick={() => history.push('/')} />
        </LogoSection>
        <AccountSection>
          {!isMobile && networkDropdown}
          <BridgeButton small onClick={openSwapModal} data-ga-id="get-token-header">
            {t('buttonText.getToken', { symbol: currentPool.tokenSymbol })}
          </BridgeButton>
          {/* {!isMobile && walletDropdown} */}

          {!isMobile && zkAccountDropdown}
          <RefreshButtonContainer onClick={toggleTheme} >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </RefreshButtonContainer>
          <RefreshButtonContainer onClick={toggleVisibility} >
            {(account || zkAccount) && isVisible ? <EyeIcon /> : <EyeOffIcon />}
          </RefreshButtonContainer>
          {zkAccount && (
            <RefreshButtonContainer onClick={refresh}>
              {(isLoadingBalance || isLoadingState) ? <Spinner size={18} /> : <RefreshCcwIcon />}
            </RefreshButtonContainer>
          )}
        </AccountSection>
      </Row>
      {isMobile && (
        <OnlyMobile>
          {networkDropdown}
          {/* {walletDropdown} */}
          {zkAccountDropdown}
        </OnlyMobile>
      )}
    </>
  );
}

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const OnlyMobile = styled.div`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  padding: 0 7px;
  background: ${props => props.theme.modal.background};
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  & > * {
    margin-right: 2px;
    margin-left: 2px;
    &:last-child {
      margin-right: 0;
    }
    &:first-child {
      margin-left: 0;
    }
  }
`;

const LogoSection = styled(Row)`
  justify-content: flex-start;
  
  & > img {
    cursor: pointer;
    height: 35px;
    width: 135px;
    margin-left: 10px;
  }
`;


const AccountSection = styled(Row)`
  justify-content: center;
  & > * {
    margin-left: 10px;
    &:first-child {
      margin-left: 0;
    }
    @media only screen and (max-width: 400px) {
      margin-left: 7px;
    }
    @media only screen and (max-width: 380px) {
      margin-left: 5px;
    }
  }
`;

const DropdownButton = styled(Row)`
  background-color: ${props => props.theme.networkLabel.background};
  color: ${props => props.theme.text.color.primary};
  font-weight: ${props => props.theme.text.weight.normal};
  padding: 0 8px;
  border-radius: 18px;
  min-height: 36px;
  box-sizing: border-box;
  cursor: ${props => props.$refreshing ? 'not-allowed' : 'pointer'};
  @media only screen and (max-width: 1000px) {
    min-height: 30px;
    border-radius: 16px;
  }
`;

const DropdownIcon = styled(ChevronDownIcon)`
  width: 16px !important;
  height: 16px;
  margin-left: 7px;
  @media only screen and (max-width: 800px) {
    margin-left: 4px;
  }
`;

const NetworkDropdownButton = styled(DropdownButton)`
  padding: 0 8px 0 10px;
  border-radius: 8px;

  @media only screen and (max-width: 800px) {
    padding: 0;
    background-color: transparent;
    border-radius: 6px;
  }
`;

const AccountDropdownButton = styled(NetworkDropdownButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  overflow: hidden;
  border: 1px solid ${props => props.theme.button.primary.text.color.contrast};
  &:hover {
    border-color: ${props => !props.$refreshing && props.theme.button.link.text.color};
    & span {
      color: ${props => !props.$refreshing && props.theme.button.link.text.color};
    }
    & path {
      stroke: ${props => !props.$refreshing && props.theme.button.link.text.color};
    }
  }
  @media only screen and (max-width: 800px) {
    flex: 1;
    padding: 0 2px 0 7px;
    ${DropdownIcon} {
      margin-left: 2px;
    }
  }
`;

// const Icon = styled.img`
//   width: 18px;
//   height: 16px;
// `;

const Address = styled.span`
  margin-left: 8px;
  margin-right: 8px;
`;

// const Balance = styled.span`
//   font-weight: ${props => props.theme.text.weight.extraBold};
//   @media only screen and (max-width: 1100px) {
//     margin-left: 8px;
//   }
//   @media only screen and (max-width: 800px) {
//     font-weight: ${props => props.theme.text.weight.bold};
//     font-size: 14px;
//   }
// `;

const Spinner = styled(SpinnerDefault)`
  path {
    stroke: ${props => props.theme.text.color.primary};
    stroke-width: 10;
  }
  circle {
    stroke: #FFF;
    stroke-width: 10;
  }
`;

const RefreshButtonContainer = styled(Row)`
  background-color: ${props => props.theme.networkLabel.background};
  padding: 8px 12px;
  border-radius: 18px;
  height: 36px;
  box-sizing: border-box;
  cursor: pointer;
  @media only screen and (max-width: 1000px) {
    height: 30px;
    border-radius: 16px;
  }

  svg {
    cursor: pointer;
    width: 16px;
    height: 16px;
    color: ${props => props.theme.icon.color.default};
  }

  &:hover svg {
    color: ${props => props.theme.icon.color.hover};
  }
`;

const Button = styled(ButtonDefault)`
  @media only screen and (max-width: 800px) {
    font-size: 14px;
    flex: 1;
    padding: 8px 5px;
  }
`;

const BridgeButton = styled(Button)`
  background: ${props => props.theme.button.link.text.color};
  @media only screen and (max-width: 800px) {
    padding: 8px 12px;
  }
`;

const NetworkIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const NetworkLabel = styled.span`
  margin-left: 8px;
  font-size: 14px;
  color: ${props => props.theme.text.color.primary};
`;
