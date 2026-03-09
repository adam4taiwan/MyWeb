'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

const navItems = [
  { href: '/admin',           label: '總覽'     },
  { href: '/admin/users',     label: '會員管理' },
  { href: '/admin/atm',       label: 'ATM 審核' },
  { href: '/admin/knowledge', label: '命理知識庫' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5013/api'
    : 'https://ecanapi.fly.dev/api';

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    fetch(`${API_URL}/Admin/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.ok) {
          setVerified(true);
        } else {
          router.replace('/');
        }
      })
      .catch(() => router.replace('/'))
      .finally(() => setChecking(false));
  }, [token, isAuthenticated, API_URL, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500">
        驗證管理員身份中...
      </div>
    );
  }

  if (!verified) return null;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-52 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-700">
          <p className="text-xs text-gray-400 mb-0.5">玉洞子</p>
          <p className="font-bold text-amber-400">後台管理</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-5 py-3 text-sm transition-colors ${
                  active
                    ? 'bg-amber-600 text-white font-medium'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-gray-700">
          <Link href="/" className="text-xs text-gray-400 hover:text-white transition-colors">
            返回前台
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
