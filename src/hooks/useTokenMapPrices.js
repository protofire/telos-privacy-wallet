import { useContext } from 'react';
import TokenPriceMapContext from 'contexts/TokenPriceMapContext';

export default function useTokenMapPrices() {
  const context = useContext(TokenPriceMapContext);

  if (!context) {
    throw new Error('useTokenMapPrices must be used within TokenPriceMapProvider');
  }

  return context;
};