'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { auth, User } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (auth.isAuthenticated()) {
        const { user } = await auth.getProfile();
        setUser(user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      auth.removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      checkAuthStatus();
    }
  }, [mounted]);

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);
      auth.setToken(response.token);
      setUser(response.user);
      setIsLoading(false);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await auth.register(email, password, name);
      auth.setToken(response.token);
      setUser(response.user);
      setIsLoading(false);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    auth.removeToken();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  // Prevent hydration mismatch by not rendering children until mounted
  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}