'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import { useTranslations } from 'next-intl';

type Tab = 'profile' | 'subscription' | 'ninestar' | 'orders' | 'reports' | 'security';

interface SubscriptionStatus {
  isSubscribed: boolean;
  planCode?: string;
  planName?: string;
  expiryDate?: string;
  daysRemaining?: number;
  isInTrial?: boolean;
  trialDaysRemaining?: number;
  benefits?: { productCode: string | null; productType: string | null; benefitType: string; benefitValue: string; description: string | null }[];
  quotaStatus?: { productCode: string; productType: string | null; total: number; used: number; remaining: number }[];
}

interface UserReport {
  id: string;
  reportType: string;
  title: string;
  createdAt: string;
}

interface UserReportDetail {
  id: string;
  reportType: string;
  title: string;
  content: string;
  createdAt: string;
}

interface DailyFortune {
  content: string;
  date: string;
  cached: boolean;
}

interface Order {
  id: string;
  orderType: string;
  amount: number;
  status: string;
  points?: number;
  createdAt: string;
}

interface NineStarCombination {
  pair: string;
  starA: { number: number; name: string };
  starB: { number: number; name: string };
  title: string;
  verdict: string;
  modified: string;
  description: string;
}

interface NineStarDaily {
  date: string;
  natalStar: { number: number; name: string };
  yunStatus: string;
  isProspering: boolean;
  yearStar: { number: number; name: string };
  monthStar: { number: number; name: string };
  dayStar: { number: number; name: string };
  hourStar: { number: number; name: string };
  combinations: NineStarCombination[];
  overallVerdict: string;
  fortuneText: string;
  auspicious: string;
  avoid: string;
  direction: string;
  color: string;
}

interface NineStarTodayStars {
  date: string;
  yearStar: { number: number; name: string };
  monthStar: { number: number; name: string };
  dayStar: { number: number; name: string };
  hourStar: { number: number; name: string };
}

