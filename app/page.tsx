
'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center bg-cover bg-center bg-black/50"
        style={{
          //backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://readdy.ai/api/search-image?query=ancient%20chinese%20scholar%20studying%20traditional%20books%20with%20golden%20light%20rays%20illuminating%20old%20manuscripts%20and%20calligraphy%20brushes%20in%20a%20serene%20traditional%20library%20setting%20with%20warm%20golden%20lighting%20creating%20peaceful%20academic%20atmosphere&width=1920&height=1080&seq=hero-main&orientation=landscape')`
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/image/hero-main.jpg')`
        }}
      >
        <div className="container mx-auto px-4 w-full">
          <div className="max-w-3xl text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              流傳千年智慧
              <br />
              <span className="text-amber-400">指引人生方向</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
              傳承古典命理學精華，結合現代生活應用，為年輕世代提供專業的人生規劃建議與命理指導服務。
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/consultation">
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer transform hover:scale-105">
                  立即預約諮詢
                </button>
              </Link>
              <Link href="/heritage">
                <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer">
                  了解課程內容
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-gradient-to-b from-white to-amber-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">專業服務項目</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              結合傳統命理智慧與現代諮詢技術，提供全方位的命理學習與諮詢服務
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/books">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-book-3-line text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">古書介紹</h3>
                <p className="text-gray-600 mb-4">
                  依年代及山醫命卜相分類介紹珍貴古籍，包含絕版線裝書籍及大師作品收藏。
                </p>
                <div className="text-amber-600 font-semibold flex items-center">
                  探索古籍典藏 <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </Link>

            <Link href="/heritage">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-graduation-cap-line text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">命學傳承</h3>
                <p className="text-gray-600 mb-4">
                  提供一對一、一對多、應用班、職業班等多種教學模式，含圖形化創新教學方法。
                </p>
                <div className="text-blue-600 font-semibold flex items-center">
                  查看課程規劃 <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </Link>
            <Link href="/disk">
              <button className="bg-amber-700 text-white hover:bg-amber-800 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer">
                線上排盤
              </button>
            </Link>
            <Link href="/consultation">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-customer-service-line text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">諮詢服務</h3>
                <p className="text-gray-600 mb-4">
                  提供遠距服務、預約服務、到府服務及專業指導，滿足不同需求的諮詢方式。
                </p>
                <div className="text-green-600 font-semibold flex items-center">
                  預約諮詢服務 <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </Link>

            <Link href="/bookstore">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-6">
                  <i className="ri-shopping-cart-line text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">二手書買賣</h3>
                <p className="text-gray-600 mb-4">
                  經營奇摩、露天拍賣姜軍府老書店，提供珍貴命理古籍的買賣交易服務。
                </p>
                <div className="text-red-600 font-semibold flex items-center">
                  瀏覽書店商品 <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-6">
                <i className="ri-phone-line text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">聯絡我們</h3>
              <p className="text-gray-600 mb-4">
                歡迎來電洽詢各項服務內容，我們將竭誠為您提供專業的命理諮詢建議。
              </p>
              <div className="text-gray-600 font-semibold">
                0910-032-057
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Master */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">專業實務經驗</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                古學堂深耕命學領域三十餘年，科技顧問背景以實事求是之精神，全心投入將古典命理智慧與現代生活相結合，為當代人提供實用的人生指導。
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-2">30+</div>
                  <div className="text-gray-600">年專業經驗</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-2">5000+</div>
                  <div className="text-gray-600">諮詢案例</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-2">500+</div>
                  <div className="text-gray-600">古籍收藏</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-2">100+</div>
                  <div className="text-gray-600">傳承學員</div>
                </div>
              </div>
              <Link href="/consultation">
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full font-semibold transition-colors whitespace-nowrap cursor-pointer">
                  預約面談諮詢
                </button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src="https://static.readdy.ai/image/6ed5cbf45b75a449f576812a2b58dc3c/0313bae85f5c542e63aaf55956563a55.jfif"
                alt="命理學者"
                className="rounded-2xl shadow-2xl object-top object-cover w-full h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">開啟您的命理學習之旅</h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            無論您是初學者還是希望深入研習，我們都有適合的學習方案。立即加入我們，探索命理學的奧妙世界。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/heritage">
              <button className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-colors whitespace-nowrap cursor-pointer">
                查看課程方案
              </button>
            </Link>
            <Link href="/consultation">
              <button className="border-2 border-white text-white hover:bg-white hover:text-amber-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer">
                免費諮詢評估
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
