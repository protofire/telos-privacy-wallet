import { useContext } from 'react';
import TokenPriceLiQuestContext from 'contexts/TokenPriceLiQuestContext';

export default function useTokenPrices() {
  const context = useContext(TokenPriceLiQuestContext);

  if (!context) {
    throw new Error('useTokenMapPrices must be used within TokenPriceLiQuestProvider');
  }

  return context;
};