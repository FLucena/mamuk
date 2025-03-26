import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 
        // Check system preference on initial load
        window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' 
          : 'light',
      
      toggleTheme: () => 
        set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        })),
      
      setTheme: (theme: Theme) => set({ theme }),
    }),
    {
      name: 'mamuk-theme-storage',
    }
  )
); 