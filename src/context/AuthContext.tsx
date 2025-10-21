import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

type AuthContextType = {
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  token: null,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await SecureStore.getItemAsync('user_token');
      if (savedToken) setToken(savedToken);
    };
    loadToken();
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    await SecureStore.setItemAsync('user_token', newToken);
  };

  const logout = async () => {
    setToken(null);
    await SecureStore.deleteItemAsync('user_token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
