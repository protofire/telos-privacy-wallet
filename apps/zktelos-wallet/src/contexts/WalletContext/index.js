import { createContext, useContext, useCallback } from 'react';
import { ethers } from 'ethers';

import {
  useAccount, useSignMessage, useConnect, useDisconnect,
  useBalance, useProvider, useSigner, useNetwork,
  useSwitchNetwork,
} from 'wagmi';


import PoolContext from 'contexts/PoolContext';

const WalletContext = createContext({});

export default WalletContext;

const useEvmWallet = pool => {
  const { address, connector } = useAccount();
  const provider = useProvider({ chainId: pool.chainId });
  const { signMessageAsync } = useSignMessage();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { refetch } = useBalance({ address, chainId: pool.chainId });
  const { data: signer } = useSigner({ chainId: pool.chainId });
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: pool.chainId,
    throwForSwitchChainNotSupported: true,
  });

  const getBalance = useCallback(async () => {
    let balance = ethers.constants.Zero;
    try {
      const { data: { value } } = await refetch();
      balance = value;
    } catch (error) { }
    return balance;
  }, [refetch]);

  const callContract = useCallback(async (address, abi, method, params = [], isSend = false) => {
    if (isSend) {
      const contract = new ethers.Contract(address, abi, signer);
      return contract[method](...params);
    }
    const providerConfigs = [...provider.providerConfigs].sort((a, b) => a.priority - b.priority);
    async function call(index, providerConfigs) {
      if (index >= provider.providerConfigs.length) {
        throw new Error('Error calling contract');
      }
      try {
        const contract = new ethers.Contract(address, abi, providerConfigs[index].provider);
        return await contract[method](...params);
      } catch (error) {
        console.error(error);
        return call(index + 1, providerConfigs);
      }
    }
    return call(0, providerConfigs);
  }, [provider, signer]);

  return {
    address,
    chain,
    provider,
    signer,
    connector,
    connectors,
    connect: connectAsync,
    disconnect: disconnectAsync,
    sign: message => signMessageAsync({ message }),
    signMessage: message => signMessageAsync({ message }),
    signTypedData: (domain, types, message) => signer?._signTypedData(domain, types, message),
    sendTransaction: ({ to, value, data }) => signer?.sendTransaction({ to, value, data }),
    switchNetwork: switchNetworkAsync,
    getBalance,
    callContract,
    waitForTx: tx => tx.wait(),
    isAddress: ethers.utils.isAddress,
  };
};


export const WalletContextProvider = ({ children }) => {
  const { currentPool } = useContext(PoolContext);
  const evmWallet = useEvmWallet(currentPool);

  return (
    <WalletContext.Provider value={{ ...evmWallet }}>
      {children}
    </WalletContext.Provider>
  );
};
