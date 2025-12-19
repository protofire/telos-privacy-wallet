import React, { useState, useCallback, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import md5 from 'js-md5';
import { useTranslation } from 'react-i18next';

import Modal from 'components/Modal';
import WalletConnectors from 'components/WalletConnectors';

import { WalletContext } from 'contexts';

import Create from './Create';
import Confirm from './Confirm';
import Restore from './Restore';
import Password from './Password';

const STEP = {
  ACCESS_ACCOUNT: 1,
  CREATE_ACCOUNT: 2,
  ENTER_SEEDPHRASE: 3,
  CREATE_INSTANT: 4,
  CONFIRM_INSTANT: 5,
  REQUEST_PASSWORD: 6,
};

const AccessAccount = ({ setStep, generate }) => {
  const { t } = useTranslation();

  const walletDescriptions = {
    'MetaMask': t('accountSetupModal.access.metaMaskDescription'),
    'WalletConnect': t('accountSetupModal.access.walletConnectDescription'),
  };

  return (
    <Container>
      <SectionTitle>{t('accountSetupModal.access.sectionTitle')}</SectionTitle>

      <WalletConnectors
        callback={generate}
        gaIdPrefix="access-"
        descriptions={walletDescriptions}
      />

      <Divider>
        <DividerLine />
        <DividerText>{t('accountSetupModal.access.dividerText')}</DividerText>
        <DividerLine />
      </Divider>

      <OptionCard onClick={() => setStep(STEP.ENTER_SEEDPHRASE)}>
        <OptionContent>
          <OptionTitle>{t('accountSetupModal.access.seedphraseTitle')}</OptionTitle>
          <OptionDescription>
            {t('accountSetupModal.access.seedphraseDescription')}
          </OptionDescription>
        </OptionContent>
      </OptionCard>
    </Container>
  );
};

const CreateAccount = ({ setStep, generate }) => {
  const { t } = useTranslation();

  const walletDescriptions = {
    'MetaMask': t('accountSetupModal.create.metaMaskDescription'),
    'WalletConnect': t('accountSetupModal.create.walletConnectDescription'),
  };

  return (
    <Container>
      <SectionTitle>{t('accountSetupModal.create.sectionTitle')}</SectionTitle>

      <WalletConnectors
        callback={generate}
        gaIdPrefix="create-"
        descriptions={walletDescriptions}
      />

      <Divider>
        <DividerLine />
        <DividerText>{t('accountSetupModal.create.dividerText')}</DividerText>
        <DividerLine />
      </Divider>

      <OptionCard onClick={() => setStep(STEP.CREATE_INSTANT)}>
        <OptionContent>
          <OptionTitle>{t('accountSetupModal.create.instantTitle')}</OptionTitle>
          <OptionDescription>
            {t('accountSetupModal.create.instantDescription')}
          </OptionDescription>
        </OptionContent>
      </OptionCard>
    </Container>
  );
};

export default ({ isOpen, onClose, saveZkAccountMnemonic, mode = 'access' }) => {
  const { t } = useTranslation();
  const evmWallet = useContext(WalletContext);
  const initialStep = mode === 'create' ? STEP.CREATE_ACCOUNT : STEP.ACCESS_ACCOUNT;
  const [step, setStep] = useState(initialStep);
  const [newMnemonic, setNewMnemonic] = useState();
  const [isNewAccount, setIsNewAccount] = useState(false);

  const closeModal = useCallback(() => {
    setStep(initialStep);
    setNewMnemonic(null);
    onClose();
  }, [onClose, initialStep]);

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setNewMnemonic(null);
    }
  }, [isOpen, mode, initialStep]);

  const setNextStep = useCallback(nextStep => {
    if (nextStep === STEP.CREATE_INSTANT) {
      const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
      setNewMnemonic(mnemonic);
    }
    setStep(nextStep);
  }, []);

  const confirmMnemonic = useCallback(() => {
    setIsNewAccount(true);
    setStep(STEP.REQUEST_PASSWORD);
  }, []);

  const restore = useCallback(mnemonic => {
    setNewMnemonic(mnemonic);
    setIsNewAccount(false);
    setStep(STEP.REQUEST_PASSWORD);
  }, []);

  const generate = useCallback(async () => {
    try {
      const { signMessage } = evmWallet;
      const message = 'Access zkTelos account.\n\nOnly sign this message for a trusted client';
      let signedMessage = await signMessage(message);
      if (!window.location.host.includes(process.env.REACT_APP_LEGACY_SIGNATURE_DOMAIN)) {
        // Metamask with ledger returns V=0/1 here too, we need to adjust it to be ethereum's valid value (27 or 28)
        const MIN_VALID_V_VALUE = 27;
        let sigV = parseInt(signedMessage.slice(-2), 16);
        if (sigV < MIN_VALID_V_VALUE) {
          sigV += MIN_VALID_V_VALUE;
        }
        signedMessage = signedMessage.slice(0, -2) + sigV.toString(16);
      }
      const mnemonic = ethers.utils.entropyToMnemonic(md5.array(signedMessage));
      const isNew = !!mnemonic;
      setNewMnemonic(mnemonic);
      setIsNewAccount(isNew);
      setStep(STEP.REQUEST_PASSWORD);
    } catch (error) {
      console.error('Error generating account from signature:', error);
      closeModal();
    }
  }, [evmWallet, closeModal]);

  const handlePasswordSet = useCallback(password => {
    saveZkAccountMnemonic(newMnemonic, password, isNewAccount);
    closeModal();
  }, [newMnemonic, isNewAccount, saveZkAccountMnemonic, closeModal]);

  // const handlePasswordSkip = useCallback(() => {
  //   saveZkAccountMnemonic(newMnemonic, null, isNewAccount);
  //   closeModal();
  // }, [newMnemonic, isNewAccount, saveZkAccountMnemonic, closeModal]);

  let title = null;
  let component = null;
  let prevStep = null;

  switch (step) {
    default:
    case STEP.ACCESS_ACCOUNT:
      title = t('accountSetupModal.access.title');
      component = <AccessAccount setStep={setStep} generate={generate} />;
      prevStep = null;
      break;
    case STEP.CREATE_ACCOUNT:
      title = t('accountSetupModal.create.title');
      component = <CreateAccount setStep={setNextStep} generate={generate} />;
      prevStep = null;
      break;
    case STEP.ENTER_SEEDPHRASE:
      title = t('accountSetupModal.restoreWithSecret.title');
      component = <Restore restore={restore} />;
      prevStep = STEP.ACCESS_ACCOUNT;
      break;
    case STEP.CREATE_INSTANT:
      title = t('accountSetupModal.createWithSecret.title');
      component = <Create mnemonic={newMnemonic} next={() => setStep(STEP.CONFIRM_INSTANT)} />;
      prevStep = STEP.CREATE_ACCOUNT;
      break;
    case STEP.CONFIRM_INSTANT:
      title = t('accountSetupModal.confirmSecret.title');
      component = <Confirm mnemonic={newMnemonic} confirmMnemonic={confirmMnemonic} />;
      prevStep = STEP.CREATE_INSTANT;
      break;
    case STEP.REQUEST_PASSWORD:
      title = t('accountSetupModal.createPassword.title');
      component = (
        <Password
          confirmPassword={handlePasswordSet}
        />
      );
      prevStep = null;
      break;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      onBack={prevStep ? () => setStep(prevStep) : null}
      title={title}
    >
      {component}
    </Modal>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  & > * {
    margin-bottom: 16px;
    &:last-child {
      margin: 0;
    }
  }
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: ${({ theme }) => theme.text.weight.normal};
  color: ${({ theme }) => theme.text.color.secondary};
  margin: 0 0 8px 0;
  `;

const Divider = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin: 8px 0;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: ${({ theme }) => theme.text.color.secondary}33;
`;

const DividerText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.text.color.secondary};
  padding: 0 12px;
  white-space: nowrap;
`;

const OptionCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.walletConnectorOption.border.default};
  border-radius: 16px;
  width: 100%;
  min-height: 76px;
  padding: 16px 24px;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.walletConnectorOption.background.hover};
    border: 1px solid ${({ theme }) => theme.walletConnectorOption.border.hover};
  }
`;

const OptionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OptionTitle = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.text.color.primary};
  font-weight: ${({ theme }) => theme.text.weight.semibold};
`;

const OptionDescription = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.text.color.secondary};
  line-height: 18px;
`;
