import { useCallback, useContext } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Dropdown from 'components/Dropdown';
import OptionButtonDefault from 'components/OptionButton';

import { ReactComponent as CopyIconDefault } from 'assets/copy.svg';

import { ModalContext, WalletContext } from 'contexts';


const Content = ({
  disconnect, close,
}) => {
  const { t } = useTranslation();

  const onDisconnect = useCallback(() => {
    close();
    disconnect();
  }, [disconnect, close]);

  return (
    <Container>
      <OptionButton onClick={onDisconnect}>
        {t('buttonText.disconnect')}
      </OptionButton>
    </Container>
  );
};

export default ({ children }) => {
  const { disconnect } = useContext(WalletContext);
  const {
    isWalletDropdownOpen,
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