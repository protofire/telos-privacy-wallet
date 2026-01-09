import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import * as Sentry from '@sentry/react';
import { useLocation } from 'react-router-dom';
import { useChainId } from 'wagmi';

import config from 'config';

const PoolContext = createContext({ currentPool: null });

export default PoolContext;

export const PoolContextProvider = ({ children }) => {
  const location = useLocation();
  const activeChainId = useChainId();

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

  // Auto-adjust currentPool if not available in active chain
  useEffect(() => {
    if (!activeChainId) return;
    if (currentPool.chainId === activeChainId) return;

    const defaultPool = availablePools[0];
    if (defaultPool) {
      setCurrentPool(defaultPool.alias);
    }
  }, [activeChainId, currentPool.chainId, availablePools, setCurrentPool]);

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
