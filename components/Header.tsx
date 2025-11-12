'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from './AuthContext'; // 引入 useAuth

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth(); // 取得認證狀態和登出函數

  return (
    <header className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
              <i className="ri-book-open-line text-white text-xl"></i>
            </div>
            <span className="text-2xl font-bold text-amber-800" style={{fontFamily: 'var(--font-pacifico)'}}>玉洞子星相古學堂</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">首頁</Link>
            <Link href="/books" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">古書介紹</Link>
            <Link href="/heritage" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">命學傳承</Link>
            <Link href="/bookstore" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">二手書店</Link>
            {/* 只有登入後才顯示排盤工具 */}
            {isAuthenticated && (
                <Link href="/disk" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">排盤工具</Link>
            )}
          </nav>

          {/* 右側按鈕區域：保留諮詢並整合認證按鈕 */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/consultation">
                <button 
                  className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors whitespace-nowrap cursor-pointer font-semibold"
                >
                    線上諮詢 {/* 保持您的線上諮詢按鈕 */}
                </button>
            </Link>
            
            {isAuthenticated ? (
                <button 
                    onClick={logout}
                    className="px-4 py-2 text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors font-semibold whitespace-nowrap"
                >
                    登出
                </button>
            ) : (
                <Link href="/login">
                    <button className="px-4 py-2 text-white bg-amber-600 rounded-full hover:bg-amber-700 transition-colors font-semibold whitespace-nowrap">
                        登入/註冊
                    </button>
                </Link>
            )}
          </div>

          {/* 行動裝置選單按鈕 */}
          <button 
            className="md:hidden p-2 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-2xl text-gray-700`}></i>
          </button>
        </div>

        {/* 行動裝置選單內容 */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-amber-200">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link href="/" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>首頁</Link>
              <Link href="/books" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>古書介紹</Link>
              <Link href="/heritage" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>命學傳承</Link>
              <Link href="/bookstore" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>二手書店</Link>
              <Link href="/consultation" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>諮詢服務</Link>
              {isAuthenticated && (
                  <Link href="/disk" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>排盤工具</Link>
              )}
              {/* 行動裝置下的登入/登出按鈕 */}
              {isAuthenticated ? (
                  <button 
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors font-semibold"
                  >
                      登出
                  </button>
              ) : (
                  <Link href="/login">
                      <button className="bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700 transition-colors font-semibold" onClick={() => setIsMenuOpen(false)}>
                          登入/註冊
                      </button>
                  </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}