export default function MemberPage() {
  const t = useTranslations('Member');
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [paymentNotice, setPaymentNotice] = useState<'success' | 'cancelled' | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasLineLinked, setHasLineLinked] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);

  const [dailyFortune, setDailyFortune] = useState<DailyFortune | null>(null);
  const [fortuneLoading, setFortuneLoading] = useState(false);
  const [fortuneError, setFortuneError] = useState('');
  const [mingGongStars, setMingGongStars] = useState<string | null>(null);
  const [hasChart, setHasChart] = useState<boolean | null>(null);

  const [nineStarDaily, setNineStarDaily] = useState<NineStarDaily | null>(null);
  const [nineStarTodayStars, setNineStarTodayStars] = useState<NineStarTodayStars | null>(null);
  const [nineStarLoading, setNineStarLoading] = useState(false);
  const [nineStarError, setNineStarError] = useState('');
  const [nineStarLoaded, setNineStarLoaded] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [reportsLoaded, setReportsLoaded] = useState(false);
  const [selectedReport, setSelectedReport] = useState<UserReportDetail | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5013/api'
    : 'https://ecanapi.fly.dev/api';

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/Subscription/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSubscription(data); })
      .catch(() => {});
    fetch(`${API_URL}/Auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setIsAdmin(data.isAdmin === true);
          setHasLineLinked(data.hasLineLinked === true);
        }
      })
      .catch(() => {});
    fetch(`${API_URL}/NineStar/notify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setNotifyEnabled(data.notifyEnabled === true); })
      .catch(() => {});
  }, [token, API_URL]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      setPaymentNotice('success');
      setActiveTab('subscription');
      window.history.replaceState({}, '', '/member');
    } else if (payment === 'cancelled') {
      setPaymentNotice('cancelled');
      setActiveTab('subscription');
      window.history.replaceState({}, '', '/member');
    }
  }, []);

  const fetchDailyFortune = useCallback(async () => {
    if (!token) return;
    setFortuneLoading(true);
    setFortuneError('');
    try {
      await fetch(`${API_URL}/Fortune/my-cache-today`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});

      const chartRes = await fetch(`${API_URL}/Astrology/my-chart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const chartData = chartRes.ok ? await chartRes.json() : null;
      const chartExists = chartRes.ok && chartData?.mingGongMainStars;
      setHasChart(!!chartExists);
      if (chartExists) setMingGongStars(chartData.mingGongMainStars);

      const fortuneUrl = chartExists
        ? `${API_URL}/Fortune/daily-personal`
        : `${API_URL}/Fortune/daily`;

      const res = await fetch(fortuneUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDailyFortune(data);
      } else {
        setFortuneError(t('fortuneError'));
      }
    } catch {
      setFortuneError(t('fortuneNetworkError'));
    } finally {
      setFortuneLoading(false);
    }
  }, [token, API_URL, t]);

  useEffect(() => {
    if (subscription === null) return;
    if (!subscription.isSubscribed && !isAdmin) return;
    fetchDailyFortune();
  }, [subscription, isAdmin, fetchDailyFortune]);

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

  const fetchNineStarDaily = useCallback(async () => {
    if (!token || nineStarLoaded) return;
    setNineStarLoading(true);
    setNineStarError('');
    try {
      const [dailyRes, starsRes] = await Promise.all([
        fetch(`${API_URL}/NineStar/daily`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/NineStar/stars/today`),
      ]);
      if (dailyRes.ok) {
        const data = await dailyRes.json();
        setNineStarDaily(data);
      } else {
        const err = await dailyRes.json().catch(() => ({}));
        setNineStarError(err?.message || t('nineStarDataNotFound'));
      }
      if (starsRes.ok) {
        setNineStarTodayStars(await starsRes.json());
      }
      setNineStarLoaded(true);
    } catch {
      setNineStarError(t('nineStarLoadError'));
    } finally {
      setNineStarLoading(false);
    }
  }, [token, API_URL, nineStarLoaded, t]);

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

  const fetchReports = async () => {
    if (!token || reportsLoaded) return;
    try {
      const res = await fetch(`${API_URL}/Reports/my`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUserReports(data);
        setReportsLoaded(true);
      }
    } catch { /* ignore */ }
  };

  const fetchReportDetail = async (id: string) => {
    if (!token) return;
    setReportLoading(true);
    try {
      const res = await fetch(`${API_URL}/Reports/my/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setSelectedReport(data);
      }
    } catch { /* ignore */ } finally { setReportLoading(false); }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'orders') fetchOrders();
    if (tab === 'ninestar') fetchNineStarDaily();
    if (tab === 'reports') fetchReports();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg(t('passwordMismatch'));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg(t('passwordTooShort'));
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
        setPasswordMsg(t('passwordSuccess'));
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMsg(data.message || t('passwordError'));
      }
    } catch {
      setPasswordMsg(t('passwordNetworkError'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: t('tabProfile') },
    { id: 'subscription', label: t('tabSubscription') },
    { id: 'ninestar', label: t('tabNineStar') },
    { id: 'reports', label: t('tabReports') },
    { id: 'orders', label: t('tabOrders') },
    { id: 'security', label: t('tabSecurity') },
  ];

  const displayName = user?.name || user?.email?.split('@')[0] || t('regularMember');
  const displayEmail = user?.email || (typeof localStorage !== 'undefined' ? localStorage.getItem('email') : '') || '';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {fortuneLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-amber-200 text-sm">{t('loadingFortune')}</p>
        </div>
      )}
      {nineStarLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-amber-200 text-sm">{t('loadingNineStar')}</p>
        </div>
      )}
      <Header />

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-8">
        {/* Member info card */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-950 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {avatarLetter}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{displayName}</h1>
              <p className="text-amber-200 text-sm truncate">{displayEmail}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {subscription?.isSubscribed ? (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    subscription.planCode === 'GOLD' ? 'bg-yellow-400 text-yellow-900' :
                    subscription.planCode === 'SILVER' ? 'bg-slate-300 text-slate-900' :
                    'bg-amber-500 text-white'
                  }`}>
                    {subscription.planName}
                  </span>
                ) : (
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                    {t('regularMember')}
                  </span>
                )}
                {subscription?.isSubscribed && subscription.daysRemaining !== undefined && (
                  <span className="text-amber-200 text-xs">
                    {t('subscriptionDaysLeft', { days: subscription.daysRemaining })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* No chart notice */}
        {hasChart === false && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold text-sm">!</div>
            <div>
              <p className="text-sm font-bold text-amber-800 mb-1">{t('noChartTitle')}</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                {t('noChartDesc')}
              </p>
              <Link href="/disk">
                <button className="mt-2 px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors">
                  {t('goToDisk')}
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Daily fortune card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-amber-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              {t('dailyFortuneTitle')}
              {hasChart && <span className="text-xs text-purple-500 font-normal">{t('personalized')}</span>}
            </h2>
            {dailyFortune && (
              <span className="text-xs text-gray-400">{dailyFortune.date}</span>
            )}
          </div>
          {subscription === null ? (
            <div className="py-6 text-center">
              <div className="inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-400">{t('loadingText')}</p>
            </div>
          ) : !subscription.isSubscribed && !isAdmin ? (
            <div className="py-4 text-center space-y-3">
              <p className="text-sm text-gray-500 leading-relaxed">
                {t('subscribeOnly')}<span className="font-bold text-amber-700">{t('subscribeOnlyBold')}</span>{t('subscribeOnlySuffix')}
              </p>
              <Link href="/subscribe">
                <button className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors">
                  {t('subscribeToView')}
                </button>
              </Link>
            </div>
          ) : fortuneLoading ? (
            <div className="py-6 text-center">
              <div className="inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-400">{t('fortuneLoadingText')}</p>
            </div>
          ) : fortuneError ? (
            <div className="py-4 text-center">
              <p className="text-sm text-red-400">{fortuneError}</p>
              <button
                onClick={fetchDailyFortune}
                className="mt-2 text-xs text-amber-600 underline"
              >
                {t('fortuneRetry')}
              </button>
            </div>
          ) : dailyFortune ? (
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {dailyFortune.content}
            </div>
          ) : null}
        </div>

        {/* Tab bar */}
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

        {/* Tab content */}
        <div className="bg-white rounded-2xl shadow-sm p-6">

          {/* Profile tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-3">{t('profileTitle')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">{t('labelName')}</p>
                  <p className="text-gray-900 font-medium">{displayName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">{t('labelEmail')}</p>
                  <p className="text-gray-900 font-medium break-all">{displayEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">{t('labelMemberLevel')}</p>
                  {subscription?.isSubscribed ? (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.planCode === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                      subscription.planCode === 'SILVER' ? 'bg-slate-100 text-slate-700' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {subscription.planName}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 font-medium">
                      {t('regularMember')}
                    </span>
                  )}
                </div>
              </div>

              {mingGongStars && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <p className="text-xs font-medium text-purple-500 mb-1">{t('mingGongLabel')}</p>
                  <p className="text-gray-800 font-semibold">{mingGongStars}</p>
                  <p className="text-xs text-gray-400 mt-1">{t('mingGongApplied')}</p>
                </div>
              )}

              {/* Subscription nudge */}
              {subscription !== null && !subscription.isSubscribed && (
                <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-xl p-5 text-white">
                  <p className="font-bold mb-1">{t('notSubscribedTitle')}</p>
                  <p className="text-amber-200 text-xs leading-relaxed mb-3">
                    {t('notSubscribedDesc')}
                  </p>
                  <Link href="/subscribe">
                    <button className="bg-white text-amber-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors">
                      {t('viewSubscribePlans')}
                    </button>
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm font-bold text-gray-700 mb-3">{t('quickActions')}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/disk">
                    <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                      {t('goToChart')}
                    </button>
                  </Link>
                  <Link href="/subscribe">
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                      {t('subscribePlan')}
                    </button>
                  </Link>
                  <Link href="/blessing">
                    <button className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">
                      {t('blessingService')}
                    </button>
                  </Link>
                  <Link href="/appointment">
                    <button className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">
                      {t('consultationBooking')}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Subscription tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-3">{t('subscriptionTitle')}</h2>

              {paymentNotice === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm flex items-start justify-between gap-3">
                  <span>{t('paymentSuccess')}</span>
                  <button onClick={() => setPaymentNotice(null)} className="text-green-500 hover:text-green-700 flex-shrink-0">x</button>
                </div>
              )}
              {paymentNotice === 'cancelled' && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-4 text-sm flex items-start justify-between gap-3">
                  <span>{t('paymentCancelled')}</span>
                  <button onClick={() => setPaymentNotice(null)} className="text-yellow-500 hover:text-yellow-700 flex-shrink-0">x</button>
                </div>
              )}

              {subscription?.isSubscribed ? (
                <>
                  {/* Current subscription card */}
                  <div className={`rounded-xl p-5 text-white ${
                    subscription.planCode === 'GOLD' ? 'bg-gradient-to-r from-yellow-500 to-amber-600' :
                    subscription.planCode === 'SILVER' ? 'bg-gradient-to-r from-slate-500 to-slate-700' :
                    'bg-gradient-to-r from-amber-700 to-amber-900'
                  }`}>
                    <p className="text-sm opacity-80 mb-1">{t('currentPlan')}</p>
                    <p className="text-2xl font-bold">{subscription.planName}</p>
                    <p className="text-sm opacity-80 mt-2">
                      {t('expiry', {
                        date: subscription.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString() : '---',
                        days: subscription.daysRemaining ?? 0,
                      })}
                    </p>
                  </div>

                  {/* LINE daily push settings */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-bold text-green-800">{t('linePushTitle')}</p>
                    <p className="text-xs text-green-700 leading-relaxed">
                      {t('linePushDesc')}
                    </p>

                    {!hasLineLinked ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-green-800">{t('lineSetupStepsTitle')}</p>
                        <ol className="text-xs text-green-700 space-y-1.5 list-decimal list-inside">
                          <li>
                            {t('lineStep1')}
                            <a
                              href="https://line.me/R/ti/p/@213qrysy"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 underline font-medium text-green-900"
                            >
                              {t('lineStep1Link')}
                            </a>
                          </li>
                          <li>{t('lineStep2')}</li>
                          <li>
                            <Link href="/login" className="underline font-medium text-green-900">
                              {t('lineStep3Prefix')}
                            </Link>
                            {t('lineStep3Suffix')}
                          </li>
                        </ol>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-xs font-medium text-green-800">{t('lineLinked')}</p>
                          <p className="text-xs text-green-600">{notifyEnabled ? t('lineNotifyOn') : t('lineNotifyOff')}</p>
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

                  {/* Quota usage */}
                  {subscription.quotaStatus && subscription.quotaStatus.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-3">{t('quotaTitle')}</p>
                      <div className="space-y-3">
                        {subscription.quotaStatus.map((q, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{
                                q.productCode === 'BOOK_BAZI' ? t('bookBazi') :
                                q.productCode === 'BOOK_LIUNIAN' ? t('bookLiunian') :
                                q.productCode === 'BOOK_DAIYUN' ? t('bookDaiyun') :
                                q.productCode
                              }</p>
                              <p className="text-xs text-gray-400">{t('quotaUsed', { used: q.used, total: q.total })}</p>
                            </div>
                            <span className={`text-sm font-bold ${q.remaining > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              {t('quotaRemaining', { remaining: q.remaining })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Plan benefits */}
                  {subscription.benefits && subscription.benefits.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-3">{t('benefitsTitle')}</p>
                      <div className="space-y-2">
                        {subscription.benefits.map((b, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-green-500 font-bold mt-0.5">v</span>
                            <span>{b.description ?? `${b.benefitType} ${b.benefitValue}`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Link href="/subscribe">
                      <button className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">
                        {t('viewOtherPlans')}
                      </button>
                    </Link>
                  </div>
                </>
              ) : (
                /* Not subscribed */
                <div className="space-y-4">
                  {subscription?.isInTrial && (
                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                      <p className="text-teal-800 font-bold text-sm mb-1">{t('trialTitle')}</p>
                      <p className="text-teal-700 text-sm">{t('trialDaysLeft', { days: subscription.trialDaysRemaining ?? 0 })}</p>
                      <p className="text-teal-600 text-xs mt-1">{t('trialDesc')}</p>
                    </div>
                  )}
                  {!subscription?.isInTrial && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
                      {t('trialEnded')}
                    </div>
                  )}
                  <div className="text-center py-4">
                    <p className="text-gray-700 font-medium mb-1">{t('noSubscriptionTitle')}</p>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                      {t('noSubscriptionDesc')}
                    </p>
                    <Link href="/subscribe">
                      <button className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors">
                        {t('viewSubscribePlans')}
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nine Star tab */}
          {activeTab === 'ninestar' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-3">{t('nineStarTitle')}</h2>

              {nineStarError && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-amber-700 text-sm">{nineStarError}</p>
                  <p className="text-amber-600 text-xs mt-1">{t('nineStarErrorFill')}</p>
                  <Link href="/disk">
                    <button className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                      {t('goFillBirthData')}
                    </button>
                  </Link>
                </div>
              )}

              {nineStarDaily && (
                <>
                  {/* Natal star card */}
                  <div className="bg-gradient-to-br from-amber-800 to-amber-900 rounded-2xl p-5 text-white">
                    <p className="text-amber-300 text-xs mb-1">{t('yourNatalStar')}</p>
                    <p className="text-2xl font-bold">{nineStarDaily.natalStar.name}</p>
                    <p className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${nineStarDaily.isProspering ? 'bg-green-600 text-green-100' : 'bg-gray-600 text-gray-200'}`}>
                      {t('currentYun', { status: nineStarDaily.yunStatus })}
                    </p>
                    <p className="text-amber-200 text-xs mt-2">{nineStarDaily.date}</p>
                  </div>

                  {/* Overall assessment */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-700 mb-1">{t('todayOverall')}</p>
                    <p className="text-sm text-amber-900 leading-relaxed">{nineStarDaily.overallVerdict}</p>
                  </div>

                  {/* Today's four stars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: t('yearStar'), star: nineStarDaily.yearStar },
                      { label: t('monthStar'), star: nineStarDaily.monthStar },
                      { label: t('dayStar'), star: nineStarDaily.dayStar },
                      { label: t('hourStar'), star: nineStarDaily.hourStar },
                    ].map(({ label, star }) => (
                      <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className="text-lg font-bold text-amber-700">{star.number}</p>
                        <p className="text-xs text-gray-700">{star.name}</p>
                      </div>
                    ))}
                  </div>

                  {/* Star combination analysis */}
                  {nineStarDaily.combinations && nineStarDaily.combinations.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                      <p className="text-sm font-bold text-gray-700 mb-3">{t('combinationTitle')}</p>
                      <div className="space-y-2">
                        {nineStarDaily.combinations.map((c, i) => {
                          const verdictColor =
                            c.modified.includes('最吉') || c.modified.includes('大吉') ? 'text-green-700 bg-green-50 border-green-200' :
                            c.modified.startsWith('吉') ? 'text-green-600 bg-green-50 border-green-100' :
                            c.modified.includes('偏吉') ? 'text-lime-700 bg-lime-50 border-lime-200' :
                            c.modified.startsWith('平') ? 'text-gray-600 bg-gray-50 border-gray-200' :
                            c.modified.includes('偏凶') ? 'text-orange-700 bg-orange-50 border-orange-200' :
                            c.modified.startsWith('凶') ? 'text-red-600 bg-red-50 border-red-200' :
                            c.modified.includes('大凶') || c.modified.includes('最凶') ? 'text-red-800 bg-red-100 border-red-300' :
                            'text-gray-600 bg-gray-50 border-gray-200';
                          return (
                            <div key={i} className="flex items-start gap-3 text-sm">
                              <span className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">{c.pair}</span>
                              <span className="text-gray-600 w-24 flex-shrink-0">
                                {c.starA.number}({c.starA.name.slice(0,2)}) x {c.starB.number}({c.starB.name.slice(0,2)})
                              </span>
                              <span className="text-gray-500 text-xs flex-1">{c.title || ''}{c.description ? `　${c.description}` : ''}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${verdictColor}`}>{c.modified}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Today's fortune detail */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-2">{t('fortuneDetailTitle')}</p>
                      <p className="text-gray-700 text-sm leading-relaxed">{nineStarDaily.fortuneText}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                        <p className="text-xs font-bold text-green-700 mb-1">{t('auspicious')}</p>
                        <p className="text-sm text-green-800">{nineStarDaily.auspicious || '-'}</p>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                        <p className="text-xs font-bold text-red-600 mb-1">{t('avoid')}</p>
                        <p className="text-sm text-red-700">{nineStarDaily.avoid || '-'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <p className="text-xs font-bold text-blue-600 mb-1">{t('direction')}</p>
                        <p className="text-sm text-blue-700">{nineStarDaily.direction || '-'}</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                        <p className="text-xs font-bold text-purple-600 mb-1">{t('color')}</p>
                        <p className="text-sm text-purple-700">{nineStarDaily.color || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 text-center">
                    {t('nineStarNote')}
                  </p>
                </>
              )}

              {!nineStarLoaded && !nineStarError && (
                <div className="text-center py-8 text-gray-400 text-sm">{t('loadingText')}</div>
              )}
            </div>
          )}

          {/* Orders tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-3">{t('ordersTitle')}</h2>
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">{t('loadingText')}</div>
              ) : orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.orderType === 'point_purchase' ? t('pointPurchase') : order.orderType}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {order.points && (
                            <p className="text-sm text-amber-600 mt-1 font-medium">
                              +{order.points}
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
                              ? t('statusCompleted')
                              : order.status === 'pending'
                              ? t('statusPending')
                              : t('statusFailed')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-3xl mb-2">🛒</p>
                  <p className="text-sm">{t('noOrders')}</p>
                  <Link href="/subscribe">
                    <button className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                      {t('goSubscribe')}
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Reports tab */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-3">{t('reportsTitle')}</h2>

              {reportLoading && (
                <div className="text-center py-8 text-amber-600">{t('loadingText')}</div>
              )}

              {selectedReport ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="text-sm text-amber-700 underline hover:text-amber-900"
                    >
                      {t('backToList')}
                    </button>
                    <span className="text-sm text-gray-500">{selectedReport.title}</span>
                  </div>
                  <div className="bg-[#F9F3E9] border-2 border-amber-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-amber-900 mb-4 text-center">{selectedReport.title}</h3>
                    <p className="text-xs text-gray-400 text-center mb-4">
                      {new Date(selectedReport.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-serif">
                      {selectedReport.content}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {reportsLoaded && userReports.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm mb-3">{t('noReports')}</p>
                      <Link href="/disk">
                        <button className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors">
                          {t('generateReport')}
                        </button>
                      </Link>
                    </div>
                  )}
                  {userReports.length > 0 && (
                    <div className="space-y-2">
                      {userReports.map(r => (
                        <button
                          key={r.id}
                          onClick={() => fetchReportDetail(r.id)}
                          className="w-full text-left flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50 transition-all shadow-sm"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{r.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <span className="text-amber-600 text-sm font-medium">{t('viewReport')}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Security tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-3">{t('securityTitle')}</h2>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <p className="text-sm font-bold text-gray-700">{t('changePasswordTitle')}</p>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t('labelCurrentPassword')}</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={e =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none transition"
                    placeholder={t('placeholderCurrentPassword')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t('labelNewPassword')}</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={e =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none transition"
                    placeholder={t('placeholderNewPassword')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t('labelConfirmPassword')}</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none transition"
                    placeholder={t('placeholderConfirmPassword')}
                  />
                </div>
                {passwordMsg && (
                  <p
                    className={`text-sm ${
                      passwordMsg.includes(t('passwordSuccess').slice(0, 4)) ? 'text-green-600' : 'text-red-500'
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
                  {passwordLoading ? t('changingPassword') : t('confirmChange')}
                </button>
              </form>

              <div className="border-t pt-6">
                <p className="text-sm font-bold text-gray-700 mb-3">{t('securityInfoTitle')}</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>{t('securityInfo1')}</li>
                  <li>{t('securityInfo2')}</li>
                  <li>{t('securityInfo3')}</li>
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
