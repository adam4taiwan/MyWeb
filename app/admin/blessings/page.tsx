'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';

interface Blessing {
  id: number;
  userId: string | null;
  userEmail: string | null;
  serviceType: string;
  serviceCode: string | null;
  name: string;
  contactType: string | null;
  contactInfo: string | null;
  birthDate: string | null;
  isLunar: boolean;
  notes: string | null;
  preferredDate: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:   { label: '待處理', cls: 'bg-amber-100 text-amber-800' },
  confirmed: { label: '已確認', cls: 'bg-blue-100  text-blue-700'  },
  completed: { label: '已完成', cls: 'bg-green-100 text-green-700' },
  cancelled: { label: '已取消', cls: 'bg-gray-100  text-gray-500'  },
};

const SERVICE_LABELS: Record<string, string> = {
  BLESSING_ANTAISUI: '安太歲',
  BLESSING_LIGHT:    '點光明燈',
  BLESSING_WEALTH:   '財神祈福',
  BLESSING_PRAYER:   '祈福消災',
};

export default function AdminBlessingsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Blessing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Blessing | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5013/api'
    : 'https://ecanapi.fly.dev/api';

  const fetchItems = useCallback(async (p: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: 'blessing', page: String(p) });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`${API_URL}/Admin/bookings?${params}`, {
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
  }, [token, API_URL, statusFilter]);

  useEffect(() => { setPage(1); fetchItems(1); }, [statusFilter]);
  useEffect(() => { fetchItems(page); }, [page]);

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleUpdateStatus = async (id: number, status: string, note?: string) => {
    const res = await fetch(`${API_URL}/Admin/bookings/${id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote: note ?? null }),
    });
    const data = await res.json();
    if (res.ok) {
      showMsg('狀態已更新', true);
      fetchItems(page);
      setSelected(null);
    } else {
      showMsg(data.message || '操作失敗', false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">祈福服務管理</h1>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        {(['pending', 'confirmed', 'completed', 'cancelled', ''] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              statusFilter === s
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400'
            }`}
          >
            {s === '' ? '全部' : STATUS_LABELS[s]?.label}
          </button>
        ))}
        <span className="text-sm text-gray-500 self-center ml-auto">共 {total} 筆</span>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">載入中...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">申請人</th>
                <th className="px-4 py-3 text-left">祈福類型</th>
                <th className="px-4 py-3 text-left">生辰</th>
                <th className="px-4 py-3 text-left">聯絡方式</th>
                <th className="px-4 py-3 text-left">申請日</th>
                <th className="px-4 py-3 text-left">狀態</th>
                <th className="px-4 py-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    {item.userEmail && <p className="text-xs text-gray-400">{item.userEmail}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {item.serviceCode
                      ? (SERVICE_LABELS[item.serviceCode] ?? item.serviceCode)
                      : '祈福'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.birthDate
                      ? `${item.birthDate}${item.isLunar ? '（農曆）' : ''}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.contactInfo
                      ? `${item.contactType ? `[${item.contactType}] ` : ''}${item.contactInfo}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(item.createdAt).toLocaleDateString('zh-TW')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_LABELS[item.status]?.cls ?? 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_LABELS[item.status]?.label ?? item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setSelected(item); setNoteInput(item.adminNote ?? ''); }}
                      className="text-xs text-amber-600 hover:underline"
                    >
                      處理
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">無資料</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex gap-2 mt-4 justify-end">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded disabled:opacity-40">上一頁</button>
          <span className="text-sm text-gray-600 self-center">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm border rounded disabled:opacity-40">下一頁</button>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              祈福申請 #{selected.id} — {selected.name}
            </h2>

            <div className="space-y-2 text-sm mb-5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400">祈福類型</span>
                  <p className="font-medium">{selected.serviceCode ? (SERVICE_LABELS[selected.serviceCode] ?? selected.serviceCode) : '祈福'}</p>
                </div>
                <div>
                  <span className="text-gray-400">生辰</span>
                  <p className="font-medium">{selected.birthDate ?? '—'}{selected.isLunar ? '（農曆）' : ''}</p>
                </div>
                <div>
                  <span className="text-gray-400">聯絡方式</span>
                  <p className="font-medium">{selected.contactInfo ?? '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400">希望日期</span>
                  <p className="font-medium">{selected.preferredDate ?? '—'}</p>
                </div>
              </div>
              {selected.notes && (
                <div>
                  <span className="text-gray-400">說明</span>
                  <p className="text-gray-700 mt-0.5">{selected.notes}</p>
                </div>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-sm text-gray-500 mb-1">管理員備註</label>
              <textarea
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="填入備註（可空白）"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                關閉
              </button>
              {selected.status === 'pending' && (
                <button
                  onClick={() => handleUpdateStatus(selected.id, 'confirmed', noteInput)}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  確認申請
                </button>
              )}
              {(selected.status === 'pending' || selected.status === 'confirmed') && (
                <button
                  onClick={() => handleUpdateStatus(selected.id, 'completed', noteInput)}
                  className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  標記完成
                </button>
              )}
              {selected.status !== 'cancelled' && selected.status !== 'completed' && (
                <button
                  onClick={() => handleUpdateStatus(selected.id, 'cancelled', noteInput)}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  取消申請
                </button>
              )}
              {noteInput !== (selected.adminNote ?? '') && (
                <button
                  onClick={() => handleUpdateStatus(selected.id, selected.status, noteInput)}
                  className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                >
                  儲存備註
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
