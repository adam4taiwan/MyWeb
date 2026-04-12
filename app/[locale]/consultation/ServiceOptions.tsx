
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
      symbol: '命',
      gradient: 'from-amber-800 to-amber-950',
      accent: 'text-amber-300',
    },
    {
      id: 'career-guidance',
      title: '事業發展諮詢',
      description: '針對職場發展提供專業建議與方向指引',
      features: ['職業適性分析', '升遷時機預測', '轉職建議', '事業運勢規劃'],
      symbol: '業',
      gradient: 'from-slate-700 to-slate-900',
      accent: 'text-amber-300',
    },
    {
      id: 'relationship',
      title: '感情婚姻諮詢',
      description: '解析感情運勢，提供婚姻關係改善建議',
      features: ['感情相容性分析', '婚姻時機預測', '關係改善建議', '桃花運勢指導'],
      symbol: '緣',
      gradient: 'from-rose-800 to-rose-950',
      accent: 'text-rose-200',
    },
    {
      id: 'health-wellness',
      title: '健康養生指導',
      description: '從命理角度分析健康狀況與養生方向',
      features: ['體質分析', '健康運勢預測', '養生建議', '疾病預防指導'],
      symbol: '壽',
      gradient: 'from-emerald-800 to-emerald-950',
      accent: 'text-emerald-200',
    },
    {
      id: 'feng-shui',
      title: '居家風水調整',
      description: '居住環境風水分析與改善建議',
      features: ['居家風水診斷', '格局優化建議', '擺設調整指導', '運勢提升方案'],
      symbol: '宅',
      gradient: 'from-teal-800 to-teal-950',
      accent: 'text-teal-200',
    },
    {
      id: 'business-feng-shui',
      title: '商業風水規劃',
      description: '辦公室與店面風水規劃，提升事業運勢',
      features: ['商業空間診斷', '財位規劃', '員工座位安排', '招財佈局設計'],
      symbol: '財',
      gradient: 'from-yellow-700 to-amber-900',
      accent: 'text-yellow-200',
    },
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
              <div className={`h-48 bg-gradient-to-br ${service.gradient} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                ></div>
                <span className={`text-8xl font-bold ${service.accent} opacity-90 select-none`}
                  style={{ fontFamily: 'serif', textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
                  {service.symbol}
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
                      對話諮詢
                    </button>
                    <button
                      onClick={() => onServiceSelect(service.title, 'email')}
                      className="bg-green-600 text-white px-3 py-3 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center"
                    >
                      <i className="ri-mail-line mr-2"></i>
                      郵件諮詢
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
