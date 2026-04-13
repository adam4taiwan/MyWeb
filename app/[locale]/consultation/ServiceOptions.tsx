
'use client';

import { useTranslations } from 'next-intl';

interface ServiceOptionsProps {
  onServiceSelect: (service: string, type: string) => void;
}

const visualConfig: Record<string, { symbol: string; gradient: string; accent: string }> = {
  'personal-fortune': {
    symbol: '\u547d',
    gradient: 'from-amber-800 to-amber-950',
    accent: 'text-amber-300',
  },
  'career-guidance': {
    symbol: '\u696d',
    gradient: 'from-slate-700 to-slate-900',
    accent: 'text-amber-300',
  },
  relationship: {
    symbol: '\u7de3',
    gradient: 'from-rose-800 to-rose-950',
    accent: 'text-rose-200',
  },
  'health-wellness': {
    symbol: '\u58fd',
    gradient: 'from-emerald-800 to-emerald-950',
    accent: 'text-emerald-200',
  },
  'feng-shui': {
    symbol: '\u5b85',
    gradient: 'from-teal-800 to-teal-950',
    accent: 'text-teal-200',
  },
  'business-feng-shui': {
    symbol: '\u8ca1',
    gradient: 'from-yellow-700 to-amber-900',
    accent: 'text-yellow-200',
  },
};

export default function ServiceOptions({ onServiceSelect }: ServiceOptionsProps) {
  const t = useTranslations('Consultation');
  const services = t.raw('services') as Array<{ id: string; title: string; description: string; features: string[] }>;

  return (
    <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('servicesTitle')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('servicesDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const visual = visualConfig[service.id] ?? { symbol: '', gradient: 'from-amber-800 to-amber-950', accent: 'text-amber-300' };
            return (
              <div key={service.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`h-48 bg-gradient-to-br ${visual.gradient} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                  ></div>
                  <span className={`text-8xl font-bold ${visual.accent} opacity-90 select-none`}
                    style={{ fontFamily: 'serif', textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
                    {visual.symbol}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>

                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <i className="ri-check-line text-green-500 mr-2"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => onServiceSelect(service.title, 'message')}
                        className="bg-blue-600 text-white px-3 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center"
                      >
                        <i className="ri-message-line mr-2"></i>
                        {t('btnChat')}
                      </button>
                      <button
                        onClick={() => onServiceSelect(service.title, 'email')}
                        className="bg-green-600 text-white px-3 py-3 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center"
                      >
                        <i className="ri-mail-line mr-2"></i>
                        {t('btnEmail')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
