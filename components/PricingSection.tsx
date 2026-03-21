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
    name: '銅會員',
    price: 1200,
    currency: 'NT$',
    description: '入門訂閱方案，享受基本會員福利',
    features: [
      '每日個人化建議',
      '每年流年命書 x1',
      '命書九折優惠',
      '年費方案，到期不自動續訂',
    ],
    cta: '訂閱銅會員',
    href: '/subscribe',
  },
  {
    name: '銀會員',
    price: 1800,
    currency: 'NT$',
    description: '進階方案，含祈福服務',
    features: [
      '每日個人化建議',
      '每年流年命書 x1',
      '命書八五折優惠',
      '問事九折優惠',
      '贈送祈福服務 x1',
    ],
    cta: '訂閱銀會員',
    recommended: true,
    href: '/subscribe',
  },
  {
    name: '金會員',
    price: 2500,
    currency: 'NT$',
    description: '尊榮方案，最大折扣與祈福服務',
    features: [
      '每日個人化建議',
      '每年流年命書 x1',
      '命書八折優惠',
      '問事八五折優惠',
      '課程八折優惠',
      '贈送祈福服務 x1',
    ],
    cta: '訂閱金會員',
    href: '/subscribe',
  },
];

export default function PricingSection() {
  return (
    <section className="section-container bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title">會員訂閱方案</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            年費訂閱，享有每日建議、命書折扣、祈福服務等專屬福利。到期後不自動續訂。
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
