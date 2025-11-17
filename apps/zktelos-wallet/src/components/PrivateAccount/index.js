import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';

import { ReactComponent as RenewSVGIcon } from 'assets/renew.svg';
import { ReactComponent as SpinnerIcon } from 'assets/spinner.svg';
import { ReactComponent as ShieldSVGIcon } from 'assets/shield.svg';
import { ZkAccountContext, PoolContext } from 'contexts';
import { useTokenMapPrices } from 'hooks';

import Skeleton from 'components/Skeleton';
import { ZkAvatar, ZkName } from 'components/ZkAccountIdentifier';
import BalanceDisplay from 'components/BalanceDisplay';
import PrivateAddress from 'components/PrivateAddress';
import { formatNumber } from 'utils';

export default () => {
  const { t } = useTranslation();
  const { priceMap } = useTokenMapPrices();
  const { currentPool } = useContext(PoolContext);

  const {
    zkAccount, balance: poolBalance,
    isLoadingState,
    generateAddress,
  } = useContext(ZkAccountContext);
  const [shieldedAddress, setShieldedAddress] = useState('');

  const usdBalance = useMemo(() => {
    if (!poolBalance || !priceMap || !currentPool) return null;

    const price = priceMap.get(currentPool.tokenSymbol);
    if (!price) return null;

    const balanceInToken = parseFloat(ethers.utils.formatUnits(poolBalance, currentPool.tokenDecimals));
    const usdValue = balanceInToken * price;

    if (usdValue < 0.01) {
      return '< $0.01';
    }

    return usdValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  }, [poolBalance, priceMap, currentPool]);

  const poolBalanceInToken = useMemo(() => {
    if (!poolBalance || !currentPool) return null;
    return formatNumber(poolBalance, currentPool.tokenDecimals, 6);
  }, [poolBalance, currentPool]);

  const generateAndStoreAddress = useCallback(async () => {
    const address = await generateAddress();
    setShieldedAddress(address);
  }, [generateAddress]);

  const getRefreshIcon = () => {
    if (isLoadingState) {
      return <SpinnerIcon width={18} height={18} />;
    }
    return <RenewIcon width={18} height={18} />;
  }

  useEffect(() => {
    if (!zkAccount) return;
    generateAndStoreAddress();
  }, [zkAccount, generateAndStoreAddress]);

  if (!zkAccount) return null;

  return (
    <Container>
      <Header>
        <AccountInfo>
          <ZkAvatar seed={zkAccount} size={46} />
          <AccountDetails>
            <Row>
              <ZkName seed={zkAccount} />
              <ShieldIcon />
              {isLoadingState ? (
                <Skeleton width={100} height={16} />
              ) : (
                <><UsdBalance value={poolBalanceInToken} /> {currentPool.tokenSymbol} {' '} ≃ {' '} <UsdBalance value={usdBalance} /></>
              )}

            </Row>
            <AddressRow>
              {shieldedAddress ? (
                <PrivateAddress
                  prefixIcon={getRefreshIcon()}
                  onPrefixClick={generateAndStoreAddress}
                  $noBorder
                  $fontSize="14px"
                  $height="auto"
                  $padding="8px 16px"
                >
                  {shieldedAddress}
                </PrivateAddress>
              ) : (
                <ShieldedAddress>{t('common.generatingAddress')}</ShieldedAddress>
              )}
            </AddressRow>
          </AccountDetails>
        </AccountInfo>
      </Header>


    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AccountInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AccountDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;


const UsdBalance = styled(BalanceDisplay)`
  font-size: 16px;
  font-weight: ${props => props.theme.text.weight.normal};
`;

const AddressRow = styled.div`
  display: flex;
  align-items: center;
  max-width: 300px;

  > div {
    padding-left:0px;
    padding-right:0px;
    border-radius: 0px;
  }
`;

const ShieldedAddress = styled.span`
  font-size: 14px;
  color: ${props => props.theme.color.black};
  line-height: 16px;
`;

const RenewIcon = styled(RenewSVGIcon)`
  cursor: pointer;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;;
  gap: 8px;
`;

const ShieldIcon = styled(ShieldSVGIcon)`
  width: 24px;
  height: 24px;
`;