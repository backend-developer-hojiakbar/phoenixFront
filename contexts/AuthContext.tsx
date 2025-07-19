import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import apiService from '../services/apiService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'language'> & { password?: string }) => Promise<void>;
  refetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      if (accessToken && storedUser) {
        try {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          // Optional: Verify token by fetching profile
          await refetchUser();
        } catch (error) {
          console.error("Auth check failed, logging out:", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (phone: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiService.post('/login/', { phone, password });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'language'> & { password?: string }): Promise<void> => {
    setIsLoading(true);
    try {
      await apiService.post('/register/', userData);
      // After successful registration, automatically log the user in
      await login(userData.phone, userData.password || '');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete apiService.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  };
  
  const refetchUser = async () => {
    try {
        const { data } = await apiService.get<User>('/profile/');
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
        console.error('Failed to refetch user, logging out.', error);
        logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, register, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};