'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';

type Tab = 'profile' | 'points' | 'orders' | 'security';

interface DailyFortune {
  content: string;
  date: string;
  cached: boolean;
}

interface PointRecord {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderType: string;
  amount: number;
  status: string;
  points?: number;
  createdAt: string;
}

export default function MemberPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [paymentNotice, setPaymentNotice] = useState<'success' | 'cancelled' | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [pointHistory, setPointHistory] = useState<PointRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const [dailyFortune, setDailyFortune] = useState<DailyFortune | null>(null);
  const [fortuneLoading, setFortuneLoading] = useState(false);
  const [fortuneError, setFortuneError] = useState('');
  const [mingGongStars, setMingGongStars] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5013/api'
    : 'https://ecanapi.fly.dev/api';

  const fetchPoints = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/Consultation/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: '同步查詢', chartRequest: { dateType: 'solar', name: '', gender: '1', year: 2000, month: 1, day: 1, hour: 0, minute: 0 } }),
      });
      if (res.ok) {
        const data = await res.json();
        setPoints(data.remainingPoints ?? data.points ?? 0);
      }
    } catch {
      // silent
    }
  }, [token, API_URL]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      setPaymentNotice('success');
      setActiveTab('points');
      fetchPoints();
      window.history.replaceState({}, '', '/member');
    } else if (payment === 'cancelled') {
      setPaymentNotice('cancelled');
      setActiveTab('points');
      window.history.replaceState({}, '', '/member');
    }
  }, [fetchPoints]);

  const fetchDailyFortune = useCallback(async () => {
    if (!token) return;
    setFortuneLoading(true);
    setFortuneError('');
    try {
      // 優先嘗試個人化運勢（需生辰資料），若無生辰則 fallback 通用版
      let res = await fetch(`${API_URL}/Fortune/daily-personal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 400) {
        res = await fetch(`${API_URL}/Fortune/daily-kb`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      if (res.ok) {
        const data = await res.json();
        setDailyFortune(data);
      } else {
        setFortuneError('今日運勢暫時無法取得，請稍後再試');
      }
    } catch {
      setFortuneError('連線失敗，請稍後再試');
    } finally {
      setFortuneLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => {
    fetchDailyFortune();
  }, [fetchDailyFortune]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/Astrology/my-chart`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.mingGongMainStars) setMingGongStars(d.mingGongMainStars); })
      .catch(() => {});
  }, [token, API_URL]);

  const fetchPointHistory = async () => {
    if (historyLoaded || !token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/Points/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPointHistory(data.records || data || []);
      }
    } catch {
      // API endpoint might not be ready yet
    } finally {
      setIsLoading(false);
      setHistoryLoaded(true);
    }
  };

  const fetchOrders = async () => {
    if (ordersLoaded || !token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/Payment/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || data || []);
      }
    } catch {
      // API endpoint might not be ready yet
    } finally {
      setIsLoading(false);
      setOrdersLoaded(true);
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'points') fetchPointHistory();
    if (tab === 'orders') fetchOrders();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg('新密碼與確認密碼不符');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg('密碼至少需要 6 位數');
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg('');
    try {
      const res = await fetch(`${API_URL}/Auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg('密碼修改成功！');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMsg(data.message || '修改失敗，請確認目前密碼是否正確');
      }
    } catch {
      setPasswordMsg('連線失敗，請稍後再試');
    } finally {
      setPasswordLoading(false);
    }
  };

  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);

  const [atmForm, setAtmForm] = useState({ packageId: 'popular', transferDate: '', accountLast5: '' });
  const [atmLoading, setAtmLoading] = useState(false);
  const [atmMsg, setAtmMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [paymentMode, setPaymentMode] = useState<'card' | 'atm'>('card');

  const handlePurchasePoints = async (packageId: string) => {
    setPurchaseLoading(true);
    setPurchasingPackageId(packageId);
    try {
      const res = await fetch(`${API_URL}/Payment/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || '支付跳轉失敗，請稍後再試');
      }
    } catch {
      alert('支付跳轉失敗，請稍後再試');
    } finally {
      setPurchaseLoading(false);
      setPurchasingPackageId(null);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: '個人資料' },
    { id: 'points', label: '點數管理' },
    { id: 'orders', label: '購買記錄' },
    { id: 'security', label: '帳號安全' },
  ];

  const displayName = user?.name || user?.email?.split('@')[0] || '會員';
  const displayEmail = user?.email || localStorage.getItem('email') || '';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {fortuneLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-amber-200 text-sm">玉洞子正在推算今日運勢...</p>
        </div>
      )}
      <Header />

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-8">
        {/* 會員資訊卡 */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-950 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {avatarLetter}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{displayName}</h1>
              <p className="text-amber-200 text-sm truncate">{displayEmail}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
                  一般會員
                </span>
                <span className="text-amber-100 text-sm">
                  點數餘額：
                  <strong className="text-white text-base">
                    {points !== null ? points : '---'}
                  </strong>{' '}
                  點
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 每日運勢卡 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-amber-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              今日運勢
            </h2>
            {dailyFortune && (
              <span className="text-xs text-gray-400">{dailyFortune.date}</span>
            )}
          </div>
          {fortuneLoading ? (
            <div className="py-6 text-center">
              <div className="inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-400">玉洞子正在推算今日運勢...</p>
            </div>
          ) : fortuneError ? (
            <div className="py-4 text-center">
              <p className="text-sm text-red-400">{fortuneError}</p>
              <button
                onClick={fetchDailyFortune}
                className="mt-2 text-xs text-amber-600 underline"
              >
                重新取得
              </button>
            </div>
          ) : dailyFortune ? (
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {dailyFortune.content}
            </div>
          ) : null}
        </div>

        {/* Tab 列 */}
        <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-amber-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 內容 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">

          {/* ── 個人資料 ── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-3">個人資料</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">姓名</p>
                  <p className="text-gray-900 font-medium">{displayName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">電子郵件</p>
                  <p className="text-gray-900 font-medium break-all">{displayEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">會員等級</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800 font-medium">
                    一般會員
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">點數餘額</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {points !== null ? points : '---'}
                    <span className="text-sm font-normal text-gray-500 ml-1">點</span>
                  </p>
                </div>
              </div>

              {mingGongStars && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-purple-500 mb-1">紫微命宮主星</p>
                  <p className="text-gray-800 font-semibold">{mingGongStars}</p>
                  <p className="text-xs text-gray-400 mt-1">已加成至今日運勢</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm font-bold text-gray-700 mb-3">快速操作</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/disk">
                    <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                      前往排盤工具
                    </button>
                  </Link>
                  <button
                    onClick={() => handleTabChange('points')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    儲值點數
                  </button>
                  <Link href="/consultation">
                    <button className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">
                      預約諮詢
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── 點數管理 ── */}
          {activeTab === 'points' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-3">點數管理</h2>

              {/* 支付結果提示 */}
              {paymentNotice === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm flex items-start justify-between gap-3">
                  <span>儲值成功！點數已入帳，請確認餘額。</span>
                  <button onClick={() => setPaymentNotice(null)} className="text-green-500 hover:text-green-700 flex-shrink-0">x</button>
                </div>
              )}
              {paymentNotice === 'cancelled' && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-4 text-sm flex items-start justify-between gap-3">
                  <span>已取消付款，如需儲值請重新選擇套餐。</span>
                  <button onClick={() => setPaymentNotice(null)} className="text-yellow-500 hover:text-yellow-700 flex-shrink-0">x</button>
                </div>
              )}

              {/* 餘額卡 */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600">目前點數餘額</p>
                  <p className="text-4xl font-bold text-amber-600 mt-1">
                    {points !== null ? points : '---'}
                    <span className="text-lg font-normal text-gray-500 ml-2">點</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">深度鑑定每次消耗 10 點</p>
                </div>
                <button
                  onClick={() => handlePurchasePoints('popular')}
                  disabled={purchaseLoading}
                  className="flex-shrink-0 bg-amber-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50 text-center"
                >
                  {purchaseLoading && purchasingPackageId === 'popular' ? '處理中...' : (
                    <>立即儲值<br /><span className="text-xs font-normal">NT$1,350 / 150點</span></>
                  )}
                </button>
              </div>

              {/* 點數套餐 */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">點數套餐</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'starter',  points: 50,   price: 500,  label: '入門', highlight: false },
                    { id: 'popular',  points: 150,  price: 1350, label: '推薦', highlight: true  },
                    { id: 'advanced', points: 400,  price: 3200, label: '進階', highlight: false },
                    { id: 'vip',      points: 1000, price: 7000, label: 'VIP',  highlight: false },
                  ].map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => handlePurchasePoints(pkg.id)}
                      disabled={purchaseLoading}
                      className={`p-4 rounded-xl border-2 text-center transition-all disabled:opacity-60 ${
                        pkg.highlight
                          ? 'border-amber-400 bg-amber-50 hover:bg-amber-100'
                          : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50'
                      } ${purchasingPackageId === pkg.id ? 'opacity-60' : ''}`}
                    >
                      {pkg.highlight && (
                        <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                          最受歡迎
                        </span>
                      )}
                      <p className="text-2xl font-bold text-amber-600 mt-2">{pkg.points}</p>
                      <p className="text-xs text-gray-500">點數</p>
                      <p className="text-sm font-bold text-gray-700 mt-1">
                        NT${pkg.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600">
                        {(pkg.price / pkg.points).toFixed(0)} 元/點
                      </p>
                      <p className="text-xs mt-2 font-medium text-amber-700">
                        {purchasingPackageId === pkg.id ? '處理中...' : '點擊購買'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 付款方式切換 */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">付款方式</p>
                <div className="flex gap-2 mb-4">
                  {([['card', '信用卡 / Apple Pay'], ['atm', 'ATM 轉帳']] as const).map(([mode, label]) => (
                    <button
                      key={mode}
                      onClick={() => setPaymentMode(mode)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        paymentMode === mode
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {paymentMode === 'atm' && (
                  <div className="border border-amber-100 rounded-xl p-5 bg-amber-50 space-y-4">
                    <div className="text-sm text-gray-700 space-y-1">
                      <p className="font-bold text-gray-800 mb-2">匯款帳號資訊</p>
                      <p>銀行：上海商業儲蓄銀行（分行代碼 011）</p>
                      <p>帳號：<strong className="tracking-wider">0002203000720489</strong></p>
                      <p>戶名：蔡嘉麟</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">選擇套餐</label>
                      <select
                        value={atmForm.packageId}
                        onChange={e => setAtmForm({ ...atmForm, packageId: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm bg-white"
                      >
                        <option value="starter">入門 — 50 點 / NT$500</option>
                        <option value="popular">推薦 — 150 點 / NT$1,350</option>
                        <option value="advanced">進階 — 400 點 / NT$3,200</option>
                        <option value="vip">VIP — 1,000 點 / NT$7,000</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">轉帳日期</label>
                        <input
                          type="date"
                          value={atmForm.transferDate}
                          onChange={e => setAtmForm({ ...atmForm, transferDate: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">轉出帳號後 5 碼</label>
                        <input
                          type="text"
                          value={atmForm.accountLast5}
                          onChange={e => setAtmForm({ ...atmForm, accountLast5: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                          maxLength={5}
                          placeholder="12345"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {atmMsg && (
                      <p className={`text-sm ${atmMsg.ok ? 'text-green-600' : 'text-red-500'}`}>{atmMsg.text}</p>
                    )}

                    <button
                      onClick={async () => {
                        if (!atmForm.transferDate || atmForm.accountLast5.length !== 5) {
                          setAtmMsg({ text: '請填寫轉帳日期及完整帳號後 5 碼', ok: false }); return;
                        }
                        setAtmLoading(true);
                        setAtmMsg(null);
                        try {
                          const res = await fetch(`${API_URL}/Payment/atm-request`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify(atmForm),
                          });
                          const data = await res.json();
                          if (res.ok) {
                            setAtmMsg({ text: data.message, ok: true });
                            setAtmForm({ packageId: 'popular', transferDate: '', accountLast5: '' });
                          } else {
                            setAtmMsg({ text: data.message || '提交失敗，請稍後再試', ok: false });
                          }
                        } catch {
                          setAtmMsg({ text: '連線失敗，請稍後再試', ok: false });
                        } finally {
                          setAtmLoading(false);
                        }
                      }}
                      disabled={atmLoading}
                      className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 disabled:opacity-50 transition-colors text-sm"
                    >
                      {atmLoading ? '提交中...' : '送出轉帳申請'}
                    </button>
                    <p className="text-xs text-gray-400 text-center">申請後由管理員人工審核，通常於 1 個工作日內入帳</p>
                  </div>
                )}
              </div>

              {/* 點數記錄 */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">點數記錄</p>
                {isLoading ? (
                  <div className="text-center py-8 text-gray-400">載入中...</div>
                ) : pointHistory.length > 0 ? (
                  <div className="space-y-2">
                    {pointHistory.map(record => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{record.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(record.createdAt).toLocaleDateString('zh-TW')}
                          </p>
                        </div>
                        <span
                          className={`font-bold ${
                            record.amount > 0 ? 'text-green-600' : 'text-red-500'
                          }`}
                        >
                          {record.amount > 0 ? '+' : ''}
                          {record.amount} 點
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-3xl mb-2">📊</p>
                    <p className="text-sm">尚無點數記錄</p>
                    <p className="text-xs mt-1">購買點數或使用服務後，記錄將顯示於此</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 購買記錄 ── */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-3">購買記錄</h2>
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">載入中...</div>
              ) : orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.orderType === 'point_purchase' ? '點數購買' : order.orderType}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('zh-TW', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {order.points && (
                            <p className="text-sm text-amber-600 mt-1 font-medium">
                              +{order.points} 點
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gray-900">
                            NT${order.amount?.toLocaleString()}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                              order.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {order.status === 'completed'
                              ? '已完成'
                              : order.status === 'pending'
                              ? '處理中'
                              : '失敗'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-3xl mb-2">🛒</p>
                  <p className="text-sm">尚無購買記錄</p>
                  <button
                    onClick={() => handleTabChange('points')}
                    className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                  >
                    立即購買點數
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── 帳號安全 ── */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-3">帳號安全</h2>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <p className="text-sm font-bold text-gray-700">修改密碼</p>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">目前密碼</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={e =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none transition"
                    placeholder="輸入目前密碼"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">新密碼</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={e =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none transition"
                    placeholder="至少 6 位數"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">確認新密碼</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none transition"
                    placeholder="再次輸入新密碼"
                  />
                </div>
                {passwordMsg && (
                  <p
                    className={`text-sm ${
                      passwordMsg.includes('成功') ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {passwordMsg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
                >
                  {passwordLoading ? '修改中...' : '確認修改'}
                </button>
              </form>

              <div className="border-t pt-6">
                <p className="text-sm font-bold text-gray-700 mb-3">安全資訊</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ 密碼使用加密儲存，我們無法查看您的密碼</li>
                  <li>✓ JWT Token 有效期為 7 天，到期後需重新登入</li>
                  <li>✓ 如懷疑帳號被盜用，請立即修改密碼並聯繫客服</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
