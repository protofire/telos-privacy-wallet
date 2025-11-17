import { useState, useCallback, useContext } from 'react';
import styled from 'styled-components';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';

import Dropdown from 'components/Dropdown';
import Tooltip from 'components/Tooltip';
import OptionButtonDefault from 'components/OptionButton';

import { ReactComponent as CopyIconDefault } from 'assets/copy.svg';
import { ReactComponent as CheckIcon } from 'assets/check.svg';

import { ModalContext, WalletContext } from 'contexts';

import { shortAddress } from 'utils';


const Content = ({
  address, changeWallet,
  disconnect, close,
}) => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = useCallback((text, result) => {
    if (result) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, []);

  const onChangeWallet = useCallback(() => {
    close();
    changeWallet();
  }, [changeWallet, close]);

  const onDisconnect = useCallback(() => {
    close();
    disconnect();
  }, [disconnect, close]);

  return (
    <Container>
      <CopyToClipboard text={address} onCopy={onCopy}>
        <AddressContainer>
          <ShortAddress>{shortAddress(address)}</ShortAddress>
          <Tooltip content={t('common.copied')} placement="right" visible={isCopied}>
            {isCopied ? <CheckIcon /> : <CopyIcon />}
          </Tooltip>
        </AddressContainer>
      </CopyToClipboard>
      <OptionButton onClick={onChangeWallet}>
        {t('buttonText.changeWallet')}
      </OptionButton>
      <OptionButton onClick={onDisconnect}>
        {t('buttonText.disconnect')}
      </OptionButton>
    </Container>
  );
};

export default ({ children }) => {
  const { address, connector, disconnect } = useContext(WalletContext);
  const {
    openWalletModal, isWalletDropdownOpen,
    openWalletDropdown, closeWalletDropdown,
  } = useContext(ModalContext);

  return (
    <Dropdown
      isOpen={isWalletDropdownOpen}
      open={openWalletDropdown}
      close={closeWalletDropdown}
      style={{ width: "auto" }}
      content={() => (
        <Content
          address={address}
          connector={connector}
          changeWallet={openWalletModal}
          disconnect={disconnect}
          close={closeWalletDropdown}
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
  gap: 16px;
  & > :last-child {
    margin-bottom: 0;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const CopyIcon = styled(CopyIconDefault)``;

const AddressContainer = styled(Row)`
  width: 100%;
  cursor: pointer;
  align-self: flex-start;
  &:hover ${CopyIcon} {
    path {
      fill: ${props => props.theme.color.purple};
    }
  }
`;

const OptionButton = styled(OptionButtonDefault)`
  padding: 6px;
  margin: 0;
  height: auto;
  font-weight: ${props => props.theme.text.weight.bold};
`;

const ShortAddress = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.text.color.primary};
  font-weight: ${({ theme }) => theme.text.weight.default};
  margin: 0 8px;
  flex: 1;
`;