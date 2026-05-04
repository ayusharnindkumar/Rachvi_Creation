'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '@/types';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('rc_token');
    const storedUser = localStorage.getItem('rc_user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        authAPI.getMe().then((res) => {
          setUser(res.data.user);
          localStorage.setItem('rc_user', JSON.stringify(res.data.user));
        }).catch(() => {
          // Token invalid - clear
          localStorage.removeItem('rc_token');
          localStorage.removeItem('rc_user');
          setUser(null);
        });
      } catch {
        localStorage.removeItem('rc_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data;
      localStorage.setItem('rc_token', token);
      localStorage.setItem('rc_user', JSON.stringify(user));
      setUser(user);
      toast.success(`Welcome back, ${user.name}! 🕯️`);
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; phone?: string }): Promise<boolean> => {
    try {
      const res = await authAPI.register(data);
      const { token, user } = res.data;
      localStorage.setItem('rc_token', token);
      localStorage.setItem('rc_user', JSON.stringify(user));
      setUser(user);
      toast.success(`Welcome to Rachvi Creation, ${user.name}! 🕯️`);
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rc_token');
    localStorage.removeItem('rc_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('rc_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
