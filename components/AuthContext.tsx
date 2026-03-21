'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

interface UserInfo {
  name: string | null;
  email: string | null;
  userId: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
  user: UserInfo | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const protectedRoutes = ['/disk', '/member', '/admin', '/blessing', '/appointment'];

function decodeJwtPayload(token: string): Record<string, string> | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function buildUserInfo(jwtToken: string): UserInfo {
  const payload = decodeJwtPayload(jwtToken);
  // ASP.NET Identity JWT 使用完整 claim URI 或短名稱
  const email =
    localStorage.getItem('email') ||
    payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    payload?.email ||
    null;
  const name =
    localStorage.getItem('userName') ||
    payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
    payload?.unique_name ||
    payload?.name ||
    null;
  const userId =
    localStorage.getItem('userId') ||
    payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
    payload?.nameid ||
    payload?.sub ||
    null;
  return { name, email, userId };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = Cookies.get('jwtToken');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      setUser(buildUserInfo(storedToken));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    if (!isAuthenticated && isProtectedRoute) {
      router.replace('/login');
    }
    if (isAuthenticated && pathname === '/login') {
      router.replace('/');
    }
  }, [isAuthenticated, loading, pathname, router]);

  const login = (jwtToken: string) => {
    Cookies.set('jwtToken', jwtToken, { expires: 7, secure: process.env.NODE_ENV === 'production' });
    setToken(jwtToken);
    setIsAuthenticated(true);
    setUser(buildUserInfo(jwtToken));
    router.push('/');
  };

  const logout = () => {
    Cookies.remove('jwtToken');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-amber-600 bg-gray-50">
        會員狀態驗證中...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, token, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
