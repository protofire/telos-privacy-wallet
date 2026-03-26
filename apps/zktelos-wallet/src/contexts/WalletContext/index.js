import {
  useConnection, useConnectors, useConnect,
  useDisconnect, useSwitchChain, useBalance,
  useSignMessage, useSignTypedData, useSendTransaction,
  useWriteContract, useClient, useChainId
} from 'wagmi';

import { ethers } from 'ethers';
import { isAddress } from 'viem'
import { readContract, waitForTransactionReceipt } from 'viem/actions'
import { useCallback, createContext, useMemo } from 'react';

const useEvmWallet = () => {
  const { address, connector } = useConnection();
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
    // Wallets that don't support Telos EVM are excluded from the list.
    const excludedConnectorIds = ['app.phantom'];
    // If specific EIP-6963 wallet connectors are available, hide the generic
    // 'injected' catch-all to avoid a duplicate entry in the list.
    const hasSpecificInjected = connectors.some(
      c => c.type === 'injected' && c.id !== 'injected'
    );
    return connectors.filter(c => {
      if (excludedConnectorIds.includes(c.id)) return false;
      if (c.id === 'injected' && hasSpecificInjected) return false;
      // Hide the generic injected connector when no browser extension wallet is present
      if (c.id === 'injected' && !window.ethereum) return false;
      return true;
    });
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

  const waitForTransaction = useCallback(async (hash) => {
    return waitForTransactionReceipt(client, { hash });
  }, [client]);

  return {
    address,
    connector,
    currentChainId,
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
    waitForTransaction,
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
