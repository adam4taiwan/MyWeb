'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function FAQSection() {
  const [expandedId, setExpandedId] = useState<number | null>(0);
  const t = useTranslations('FAQ');
  const faqs = t.raw('items') as Array<{ question: string; answer: string }>;

  return (
    <section className="section-container bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title">{t('sectionTitle')}</h2>
          <p className="text-gray-600 mt-4">
            {t('sectionDesc')}
          </p>
        </div>

        {/* FAQ items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-brand overflow-hidden bg-white hover:shadow-lg transition-shadow duration-250"
            >
              {/* Question button */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === index ? null : index)
                }
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
              >
                <span className="font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <i
                  className={`ri-arrow-down-s-line text-brand-300 text-xl transition-transform duration-350 flex-shrink-0 ${
                    expandedId === index ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>

              {/* Answer */}
              {expandedId === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions? */}
        <div className="mt-12 p-8 bg-brand-50 rounded-brand border border-brand-200 text-center">
          <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">
            {t('stillHaveQuestion')}
          </h3>
          <p className="text-gray-700 mb-6">
            {t('contactPrompt')}
          </p>
          <button className="btn-primary">
            {t('contactBtn')}
          </button>
        </div>
      </div>
    </section>
  );
}
