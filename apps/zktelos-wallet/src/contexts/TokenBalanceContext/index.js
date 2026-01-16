import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { ethers } from 'ethers';
import * as Sentry from '@sentry/react';

import { PoolContext, WalletContext } from 'contexts';

import { showLoadingError } from 'utils';
import tokenAbi from 'abis/token.json';
import config from 'config';

const TokenBalanceContext = createContext({ balance: null });

export default TokenBalanceContext;

const pools = Object.entries(config.pools).map(
  ([poolAlias, poolConfig]) => ({
    poolAlias,
    tokenAddress: poolConfig.tokenAddress,
  })
);

export const TokenBalanceContextProvider = ({ children }) => {
  const { address: account, refetchNativeBalance, callContract } = useContext(WalletContext);
  const { currentPool } = useContext(PoolContext);
  const [balances, setBalances] = useState(
    pools.reduce((acc, { poolAlias }) => {
      acc[poolAlias] = ethers.constants.Zero;
      return acc;
    }, {})
  );
  const [nativeBalance, setNativeBalance] = useState(ethers.constants.Zero);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Computed values pointing to current pool
  const balance = useMemo(() => account ? balances[currentPool.alias] : ethers.constants.Zero, [balances, currentPool.alias, account]);

  const updateBalance = useCallback(async () => {
    if (!account) return;

    setIsLoadingBalance(true);
    try {
      const results = await Promise.all(
        pools.map(async ({ poolAlias, tokenAddress }) => {
          const balance = await callContract(
            tokenAddress,
            tokenAbi,
            'balanceOf',
            [account]
          );

          return { poolAlias, balance };
        })
      );

      const nextBalances = results.reduce((acc, { poolAlias, balance }) => {
        acc[poolAlias] = balance;
        return acc;
      }, {});

      setBalances((prev) => ({
        ...prev,
        ...nextBalances,
      }));
    } catch (error) {
      Sentry.captureException(error, { tags: { method: 'TokenBalanceContext.updateTokenBalances' } });
      showLoadingError('walletBalance');
    }

    try {
      const nativeBalance = await refetchNativeBalance();
      setNativeBalance(nativeBalance);
    } catch (error) {
      Sentry.captureException(error, { tags: { method: 'TokenBalanceContext.updateNativeBalance' } });
      showLoadingError('walletBalance');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [account, refetchNativeBalance, callContract]);

  // Update balances when account changes
  useEffect(() => {
    if (!account) return;
    updateBalance();
  }, [account, updateBalance]);

  return (
    <TokenBalanceContext.Provider
      value={{
        balance, // Current pool balance (computed)
        nativeBalance, // Native balance (computed)
        balances,
        updateBalance,
        isLoadingBalance: isLoadingBalance,
      }}>
      {children}
    </TokenBalanceContext.Provider>
  );
};
