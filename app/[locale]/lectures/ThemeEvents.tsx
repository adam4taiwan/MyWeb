'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ThemeEventItem {
  title: string;
  category: string;
  description: string;
  duration: string;
  capacity: string;
  price: string;
  features: string[];
  suitable: string[];
  image: string;
}

export default function ThemeEvents() {
  const t = useTranslations('Lectures');
  const events = t.raw('themeEvents') as ThemeEventItem[];

  const [selectedEvent, setSelectedEvent] = useState(0);

  return (
    <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('themeEventsTitle')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('themeEventsDesc')}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {events.map((event, index) => (
              <button
                key={index}
                onClick={() => setSelectedEvent(index)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedEvent === index
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-amber-100 border border-gray-200'
                }`}
              >
                {event.title}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="h-64 lg:h-auto">
                <Image
                  src={`https://readdy.ai/api/search-image?query=${events[selectedEvent].image}&width=600&height=400&seq=theme-event-${selectedEvent}&orientation=landscape`}
                  alt={events[selectedEvent].title}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="p-8 lg:p-12">
                <div className="inline-block bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  {events[selectedEvent].category}
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  {events[selectedEvent].title}
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  {events[selectedEvent].description}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <i className="ri-time-line text-amber-600"></i>
                    <span>{t('durationInfo')}{events[selectedEvent].duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <i className="ri-group-line text-amber-600"></i>
                    <span>{t('capacityInfo')}{events[selectedEvent].capacity}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <i className="ri-money-dollar-circle-line text-amber-600"></i>
                    <span>{t('priceInfo')}{events[selectedEvent].price}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">{t('lectureFeatures')}</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {events[selectedEvent].features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                        <div className="w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center">
                          <i className="ri-check-line text-white text-xs"></i>
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-3">{t('suitableVenues')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {events[selectedEvent].suitable.map((place, index) => (
                      <span key={index} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                        {place}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-amber-600 text-white py-3 rounded-full hover:bg-amber-700 transition-colors font-semibold whitespace-nowrap cursor-pointer">
                  {t('bookThemeBtn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
