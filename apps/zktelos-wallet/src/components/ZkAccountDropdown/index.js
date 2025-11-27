import { useState, useCallback, useContext } from 'react';
import styled from 'styled-components';
import QRCode from 'react-qr-code';
import { useTranslation, Trans } from 'react-i18next';

import Dropdown from 'components/Dropdown';
import OptionButton from 'components/OptionButton';
import Button from 'components/Button';
import PrivateAddress from 'components/AdressWithCopy';
// import QRCodeReader from 'components/QRCodeReader';

import { ReactComponent as BackIconDefault } from 'assets/back.svg';

import { ZkAccountContext, ModalContext, WalletContext } from 'contexts';

const Content = ({
  generateAddress, getSeed, setPassword,
  removePassword, logout, close, showSeedPhrase,
  isLoadingState, initializeGiftCard,
  generatePaymentLink,
}) => {
  const { t } = useTranslation();
  const [privateAddress, setPrivateAddress] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { disconnect } = useContext(WalletContext);

  const { hasPassword } = getSeed();

  const generatePrivateAddress = useCallback(async () => {
    setPrivateAddress(await generateAddress());
  }, [generateAddress]);

  const generateQRCode = useCallback(async () => {
    await generatePrivateAddress();
    setShowQRCode(true);
  }, [generatePrivateAddress]);

  const closeQRCode = useCallback(() => {
    setPrivateAddress(null);
    setShowQRCode(false);
  }, []);

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

  const settingsOptions = [
    {
      text: t('buttonText.showSecretPhrase'),
      action: showSeedPhrase,
      gaIdPostfix: 'secret-phrase',
    },
    {
      text: hasPassword ? t('buttonText.disablePassword') : t('buttonText.setPassword'),
      action: hasPassword ? removePassword : setPassword,
      gaIdPostfix: `${hasPassword ? 'disable' : 'enable'}-password`,
    },
  ];

  if (showQRCode) {
    return (
      <Container>
        <BackIcon onClick={closeQRCode} />
        <Title>{t('qrCode.title')}</Title>
        <Description>
          <Trans i18nKey="qrCode.description" />
        </Description>
        <QRCode
          value={privateAddress}
          style={{ alignSelf: 'center' }}
        />
      </Container>
    );
  }

  if (showSettings) {
    return (
      <Container>
        <BackIcon onClick={() => setShowSettings(false)} />
        <Title style={{ marginBottom: 20 }}>{t('common.settings')}</Title>
        {settingsOptions.map((item, index) =>
          <OptionButton
            key={index}
            onClick={() => handleOptionClick([item.action])}
            data-ga-id={`zkaccount-settings-${item.gaIdPostfix}`}
          >
            {item.text}
          </OptionButton>
        )}
      </Container>
    )
  }

  return (
    <Container>
      <Title style={{ marginBottom: 20 }}>{t('common.zkAccount')}</Title>
      <Button
        style={{ marginBottom: 10 }}
        onClick={generateQRCode}
        disabled={isLoadingState}
        data-ga-id="zkaccount-generate-qr-code"
      >
        {t('buttonText.generateQRCode')}
      </Button>
      {privateAddress ? (
        <PrivateAddress>{privateAddress}</PrivateAddress>
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
      <OptionButton onClick={() => setShowSettings(true)} data-ga-id="zkaccount-settings">
        {t('common.settings')}
      </OptionButton>
      <OptionButton onClick={() => handleOptionClick([logout, disconnect])} data-ga-id="zkaccount-logout">
        {t('buttonText.logout')}
      </OptionButton>
    </Container>
  );
};

export default ({ children }) => {
  const {
    generateAddress, isDemo,
    isLoadingState, initializeGiftCard, getSeed,
  } = useContext(ZkAccountContext);
  const {
    openSeedPhraseModal, openAccountSetUpModal, openChangePasswordModal,
    openConfirmLogoutModal, openDisablePasswordModal, openPaymentLinkModal,
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
          generateAddress={generateAddress}
          switchAccount={openAccountSetUpModal}
          setPassword={openChangePasswordModal}
          removePassword={openDisablePasswordModal}
          logout={openConfirmLogoutModal}
          showSeedPhrase={openSeedPhraseModal}
          isDemo={isDemo}
          isLoadingState={isLoadingState}
          initializeGiftCard={initializeGiftCard}
          getSeed={getSeed}
          close={closeZkAccountDropdown}
          generatePaymentLink={openPaymentLinkModal}
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

const BackIcon = styled(BackIconDefault)`
  position: absolute;
  top: 34px;
  left: 11px;
  cursor: pointer;
  padding: 10px;
  @media only screen and (max-width: 560px) {
    top: 11px;
  }
`;

const Title = styled.span`
  text-align: center;
  font-size: 20px;
  color: ${({ theme }) => theme.text.color.primary};
  font-weight: ${({ theme }) => theme.text.weight.bold};
`;
