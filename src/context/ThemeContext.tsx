import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type ThemeContextType = {
    isNight: boolean;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
    isNight: false,
    toggleTheme: () => { },
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isNight, setIsNight] = useState(false);

    const toggleTheme = () => setIsNight(prev => !prev);

    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem('isNight');
            if (saved !== null) setIsNight(JSON.parse(saved));
        })();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem('isNight', JSON.stringify(isNight));
    }, [isNight]);


    return (
        <ThemeContext.Provider value={{ isNight, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook pratique pour y accéder facilement
export const useTheme = () => useContext(ThemeContext);
