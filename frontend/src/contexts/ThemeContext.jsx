import { createContext } from "react";
import { useState, useEffect } from "react";

export const ThemeContext = createContext()

const isBrowserDefaultDark = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const defaultTheme = () => {
  const localStorageTheme = JSON.parse(localStorage.getItem('isDark'));
  if (typeof localStorageTheme === 'boolean') {
    return localStorageTheme
  }
  return isBrowserDefaultDark()
};

export const ThemeContextProvider = ({children}) => {
  const [isDark, setIsDark] = useState(defaultTheme())

  const toggleTheme = () => {
    setIsDark(!isDark)
    localStorage.setItem('isDark', JSON.stringify(!isDark));
  }

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]); 

 

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}