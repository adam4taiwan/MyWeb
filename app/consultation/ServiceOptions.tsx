
'use client';

interface ServiceOptionsProps {
  onServiceSelect: (service: string, type: string) => void;
}

export default function ServiceOptions({ onServiceSelect }: ServiceOptionsProps) {
  const services = [
    {
      id: 'personal-fortune',
      title: '個人命理分析',
      description: '深度解析八字命盤，了解人生運勢走向',
      features: ['八字命盤分析', '流年運勢預測', '性格特質解讀', '事業發展建議'],
      image: 'traditional chinese fortune telling setup with ancient books, compass and divination tools on wooden table, warm candlelight atmosphere, mystical ambiance with red and gold accents'
    },
    {
      id: 'career-guidance',
      title: '事業發展諮詢',
      description: '針對職場發展提供專業建議與方向指引',
      features: ['職業適性分析', '升遷時機預測', '轉職建議', '事業運勢規劃'],
      image: 'professional business consultation scene with modern office setting, career planning documents and success symbols, bright and inspiring atmosphere'
    },
    {
      id: 'relationship',
      title: '感情婚姻諮詢',
      description: '解析感情運勢，提供婚姻關係改善建議',
      features: ['感情相容性分析', '婚姻時機預測', '關係改善建議', '桃花運勢指導'],
      image: 'romantic consultation setting with soft pink lighting, heart symbols and relationship guidance materials, warm and intimate atmosphere'
    },
    {
      id: 'health-wellness',
      title: '健康養生指導',
      description: '從命理角度分析健康狀況與養生方向',
      features: ['體質分析', '健康運勢預測', '養生建議', '疾病預防指導'],
      image: 'health and wellness consultation with traditional chinese medicine elements, herbs and healing stones, peaceful green and natural atmosphere'
    },
    {
      id: 'feng-shui',
      title: '居家風水調整',
      description: '居住環境風水分析與改善建議',
      features: ['居家風水診斷', '格局優化建議', '擺設調整指導', '運勢提升方案'],
      image: 'feng shui consultation showing traditional chinese interior with proper furniture arrangement, plants and lucky symbols, harmonious living space'
    },
    {
      id: 'business-feng-shui',
      title: '商業風水規劃',
      description: '辦公室與店面風水規劃，提升事業運勢',
      features: ['商業空間診斷', '財位規劃', '員工座位安排', '招財佈局設計'],
      image: 'business feng shui consultation in modern office space with traditional elements, wealth symbols and prosperity arrangements, professional atmosphere'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            專業諮詢服務
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            多元化的諮詢服務方式，讓您可以選擇最適合的溝通方式，獲得專業的命理指導
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('https://readdy.ai/api/search-image?query=$%7Bservice.image%7D&width=400&height=300&seq=${service.id}&orientation=landscape')`
                }}
              ></div>
              
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
                  <button 
                    onClick={() => onServiceSelect(service.title, 'video')}
                    className="bg-amber-600 text-white px-4 py-3 rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center"
                  >
                    <i className="ri-video-line mr-2"></i>
                    視訊諮詢
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => onServiceSelect(service.title, 'message')}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center text-sm"
                    >
                      <i className="ri-message-line mr-1"></i>
                      對話
                    </button>
                    <button 
                      onClick={() => onServiceSelect(service.title, 'email')}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center text-sm"
                    >
                      <i className="ri-mail-line mr-1"></i>
                      郵件
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
