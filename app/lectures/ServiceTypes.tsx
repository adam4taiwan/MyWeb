'use client';

import { useState } from 'react';

export default function ServiceTypes() {
  type ServiceKey = keyof typeof services;
  const [selectedService, setSelectedService] = useState<ServiceKey>('enterprise');

  const services = {
    enterprise: {
      title: '企業講座服務',
      description: '為企業員工提供命理智慧與職場應用',
      features: ['員工身心平衡', '團隊和諧建議', '企業文化融合', '領導決策支援'],
      price: '面議',
      duration: '2-4小時'
    },
    restaurant: {
      title: '餐飲業合作',
      description: '結合美食與命理文化的特色體驗',
      features: ['主題餐廳設計', '菜單命理解析', '用餐吉時建議', '食材五行搭配'],
      price: '每場 15,000-30,000',
      duration: '1-2小時'
    },
    hotel: {
      title: '飯店合作服務',
      description: '為住客提供尊榮命理諮詢體驗',
      features: ['VIP客製服務', '房間風水建議', '旅遊吉日規劃', '商務決策諮詢'],
      price: '每月合作方案',
      duration: '彈性安排'
    },
    academy: {
      title: '學苑教育合作',
      description: '將命理智慧融入終身學習課程',
      features: ['課程設計規劃', '師資培訓服務', '教材編寫協助', '認證考核制度'],
      price: '長期合作方案',
      duration: '依課程規劃'
    },
    home: {
      title: '到府服務',
      description: '專業老師親自到府提供個人或小團體服務',
      features: ['居家風水勘察', '家族命理分析', '私人專屬諮詢', '小團體講座'],
      price: '每次 8,000-20,000',
      duration: '2-3小時'
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-amber-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">多元服務類型</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            提供企業、餐飲、飯店、學苑等各行業專業講座服務，將傳統命理智慧融入現代商業應用
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Object.entries(services).map(([key, service]) => (
            <button
              key={key}
              onClick={() => setSelectedService(key as ServiceKey)}
              className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedService === key 
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
                  {services[selectedService].title}
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  {services[selectedService].description}
                </p>
                
                <div className="space-y-3 mb-8">
                  {services[selectedService].features.map((feature, index) => (
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
                    <span>時長：{services[selectedService].duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="ri-money-dollar-circle-line text-amber-600"></i>
                    <span>費用：{services[selectedService].price}</span>
                  </div>
                </div>

                <button className="bg-amber-600 text-white px-8 py-3 rounded-full hover:bg-amber-700 transition-colors font-semibold whitespace-nowrap cursor-pointer">
                  預約此服務
                </button>
              </div>

              <div className="h-80 rounded-2xl overflow-hidden">
                <img 
                  src={`https://readdy.ai/api/search-image?query=Professional%20$%7BselectedService%7D%20lecture%20and%20consultation%20service%20scene%2C%20modern%20business%20environment%20with%20traditional%20Chinese%20wisdom%20elements%2C%20elegant%20presentation%20setup%2C%20warm%20professional%20atmosphere%2C%20contemporary%20interior%20design%20with%20cultural%20accents&width=600&height=400&seq=service-${selectedService}&orientation=landscape`}
                  alt={services[selectedService].title}
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