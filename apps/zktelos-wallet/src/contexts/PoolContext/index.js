import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import * as Sentry from '@sentry/react';
import { useLocation } from 'react-router-dom';
import { useChainId, useSwitchChain, useAccount } from 'wagmi';

import config from 'config';
import ModalContext from 'contexts/ModalContext';

const PoolContext = createContext({ currentPool: null });

export default PoolContext;

export const PoolContextProvider = ({ children }) => {
  const location = useLocation();
  const activeChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();
  const { isSwapModalOpen } = useContext(ModalContext);

  const allPools = useMemo(() => {
    return Object.keys(config.pools).map(alias => ({ alias, ...config.pools[alias] }));
  }, []);

  const availablePools = useMemo(() => {
    if (!activeChainId) return allPools;

    return allPools.filter(pool => pool.chainId === activeChainId);
  }, [activeChainId, allPools]);

  const [currentPool, setPool] = useState(() => {
    const savedPoolAlias = window.localStorage.getItem('pool');
    const alias = config.pools[savedPoolAlias] ? savedPoolAlias : config.defaultPool;
    return { ...config.pools[alias], alias };
  });

  const setCurrentPool = useCallback(alias => {
    setPool({ ...config.pools[alias], alias });
    localStorage.setItem('pool', alias);
    Sentry.configureScope(scope => {
      scope.setTag('pool_id', alias);
    });
  }, []);

  // Auto-adjust currentPool if not available in active chain.
  // If the wallet is connected to a chain the app has no pools for (e.g. Ethereum),
  // automatically prompt the user to switch back to the default pool's chain (Telos EVM).
  useEffect(() => {
    if (!activeChainId) return;
    if (currentPool.chainId === activeChainId) return;

    const defaultPool = availablePools[0];
    if (defaultPool) {
      setCurrentPool(defaultPool.alias);
    } else if (isConnected && !isSwapModalOpen) {
      // Wallet is on an unsupported chain — silently request switch to Telos.
      // Skip when the LiFi swap modal is open: LiFi switches chains internally
      // for bridging, and auto-switching back would race with its flow.
      const telosChainId = config.pools[config.defaultPool].chainId;
      switchChain({ chainId: telosChainId }, { onError: () => {} });
    }
  }, [activeChainId, currentPool.chainId, availablePools, setCurrentPool, isConnected, switchChain, isSwapModalOpen]);

  // Handle query params for pool selection
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const toParam = queryParams.get('to');

    if (toParam) {
      const pool = allPools.find(p =>
        p.tokenSymbol?.toLowerCase() === toParam.toLowerCase()
      );
      if (pool) {
        setCurrentPool(pool.alias);
        return;
      }
    }

    const poolInParams = queryParams.get('pool');
    if (poolInParams) {
      const pool = allPools.find(p =>
        p.alias.toLowerCase() === poolInParams?.toLowerCase()
      );
      if (pool) {
        setCurrentPool(pool.alias);
      }
    }
  }, [location.search, allPools, setCurrentPool]);

  return (
    <PoolContext.Provider value={{
      currentPool,
      setCurrentPool,
      availablePools,
      allPools,
      activeChainId,
    }}>
      {children}
    </PoolContext.Provider>
  );
};
