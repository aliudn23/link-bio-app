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
    
    // Load user from localStorage after mount to avoid hydration mismatch
    const checkAuth = async () => {
      try {
        const token = auth.getToken();

        console.log('Auth token on mount:', token);
        if (token) {
          // Try to get cached user first
          const savedUser = localStorage.getItem('user');

          console.log('Saved user from localStorage:', savedUser);
          if (savedUser) {
            try {
              const cachedUser = JSON.parse(savedUser);
              setUser(cachedUser);
              setIsLoading(false);
              return; // Use cached user, no need to fetch
            } catch (e) {
              localStorage.removeItem('user');
            }
          }
          
          // No cached user, fetch from API
          const { user: fetchedUser } = await auth.getProfile();
          setUser(fetchedUser);
          localStorage.setItem('user', JSON.stringify(fetchedUser));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        auth.removeToken();
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        console.log('Auth check completed');
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);
      auth.setToken(response.token);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await auth.register(email, password, name);
      auth.setToken(response.token);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    auth.removeToken();
    setUser(null);
    localStorage.removeItem('user');
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