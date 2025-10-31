'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Link href="/consultation" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">諮詢服務</Link>
            <Link href="/bookstore" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">二手書店</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700 transition-colors whitespace-nowrap cursor-pointer">
              預約諮詢
            </button>
          </div>

          <button 
            className="md:hidden p-2 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-2xl text-gray-700`}></i>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-amber-200">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link href="/" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">首頁</Link>
              <Link href="/books" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">古書介紹</Link>
              <Link href="/heritage" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">命學傳承</Link>
              <Link href="/consultation" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">諮詢服務</Link>
              <Link href="/bookstore" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">二手書店</Link>
              <button className="bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700 transition-colors whitespace-nowrap cursor-pointer w-fit">
                預約諮詢
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
