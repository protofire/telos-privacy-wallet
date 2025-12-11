import React, { useContext } from 'react';
import { ThemeProvider } from 'styled-components';
import ThemeContext from 'contexts/ThemeContext';
import { light, dark } from './ThemeConstants';

export default ({ children }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <ThemeProvider theme={theme === 'dark' ? dark : light}>
      {children}
    </ThemeProvider>
  );
};
