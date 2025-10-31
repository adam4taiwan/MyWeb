'use client';

import { useState } from 'react';

export default function SearchSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (platform: string) => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // 模擬搜尋結果
    setTimeout(() => {
      setSearchResults([
        {
          id: 1,
          title: `${searchTerm} - 古典文學集`,
          price: 'NT$ 1,200',
          platform: platform,
          image: 'https://readdy.ai/api/search-image?query=ancient%20chinese%20book%20with%20traditional%20binding%20golden%20pages%20classic%20literature%20vintage%20appearance%20scholarly%20atmosphere&width=200&height=280&seq=book-1&orientation=portrait'
        },
        {
          id: 2,
          title: `${searchTerm} - 書法字帖精選`,
          price: 'NT$ 800',
          platform: platform,
          image: 'https://readdy.ai/api/search-image?query=chinese%20calligraphy%20practice%20book%20with%20brush%20writing%20examples%20traditional%20characters%20elegant%20script%20artistic%20presentation&width=200&height=280&seq=book-2&orientation=portrait'
        },
        {
          id: 3,
          title: `${searchTerm} - 古代藝術圖譜`,
          price: 'NT$ 2,500',
          platform: platform,
          image: 'https://readdy.ai/api/search-image?query=ancient%20chinese%20art%20book%20with%20traditional%20paintings%20illustrations%20cultural%20artifacts%20historical%20documents%20scholarly%20collection&width=200&height=280&seq=book-3&orientation=portrait'
        }
      ]);
      setIsSearching(false);
    }, 1000);
  };

  const openPlatformSearch = (platform: string) => {
    const searchQuery = searchTerm || '姜軍府';
    let url = '';
    
    if (platform === 'yahoo') {
      url = `https://tw.bid.yahoo.com/search/ac?p=${encodeURIComponent(searchQuery)}`;
    } else if (platform === 'ruten') {
      url = `https://www.ruten.com.tw/find/?q=${encodeURIComponent(searchQuery)}`;
    }
    
    window.open(url, '_blank');
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              書籍搜尋服務
            </h2>
            <p className="text-xl text-gray-600">
              在奇摩拍賣和露天拍賣搜尋「姜軍府」找到珍貴古籍
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="請輸入書名或關鍵字..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => openPlatformSearch('yahoo')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-search-line"></i>
                  奇摩拍賣搜尋
                </button>
                <button
                  onClick={() => openPlatformSearch('ruten')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-search-line"></i>
                  露天拍賣搜尋
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-3">快速搜尋熱門關鍵字：</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['書法', '古典文學', '藝術圖錄', '古籍善本', '碑帖', '畫冊'].map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => {
                      setSearchTerm(keyword);
                    }}
                    className="bg-white hover:bg-amber-50 text-gray-700 hover:text-amber-700 px-4 py-2 rounded-full border border-gray-300 hover:border-amber-300 transition-colors cursor-pointer text-sm"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                <span className="text-gray-600">搜尋中...</span>
              </div>
            </div>
          )}

          {searchResults.length > 0 && !isSearching && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">搜尋結果預覽</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {searchResults.map((book) => (
                  <div key={book.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <img 
                      src={book.image} 
                      alt={book.title}
                      className="w-full h-48 object-cover object-top"
                    />
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">{book.title}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-amber-600">{book.price}</span>
                        <span className="text-sm text-gray-500">{book.platform === 'yahoo' ? '奇摩拍賣' : '露天拍賣'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <p className="text-gray-600 mb-4">查看完整搜尋結果，請前往拍賣平台</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => openPlatformSearch('yahoo')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    前往奇摩拍賣查看更多
                  </button>
                  <button
                    onClick={() => openPlatformSearch('ruten')}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full font-semibold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    前往露天拍賣查看更多
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}