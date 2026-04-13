'use client';

import { useState } from 'react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function ContactMethods() {
  const t = useTranslations('Consultation');
  const [wechatCopied, setWechatCopied] = useState(false);

  const copyWechatId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setWechatCopied(true);
      setTimeout(() => setWechatCopied(false), 2000);
    });
  };

  const socialContacts = [
    {
      platform: 'LINE',
      icon: 'ri-line-line',
      color: 'bg-green-500 hover:bg-green-600',
      id: 'adam4taiwan',
      description: t('lineDesc'),
      qrImage: '/image/lineID.jpg',
      link: 'https://line.me/ti/p/adam4taiwan',
    },
    {
      platform: t('contactWechat') || '微信',
      icon: 'ri-wechat-line',
      color: 'bg-green-600 hover:bg-green-700',
      id: 'wxid_22io062y9j1952',
      description: t('wechatDesc'),
      qrImage: '/image/WeChatID.jpg',
      link: null,
    },
  ];

  const traditionalContacts = [
    {
      method: t('phoneMethod'),
      icon: 'ri-phone-line',
      info: '0910-032-057',
      description: t('phoneDesc'),
      color: 'text-amber-600'
    },
    {
      method: t('emailMethod'),
      icon: 'ri-mail-line',
      info: 'adam4taiwan@gmail.com',
      description: t('emailDesc'),
      color: 'text-blue-600'
    },
    {
      method: t('bookingMethod'),
      icon: 'ri-phone-line',
      info: 'TEL:0970975258',
      description: t('bookingDesc'),
      color: 'text-green-600'
    }
  ];

  const consultFeatures = t.raw('consultFeatures') as string[];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('contactTitle')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('contactDesc')}
          </p>
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">{t('socialTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {socialContacts.map((contact, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
                <div className="mb-4 hidden md:block">
                  <img
                    src={contact.qrImage}
                    alt={`${contact.platform} QR Code`}
                    className="w-28 h-28 object-cover rounded-lg mx-auto"
                  />
                </div>

                <div className={`w-14 h-14 ${contact.color} rounded-full flex items-center justify-center mx-auto mb-3 transition-colors`}>
                  <i className={`${contact.icon} text-white text-2xl`}></i>
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-1">{contact.platform}</h4>
                <p className="text-amber-600 font-semibold mb-2">{contact.id}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{contact.description}</p>

                {contact.link ? (
                  <a
                    href={contact.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-4 inline-block ${contact.color} text-white px-6 py-2 rounded-full transition-colors whitespace-nowrap cursor-pointer`}
                  >
                    {t('lineJoinBtn')}
                  </a>
                ) : (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-500 hidden md:block">{t('wechatScanDesc')}</p>
                    <button
                      onClick={() => copyWechatId(contact.id)}
                      className={`inline-block ${contact.color} text-white px-6 py-2 rounded-full transition-colors whitespace-nowrap cursor-pointer`}
                    >
                      {wechatCopied ? t('wechatCopied') : t('wechatCopyBtn')}
                    </button>
                    <p className="text-xs text-gray-400 md:hidden">{t('wechatMobileDesc')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">{t('traditionalTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {traditionalContacts.map((contact, index) => (
              <div key={index} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className={`w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md`}>
                  <i className={`${contact.icon} text-2xl ${contact.color}`}></i>
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-3">{contact.method}</h4>
                <p className={`font-semibold mb-2 ${contact.color}`}>{contact.info}</p>
                <p className="text-gray-600 leading-relaxed">{contact.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Personal consultation pricing */}
        <div className="mt-16">
          <div className="bg-gradient-to-br from-amber-900 to-amber-950 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 text-center md:text-left">
                <p className="text-amber-300 text-sm font-medium tracking-widest mb-2">{t('personalConsultLabel')}</p>
                <h3 className="text-2xl font-bold mb-1">{t('personalConsultTitle')}</h3>
                <p className="text-amber-200 text-sm">{t('personalConsultDesc')}</p>
                <div className="mt-4">
                  <p className="text-4xl font-bold text-yellow-300">{t('personalConsultPrice')}</p>
                  <p className="text-amber-300 text-sm mt-1">{t('personalConsultPriceUnit')}</p>
                </div>
              </div>
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-3">
                {consultFeatures.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-amber-100">
                    <span className="text-yellow-400 font-bold">v</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex-shrink-0 text-center">
                <Link href="/appointment">
                  <button className="bg-amber-400 text-amber-900 px-8 py-3 rounded-xl font-bold hover:bg-amber-300 transition-colors whitespace-nowrap">
                    {t('bookNowBtn')}
                  </button>
                </Link>
                <p className="text-amber-300 text-xs mt-2">{t('memberDiscountNote')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-2">{t('servicePromise')}</h3>
            <p className="text-sm opacity-90">
              {t('servicePromiseDesc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
