// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api'; 

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, surname: string, phone: string, password: string) => Promise<void>;
  refetchUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setAuthTokens = (tokens: { access: string; refresh: string }) => {
  localStorage.setItem('accessToken', tokens.access);
  localStorage.setItem('refreshToken', tokens.refresh);
};

const removeAuthTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('anotUser');
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const userData = await api.get('/profile/');
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('anotUser', JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (phone: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.post('/login/', { phone, password });
      setAuthTokens(response);
      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem('anotUser', JSON.stringify(response.user));
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const register = async (name: string, surname: string, phone: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await api.post('/register/', { name, surname, phone, password, role: UserRole.CLIENT });
      await login(phone, password);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    removeAuthTokens();
    setUser(null);
    setIsAuthenticated(false);
  };
  
  const refetchUser = () => {
      if(isAuthenticated) {
          fetchUser();
      }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, register, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};