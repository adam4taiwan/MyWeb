'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

type Tab = 'info' | 'subscription' | 'password' | 'points';

interface AdminSubscription {
  planCode: string;
  planName: string;
  status: string;
  expiryDate?: string;
  isInTrial: boolean;
  trialStartDate?: string;
  trialDaysRemaining?: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  address: string;
  taxId: string;
  points: number;
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
  birthHour?: number;
  birthGender?: number;
  subscription?: AdminSubscription;
}

export default function AdminUserDetailPage() {
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [infoForm, setInfoForm] = useState({ name: '', phone: '', postalCode: '', address: '', taxId: '' });
  const [pwForm, setPwForm]   = useState({ newPassword: '', confirmPassword: '' });
  const [ptForm, setPtForm]   = useState({ amount: '', reason: '' });

  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5013/api'
    : 'https://ecanapi.fly.dev/api';

  useEffect(() => {
    if (!token || !id) return;
    fetch(`${API_URL}/Admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then((data: AdminUser | null) => {
        if (!data) { router.replace('/admin/users'); return; }
        setUser(data);
        setInfoForm({
          name: data.name || '',
          phone: data.phone || '',
          postalCode: data.postalCode || '',
          address: data.address || '',
          taxId: data.taxId || '',
        });
      });
  }, [token, id, API_URL, router]);

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/Admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(infoForm),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg('更新成功', true);
        setUser(prev => prev ? { ...prev, ...infoForm } : prev);
      } else {
        showMsg(data.message || '更新失敗', false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showMsg('兩次密碼不符', false); return;
    }
    if (pwForm.newPassword.length < 6) {
      showMsg('密碼至少 6 位數', false); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/Admin/users/${id}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (res.ok) { showMsg(data.message, true); setPwForm({ newPassword: '', confirmPassword: '' }); }
      else showMsg(data.message || '變更失敗', false);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(ptForm.amount);
    if (isNaN(amount) || amount === 0) { showMsg('請輸入有效數字（正數加點、負數扣點）', false); return; }
    if (!ptForm.reason.trim()) { showMsg('請填寫調整原因', false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/Admin/users/${id}/adjust-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, reason: ptForm.reason }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(data.message, true);
        setUser(prev => prev ? { ...prev, points: data.newPoints } : prev);
        setPtForm({ amount: '', reason: '' });
      } else {
        showMsg(data.message || '調整失敗', false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-gray-400">載入中...</div>;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'info',         label: '基本資料' },
    { id: 'subscription', label: '訂閱狀態' },
    { id: 'password',     label: '強制改密碼' },
    { id: 'points',       label: '點數調整' },
  ];

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
      >
        &larr; 返回列表
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-xl font-bold text-amber-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-sm text-amber-600 font-medium">點數餘額：{user.points} 點</p>
          {user.birthYear && (
            <p className="text-sm text-gray-500">
              生辰：{user.birthYear}/{user.birthMonth}/{user.birthDay} {user.birthHour}時
              （{user.birthGender === 1 ? '乾造' : '坤造'}）
            </p>
          )}
          </div>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Basic Info */}
        {activeTab === 'info' && (
          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <h2 className="font-bold text-gray-700 border-b pb-3">基本資料</h2>
            {[
              { label: '姓名', key: 'name', type: 'text' },
              { label: '電話', key: 'phone', type: 'tel' },
              { label: '郵遞區號', key: 'postalCode', type: 'text' },
              { label: '地址', key: 'address', type: 'text' },
              { label: '統一編號', key: 'taxId', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-600 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  value={infoForm[field.key as keyof typeof infoForm]}
                  onChange={e => setInfoForm({ ...infoForm, [field.key]: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input type="text" value={user.email} disabled className="w-full px-4 py-2.5 border border-gray-100 rounded-lg bg-gray-50 text-gray-400 text-sm" />
              <p className="text-xs text-gray-400 mt-1">Email 為登入帳號，不可修改</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '儲存中...' : '儲存變更'}
            </button>
          </form>
        )}

        {/* Subscription Status */}
        {activeTab === 'subscription' && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-700 border-b pb-3">訂閱狀態</h2>
            {user.subscription ? (
              <div className="space-y-3">
                <div className="bg-amber-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">方案</span>
                    <span className="text-sm font-medium text-gray-800">{user.subscription.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">狀態</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                      user.subscription.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {user.subscription.status === 'active' ? '訂閱中' :
                       user.subscription.status === 'trial' ? '試用中' :
                       user.subscription.status === 'trial_expired' ? '試用已到期' : user.subscription.status}
                    </span>
                  </div>
                  {user.subscription.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">到期日</span>
                      <span className="text-sm font-medium text-gray-800">
                        {new Date(user.subscription.expiryDate).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                  )}
                  {user.subscription.isInTrial && user.subscription.trialDaysRemaining !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">試用剩餘</span>
                      <span className="text-sm font-medium text-blue-700">{user.subscription.trialDaysRemaining} 天</span>
                    </div>
                  )}
                  {user.subscription.trialStartDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">試用開始</span>
                      <span className="text-sm text-gray-600">
                        {new Date(user.subscription.trialStartDate).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-sm">無訂閱紀錄，未使用過試用</p>
              </div>
            )}
          </div>
        )}

        {/* Force Change Password */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
            <h2 className="font-bold text-gray-700 border-b pb-3">強制變更密碼</h2>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">新密碼</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                required minLength={6}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm"
                placeholder="至少 6 位數"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">確認新密碼</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                required minLength={6}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm"
                placeholder="再次輸入新密碼"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '變更中...' : '強制變更密碼'}
            </button>
          </form>
        )}

        {/* Adjust Points */}
        {activeTab === 'points' && (
          <form onSubmit={handleAdjustPoints} className="space-y-4 max-w-sm">
            <h2 className="font-bold text-gray-700 border-b pb-3">點數調整</h2>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500">目前點數餘額</p>
              <p className="text-3xl font-bold text-amber-600">{user.points} <span className="text-base font-normal text-gray-500">點</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">調整數量（正數加點，負數扣點）</label>
              <input
                type="number"
                value={ptForm.amount}
                onChange={e => setPtForm({ ...ptForm, amount: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm"
                placeholder="例如：50 或 -10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">調整原因（必填）</label>
              <input
                type="text"
                value={ptForm.reason}
                onChange={e => setPtForm({ ...ptForm, reason: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm"
                placeholder="例如：ATM 入帳確認、補償調整..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '調整中...' : '確認調整'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
