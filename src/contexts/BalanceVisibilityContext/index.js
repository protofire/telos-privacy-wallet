import { createContext, useState, useCallback, useMemo } from 'react';

const BalanceVisibilityContext = createContext({ isVisible: true, toggleVisibility: () => { } });

export default BalanceVisibilityContext;

export const BalanceVisibilityProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const contextValue = useMemo(() => ({ isVisible, toggleVisibility }), [isVisible, toggleVisibility]);

  return (
    <BalanceVisibilityContext.Provider value={contextValue}>
      {children}
    </BalanceVisibilityContext.Provider>
  );
};

