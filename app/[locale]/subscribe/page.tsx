'use client';

import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import { useTranslations } from 'next-intl';

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

const PLAN_META: Record<string, { color: string; border: string; btnClass: string; highlight: boolean }> = {
  BRONZE: {
    color: 'from-amber-700 to-amber-900',
    border: 'border-amber-300',
    btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    highlight: false,
  },
  SILVER: {
    color: 'from-slate-500 to-slate-700',
    border: 'border-slate-400',
    btnClass: 'bg-slate-600 hover:bg-slate-700 text-white',
    highlight: true,
  },
  GOLD: {
    color: 'from-yellow-500 to-amber-600',
    border: 'border-yellow-400',
    btnClass: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    highlight: false,
  },
};

export default function SubscribePage() {
  const t = useTranslations('Subscribe');
  const tPricing = useTranslations('Pricing');
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  function planDisplayName(code: string): string {
    const key = `planName_${code}` as Parameters<typeof t>[0];
    return t(key);
  }

  function benefitLabel(b: PlanBenefit): string {
    // Use productCode-based translation key first
    if (b.productCode) {
      const codeKey = `benefit_${b.productCode}` as Parameters<typeof t>[0];
      try { const v = t(codeKey); if (v) return v; } catch { /* fallthrough */ }
    }
    if (b.benefitType === 'access') return t('benefitAccess');
    if (b.benefitType === 'quota') return t('benefitQuota', { value: b.benefitValue });
    if (b.benefitType === 'discount') {
      const pct = Math.round(parseFloat(b.benefitValue) * 100);
      const target = b.productType ?? b.productCode ?? '';
      const keyMap: Record<string, string> = {
        book: 'benefitDiscountBook',
        blessing: 'benefitDiscountBlessing',
        consultation: 'benefitDiscountConsultation',
        course: 'benefitDiscountCourse',
      };
      const key = keyMap[target];
      if (key) return t(key as Parameters<typeof t>[0], { pct });
      return `${target} ${pct}%`;
    }
    return b.benefitValue;
  }

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
        alert(data.message || t('subscribeError'));
      }
    } catch {
      alert(t('connectError'));
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
          <p className="text-amber-600 text-sm font-medium tracking-widest mb-2">{t('membership')}</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('heroTitle')}</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('heroDesc')}
            <br />{t('heroDesc2')}
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
                        {t('mostPopular')}
                      </div>
                    )}
                    <p className="text-sm font-medium opacity-80 mb-1">{planDisplayName(plan.code)}</p>
                    <p className="text-4xl font-bold">
                      NT${plan.priceTwd.toLocaleString()}
                      <span className="text-sm font-normal opacity-80 ml-1">{t('perYear')}</span>
                    </p>
                    {plan.description && (
                      <p className="text-xs opacity-70 mt-2">{plan.description}</p>
                    )}
                  </div>

                  {/* Benefits */}
                  <div className="flex-grow p-5 space-y-2.5">
                    {plan.benefits
                      .filter(b =>
                        b.productType !== 'consultation' &&
                        !(b.productCode ?? '').startsWith('CONSULT') &&
                        !benefitLabel(b).includes('問事')
                      )
                      .map((b, i) => (
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
                      {purchasing === plan.code ? t('processing') : t('subscribePlan', { name: planDisplayName(plan.code) })}
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
                  {tPricing('comingSoon')}
                </span>
              </div>
              <div className="p-6 flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex-shrink-0">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">VIP</p>
                  <p className="text-2xl font-bold text-yellow-300">{tPricing('vipName')}</p>
                  <p className="text-3xl font-bold text-yellow-300 mt-2">NT$6,000<span className="text-sm font-normal text-gray-400 ml-1">{tPricing('perYear')}</span></p>
                  <div className="mt-2 bg-white/10 rounded-lg px-3 py-1.5">
                    <p className="text-xs text-gray-400 mb-0.5">{t('vipPlanValue')}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-yellow-300">NT$8,000+</span>
                      <span className="bg-yellow-500/30 text-yellow-300 text-xs font-bold px-2 py-0.5 rounded-full">{t('vipSaving')}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{tPricing('vipDesc')}</p>
                </div>
                <div className="flex-grow grid grid-cols-2 gap-2">
                  {(tPricing.raw('vipFeatures') as string[]).map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-yellow-400 font-bold">v</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="flex-shrink-0">
                  <button disabled className="w-full px-6 py-3 rounded-xl font-bold bg-gray-600 text-gray-400 cursor-not-allowed text-sm">
                    {tPricing('comingSoonBtn')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ / Notes */}
        <div className="max-w-2xl mx-auto mt-14 space-y-4">
          <h2 className="text-center text-base font-bold text-gray-700 mb-4">{t('faqTitle')}</h2>
          {(t.raw('faqs') as string[][]).map(([q, a]) => (
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
              {t('backToMember')}
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
