import {
  useConnection, useConnectors, useConnect,
  useDisconnect, useSwitchChain, useBalance,
  useSignMessage, useSignTypedData, useSendTransaction,
  useWriteContract, useClient, useChainId
} from 'wagmi';

import { ethers } from 'ethers';
import { isAddress } from 'viem'
import { readContract } from 'viem/actions'
import { useCallback, createContext, useMemo } from 'react';

const allowedConnectorId = ['io.metamask', 'walletConnect']

const useEvmWallet = () => {
  const { address, connector, status } = useConnection();
  const currentChainId = useChainId();
  const connectors = useConnectors();
  const { mutateAsync: connectAsync } = useConnect();
  const { mutateAsync: disconnectAsync } = useDisconnect();
  const { mutateAsync: switchNetworkAsync } = useSwitchChain();
  const { refetch } = useBalance({ address })
  const { mutateAsync: signAsync } = useSignMessage();
  const { mutateAsync: signTypedDataAsync } = useSignTypedData();
  const { mutateAsync: sendTransactionAsync } = useSendTransaction();
  const { mutateAsync: writeContractAsync } = useWriteContract();
  const client = useClient();

  const filteredConnectors = useMemo(() => {
    return connectors.filter(connector => allowedConnectorId.includes(connector.id));
  }, [connectors]);

  const callContract = useCallback(async (address, abi, method, params = [], isSend = false) => {
    if (isSend) {
      return await writeContractAsync({ address, abi, functionName: method, args: params });
    }

    const result = await readContract(client, { address, abi, functionName: method, args: params });

    if (typeof result === 'bigint') {
      return ethers.BigNumber.from(result.toString());
    }

    if (typeof result === 'string' && /^\d+$/.test(result)) {
      return ethers.BigNumber.from(result);
    }

    return result;
  }, [writeContractAsync, client]);

  const getBalance = useCallback(async () => {
    try {
      const { data: balanceData } = await refetch();
      return ethers.BigNumber.from(balanceData?.value?.toString() || '0');
    } catch (error) {
      return ethers.constants.Zero;
    }
  }, [refetch]);

  return {
    address,
    connector,
    currentChainId,
    status,
    connectors: filteredConnectors,
    connect: ({ connector }) => connectAsync({ connector }),
    disconnect: async () => {
      connectors.forEach(async (connector) => {
        await disconnectAsync({ connector });
      });
    },
    switchNetwork: switchNetworkAsync,
    signMessageAsync: messageOrRaw => {
      const isNotLiteralString = messageOrRaw instanceof Uint8Array || (typeof messageOrRaw === 'string' && /^0x[0-9a-fA-F]+$/.test(messageOrRaw));

      if (isNotLiteralString) {
        return signAsync({ message: { raw: messageOrRaw } });
      }

      return signAsync({ message: messageOrRaw });
    },
    // https://wagmi.sh/core/api/actions/signTypedData#types
    signTypedDataAsync: (domain, types, message) => signTypedDataAsync({ domain, types, message }),
    sendTransactionAsync: ({ to, value, data }) => sendTransactionAsync({ to, value, data }),
    callContract,
    refetchNativeBalance: getBalance,
    isAddress,
  }
}

const WalletContext = createContext({});

export default WalletContext;

export const WalletContextProvider = ({ children }) => {
  const evmWallet = useEvmWallet();

  return (
    <WalletContext.Provider value={evmWallet}>
      {children}
    </WalletContext.Provider>
  );
};
