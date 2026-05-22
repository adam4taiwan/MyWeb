'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';

interface LinePushStats {
  totalLineUsers: number;
  notifyEnabled: number;
  notifyDisabled: number;
  subscribersBound: number;
}

interface PushResult {
  pushedCount: number;
  errorCount: number;
  pushed: { type: string; lineUserId: string; name?: string }[];
  errors: { type: string; lineUserId?: string; userId?: string; error: string }[];
}

export default function AdminLinePushPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<LinePushStats | null>(null);
  const [pushing, setPushing] = useState(false);
  const [result, setResult] = useState<PushResult | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [hasLineLinked, setHasLineLinked] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5013/api'
    : 'https://ecanapi.fly.dev/api';

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/Admin/line-push/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStats(data); });
    fetch(`${API_URL}/Auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setHasLineLinked(data.hasLineLinked === true); })
      .catch(() => {});
    fetch(`${API_URL}/NineStar/notify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setNotifyEnabled(data.notifyEnabled === true); })
      .catch(() => {});
  }, [token, API_URL]);

  const handleToggleNotify = async () => {
    if (!token || !hasLineLinked) return;
    setNotifyLoading(true);
    try {
      const res = await fetch(`${API_URL}/NineStar/notify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled: !notifyEnabled }),
      });
      if (res.ok) setNotifyEnabled(v => !v);
    } catch { /* ignore */ }
    finally { setNotifyLoading(false); }
  };

  const handlePushNow = async () => {
    if (!confirm('確定要立即推播今日九星運勢給所有訂閱者？')) return;
    setPushing(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/NineStar/push-now`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setMsg({ text: `推播完成：成功 ${data.pushedCount} 人，失敗 ${data.errorCount} 人`, ok: true });
      } else {
        setMsg({ text: data.message || '推播失敗', ok: false });
      }
    } finally {
      setPushing(false);
      setTimeout(() => setMsg(null), 6000);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">LINE 推播管理</h1>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}

      {/* Admin LINE binding & notify settings */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8">
        <h2 className="font-bold text-green-800 mb-3">管理員 LINE 設定</h2>
        {!hasLineLinked ? (
          <div className="space-y-2">
            <p className="text-sm text-green-700">尚未綁定 LINE 帳號，完成以下步驟後即可啟用推播：</p>
            <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
              <li>
                加入官方 LINE 帳號
                <a href="https://line.me/R/ti/p/@213qrysy" target="_blank" rel="noopener noreferrer"
                  className="ml-1 underline font-medium text-green-900">點此加入 @213qrysy</a>
              </li>
              <li>在排盤工具填寫並儲存生辰資料</li>
              <li>用 LINE 帳號登入本平台（綁定 LINE ID）</li>
            </ol>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">LINE 帳號已綁定</p>
              <p className="text-xs text-green-600 mt-0.5">{notifyEnabled ? '推播已開啟，每日 7:30 自動發送' : '推播已關閉'}</p>
            </div>
            <button
              onClick={handleToggleNotify}
              disabled={notifyLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifyEnabled ? 'bg-green-500' : 'bg-gray-300'} ${notifyLoading ? 'opacity-50' : ''}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'LINE 用戶總數', value: stats?.totalLineUsers ?? '—' },
          { label: '已開通推播', value: stats?.notifyEnabled ?? '—', highlight: true },
          { label: '未開通推播', value: stats?.notifyDisabled ?? '—' },
          { label: '訂閱會員已綁 LINE', value: stats?.subscribersBound ?? '—' },
        ].map(card => (
          <div key={card.label} className={`bg-white rounded-xl p-5 shadow-sm border ${card.highlight ? 'border-amber-300' : 'border-gray-100'}`}>
            <p className="text-xs text-gray-400 mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${card.highlight ? 'text-amber-600' : 'text-gray-800'}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Manual push */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-bold text-gray-700 mb-2">手動推播</h2>
        <p className="text-sm text-gray-500 mb-4">
          立即推播今日九星運勢給所有開通通知的 LINE 用戶，以及有綁定 LINE 的有效訂閱會員（個人化版本）。
        </p>
        <button
          onClick={handlePushNow}
          disabled={pushing}
          className="px-5 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pushing ? '推播中...' : '立即推播'}
        </button>
      </div>

      {/* Push result */}
      {result && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-3">推播結果</h2>
          <div className="flex gap-6 mb-4">
            <div>
              <p className="text-xs text-gray-400">成功</p>
              <p className="text-2xl font-bold text-green-600">{result.pushedCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">失敗</p>
              <p className="text-2xl font-bold text-red-500">{result.errorCount}</p>
            </div>
          </div>

          {result.pushed.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">成功名單</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {result.pushed.map((p, i) => (
                  <div key={i} className="text-xs text-gray-600 flex gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${p.type === 'subscriber' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {p.type === 'subscriber' ? '訂閱' : '九星'}
                    </span>
                    <span>{p.name ?? p.lineUserId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.errors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-500 mb-2">失敗清單</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {result.errors.map((e, i) => (
                  <div key={i} className="text-xs text-red-600">
                    {e.lineUserId ?? e.userId}: {e.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
