'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ServiceTypeItem {
  key: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  duration: string;
}

export default function ServiceTypes() {
  const t = useTranslations('Lectures');
  const serviceTypesArray = t.raw('serviceTypes') as ServiceTypeItem[];

  const [selectedKey, setSelectedKey] = useState<string>(serviceTypesArray[0]?.key ?? 'enterprise');

  const servicesMap = Object.fromEntries(serviceTypesArray.map((item) => [item.key, item]));
  const selectedService = servicesMap[selectedKey] ?? serviceTypesArray[0];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-amber-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('serviceTypesTitle')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('serviceTypesDesc')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {serviceTypesArray.map((service) => (
            <button
              key={service.key}
              onClick={() => setSelectedKey(service.key)}
              className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedKey === service.key
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-amber-100 border border-gray-200'
              }`}
            >
              {service.title}
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {selectedService.title}
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  {selectedService.description}
                </p>

                <div className="space-y-3 mb-8">
                  {selectedService.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-sm"></i>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center space-x-2">
                    <i className="ri-time-line text-amber-600"></i>
                    <span>{t('durationLabel')}{selectedService.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="ri-money-dollar-circle-line text-amber-600"></i>
                    <span>{t('priceLabel')}{selectedService.price}</span>
                  </div>
                </div>

                <button className="bg-amber-600 text-white px-8 py-3 rounded-full hover:bg-amber-700 transition-colors font-semibold whitespace-nowrap cursor-pointer">
                  {t('bookServiceBtn')}
                </button>
              </div>

              <div className="h-80 rounded-2xl overflow-hidden">
                <Image
                  src={`https://readdy.ai/api/search-image?query=Professional%20${selectedKey}%20lecture%20and%20consultation%20service%20scene%2C%20modern%20business%20environment%20with%20traditional%20Chinese%20wisdom%20elements%2C%20elegant%20presentation%20setup%2C%20warm%20professional%20atmosphere%2C%20contemporary%20interior%20design%20with%20cultural%20accents&width=600&height=400&seq=service-${selectedKey}&orientation=landscape`}
                  alt={selectedService.title}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
