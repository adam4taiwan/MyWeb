'use client';

// ... 保持其他 import 不變
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation'; 
import Cookies from 'js-cookie'; 

// 1. 定義 Context 類型 (保持不變)
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 【關鍵修改點】：定義受保護的路由
// 將首頁 '/' 移除，只保留需要會員才能訪問的頁面。
const protectedRoutes = ['/disk']; 
// 如果您未來有其他會員頁面，如 '/profile' 或 '/dashboard'，也請加在這裡。

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); 
  const router = useRouter();
  const pathname = usePathname();

  // 2. 初始化：檢查 Cookie 中是否有 Token (保持不變)
  useEffect(() => {
    const storedToken = Cookies.get('jwtToken');
    
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []); 

  // 3. 路由守衛邏輯 (修正後)
  useEffect(() => {
    if (loading) return; 
    
    // 檢查當前路徑是否為受保護頁面
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // 情況 A: 嘗試訪問受保護頁面 (如 /charts) 但未認證，強制導向 /login
    if (!isAuthenticated && isProtectedRoute) {
        router.replace('/login');
    }
    
    // 情況 B: 已認證，但停留在 /login，則導向 /
    if (isAuthenticated && pathname === '/login') {
        router.replace('/');
    }
    // 情況 C: 如果未認證且不是受保護路徑，則正常顯示頁面 (例如：/、/heritage)
    
  }, [isAuthenticated, loading, pathname, router]);

  // 4. 登入處理函數 (保持不變)
  const login = (jwtToken: string) => {
    Cookies.set('jwtToken', jwtToken, { expires: 7, secure: process.env.NODE_ENV === 'production' });
    setToken(jwtToken);
    setIsAuthenticated(true);
    router.push('/'); 
  };

  // 5. 登出處理函數 (保持不變)
  const logout = () => {
    Cookies.remove('jwtToken');
    setToken(null);
    setIsAuthenticated(false);
    // 登出後導向首頁，因為首頁已公開
    router.push('/'); 
  };
  
  // 顯示加載或等待導向的 UI
  // 只有在訪問受保護路徑且未認證時才顯示 loading screen
  if (loading || (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route)))) {
      return (
        <div className="min-h-screen flex items-center justify-center text-xl text-amber-600 bg-gray-50">
          會員狀態驗證中...
        </div>
      );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. 自定義 Hook (保持不變)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};