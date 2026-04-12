'use client';

import { useTranslations } from 'next-intl';

const featureIcons = [
  'ri-focus-3-line',
  'ri-file-text-line',
  'ri-lightbulb-flash-line',
];

export default function FeaturesSection() {
  const t = useTranslations('Features');
  const items = t.raw('items') as Array<{ title: string; description: string }>;

  return (
    <section id="features" className="section-container bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title">{t('sectionTitle')}</h2>
          <div className="w-20 h-1 bg-gradient-gold mx-auto"></div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((feature, index) => (
            <div
              key={index}
              className="card-base group hover:shadow-brand-lg transition-all duration-350"
            >
              {/* Icon */}
              <div className="mb-6">
                <i
                  className={`${featureIcons[index]} text-5xl text-brand-300 group-hover:scale-110 transition-transform duration-350`}
                ></i>
              </div>

              {/* Content */}
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Accent bar */}
              <div className="mt-6 pt-6 border-t-2 border-brand-300/20 group-hover:border-brand-300/50 transition-colors">
                <span className="text-brand-600 font-semibold text-sm">
                  {t('learnMore')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
