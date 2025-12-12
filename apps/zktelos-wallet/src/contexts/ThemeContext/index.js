import { createContext, useState, useCallback, useMemo, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  themePreference: 'system',
  setThemePreference: () => { },
  toggleTheme: () => { }
});

export default ThemeContext;

export const ThemeProvider = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState(() => {
    return localStorage.getItem('theme-preference') || 'system';
  });
  const [theme, setTheme] = useState('light');

  const setThemePreference = useCallback((newPreference) => {
    setThemePreferenceState(newPreference);
    localStorage.setItem('theme-preference', newPreference);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      setThemePreference(newTheme);
      return newTheme;
    });
  }, [setThemePreference]);

  useEffect(() => {
    if (themePreference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => setTheme(e.matches ? 'dark' : 'light');

      setTheme(mediaQuery.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setTheme(themePreference);
    }
  }, [themePreference]);


  const contextValue = useMemo(() => ({
    theme,
    themePreference,
    setThemePreference,
    toggleTheme
  }), [theme, themePreference, setThemePreference, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
