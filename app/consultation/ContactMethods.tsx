
'use client';

export default function ContactMethods() {
  const socialContacts = [
    {
      platform: 'LINE',
      icon: 'ri-line-line',
      color: 'bg-green-500 hover:bg-green-600',
      id: 'adam4taiwan',
      description: '即時訊息諮詢，快速回覆',
      qrImage: '/image/lineID.jpg',
    },
    {
      platform: '微信',
      icon: 'ri-wechat-line',
      color: 'bg-green-600 hover:bg-green-700',
      id: 'wxid_22io062y9j1952',
      description: '語音文字皆可，24小時內回覆',
      qrImage: '/image/WeChatID.jpg',
    },
  ];

  const traditionalContacts = [
    {
      method: '專線電話',
      icon: 'ri-phone-line',
      info: '0910-032-057',
      description: '週一至週五 9:00-18:00',
      color: 'text-amber-600'
    },
    {
      method: '電子郵件',
      icon: 'ri-mail-line',
      info: 'adam4taiwan@gmail.com',
      description: '詳細諮詢說明，24小時內回覆',
      color: 'text-blue-600'
    },
    {
      method: '預約專線',
      icon: 'ri-phone-line',
      info: 'TEL:0970975258',
      description: '面對面深度諮詢，需提前預約',
      color: 'text-green-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            多元聯絡方式
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            選擇您最習慣的溝通方式，我們提供全方位的諮詢管道
          </p>
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">社群平台聯繫</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {socialContacts.map((contact, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
                <div className="mb-4">
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

                <button className={`mt-4 ${contact.color} text-white px-6 py-2 rounded-full transition-colors whitespace-nowrap cursor-pointer`}>
                  立即聯繫
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">傳統聯繫方式</h3>
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

        {/* 玉洞子親談費率 */}
        <div className="mt-16">
          <div className="bg-gradient-to-br from-amber-900 to-amber-950 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 text-center md:text-left">
                <p className="text-amber-300 text-sm font-medium tracking-widest mb-2">PERSONAL CONSULTATION</p>
                <h3 className="text-2xl font-bold mb-1">玉洞子親談</h3>
                <p className="text-amber-200 text-sm">百事可問，線上視訊深度諮詢</p>
                <div className="mt-4">
                  <p className="text-4xl font-bold text-yellow-300">NT$3,600</p>
                  <p className="text-amber-300 text-sm mt-1">/ 小時</p>
                </div>
              </div>
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  '命主八字全面剖析',
                  '紫微斗數深度解讀',
                  '大運流年交叉論斷',
                  '事業婚姻財運諮詢',
                  '風水格局指點',
                  '可錄影備存參考',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-amber-100">
                    <span className="text-yellow-400 font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex-shrink-0 text-center">
                <a href="/appointment">
                  <button className="bg-amber-400 text-amber-900 px-8 py-3 rounded-xl font-bold hover:bg-amber-300 transition-colors whitespace-nowrap">
                    立即預約
                  </button>
                </a>
                <p className="text-amber-300 text-xs mt-2">訂閱會員享折扣優惠</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-2">24小時服務承諾</h3>
            <p className="text-sm opacity-90">
              無論您選擇哪種聯繫方式，我們承諾在24小時內給予回覆
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
