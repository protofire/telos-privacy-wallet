import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Modal from 'components/Modal';
import WalletConnectors from 'components/WalletConnectors';


export default ({ isOpen, close }) => {
  const { t } = useTranslation();

  const { title, description } = useMemo(() => ({
    title: t(`connectWalletModal.title`),
    description: t(`connectWalletModal.description`),
  }), [t]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={title}
    >
      <Text>{description}</Text>
      <WalletConnectors callback={close} />
    </Modal>
  );
};

const Text = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.text.color.secondary};
  text-align: center;
  line-height: 20px;
  margin-bottom: 16px;
  &:last-child {
    margin-bottom: 0;
  }
`;
