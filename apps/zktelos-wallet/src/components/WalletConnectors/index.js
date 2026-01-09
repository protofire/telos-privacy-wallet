import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

import { WalletContext } from 'contexts';

import { CONNECTORS_ICONS } from 'constants';

export default ({ nextStep, gaIdPrefix = '', descriptions = {} }) => {
  const { connectors, connect, disconnect, connector: currentConnector } = useContext(WalletContext);

  const connectWallet = useCallback(async connector => {
    try {
      if (connector.id === currentConnector?.id) {
        await disconnect();
      }

      await connect({ connector });
      nextStep();
    } catch (error) {
      console.error('Error while connecting with connector:', connector.name, error);
    }
  }, [connect, disconnect, currentConnector, nextStep]);

  const hasDescriptions = Object.keys(descriptions).length > 0;

  return (
    <>
      {connectors.map((connector, index) =>
        <WalletConnector
          key={index}
          onClick={() => connectWallet(connector)}
          data-ga-id={gaIdPrefix + connector.name}
          $hasDescription={hasDescriptions}
        >
          <WalletConnectorContent>
            <WalletConnectorName>{connector.name}</WalletConnectorName>
            {descriptions[connector.name] && (
              <WalletConnectorDescription>
                {descriptions[connector.name]}
              </WalletConnectorDescription>
            )}
          </WalletConnectorContent>
          <WalletConnectorIcon src={CONNECTORS_ICONS[connector.name]} />
        </WalletConnector>
      )}
    </>
  );
};

const WalletConnector = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.walletConnectorOption.background.default};
  border: 1px solid ${({ theme }) => theme.walletConnectorOption.border.default};
  border-radius: 16px;
  width: 100%;
  min-height: ${({ $hasDescription }) => $hasDescription ? '76px' : '60px'};
  padding: ${({ $hasDescription }) => $hasDescription ? '16px 24px' : '0 24px'};
  margin-bottom: 16px;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.walletConnectorOption.background.hover};
    border: 1px solid ${({ theme }) => theme.walletConnectorOption.border.hover};
  }
`;

const WalletConnectorContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const WalletConnectorName = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.text.color.primary};
  font-weight: ${({ theme }) => theme.text.weight.semibold};
`;

const WalletConnectorDescription = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.text.color.secondary};
  line-height: 18px;
`;

const WalletConnectorIcon = styled.img`
  width: 32px;
  margin-left: 16px;
`;
