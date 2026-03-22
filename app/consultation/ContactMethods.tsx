
'use client';

export default function ContactMethods() {
  const socialContacts = [
    {
      platform: 'LINE',
      icon: 'ri-line-line',
      color: 'bg-green-500 hover:bg-green-600',
      id: '@destiny-master',
      description: '即時訊息諮詢，快速回覆',
      qrImage: '/image/lineID.jpg',
    },
    {
      platform: '微信',
      icon: 'ri-wechat-line',
      color: 'bg-green-600 hover:bg-green-700',
      id: 'destiny_master_tw',
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

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">24小時服務承諾</h3>
            <p className="text-lg opacity-90 mb-6">
              無論您選擇哪種聯繫方式，我們承諾在24小時內給予回覆
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-white text-amber-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer">
                查看服務時間
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-amber-600 transition-colors whitespace-nowrap cursor-pointer">
                緊急諮詢專線
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
