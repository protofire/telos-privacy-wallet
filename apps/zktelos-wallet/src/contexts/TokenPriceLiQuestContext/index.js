import { createContext, useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import * as Sentry from '@sentry/react';

import { PoolContext } from 'contexts';

const TokenPriceLiQuestContext = createContext({ priceMap: null, isLoading: false, refetch: () => { } });

export default TokenPriceLiQuestContext;

const tokens = [
  { address: "0x0000000000000000000000000000000000000000", symbol: "ETH" },
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC" },
  { address: "0x193f4A4a6ea24102F49b931DEeeb931f6E32405d", symbol: "TLOS" },
  { address: "0x193f4A4a6ea24102F49b931DEeeb931f6E32405d", symbol: "WTLOS" },
];
const baseUrl = "https://li.quest/v1/token";
const refreshInterval = 30_000;

const getChainId = (chainId) => {
  if (chainId === 40 || chainId === 41) {
    return 1;
  }
  return chainId;
};

export const TokenPriceLiQuestProvider = ({ children }) => {
  const { currentPool } = useContext(PoolContext);
  const [priceMap, setPriceMap] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  const fetchPrices = useCallback(async () => {
    if (!currentPool) return;

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);

      const chainId = getChainId(currentPool.chainId);
      const signal = abortControllerRef.current.signal;

      const pricePromises = tokens.map(async ({ address, symbol }) => {
        const url = `${baseUrl}?chain=${chainId}&token=${address}`;
        const response = await fetch(url, { signal });
        const data = await response.json();
        return { symbol, price: data.priceUSD ? parseFloat(data.priceUSD) : null };
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

  const refetch = useCallback(() => {
    return fetchPrices();
  }, [fetchPrices]);

  useEffect(() => {
    if (!currentPool) return;

    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPrices, currentPool]);

  const contextValue = useMemo(() => ({ priceMap, isLoading, refetch }), [priceMap, isLoading, refetch]);

  return (
    <TokenPriceLiQuestContext.Provider value={contextValue}>
      {children}
    </TokenPriceLiQuestContext.Provider>
  );
};