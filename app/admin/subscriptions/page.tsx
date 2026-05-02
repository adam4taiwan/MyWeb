'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';

interface Subscription {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  planCode: string;
  planName: string;
  status: string;
  startDate: string;
  expiryDate: string;
  paymentRef: string | null;
  createdAt: string;
  daysLeft: number;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active:    { label: '有效',   cls: 'bg-green-100 text-green-700' },
  expired:   { label: '已到期', cls: 'bg-gray-100  text-gray-500'  },
  cancelled: { label: '已取消', cls: 'bg-red-100   text-red-600'   },
};

const PLAN_LABELS: Record<string, string> = {
  BRONZE: '銅會員',
  SILVER: '銀會員',
  GOLD:   '金會員',
};

export default function AdminSubscriptionsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('active');
  const [planFilter, setPlanFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [extendDays, setExtendDays] = useState(30);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5013/api'
    : 'https://ecanapi.fly.dev/api';

  const fetchSubs = useCallback(async (p: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (statusFilter) params.set('status', statusFilter);
      if (planFilter) params.set('planCode', planFilter);
      const res = await fetch(`${API_URL}/Admin/subscriptions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [token, API_URL, statusFilter, planFilter]);

  useEffect(() => { setPage(1); fetchSubs(1); }, [statusFilter, planFilter]);
  useEffect(() => { fetchSubs(page); }, [page]);

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleExtend = async (id: number) => {
    const res = await fetch(`${API_URL}/Admin/subscriptions/${id}/extend`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: extendDays }),
    });
    const data = await res.json();
    if (res.ok) { showMsg(data.message, true); fetchSubs(page); }
    else showMsg(data.message || '操作失敗', false);
    setActionId(null);
  };

  const handleCancel = async (id: number) => {
    if (!confirm('確定要取消此訂閱？')) return;
    const res = await fetch(`${API_URL}/Admin/subscriptions/${id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) { showMsg(data.message, true); fetchSubs(page); }
    else showMsg(data.message || '操作失敗', false);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">訂閱管理</h1>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">全部狀態</option>
          <option value="active">有效</option>
          <option value="expired">已到期</option>
          <option value="cancelled">已取消</option>
        </select>
        <select
          value={planFilter}
          onChange={e => setPlanFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">全部套餐</option>
          <option value="BRONZE">銅會員</option>
          <option value="SILVER">銀會員</option>
          <option value="GOLD">金會員</option>
        </select>
        <span className="text-sm text-gray-500 self-center">共 {total} 筆</span>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">載入中...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">會員</th>
                <th className="px-4 py-3 text-left">套餐</th>
                <th className="px-4 py-3 text-left">開始日</th>
                <th className="px-4 py-3 text-left">到期日</th>
                <th className="px-4 py-3 text-left">狀態</th>
                <th className="px-4 py-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(sub => {
                const expiringSoon = sub.status === 'active' && sub.daysLeft <= 7 && sub.daysLeft >= 0;
                return (
                  <tr key={sub.id} className={expiringSoon ? 'bg-amber-50' : ''}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{sub.userName || '未知'}</p>
                      <p className="text-xs text-gray-400">{sub.userEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{PLAN_LABELS[sub.planCode] ?? sub.planCode}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(sub.startDate).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={expiringSoon ? 'text-amber-600 font-medium' : 'text-gray-600'}>
                        {new Date(sub.expiryDate).toLocaleDateString('zh-TW')}
                      </span>
                      {expiringSoon && (
                        <span className="ml-1 text-xs text-amber-500">({sub.daysLeft}天後到期)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_LABELS[sub.status]?.cls ?? 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_LABELS[sub.status]?.label ?? sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {actionId === sub.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={extendDays}
                            onChange={e => setExtendDays(Number(e.target.value))}
                            min={1}
                            max={730}
                            className="w-16 border border-gray-300 rounded px-2 py-1 text-xs"
                          />
                          <span className="text-xs text-gray-500">天</span>
                          <button
                            onClick={() => handleExtend(sub.id)}
                            className="text-xs bg-amber-500 text-white px-2 py-1 rounded hover:bg-amber-600"
                          >
                            確認
                          </button>
                          <button
                            onClick={() => setActionId(null)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setActionId(sub.id); setExtendDays(30); }}
                            className="text-xs text-amber-600 hover:underline"
                          >
                            展期
                          </button>
                          {sub.status === 'active' && (
                            <button
                              onClick={() => handleCancel(sub.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              取消
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">無資料</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex gap-2 mt-4 justify-end">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-40"
          >
            上一頁
          </button>
          <span className="text-sm text-gray-600 self-center">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-40"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
}
