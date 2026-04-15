'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';

interface Booking {
  id: number;
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
  userEmail: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: '待處理', color: 'bg-amber-100 text-amber-800' },
  confirmed: { label: '已確認', color: 'bg-blue-100 text-blue-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
};

const SERVICE_LABELS: Record<string, string> = {
  blessing:     '祈福服務',
  consultation: '問事預約',
};

const SERVICE_CODE_LABELS: Record<string, string> = {
  BLESSING_ANTAISUI: '安太歲',
  BLESSING_LIGHT:    '光明燈',
  BLESSING_WEALTH:   '補財庫',
  BLESSING_PRAYER:   '祈福祝願',
  CONSULT_VIDEO:     '問事/視訊',
};

export default function AdminBookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');
  const [saving, setSaving] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5013/api'
    : 'https://ecanapi.fly.dev/api';

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filterStatus) params.set('status', filterStatus);
    if (filterType) params.set('type', filterType);
    try {
      const res = await fetch(`${API_URL}/Booking/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.items);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [token, page, filterStatus, filterType, API_URL]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const startEdit = (b: Booking) => {
    setEditingId(b.id);
    setEditStatus(b.status);
    setEditNote(b.adminNote ?? '');
  };

  const saveEdit = async (id: number) => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/Booking/${id}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus, adminNote: editNote }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchBookings();
      }
    } finally {
      setSaving(false);
    }
  };

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">預約管理</h1>
        <span className="text-sm text-gray-500">共 {total} 筆</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value="">所有狀態</option>
          <option value="pending">待處理</option>
          <option value="confirmed">已確認</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
        </select>
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value="">所有類型</option>
          <option value="blessing">祈福服務</option>
          <option value="consultation">問事預約</option>
        </select>
        <button
          onClick={fetchBookings}
          className="text-sm px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
        >
          重新整理
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">載入中...</div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-gray-400">目前沒有預約記錄</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">時間</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">類型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">聯絡</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">備註</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{b.id}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(b.createdAt).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })}
                      <br/>
                      <span className="text-xs">{new Date(b.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-700">{SERVICE_LABELS[b.serviceType] ?? b.serviceType}</span>
                      {b.serviceCode && (
                        <div className="text-xs text-gray-400">{SERVICE_CODE_LABELS[b.serviceCode] ?? b.serviceCode}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{b.name}</div>
                      {b.userEmail && <div className="text-xs text-gray-400">{b.userEmail}</div>}
                      {b.birthDate && <div className="text-xs text-gray-400">{b.birthDate}{b.isLunar ? '(農)' : ''}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {b.contactType && (
                        <div className="text-gray-700">
                          <span className="text-xs text-gray-400 mr-1">{b.contactType.toUpperCase()}</span>
                          {b.contactInfo}
                        </div>
                      )}
                      {b.preferredDate && <div className="text-xs text-gray-400">希望時間: {b.preferredDate}</div>}
                    </td>
                    <td className="px-4 py-3 max-w-48">
                      {b.notes && <div className="text-gray-600 text-xs line-clamp-2">{b.notes}</div>}
                      {b.adminNote && <div className="text-amber-600 text-xs mt-1">備注: {b.adminNote}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_LABELS[b.status]?.color ?? 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_LABELS[b.status]?.label ?? b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === b.id ? (
                        <div className="space-y-2 min-w-40">
                          <select
                            value={editStatus}
                            onChange={e => setEditStatus(e.target.value)}
                            className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                          >
                            <option value="pending">待處理</option>
                            <option value="confirmed">已確認</option>
                            <option value="completed">已完成</option>
                            <option value="cancelled">已取消</option>
                          </select>
                          <input
                            value={editNote}
                            onChange={e => setEditNote(e.target.value)}
                            placeholder="內部備注..."
                            className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => saveEdit(b.id)}
                              disabled={saving}
                              className="text-xs px-2 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
                            >
                              儲存
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(b)}
                          className="text-xs px-3 py-1.5 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                        >
                          處理
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-40"
          >
            上一頁
          </button>
          <span className="px-3 py-1 text-sm text-gray-500">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-40"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
}
