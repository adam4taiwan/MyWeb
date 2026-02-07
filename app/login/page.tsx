'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext'; 
import Link from 'next/link';

export default function LoginPage() {
  // *** 請將此處的網址替換為您部署在 Fly.io 上的實際後端網址！ *** 
  //const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:32801/api';
  // 修改後的邏輯：優先使用環境變數，若無則依序判斷
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/auth` 
  : (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'https://localhost:32801/api/auth'  // 本地開發
    : 'https://ecanapi.fly.dev/api/Account'; // 🚩 雲端預設 (並修正為您後端的 AccountController)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  
  if (isAuthenticated) return null; 

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
          setPassword('');
        } else if (data.token) {
          // 🚩 1. 存入 Token (維持原樣)
          localStorage.setItem('token', data.token);
          localStorage.setItem('email', email); // ✅ 新增這行，把登入用的 email 存起來
          // 🚩 2. 關鍵新增：存入 UserId，解決分析與點數同步時的字典錯誤
          // 這裡使用 data.id 是因為您後端現在回傳 return Ok(new { id = session.Id, url = session.Url })
          const uid = data.userId || data.id || "user_standard";
          localStorage.setItem('userId', uid);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-amber-600">
          {isRegister ? '會員註冊' : '會員登入'}
        </h2>
        
        {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
                {error}
            </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700">姓名</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required={isRegister}
                className="w-full px-4 py-2 border rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="您的姓名"
                disabled={isLoading}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-amber-500 focus:border-amber-500"
              placeholder="您的 Email"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">密碼</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              minLength={6}
              className="w-full px-4 py-2 border rounded-lg focus:ring-amber-500 focus:border-amber-500"
              placeholder="至少 6 位數"
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 text-white rounded-lg font-semibold transition-colors ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isLoading ? '處理中...' : (isRegister ? '立即註冊' : '登入帳號')}
          </button>
        </form>
        
        <div className="text-center">
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
            className="text-sm text-amber-600 hover:text-amber-800 disabled:opacity-50"
          >
            {isRegister ? '已有帳號？前往登入' : '還沒有帳號？前往註冊'}
          </button>
        </div>
      </div>
    </div>
  );
}
