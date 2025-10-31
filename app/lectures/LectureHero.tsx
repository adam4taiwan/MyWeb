'use client';

export default function LectureHero() {
  return (
    <section className="relative min-h-screen flex items-center"
      style={{
        backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20elegant%20conference%20room%20with%20traditional%20Chinese%20elements%2C%20professional%20business%20meeting%20setup%2C%20warm%20lighting%2C%20contemporary%20furniture%20with%20classical%20Chinese%20decorative%20accents%2C%20spacious%20venue%20with%20presentation%20screen%2C%20sophisticated%20atmosphere%20for%20corporate%20training%20and%20educational%20seminars&width=1920&height=1080&seq=lecture-hero&orientation=landscape')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            生活講座<br />
            <span className="text-amber-400">智慧分享</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
            三十年命理經驗融入現代生活，為企業、餐飲、飯店、學苑提供專業講座服務
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-amber-600 text-white px-8 py-4 rounded-full hover:bg-amber-700 transition-colors text-lg font-semibold whitespace-nowrap cursor-pointer">
              立即預約講座
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-gray-900 transition-colors text-lg font-semibold whitespace-nowrap cursor-pointer">
              了解合作方案
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}