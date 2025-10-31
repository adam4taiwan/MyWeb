'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
                <i className="ri-book-open-line text-white text-lg"></i>
              </div>
              <span className="text-xl font-bold" style={{fontFamily: 'var(--font-pacifico)'}}>玉洞子</span>
            </div>
            <p className="text-gray-400 mb-4">三十年命理經驗，傳承古典智慧，為現代人生提供專業指導。</p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors">
                <i className="ri-wechat-line text-sm"></i>
              </div>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors">
                <i className="ri-line-line text-sm"></i>
              </div>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors">
                <i className="ri-facebook-line text-sm"></i>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">服務項目</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/consultation" className="hover:text-white transition-colors cursor-pointer">個人命理諮詢</Link></li>
              <li><Link href="/heritage" className="hover:text-white transition-colors cursor-pointer">命學傳承教學</Link></li>
              <li><Link href="/lectures" className="hover:text-white transition-colors cursor-pointer">企業講座服務</Link></li>
              <li><Link href="/consultation" className="hover:text-white transition-colors cursor-pointer">遠距線上服務</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">學習資源</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/books" className="hover:text-white transition-colors cursor-pointer">古籍典藏</Link></li>
              <li><Link href="/bookstore" className="hover:text-white transition-colors cursor-pointer">二手書交易</Link></li>
              <li><Link href="/heritage" className="hover:text-white transition-colors cursor-pointer">在線課程</Link></li>
              <li><Link href="/heritage" className="hover:text-white transition-colors cursor-pointer">圖形化教學</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">聯絡方式</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <i className="ri-phone-line text-amber-500"></i>
                <span>0910-032-057</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="ri-mail-line text-amber-500"></i>
                <span>adam4taiwan@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="ri-time-line text-amber-500"></i>
                <span>週一至週五 9:00-18:00</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="ri-map-pin-line text-amber-500"></i>
                <span>Line id:adam4taiwan</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 1993 玉洞子. 版權所有 | 三十年專業經驗，值得信賴</p>
        </div>
      </div>
    </footer>
  );
}