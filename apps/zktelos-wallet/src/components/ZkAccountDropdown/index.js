import { useState, useCallback, useContext } from 'react';
import styled from 'styled-components';
// import QRCode from 'react-qr-code';
import { useTranslation } from 'react-i18next';

import Dropdown from 'components/Dropdown';
import OptionButton from 'components/OptionButton';
import Button from 'components/Button';
import PrivateAddress from 'components/AdressWithCopy';
// import QRCodeReader from 'components/QRCodeReader';

// import { ReactComponent as BackIconDefault } from 'assets/back.svg';

import { ZkAccountContext, ModalContext, WalletContext, PoolContext } from 'contexts';

const Content = ({
  zkClients, logout, close, isLoadingState, zkAccount,
}) => {
  const { t } = useTranslation();
  const [shieldedAddresses, setShieldedAddresses] = useState({});
  // const [showQRCode, setShowQRCode] = useState(false);
  const { disconnect } = useContext(WalletContext);
  const { allPools } = useContext(PoolContext);

  const generatePrivateAddress = useCallback(async () => {
    if (!zkAccount || !zkClients) return;

    const addressPromises = allPools.map(async (pool) => {
      const poolAlias = pool.alias;
      const client = zkClients[poolAlias];
      if (!client) return { poolAlias, address: null };

      try {
        const address = await client.generateAddress();
        return { poolAlias, address };
      } catch (error) {
        console.error(`Error generating address for pool ${poolAlias}:`, error);
        return { poolAlias, address: null };
      }
    });

    const results = await Promise.all(addressPromises);
    const addressesMap = {};
    results.forEach(({ poolAlias, address }) => {
      if (address) addressesMap[poolAlias] = address;
    });

    setShieldedAddresses(addressesMap);
  }, [zkAccount, zkClients, allPools]);

  // const generateQRCode = useCallback(async () => {
  //   await generatePrivateAddress();
  //   setShowQRCode(true);
  // }, [generatePrivateAddress]);

  // const closeQRCode = useCallback(() => {
  //   setPrivateAddress(null);
  //   setShowQRCode(false);
  // }, []);

  // const initGiftCard = useCallback(async result => {
  //   try {
  //     const paramsString = result.split('?')[1];
  //     const queryParams = new URLSearchParams(paramsString);
  //     const code = queryParams.get('gift-code');
  //     await initializeGiftCard(code);
  //     close();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [initializeGiftCard, close]);

  const handleOptionClick = useCallback(actions => {
    close();
    actions.forEach(action => action());
  }, [close]);

  // if (showQRCode) {
  //   return (
  //     <Container>
  //       <BackIcon onClick={closeQRCode} />
  //       <Title>{t('qrCode.title')}</Title>
  //       <Description>
  //         <Trans i18nKey="qrCode.description" />
  //       </Description>
  //       <QRCode
  //         value={privateAddress}
  //         style={{ alignSelf: 'center' }}
  //       />
  //     </Container>
  //   );
  // }

  const hasAddresses = Object.keys(shieldedAddresses).length > 0;


  return (
    <Container>
      <Title style={{ marginBottom: 20 }}>{t('common.zkAccount')}</Title>
      {/* <Button
        style={{ marginBottom: 10 }}
        onClick={generateQRCode}
        disabled={isLoadingState}
        data-ga-id="zkaccount-generate-qr-code"
      >
        {t('buttonText.generateQRCode')}
      </Button> */}
      {hasAddresses ? (
        <AddressesContainer>
          {allPools.map(pool => {
            const poolAlias = pool.alias;
            const address = shieldedAddresses[poolAlias];
            const tokenSymbol = pool.tokenSymbol;

            return (
              <AddressRow key={poolAlias}>
                <TokenLabel>{tokenSymbol}:</TokenLabel>
                {address ? (
                  <PrivateAddress
                    $noBorder
                    $fontSize="13px"
                    $height="auto"
                    $borderRadius="0"
                    $maxWidth="210px"
                    $padding="0"
                    $background="transparent"
                  >
                    {address}
                  </PrivateAddress>
                ) : (
                  <ShieldedAddress>{t('common.generatingAddress')}</ShieldedAddress>
                )}
              </AddressRow>
            );
          })}
        </AddressesContainer>
      ) : (
        <Button
          onClick={generatePrivateAddress}
          disabled={isLoadingState}
          data-ga-id="zkaccount-generate-address"
        >
          {t('buttonText.generateAddress')}
        </Button>
      )}
      <Description>
        {t('zkAccount.addressDescription')}
      </Description>
      {/* {currentPool.paymentContractAddress && (
        <OptionButton onClick={() => handleOptionClick(generatePaymentLink)} data-ga-id="zkaccount-payment-link">
          {t('buttonText.getPaymentLink')}
        </OptionButton>
      )} */}
      {/* <QRCodeReader onResult={initGiftCard}>
        <OptionButton data-ga-id="zkaccount-gift-card">
          {t('buttonText.redeemGiftCard')}
        </OptionButton>
      </QRCodeReader> */}
      <OptionButton onClick={() => handleOptionClick([logout, disconnect])} data-ga-id="zkaccount-logout">
        {t('buttonText.logout')}
      </OptionButton>
    </Container>
  );
};

export default ({ children }) => {
  const {
    zkAccount, zkClients,
    isLoadingState,
  } = useContext(ZkAccountContext);
  const {
    openConfirmLogoutModal,
    isZkAccountDropdownOpen, openZkAccountDropdown, closeZkAccountDropdown,
  } = useContext(ModalContext);

  return (
    <Dropdown
      disabled={isLoadingState}
      isOpen={isZkAccountDropdownOpen}
      open={openZkAccountDropdown}
      close={closeZkAccountDropdown}
      content={() => (
        <Content
          zkAccount={zkAccount}
          zkClients={zkClients}
          logout={openConfirmLogoutModal}
          isLoadingState={isLoadingState}
          close={closeZkAccountDropdown}
        />
      )}
    >
      {children}
    </Dropdown>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  & > :last-child {
    margin-bottom: 0;
  }
`;

const Description = styled.span`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.text.color.secondary};
  margin: 10px 0 20px;
  line-height: 22px;
`;

// const BackIcon = styled(BackIconDefault)`
//   position: absolute;
//   top: 34px;
//   left: 11px;
//   cursor: pointer;
//   padding: 10px;
//   @media only screen and (max-width: 560px) {
//     top: 11px;
//   }
// `;

const Title = styled.span`
  text-align: center;
  font-size: 20px;
  color: ${({ theme }) => theme.text.color.primary};
  font-weight: ${({ theme }) => theme.text.weight.bold};
`;

const AddressesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
`;

const AddressRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const TokenLabel = styled.span`
  font-size: 13px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.secondary};
  text-transform: uppercase;
  min-width: 50px;
`;

const ShieldedAddress = styled.span`
  font-size: 13px;
  color: ${props => props.theme.color.black};
  line-height: 16px;
`;
