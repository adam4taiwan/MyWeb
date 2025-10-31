
'use client';

export default function ConsultationHero() {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        //backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url('https://readdy.ai/api/search-image?query=modern%20minimalist%20consultation%20room%20with%20traditional%20chinese%20elements%2C%20warm%20lighting%2C%20comfortable%20seating%20area%2C%20professional%20atmosphere%2C%20elegant%20interior%20design%20with%20wooden%20furniture%20and%20ancient%20scrolls%2C%20peaceful%20ambiance%20for%20fortune%20telling%20consultation&width=1920&height=1080&seq=consultation-hero&orientation=landscape')`
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url('/image/consultation-hero.jpg')` 
      }}
    >
      <div className="container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            專業諮詢服務服務
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
            三十年命理經驗，多元化諮詢方式<br/>
            無論您身在何處，都能獲得專業指導
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="bg-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-700 transition-colors whitespace-nowrap cursor-pointer">
              立即預約諮詢
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors whitespace-nowrap cursor-pointer">
              了解服務項目
            </button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
          <i className="ri-arrow-down-line text-white"></i>
        </div>
      </div>
    </section>
  );
}
