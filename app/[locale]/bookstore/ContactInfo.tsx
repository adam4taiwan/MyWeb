'use client';

export default function ContactInfo() {
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              聯絡資訊
            </h2>
            <p className="text-xl text-gray-600">
              專業的古書收購與販賣服務，歡迎來電洽詢
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">店家資訊</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-store-line text-white text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg">店名</h4>
                    <p className="text-gray-600">姜軍府老書店</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-map-pin-line text-white text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg">地址</h4>
                    <p className="text-gray-600">台北市農安街125巷6號1樓</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-phone-line text-white text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg">買賣專線</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleCall('02-25851238')}
                        className="block text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                      >
                        (02)25851238
                      </button>
                      <button
                        onClick={() => handleCall('0922220070')}
                        className="block text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                      >
                        0922220070 姜小姐
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-time-line text-white text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg">營業時間</h4>
                    <div className="text-gray-600">
                      <p>週一至週五：10:00 - 19:00</p>
                      <p>週六至週日：10:00 - 20:00</p>
                      <p className="text-red-500 text-sm mt-1">國定假日請來電確認</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">服務項目</h3>
              
              <div className="space-y-6">
                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">古書收購</h4>
                  <p className="text-gray-600">專業評估古籍價值，提供合理收購價格</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">古書販賣</h4>
                  <p className="text-gray-600">精選各類古文化典籍，品質保證</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">網路拍賣</h4>
                  <p className="text-gray-600">奇摩拍賣、露天拍賣同步販售</p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">慈善捐書</h4>
                  <p className="text-gray-600">接受古書捐贈，傳承文化知識</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">到府服務</h4>
                  <p className="text-gray-600">大量古書收購，提供到府評估</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact Buttons */}
          <div className="mt-12 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleCall('02-25851238')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="ri-phone-line"></i>
                撥打市話 (02)25851238
              </button>
              <button
                onClick={() => handleCall('0922220070')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="ri-smartphone-line"></i>
                撥打手機 0922220070
              </button>
            </div>
            <p className="text-gray-600 mt-4">
              歡迎來電洽詢古書收購、販賣及相關服務
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}