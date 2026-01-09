import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { ethers } from 'ethers';
import * as Sentry from '@sentry/react';

import { PoolContext, WalletContext } from 'contexts';

import { showLoadingError } from 'utils';
import tokenAbi from 'abis/token.json';
import config from 'config';

const TokenBalanceContext = createContext({ balance: null });

export default TokenBalanceContext;

export const TokenBalanceContextProvider = ({ children }) => {
  const { address: account, refetchNativeBalance, callContract, status } = useContext(WalletContext);
  const { currentPool, availablePools } = useContext(PoolContext);
  const [balances, setBalances] = useState({});
  const [nativeBalances, setNativeBalances] = useState({});
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Computed values pointing to current pool
  const balance = useMemo(() => account ? balances[currentPool.alias] : ethers.constants.Zero, [balances, currentPool.alias, account]);
  const nativeBalance = useMemo(() => account ? nativeBalances[currentPool.alias] : ethers.constants.Zero, [nativeBalances, currentPool.alias, account]);

  const updateBalance = useCallback(async (poolAlias) => {
    if (!account) return;
    if (!poolAlias) {
      console.error('updateBalance called without poolAlias');
      return;
    }

    setIsLoadingBalance(true);
    let balance = ethers.constants.Zero;
    let nativeBalance = ethers.constants.Zero;

    const pool = config.pools[poolAlias];
    if (!pool) {
      console.error(`Pool not found: ${poolAlias}`);
      setIsLoadingBalance(false);
      return;
    }


    try {
      [balance, nativeBalance] = await Promise.all([
        callContract(pool.tokenAddress, tokenAbi, 'balanceOf', [account]),
        refetchNativeBalance(),
      ]);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error, { tags: { method: 'TokenBalanceContext.updateBalance', pool: poolAlias } });
      showLoadingError('walletBalance');
    }

    setBalances(prev => ({ ...prev, [poolAlias]: balance }));
    setNativeBalances(prev => ({ ...prev, [poolAlias]: nativeBalance }));
    setIsLoadingBalance(false);
  }, [account, refetchNativeBalance, callContract]);

  // Update balances only for pools in active chain
  useEffect(() => {
    if (!account) return;
    if (status !== 'connected') return;

    const poolAliases = availablePools.map(p => p.alias);

    Promise.all(poolAliases.map(poolAlias => updateBalance(poolAlias)))
      .catch(error => {
        console.error('Error updating pool balances:', error);
      });
  }, [account, updateBalance, availablePools, status]);

  // Wrapper for backward compatibility: if no poolAlias provided, update current pool
  const updateBalanceWrapper = useCallback(async (poolAlias) => {
    const targetPool = poolAlias || currentPool.alias;
    return updateBalance(targetPool);
  }, [updateBalance, currentPool.alias]);

  return (
    <TokenBalanceContext.Provider
      value={{
        balance, // Current pool balance (computed)
        nativeBalance, // Current pool native balance (computed)
        balances, // All pools balances (object keyed by poolAlias)
        nativeBalances, // All pools native balances (object keyed by poolAlias)
        updateBalance: updateBalanceWrapper,
        isLoadingBalance: isLoadingBalance,
      }}>
      {children}
    </TokenBalanceContext.Provider>
  );
};
