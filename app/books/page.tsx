'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { useState } from 'react';

export default function BooksPage() {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedEra, setSelectedEra] = useState('全部');

  const categories = ['全部', '山學', '醫學', '命學', '卜學', '相學'];
  const eras = ['全部', '清代', '民國', '現代', '當代'];

  const books = [
    {
      id: 1,
      title: '子平真詮',
      author: '沈孝瞻',
      era: '清代',
      category: '命學',
      type: '線裝古籍',
      rarity: '絕版珍藏',
      description: '四柱命理學經典著作，詳解干支五行生剋制化之理，為學習八字命理必讀典籍。',
      price: '珍藏版',
      image: 'https://readdy.ai/api/search-image?query=ancient%20chinese%20book%20cover%20with%20traditional%20calligraphy%20golden%20characters%20on%20dark%20background%20classic%20binding%20style%20traditional%20paper%20texture%20scholarly%20appearance%20wisdom%20symbols&width=300&height=400&seq=book1&orientation=portrait'
    },
    {
      id: 2,
      title: '滴天髓',
      author: '劉基',
      era: '明代',
      category: '命學',
      type: '手抄本',
      rarity: '稀有典藏',
      description: '命理學之精華，以詩歌形式闡述命理玄機，被譽為命學聖典。',
      price: '絕版收藏',
      image: 'https://readdy.ai/api/search-image?query=traditional%20chinese%20manuscript%20book%20with%20handwritten%20calligraphy%20ancient%20paper%20yellowed%20with%20age%20classical%20binding%20red%20seal%20stamps%20scholarly%20treasure&width=300&height=400&seq=book2&orientation=portrait'
    },
    {
      id: 3,
      title: '神峰通考',
      author: '張楠',
      era: '明代',
      category: '命學',
      type: '線裝古籍',
      rarity: '珍貴古本',
      description: '詳述八字推命之法，內容豐富詳實，為明代命理學重要文獻。',
      price: '古籍珍藏',
      image: 'https://readdy.ai/api/search-image?query=old%20chinese%20book%20with%20traditional%20binding%20thread%20golden%20title%20characters%20on%20brown%20cover%20ancient%20scholarly%20text%20classical%20appearance&width=300&height=400&seq=book3&orientation=portrait'
    },
    {
      id: 4,
      title: '麻衣神相',
      author: '麻衣道者',
      era: '宋代',
      category: '相學',
      type: '線裝古籍',
      rarity: '絕版珍藏',
      description: '相學經典之作，詳述面相手相之術，為相學入門必讀。',
      price: '稀世珍本',
      image: 'https://readdy.ai/api/search-image?query=ancient%20chinese%20book%20about%20physiognomy%20traditional%20cover%20design%20with%20face%20diagrams%20classical%20binding%20old%20paper%20texture%20scholarly%20work&width=300&height=400&seq=book4&orientation=portrait'
    },
    {
      id: 5,
      title: '易經',
      author: '伏羲',
      era: '上古',
      category: '卜學',
      type: '石印本',
      rarity: '傳世經典',
      description: '群經之首，卜筮之源，闡述陰陽變化之理，為東方哲學之根本。',
      price: '經典傳承',
      image: 'https://readdy.ai/api/search-image?query=ancient%20yi%20jing%20book%20with%20bagua%20symbols%20traditional%20chinese%20binding%20classical%20cover%20design%20scholarly%20appearance%20wisdom%20text&width=300&height=400&seq=book5&orientation=portrait'
    },
    {
      id: 6,
      title: '黃帝內經',
      author: '黃帝',
      era: '上古',
      category: '醫學',
      type: '線裝古籍',
      rarity: '醫學聖典',
      description: '中醫理論基礎，闡述人體生理病理，為中醫學之根本典籍。',
      price: '醫道傳承',
      image: 'https://readdy.ai/api/search-image?query=ancient%20chinese%20medical%20book%20yellow%20emperor%20classic%20traditional%20binding%20acupuncture%20diagrams%20classical%20cover%20scholarly%20medical%20text&width=300&height=400&seq=book6&orientation=portrait'
    },
    {
      id: 7,
      title: '奇門遁甲',
      author: '諸葛亮',
      era: '三國',
      category: '卜學',
      type: '手抄本',
      rarity: '兵法奇書',
      description: '古代預測學之王，結合天文地理人事，為預測學最高境界。',
      price: '軍機秘典',
      image: 'https://readdy.ai/api/search-image?query=ancient%20chinese%20divination%20book%20with%20mysterious%20symbols%20traditional%20binding%20dark%20cover%20golden%20characters%20occult%20appearance&width=300&height=400&seq=book7&orientation=portrait'
    },
    {
      id: 8,
      title: '撼龍經',
      author: '楊筠松',
      era: '唐代',
      category: '山學',
      type: '線裝古籍',
      rarity: '風水寶典',
      description: '風水學經典著作，詳述龍脈穴法，為堪輿學必讀典籍。',
      price: '地理真傳',
      image: 'https://readdy.ai/api/search-image?query=ancient%20feng%20shui%20book%20with%20mountain%20dragon%20diagrams%20traditional%20chinese%20binding%20classical%20cover%20landscape%20symbols&width=300&height=400&seq=book8&orientation=portrait'
    }
  ];

  const filteredBooks = books.filter(book => {
    return (selectedCategory === '全部' || book.category === selectedCategory) &&
           (selectedEra === '全部' || book.era === selectedEra);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative py-20 md:py-32 bg-cover bg-center"
        style={{
          //backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://readdy.ai/api/search-image?query=ancient%20chinese%20library%20with%20traditional%20wooden%20bookshelves%20filled%20with%20old%20books%20scrolls%20and%20manuscripts%20warm%20golden%20lighting%20scholarly%20atmosphere%20traditional%20architecture&width=1920&height=800&seq=books-hero&orientation=landscape')`
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/image/books-hero.jpg')`
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">古書典藏</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-200">
            珍藏歷代命理典籍，傳承千年智慧結晶
            <br />
            依年代及山醫命卜相分類，包含絕版線裝書籍與大師作品
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-amber-400">500+</div>
                <div className="text-sm text-gray-300">珍藏古籍</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-400">50+</div>
                <div className="text-sm text-gray-300">絕版典籍</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-400">1000+</div>
                <div className="text-sm text-gray-300">年歷史跨度</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-400">5</div>
                <div className="text-sm text-gray-300">學科分類</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">學科分類</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                        selectedCategory === category
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-amber-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">年代分類</label>
                <div className="flex flex-wrap gap-2">
                  {eras.map(era => (
                    <button
                      key={era}
                      onClick={() => setSelectedEra(era)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                        selectedEra === era
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                      }`}
                    >
                      {era}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              共找到 <span className="font-semibold text-amber-600">{filteredBooks.length}</span> 本古籍
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBooks.map(book => (
              <div key={book.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative">
                  <img 
                    src={book.image} 
                    alt={book.title}
                    className="w-full h-64 object-cover object-top"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {book.rarity}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-black/80 text-white px-3 py-1 rounded-full text-xs">
                      {book.type}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-lg text-xs font-semibold">
                      {book.category}
                    </span>
                    <span className="text-gray-500 text-sm">{book.era}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{book.title}</h3>
                  <p className="text-gray-600 mb-1">作者：{book.author}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{book.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-amber-600 font-semibold">{book.price}</div>
                    <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer">
                      詳細介紹
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Introduction */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">五術學科介紹</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              山醫命卜相五大學科，涵蓋東方玄學精髓
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-mountain-line text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">山學</h3>
              <p className="text-gray-600">
                包含風水堪輿、地理環境學，研究山川地理對人居環境的影響。
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-hospital-line text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">醫學</h3>
              <p className="text-gray-600">
                傳統中醫理論，包含針灸、本草、診脈等醫學典籍與實踐方法。
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-calendar-line text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">命學</h3>
              <p className="text-gray-600">
                八字命理、紫微斗數等命理推算學科，研究個人命運軌跡。
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-compass-3-line text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">卜學</h3>
              <p className="text-gray-600">
                易經占卜、奇門遁甲等預測學，用於判斷事物發展趨勢。
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-user-line text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">相學</h3>
              <p className="text-gray-600">
                面相手相學，通過觀察人體特徵判斷性格命運。
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-book-open-line text-white text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">典籍收藏</h3>
                <p className="text-gray-600 mb-6">
                  涵蓋各學科珍貴典籍，歡迎學者交流研習。
                </p>
                <Link href="/consultation">
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer">
                    預約參觀
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">與古聖先賢對話</h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            每一本古籍都是智慧的結晶，歡迎預約參觀我們的典藏室，親身感受古典文化的魅力。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation">
              <button className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-colors whitespace-nowrap cursor-pointer">
                預約參觀典藏室
              </button>
            </Link>
            <Link href="/bookstore">
              <button className="border-2 border-white text-white hover:bg-white hover:text-amber-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer">
                瀏覽二手書店
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}