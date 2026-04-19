'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';

interface Stats {
  totalUsers: number;
  totalPointsSold: number;
  pendingAtm: number;
  pendingBookings: number;
  pendingReports?: number;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5013/api'
    : 'https://ecanapi.fly.dev/api';

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API_URL}/Admin/stats`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
      fetch(`${API_URL}/Reports/admin/list?status=pending_review`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
    ]).then(([statsData, reportsData]) => {
      if (statsData) {
        setStats({ ...statsData, pendingReports: Array.isArray(reportsData) ? reportsData.length : 0 });
      }
    });
  }, [token, API_URL]);

  const cards = [
    { label: '總會員數', value: stats?.totalUsers ?? '---', unit: '人', href: '/admin/users' },
    { label: '已售點數', value: stats?.totalPointsSold ?? '---', unit: '點', href: null },
    { label: '待審 ATM', value: stats?.pendingAtm ?? '---', unit: '筆', href: '/admin/atm', urgent: (stats?.pendingAtm ?? 0) > 0 },
    { label: '待處理預約', value: stats?.pendingBookings ?? '---', unit: '筆', href: '/admin/bookings', urgent: (stats?.pendingBookings ?? 0) > 0 },
    { label: '待審命書', value: stats?.pendingReports ?? '---', unit: '份', href: '/admin/reports', urgent: (stats?.pendingReports ?? 0) > 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">總覽</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {cards.map(card => (
          <div
            key={card.label}
            className={`bg-white rounded-xl p-6 shadow-sm border ${
              card.urgent ? 'border-amber-400' : 'border-gray-100'
            }`}
          >
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className={`text-4xl font-bold ${card.urgent ? 'text-amber-600' : 'text-gray-800'}`}>
              {card.value}
              <span className="text-base font-normal text-gray-400 ml-1">{card.unit}</span>
            </p>
            {card.href && (
              <Link href={card.href} className="text-xs text-amber-600 hover:underline mt-2 inline-block">
                前往處理
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Link href="/admin/users">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-amber-300 transition-colors cursor-pointer">
            <h2 className="font-bold text-gray-700 mb-1">會員管理</h2>
            <p className="text-sm text-gray-500">查詢會員、修改資料、強制改密碼、手動調整點數</p>
          </div>
        </Link>
        <Link href="/admin/atm">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-amber-300 transition-colors cursor-pointer">
            <h2 className="font-bold text-gray-700 mb-1">ATM 審核</h2>
            <p className="text-sm text-gray-500">審核會員 ATM 轉帳申請，批准後自動入帳點數</p>
          </div>
        </Link>
        <Link href="/admin/reports">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-amber-300 transition-colors cursor-pointer">
            <h2 className="font-bold text-gray-700 mb-1">命書審核</h2>
            <p className="text-sm text-gray-500">審閱用戶申請的命書，核准後自動發送 Email 下載連結</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
