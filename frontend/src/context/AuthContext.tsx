import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: str | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  demoLogin: (roleKey: string) => Promise<User>;
  logout: () => void;
}

// Temporary string type helper
type str = string;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('urbanpulse_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('urbanpulse_token');
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      api.getCurrentUser(token)
        .then(u => {
          if (u) {
            setUser(u);
            localStorage.setItem('urbanpulse_user', JSON.stringify(u));
          }
        })
        .catch(() => {
          const saved = localStorage.getItem('urbanpulse_user');
          if (saved) {
            try {
              setUser(JSON.parse(saved));
            } catch {
              logout();
            }
          }
        });
    }
  }, [token, user]);

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login(username, password);
      const userToken = res.token || `demo-token-${Date.now()}`;
      setUser(res);
      setToken(userToken);
      localStorage.setItem('urbanpulse_user', JSON.stringify(res));
      localStorage.setItem('urbanpulse_token', userToken);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (roleKey: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(roleKey);
      const userToken = res.token || `demo-token-${Date.now()}`;
      setUser(res);
      setToken(userToken);
      localStorage.setItem('urbanpulse_user', JSON.stringify(res));
      localStorage.setItem('urbanpulse_token', userToken);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('urbanpulse_user');
    localStorage.removeItem('urbanpulse_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        demoLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
