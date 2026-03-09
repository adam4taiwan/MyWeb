'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';

type StatusFilter = 'pending' | 'approved' | 'rejected' | '';

interface AtmRequest {
  id: number;
  userId: string;
  userEmail: string;
  userName: string;
  packageId: string;
  points: number;
  priceTwd: number;
  transferDate: string;
  accountLast5: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
}

const PACKAGE_LABELS: Record<string, string> = {
  starter:  '入門 50點',
  popular:  '推薦 150點',
  advanced: '進階 400點',
  vip:      'VIP 1000點',
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:  { label: '待審核', cls: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '已批准', cls: 'bg-green-100  text-green-700'  },
  rejected: { label: '已拒絕', cls: 'bg-red-100    text-red-600'    },
};

export default function AdminAtmPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<AtmRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5013/api'
    : 'https://ecanapi.fly.dev/api';

  const fetchRequests = useCallback(async (status: StatusFilter) => {
    if (!token) return;
    setLoading(true);
    try {
      const url = `${API_URL}/Admin/atm-requests${status ? `?status=${status}` : ''}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setRequests(await res.json());
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => { fetchRequests(statusFilter); }, [fetchRequests, statusFilter]);

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (action === 'reject' && !note.trim()) {
      showMsg('拒絕時必須填寫備註原因', false); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/Admin/atm-requests/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(data.message, true);
        setActionId(null);
        setNote('');
        fetchRequests(statusFilter);
      } else {
        showMsg(data.message || '操作失敗', false);
      }
    } finally {
      setLoading(false);
    }
  };

  const filters: { value: StatusFilter; label: string }[] = [
    { value: 'pending',  label: '待審核' },
    { value: 'approved', label: '已批准' },
    { value: 'rejected', label: '已拒絕' },
    { value: '',         label: '全部'   },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ATM 轉帳審核</h1>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <div className="flex gap-2 mb-5">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-400">載入中...</div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-gray-400">無申請記錄</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {requests.map(r => (
              <div key={r.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-800">{r.userName}</span>
                      <span className="text-sm text-gray-500">{r.userEmail}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[r.status]?.cls ?? ''}`}>
                        {STATUS_LABELS[r.status]?.label ?? r.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>套餐：<strong className="text-amber-600">{PACKAGE_LABELS[r.packageId] ?? r.packageId}</strong></span>
                      <span>金額：<strong>NT${r.priceTwd.toLocaleString()}</strong></span>
                      <span>轉帳日期：{r.transferDate}</span>
                      <span>帳號後5碼：<strong>{r.accountLast5}</strong></span>
                    </div>
                    <p className="text-xs text-gray-400">
                      申請時間：{new Date(r.createdAt).toLocaleString('zh-TW')}
                      {r.processedAt && ` | 處理時間：${new Date(r.processedAt).toLocaleString('zh-TW')}`}
                    </p>
                    {r.adminNote && (
                      <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">備註：{r.adminNote}</p>
                    )}
                  </div>

                  {r.status === 'pending' && (
                    <div className="flex-shrink-0">
                      {actionId === r.id ? (
                        <div className="space-y-2 min-w-48">
                          <input
                            type="text"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="備註（拒絕時必填）"
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-300 outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(r.id, 'approve')}
                              disabled={loading}
                              className="flex-1 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                            >
                              批准入帳
                            </button>
                            <button
                              onClick={() => handleAction(r.id, 'reject')}
                              disabled={loading}
                              className="flex-1 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors font-medium"
                            >
                              拒絕
                            </button>
                            <button
                              onClick={() => { setActionId(null); setNote(''); }}
                              className="px-2 py-1.5 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActionId(r.id)}
                          className="px-4 py-2 bg-amber-600 text-white text-xs rounded-lg hover:bg-amber-700 transition-colors font-medium"
                        >
                          審核
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
