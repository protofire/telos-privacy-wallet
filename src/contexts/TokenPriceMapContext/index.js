import { createContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as Sentry from '@sentry/react';


const TokenPriceMapContext = createContext({ priceMap: null, isLoading: false, refetch: () => { } });

export default TokenPriceMapContext;

const symbols = ["ETH", "USDC", "TLOS"];
const baseUrl = "https://api.diadata.org/v1/quotation";
const refreshInterval = 30_000; // 30 seconds

export const TokenPriceMapProvider = ({ children }) => {
  const [priceMap, setPriceMap] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  const fetchPrices = useCallback(async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);

      const urls = symbols.map(symbol => `${baseUrl}/${symbol}`);
      const data = await Promise.all(
        urls.map(url =>
          fetch(url, { signal: abortControllerRef.current.signal })
            .then(res => res.json())
        )
      );

      setPriceMap(new Map(data.map(item => [item.Symbol, item.Price])));
    } catch (error) {
      console.error(error);
      Sentry.captureException(error, { tags: { method: 'TokenPriceContext.getTokenPrice' } });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchPrices();
  }, [fetchPrices]);


  useEffect(() => {
    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, refreshInterval);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [fetchPrices]);

  const contextValue = useMemo(() => ({ priceMap, isLoading, refetch }), [priceMap, isLoading, refetch]);

  return (
    <TokenPriceMapContext.Provider value={contextValue}>
      {children}
    </TokenPriceMapContext.Provider>
  );
};