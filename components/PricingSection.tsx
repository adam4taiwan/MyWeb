'use client';

import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

const planHrefs = ['/subscribe', '/subscribe', '/subscribe'];
const planRecommended = [false, true, false];
const planPrices = [2500, 3000, 3600];
const planCurrency = 'NT$';

export default function PricingSection() {
  const t = useTranslations('Pricing');
  const plans = t.raw('plans') as Array<{
    name: string;
    description: string;
    features: string[];
    cta: string;
  }>;
  const vipFeatures = t.raw('vipFeatures') as string[];

  return (
    <section className="section-container bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title">{t('sectionTitle')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            {t('sectionDesc')}
          </p>
        </div>

        {/* Pricing cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl transition-all duration-350 ${
                planRecommended[index]
                  ? 'ring-2 ring-brand-300 shadow-brand-lg md:scale-105 bg-brand-50'
                  : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Recommended badge */}
              {planRecommended[index] && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-brand-300 text-brand-900 px-4 py-1 rounded-full text-sm font-bold">
                    {t('recommended')}
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
                    {planCurrency}
                    {planPrices[index].toLocaleString()}
                    <span className="text-sm font-normal text-gray-500 ml-1">{t('perYear')}</span>
                  </p>
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
                <Link href={planHrefs[index]} className="block">
                  <button
                    className={`w-full py-3 rounded-lg font-bold transition-all duration-250 ${
                      planRecommended[index]
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

        {/* VIP Plan - Coming Soon */}
        <div className="relative rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600 shadow-lg overflow-hidden opacity-80">
          <div className="absolute top-4 right-4">
            <span className="bg-gray-600 text-gray-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              {t('comingSoon')}
            </span>
          </div>
          <div className="p-8 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0">
              <h3 className="text-2xl font-serif font-bold text-yellow-300">{t('vipName')}</h3>
              <p className="text-gray-400 text-sm mt-1">{t('vipDesc')}</p>
              <p className="text-4xl font-bold text-yellow-300 mt-3">NT$6,000<span className="text-sm font-normal text-gray-400 ml-1">{t('perYear')}</span></p>
            </div>
            <div className="flex-grow grid grid-cols-2 md:grid-cols-3 gap-2">
              {vipFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-yellow-400 font-bold">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="flex-shrink-0">
              <button disabled className="w-full md:w-auto px-8 py-3 rounded-lg font-bold bg-gray-600 text-gray-400 cursor-not-allowed">
                {t('comingSoonBtn')}
              </button>
            </div>
          </div>
        </div>

        {/* Trust signal */}
        <div className="mt-16 p-8 bg-white rounded-xl border border-gray-200 text-center">
          <p className="text-gray-700">
            <span className="font-bold text-brand-600">{t('trustTitle')}</span>
            {t('trustBody')}
            <span className="block mt-2 text-sm text-gray-600">
              {t('trustNote')}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
