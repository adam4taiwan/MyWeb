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

        {/* LINE Login */}
        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams({
              response_type: 'code',
              client_id: '2009616807',
              redirect_uri: `${window.location.origin}/auth/line/callback`,
              state: Math.random().toString(36).slice(2),
              scope: 'profile openid',
            });
            window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params}`;
          }}
          className="w-full flex items-center justify-center gap-3 py-3 bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold rounded-lg transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          用 LINE 登入
        </button>

        {/* Google Login */}
        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams({
              response_type: 'code',
              client_id: '714420332840-id1j3c8cd1anv43shludguaam86pbgt3.apps.googleusercontent.com',
              redirect_uri: `${window.location.origin}/auth/google/callback`,
              scope: 'openid profile email',
              state: Math.random().toString(36).slice(2),
            });
            window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
          }}
          className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors border border-gray-300"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          用 Google 登入
        </button>

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
            ✓ ECPay 安全付款 | ✓ 確認了解再下單 | ✓ LINE 客服支持
          </p>
        </div>
      </div>
    </div>
  );
}
