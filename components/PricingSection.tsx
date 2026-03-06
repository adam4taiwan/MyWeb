'use client';

import Link from 'next/link';

interface PricingPlan {
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  cta: string;
  recommended?: boolean;
  href: string;
}

const pricingPlans: PricingPlan[] = [
  {
    name: '基礎命盤',
    price: 1200,
    currency: 'NT$',
    description: '完整的八字和紫微分析',
    features: [
      '完整命盤報告',
      '八字詳細解讀',
      '五行分析',
      '立即交付',
    ],
    cta: '選擇此方案',
    href: '/login',
  },
  {
    name: '進階深度分析',
    price: 2800,
    currency: 'NT$',
    description: '專業諮詢師為您深度解讀',
    features: [
      '完整命盤報告',
      '全面分析（八字+紫微）',
      '年度運勢預測',
      '1 次 30分鐘諮詢',
      '1 小時內交付',
      '優先客服支持',
    ],
    cta: '熱銷推薦',
    recommended: true,
    href: '/login',
  },
  {
    name: 'VIP 終身會員',
    price: 8888,
    currency: 'NT$',
    description: '全套諮詢和終身支持',
    features: [
      '上述所有服務',
      '1 次深度面諮（60 分）',
      '婚配分析',
      '團隊命盤分析',
      '優先預約',
      '專屬 WhatsApp 群組',
      '終身高優先級客服',
    ],
    cta: '聯繫我們',
    href: '/contact',
  },
];

export default function PricingSection() {
  return (
    <section className="section-container bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title">透明的價格，卓越的價值</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            選擇最適合您的方案。所有客戶都享受相同的高品質分析和支持。
          </p>
        </div>

        {/* Pricing cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl transition-all duration-350 ${
                plan.recommended
                  ? 'ring-2 ring-brand-300 shadow-brand-lg md:scale-105 bg-brand-50'
                  : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Recommended badge */}
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-brand-300 text-brand-900 px-4 py-1 rounded-full text-sm font-bold">
                    熱銷推薦
                  </span>
                </div>
              )}

              <div className="p-8 space-y-6">
                {/* Plan name */}
                <div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mt-2">{plan.description}</p>
                </div>

                {/* Price */}
                <div>
                  <p className="text-5xl font-bold text-brand-300">
                    {plan.currency}
                    {plan.price.toLocaleString()}
                  </p>
                  {index < 2 && <p className="text-gray-500 text-sm mt-2">/次</p>}
                </div>

                {/* Features list */}
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <span className="text-brand-300 font-bold text-lg">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href={plan.href} className="block">
                  <button
                    className={`w-full py-3 rounded-lg font-bold transition-all duration-250 ${
                      plan.recommended
                        ? 'bg-brand-300 text-brand-900 hover:bg-brand-400'
                        : 'border-2 border-brand-300 text-brand-300 hover:bg-brand-300/10'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Trust signal */}
        <div className="mt-16 p-8 bg-white rounded-xl border border-gray-200 text-center">
          <p className="text-gray-700">
            <span className="font-bold text-brand-600">💳 玉洞子古學堂安心付款保證：</span>
            銀行轉帳方式最安全，我們不儲存任何銀行敏感信息。
            <span className="block mt-2 text-sm text-gray-600">
              ✓ 7 天內無條件退款保證
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
