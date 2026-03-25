"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeContextType = {
    theme: 'light' | 'dark';
    changeTheme: (theme: 'light' | 'dark') => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    changeTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // İlk yüklemede temayı ayarla
        const storedTheme = (localStorage.getItem('novatrum_theme') as 'light' | 'dark') || 'light';
        setTheme(storedTheme);
        applyTheme(storedTheme);

        // MUHTEŞEM ÖZELLİK: Farklı bir sekmede tema değişirse bu sekmeyi de anında güncelle
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'novatrum_theme' && e.newValue) {
                setTheme(e.newValue as 'light' | 'dark');
                applyTheme(e.newValue as 'light' | 'dark');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const applyTheme = (newTheme: 'light' | 'dark') => {
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const changeTheme = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        localStorage.setItem('novatrum_theme', newTheme);
        applyTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);