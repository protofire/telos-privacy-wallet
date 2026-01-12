import { createContext, useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import * as Sentry from '@sentry/react';
import { getToken } from '@lifi/sdk';

import { PoolContext } from 'contexts';

const TokenPriceLiQuestContext = createContext({ priceMap: null, isLoading: false, refetch: () => { } });

export default TokenPriceLiQuestContext;

// TODO: Since TLOS is not supported in LiFi SDK we are getting prices from Ethereum.
// When LiFi adds TELOS support, change ETHEREUM_CHAIN_ID to TELOS chain ID.
const ETHEREUM_CHAIN_ID = 1;

const tokens = [
  { address: "0x0000000000000000000000000000000000000000", symbol: "ETH" },
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC.e" },
  { address: "0x193f4A4a6ea24102F49b931DEeeb931f6E32405d", symbol: "TLOS" },
];

const REFRESH_INTERVAL_MS = 30_000;

export const TokenPriceLiQuestProvider = ({ children }) => {
  const { currentPool } = useContext(PoolContext);
  const [priceMap, setPriceMap] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  const fetchPrices = useCallback(async () => {
    if (!currentPool) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);

    try {
      const pricePromises = tokens.map(async ({ address, symbol }) => {
        const tokenInfo = await getToken(ETHEREUM_CHAIN_ID, address, { signal });
        return { symbol, price: tokenInfo.priceUSD ? parseFloat(tokenInfo.priceUSD) : null };
      });

      const results = await Promise.all(pricePromises);

      const priceMapData = new Map([
        ['PUSD', 1], // Mocked price for ProtoUSD
      ]);

      results.forEach(({ symbol, price }) => {
        if (price !== null) {
          priceMapData.set(symbol, price);
        }
      });

      setPriceMap(priceMapData);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
        Sentry.captureException(error, { tags: { method: 'TokenPriceLiQuestContext.fetchPrices' } });
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPool]);

  const refetch = useCallback(() => fetchPrices(), [fetchPrices]);

  useEffect(() => {
    if (!currentPool) return;

    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchPrices, currentPool]);

  const contextValue = useMemo(() => ({ priceMap, isLoading, refetch }), [priceMap, isLoading, refetch]);

  return (
    <TokenPriceLiQuestContext.Provider value={contextValue}>
      {children}
    </TokenPriceLiQuestContext.Provider>
  );
};