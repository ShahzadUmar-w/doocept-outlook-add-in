import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'white',  // Default theme
  setTheme: (__theme: string) => {}, // Placeholder function
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    // Initialize theme from localStorage, or use default ('white')
    const storedTheme = localStorage.getItem('app-theme');
    return storedTheme || 'white';
  });

  // Function to update theme and localStorage
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  useEffect(() => {
    // This useEffect will run whenever `theme` changes
    // It's a good place to save the theme to localStorage
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);