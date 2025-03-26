import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  isDarkMode: false,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on client-side
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    setMounted(true);
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      
      root.classList.add(systemTheme);
      setIsDarkMode(systemTheme === 'dark');
      return;
    }
    
    root.classList.add(theme);
    setIsDarkMode(theme === 'dark');
  }, [theme, mounted]);

  const toggleTheme = () => {
    if (!mounted) return;
    
    setTheme((prevTheme) => {
      // If system preference, toggle based on current appearance
      if (prevTheme === 'system') {
        const newTheme = isDarkMode ? 'light' : 'dark';
        localStorage.setItem(storageKey, newTheme);
        return newTheme;
      }
      
      // If already light/dark, toggle directly
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem(storageKey, newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    if (!mounted) return;
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setIsDarkMode(mediaQuery.matches);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(
          mediaQuery.matches ? 'dark' : 'light'
        );
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
    isDarkMode,
    toggleTheme,
  };

  // Prevent flash of wrong theme while the page loads
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {mounted ? children : null}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  
  return context;
}; 