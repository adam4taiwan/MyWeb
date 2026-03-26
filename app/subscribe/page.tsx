'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';

interface PlanBenefit {
  productCode: string | null;
  productType: string | null;
  benefitType: string;
  benefitValue: string;
  description: string | null;
}

interface Plan {
  id: number;
  code: string;
  name: string;
  priceTwd: number;
  durationDays: number;
  description: string | null;
  benefits: PlanBenefit[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ecanapi.fly.dev/api';

const PLAN_META: Record<string, { badge: string; color: string; border: string; btnClass: string; highlight: boolean; pointsValue: number; savingLabel: string }> = {
  BRONZE: {
    badge: '銅會員',
    color: 'from-amber-700 to-amber-900',
    border: 'border-amber-300',
    btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    highlight: false,
    pointsValue: 1500,
    savingLabel: '省 NT$300',
  },
  SILVER: {
    badge: '銀會員',
    color: 'from-slate-500 to-slate-700',
    border: 'border-slate-400',
    btnClass: 'bg-slate-600 hover:bg-slate-700 text-white',
    highlight: true,
    pointsValue: 2500,
    savingLabel: '省 NT$700',
  },
  GOLD: {
    badge: '金會員',
    color: 'from-yellow-500 to-amber-600',
    border: 'border-yellow-400',
    btnClass: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    highlight: false,
    pointsValue: 4000,
    savingLabel: '省 NT$1,500',
  },
};

function benefitLabel(b: PlanBenefit): string {
  if (b.description) return b.description;
  if (b.benefitType === 'access') return '每日建議存取';
  if (b.benefitType === 'quota') return `免費額度 x${b.benefitValue}`;
  if (b.benefitType === 'discount') {
    const pct = Math.round(parseFloat(b.benefitValue) * 100);
    const target = b.productType ?? b.productCode ?? '';
    const typeMap: Record<string, string> = { book: '命書', blessing: '祈福服務', consultation: '問事', course: '課程' };
    return `${typeMap[target] ?? target}享 ${pct} 折`;
  }
  return b.benefitValue;
}

export default function SubscribePage() {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/Subscription/plans`)
      .then(r => r.json())
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planCode: string) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/subscribe');
      return;
    }
    setPurchasing(planCode);
    try {
      const res = await fetch(`${API_URL}/Payment/create-subscription-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planCode }),
      });
      const data = await res.json();
      if (data.actionUrl && data.parameters) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.actionUrl;
        Object.entries(data.parameters).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else {
        alert(data.message || '訂閱失敗，請稍後再試');
      }
    } catch {
      alert('連線失敗，請稍後再試');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <div className="fixed top-0 left-0 right-0 z-[100] bg-white shadow-md">
        <Header />
      </div>

      <main className="flex-grow pt-20 pb-16 px-4">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center py-10">
          <p className="text-amber-600 text-sm font-medium tracking-widest mb-2">MEMBERSHIP</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">選擇您的會員方案</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            訂閱即可獲得每日個人化建議、命書折扣、祈福服務等專屬福利。
            <br />每個方案均以年為單位，到期前皆可續訂。
          </p>
        </div>

        {/* Plans */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => {
              const meta = PLAN_META[plan.code] ?? PLAN_META.BRONZE;
              return (
                <div
                  key={plan.code}
                  className={`relative bg-white rounded-2xl shadow-sm border-2 flex flex-col overflow-hidden ${meta.border} ${meta.highlight ? 'md:-translate-y-3 shadow-lg' : ''}`}
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-br ${meta.color} p-6 text-white`}>
                    {meta.highlight && (
                      <div className="absolute top-3 right-3 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        最受歡迎
                      </div>
                    )}
                    <p className="text-sm font-medium opacity-80 mb-1">{plan.name}</p>
                    <p className="text-4xl font-bold">
                      NT${plan.priceTwd.toLocaleString()}
                      <span className="text-sm font-normal opacity-80 ml-1">/ 年</span>
                    </p>
                    {/* 點數價值區塊 */}
                    <div className="mt-3 bg-white/15 rounded-lg px-3 py-2">
                      <p className="text-xs opacity-80 mb-0.5">方案服務點數價值</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">NT${meta.pointsValue.toLocaleString()}</span>
                        <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">{meta.savingLabel}</span>
                      </div>
                    </div>
                    {plan.description && (
                      <p className="text-xs opacity-70 mt-2">{plan.description}</p>
                    )}
                  </div>

                  {/* Benefits */}
                  <div className="flex-grow p-5 space-y-2.5">
                    {plan.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">v</span>
                        <span>{benefitLabel(b)}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleSubscribe(plan.code)}
                      disabled={purchasing !== null}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 ${meta.btnClass}`}
                    >
                      {purchasing === plan.code ? '處理中...' : `訂閱 ${plan.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIP Coming Soon card */}
        {!loading && (
          <div className="max-w-4xl mx-auto mt-6">
            <div className="relative rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600 shadow-lg overflow-hidden opacity-80">
              <div className="absolute top-4 right-4">
                <span className="bg-gray-600 text-gray-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  即將推出
                </span>
              </div>
              <div className="p-6 flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex-shrink-0">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">VIP</p>
                  <p className="text-2xl font-bold text-yellow-300">VIP 會員</p>
                  <p className="text-3xl font-bold text-yellow-300 mt-2">NT$6,000<span className="text-sm font-normal text-gray-400 ml-1">/ 年</span></p>
                  <div className="mt-2 bg-white/10 rounded-lg px-3 py-1.5">
                    <p className="text-xs text-gray-400 mb-0.5">方案服務點數價值</p>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-yellow-300">NT$8,000+</span>
                      <span className="bg-yellow-500/30 text-yellow-300 text-xs font-bold px-2 py-0.5 rounded-full">省 NT$2,000+</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">頂級尊榮，一次擁有最完整服務</p>
                </div>
                <div className="flex-grow grid grid-cols-2 gap-2">
                  {['每日個人化建議', '終身命書(8大運) x1', '玉洞子解說 x1', '流年命書六折優惠', '問事六折優惠', '課程八折優惠', '贈送祈福服務 x1'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-yellow-400 font-bold">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="flex-shrink-0">
                  <button disabled className="w-full px-6 py-3 rounded-xl font-bold bg-gray-600 text-gray-400 cursor-not-allowed text-sm">
                    敬請期待
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ / Notes */}
        <div className="max-w-2xl mx-auto mt-14 space-y-4">
          <h2 className="text-center text-base font-bold text-gray-700 mb-4">常見問題</h2>
          {[
            ['訂閱後何時生效？', '付款完成後立即生效，有效期 365 天。'],
            ['可以升級方案嗎？', '可以。升級後新方案到期日從購買日起算 365 天，並與現有訂閱合計。'],
            ['祈福服務如何使用？', '銀會員及金會員每年可領取 1 項免費祈福服務（安太歲、光明燈、補財庫、祈福服務擇一）。前往會員中心點選兌換後，由玉洞子代辦，並寄送電子收據。'],
            ['命書折扣如何計算？', '訂閱後購買命書時，系統自動套用折扣點數，無需手動輸入折扣碼。'],
            ['如何取消訂閱？', '訂閱為一次性年費，到期後不自動續訂。如需繼續享有福利，請在到期前手動續訂。'],
          ].map(([q, a]) => (
            <details key={q} className="bg-white rounded-xl border border-gray-100 p-4 group">
              <summary className="font-medium text-gray-800 cursor-pointer text-sm list-none flex justify-between items-center">
                {q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform text-xs">v</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>

        {/* Back to member */}
        {isAuthenticated && (
          <div className="text-center mt-10">
            <Link href="/member" className="text-sm text-amber-600 hover:underline">
              返回會員中心
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
