import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, JwtResponse } from '../services/api';

interface AuthContextType {
  user: {
    email: string;
    userType: string;
    userId: number;
  } | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, number: string, userType: 'ADMIN' | 'HELPER' | 'NEEDY', password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string; userType: string; userId: number } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненный токен при загрузке
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: JwtResponse = await apiService.login({ email, password });
      setToken(response.token);
      setUser({
        email: response.email,
        userType: response.userType,
        userId: response.userId,
      });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        email: response.email,
        userType: response.userType,
        userId: response.userId,
      }));
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    email: string,
    number: string,
    userType: 'ADMIN' | 'HELPER' | 'NEEDY',
    password: string
  ) => {
    try {
      await apiService.register({ email, number, userType, password });
      // После регистрации автоматически лог
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
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

