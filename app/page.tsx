'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
// 【關鍵修改】：引入 useAuth
import { useAuth } from '@/components/AuthContext'; 

export default function Home() {
  const { isAuthenticated } = useAuth(); // 取得認證狀態
  
  // 如果還在驗證中，則返回 null，讓 AuthProvider 的 UI (會員狀態驗證中) 顯示
  if (typeof isAuthenticated === 'undefined') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center bg-cover bg-center bg-black/50"
        style={{
          // 使用您原有的圖片路徑
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/image/hero-main.jpg')`
        }}
      >
        <div className="container mx-auto px-4 w-full">
          <div className="max-w-4xl text-white">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 text-amber-300 drop-shadow-lg">
              探索命運的藍圖
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-light drop-shadow-md">
              我們將傳統命理學與現代科技結合，提供最精準的八字、紫微斗數分析。
            </p>
            <div className="space-x-4">
              {/* 根據認證狀態動態顯示按鈕 */}
              {isAuthenticated ? (
                <Link href="/disk">
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-transform duration-300 transform hover:scale-105">
                    開始排盤分析
                  </button>
                </Link>
              ) : (
                <Link href="/login">
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-transform duration-300 transform hover:scale-105">
                    立即加入會員
                  </button>
                </Link>
              )}
              <Link href="/heritage">
                <button className="bg-white hover:bg-gray-100 text-amber-600 px-8 py-4 rounded-full text-lg font-semibold transition-transform duration-300 transform hover:scale-105">
                  了解易經文化
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 1 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">我們的核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature Card 1 */}
            <div className="text-center p-8 bg-amber-50 rounded-2xl shadow-lg transition-shadow hover:shadow-xl">
            <i className="ri-calendar-check-line text-6xl text-amber-600 mb-4 inline-block"></i>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">精準排盤</h3>
              <p className="text-gray-600">
                結合天文曆法與現代計算，提供毫秒級精準的八字、紫微斗數命盤。
              </p>
            </div>
            {/* Feature Card 2 */}
            <div className="text-center p-8 bg-amber-50 rounded-2xl shadow-lg transition-shadow hover:shadow-xl">
             <i className="ri-file-text-line text-6xl text-amber-600 mb-4 inline-block"></i>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">深度分析報告</h3>
              <p className="text-gray-600">
                基於數十年的命理經驗，生成包含格局、運勢、大運流年的詳細報告。
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="text-center p-8 bg-amber-50 rounded-2xl shadow-lg transition-shadow hover:shadow-xl">
              <i className="ri-book-3-line text-6xl text-amber-600 mb-4 inline-block"></i>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">系統化學習</h3>
              <p className="text-gray-600">
                從基礎知識到高級實戰，提供結構清晰、循序漸進的線上學習課程。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - 圖片與文字並排 */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-800">我們的願景：傳承與創新</h2>
              <p className="text-lg text-gray-600">
                傳統命理學是中華文化的瑰寶。我們致力於使用現代軟體工程和數據庫技術，將這些複雜的知識系統化、數位化，使其更易於學習和應用。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>數據驅動：減少人為錯誤，提升排盤精確度。</li>
                <li>易於理解：將複雜概念視覺化，降低學習門檻。</li>
                <li>雲端存儲：隨時隨地存取您的排盤記錄和學習進度。</li>
              </ul>
              <Link href="/about">
                <button className="mt-4 bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition-colors font-semibold">
                  深入了解我們
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
              <button className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-colors whitespace-nowrap cursor-pointer transform hover:scale-105">
                查看課程方案
              </button>
            </Link>
            {/* 如果未登入，顯示註冊按鈕 */}
            {!isAuthenticated && (
                <Link href="/login">
                    <button className="bg-amber-800 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-900 transition-colors whitespace-nowrap cursor-pointer transform hover:scale-105">
                        註冊免費帳號
                    </button>
                </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
