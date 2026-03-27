'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ecanapi.fly.dev/api';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('未收到 Google 授權碼，請重新嘗試。');
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    fetch(`${API_URL}/Auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          if (data.name) localStorage.setItem('userName', data.name);
          login(data.token);
        } else {
          setError(data.message || 'Google 登入失敗，請重試。');
        }
      })
      .catch(() => setError('連線失敗，請重試。'));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          返回登入頁
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-[#4285F4] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 text-sm">Google 登入中，請稍候...</p>
    </div>
  );
}
