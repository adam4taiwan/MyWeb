'use client';

import { useState } from 'react';

export default function ThemeEvents() {
  const [selectedEvent, setSelectedEvent] = useState(0);

  const events = [
    {
      title: '新春開運講座',
      category: '節慶主題',
      description: '農曆新年開運秘笈，讓您虎年大展鴻圖',
      duration: '2-3小時',
      capacity: '30-100人',
      price: '25,000-60,000',
      features: ['生肖運勢解析', '開運方位指導', '招財風水布局', '新年許願儀式'],
      suitable: ['企業尾牙', '社區活動', '商場推廣', '餐廳主題活動'],
      image: 'Traditional Chinese New Year celebration setup with elegant red and gold decorations, festive atmosphere, cultural elements, auspicious symbols, warm lighting, professional event space with traditional ornaments and modern presentation facilities'
    },
    {
      title: '職場風水講座',
      category: '商業應用',
      description: '辦公室風水布局與事業發展運勢提升',
      duration: '1.5-2小時',
      capacity: '20-80人',
      price: '20,000-45,000',
      features: ['辦公桌擺設', '座位方位選擇', '植物擺放建議', '色彩搭配指導'],
      suitable: ['企業內訓', '共享辦公室', '商業大樓', '創業園區'],
      image: 'Modern office environment with feng shui elements, professional workspace design, contemporary furniture arrangement, business atmosphere with traditional Chinese wisdom integration, clean sophisticated interior'
    },
    {
      title: '愛情婚姻講座',
      category: '生活應用',
      description: '姻緣配對與感情經營的古典智慧',
      duration: '2小時',
      capacity: '15-60人',
      price: '18,000-40,000',
      features: ['八字合婚解析', '桃花運提升', '夫妻相處之道', '婚嫁吉日選擇'],
      suitable: ['婚紗店合作', '婚宴會館', '交友平台', '文化中心'],
      image: 'Romantic elegant setting with traditional Chinese wedding elements, sophisticated cultural decoration, warm intimate atmosphere, beautiful floral arrangements, classic furniture with modern touches for relationship consultation'
    },
    {
      title: '親子教育講座',
      category: '家庭教育',
      description: '運用命理智慧培養孩子的天賦潛能',
      duration: '2-2.5小時',
      capacity: '20-50人',
      price: '22,000-35,000',
      features: ['兒童天賦分析', '學習方位建議', '親子溝通技巧', '成長環境規劃'],
      suitable: ['幼兒園', '補習班', '親子中心', '社區活動'],
      image: 'Warm family-friendly educational environment with traditional Chinese cultural elements, comfortable seating arrangement for parents and children, educational materials display, nurturing atmosphere with cultural wisdom integration'
    },
    {
      title: '健康養生講座',
      category: '養生保健',
      description: '五行體質調理與日常養生智慧',
      duration: '1.5-2小時',
      capacity: '25-80人',
      price: '15,000-35,000',
      features: ['體質類型分析', '四季養生法', '飲食調理建議', '運動時機指導'],
      suitable: ['養生會館', '中醫診所', '健身中心', '社區講堂'],
      image: 'Serene wellness center with traditional Chinese health and wellness elements, peaceful atmosphere, natural materials, comfortable consultation space, healthy lifestyle promotion environment with cultural wisdom'
    },
    {
      title: '財富投資講座',
      category: '財經理財',
      description: '運用命理時機掌握投資理財契機',
      duration: '2-3小時',
      capacity: '20-100人',
      price: '30,000-80,000',
      features: ['財運時機分析', '投資方位建議', '理財規劃指導', '創業時機選擇'],
      suitable: ['銀行理專', '投資顧問', '商業俱樂部', '企業家聚會'],
      image: 'Professional financial consultation environment with traditional Chinese prosperity symbols, sophisticated business atmosphere, elegant meeting room setup, modern presentation facilities with cultural elements for wealth consultation'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">主題式活動</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            針對不同節慶、場合與需求，設計專屬主題講座活動，讓傳統智慧融入現代生活各個層面
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
                <img 
                  src={`https://readdy.ai/api/search-image?query=$%7Bevents%5BselectedEvent%5D.image%7D&width=600&height=400&seq=theme-event-${selectedEvent}&orientation=landscape`}
                  alt={events[selectedEvent].title}
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
                    <span>時長：{events[selectedEvent].duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <i className="ri-group-line text-amber-600"></i>
                    <span>人數：{events[selectedEvent].capacity}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <i className="ri-money-dollar-circle-line text-amber-600"></i>
                    <span>費用：{events[selectedEvent].price}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">講座特色內容</h4>
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
                  <h4 className="font-semibold text-gray-900 mb-3">適合場所</h4>
                  <div className="flex flex-wrap gap-2">
                    {events[selectedEvent].suitable.map((place, index) => (
                      <span key={index} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                        {place}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-amber-600 text-white py-3 rounded-full hover:bg-amber-700 transition-colors font-semibold whitespace-nowrap cursor-pointer">
                  預約此主題講座
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}