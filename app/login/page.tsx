'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // API_BASE_URL 邏輯
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/auth`  // 雲端：https://ecanapi.fly.dev/api/auth
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'http://localhost:5013/api/auth'       // 本地開發
      : 'https://ecanapi.fly.dev/api/auth';      // 雲端保底 (避免環境變數失效)

  // 已登入用戶重定向到首頁
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isRegister ? 'register' : 'login';
    const body = isRegister ? { name, email, password } : { email, password };

    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegister) {
          setError('註冊成功！請使用新帳號登入。');
          setIsRegister(false);
          setName('');
          setEmail('');
          setPassword('');
        } else if (data.token) {
          // ✅ 只通過 AuthContext.login() 統一處理 Token (存入 Cookies)
          // 同時保存必要數據到 localStorage
          localStorage.setItem('email', email);
          const uid = data.userId || data.id || 'user_standard';
          localStorage.setItem('userId', uid);

          // 調用 login 函數 - 會自動存入 Cookies 並重定向
          login(data.token);
        }
      } else {
        setError(data.message || '操作失敗，請檢查資料。');
      }
    } catch (err) {
      console.error("API 連線錯誤:", err);
      setError('連線錯誤，請檢查網路或 API 狀態。');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-brand-300/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-brand-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-serif font-bold text-brand-900">
            {isRegister ? '會員註冊' : '會員登入'}
          </h2>
          <p className="text-sm text-gray-600">
            {isRegister ? '加入 玉洞子古學堂 開始您的命理之旅' : '登入會員帳號'}
          </p>
        </div>

        {error && (
          <div className={`p-3 border rounded-lg text-sm text-center ${
            error.includes('成功')
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isRegister}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-300 focus:border-brand-300 outline-none transition"
                placeholder="您的姓名"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-300 focus:border-brand-300 outline-none transition"
              placeholder="您的 Email"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-300 focus:border-brand-300 outline-none transition"
              placeholder="至少 6 位數"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-250 transform ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-brand-300 hover:bg-brand-400 active:scale-95 text-brand-900'
            }`}
          >
            {isLoading ? '處理中...' : (isRegister ? '立即註冊' : '登入帳號')}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-600">或</span>
          </div>
        </div>

        <div className="text-center space-y-3">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setName('');
              setEmail('');
              setPassword('');
            }}
            disabled={isLoading}
            className="w-full text-brand-300 hover:text-brand-400 font-medium transition disabled:opacity-50"
          >
            {isRegister ? '已有帳號？前往登入' : '還沒有帳號？前往註冊'}
          </button>

          <Link href="/" className="block">
            <button
              type="button"
              className="w-full px-4 py-2 text-brand-600 border border-brand-200 hover:bg-brand-50 rounded-lg transition disabled:opacity-50"
            >
              返回首頁
            </button>
          </Link>
        </div>

        {/* Trust signal */}
        <div className="pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            ✓ 安全的銀行轉帳付款 | ✓ 7 天無條件退款 | ✓ 專業客服支持
          </p>
        </div>
      </div>
    </div>
  );
}
