'use client';

import { useState } from 'react';

type CategoryKey = 'calligraphy' | 'literature' | 'art' | 'philosophy';

type Book = {
  title: string;
  author: string;
  year: string;
  price: string;
  condition: string;
  image: string;
};

type Category = {
  title: string;
  description: string;
  books: Book[];
};

const categories: Record<CategoryKey, Category> = {
  calligraphy: {
    title: '書法字帖',
    description: '歷代名家書法作品集，碑帖拓本精選',
    books: [
        {
          title: '王羲之書法全集',
          author: '王羲之',
          year: '明代刻本',
          price: '',
          condition: '品相良好',
          image: 'https://readdy.ai/api/search-image?query=traditional%20chinese%20calligraphy%20book%20wang%20xizhi%20style%20ancient%20script%20elegant%20brushwork%20classic%20characters%20scholarly%20collection%20vintage%20binding&width=300&height=400&seq=calligraphy-1&orientation=portrait'
        },
        {
          title: '顏真卿楷書字帖',
          author: '顏真卿',
          year: '清代版本',
          price: '',
          condition: '收藏級',
          image: 'https://readdy.ai/api/search-image?query=yan%20zhenqing%20calligraphy%20practice%20book%20traditional%20chinese%20characters%20regular%20script%20brush%20writing%20examples%20scholarly%20atmosphere%20ancient%20book&width=300&height=400&seq=calligraphy-2&orientation=portrait'
        },
        {
          title: '懷素草書千字文',
          author: '懷素',
          year: '民國精印',
          price: '',
          condition: '九成新',
          image: 'https://readdy.ai/api/search-image?query=huaisu%20cursive%20script%20calligraphy%20thousand%20character%20classic%20chinese%20grass%20script%20flowing%20brushwork%20artistic%20expression%20ancient%20manuscript&width=300&height=400&seq=calligraphy-3&orientation=portrait'
        }
      ]
    },
    literature: {
      title: '古典文學',
      description: '經典文學作品，詩詞歌賦選集',
      books: [
        {
          title: '唐詩三百首',
          author: '蘅塘退士',
          year: '清光緒版',
          price: '',
          condition: '珍藏版',
          image: 'https://readdy.ai/api/search-image?query=tang%20dynasty%20poetry%20collection%20three%20hundred%20poems%20ancient%20chinese%20literature%20classic%20verses%20traditional%20binding%20scholarly%20book&width=300&height=400&seq=literature-1&orientation=portrait'
        },
        {
          title: '宋詞精選',
          author: '歷代詞人',
          year: '民國初年',
          price: '',
          condition: '品相佳',
          image: 'https://readdy.ai/api/search-image?query=song%20dynasty%20ci%20poetry%20collection%20classical%20chinese%20literature%20elegant%20verses%20traditional%20book%20format%20ancient%20manuscript%20style&width=300&height=400&seq=literature-2&orientation=portrait'
        },
        {
          title: '古文觀止',
          author: '吳楚材',
          year: '清代木刻',
          price: '',
          condition: '孤本珍品',
          image: 'https://readdy.ai/api/search-image?query=ancient%20chinese%20prose%20collection%20guwen%20guanzhi%20classical%20literature%20traditional%20woodblock%20printing%20vintage%20book%20scholarly%20texts&width=300&height=400&seq=literature-3&orientation=portrait'
        }
      ]
    },
    art: {
      title: '藝術圖錄',
      description: '書畫作品集，古代藝術圖錄',
      books: [
        {
          title: '宋代名畫集',
          author: '宮廷畫師',
          year: '現代精印',
          price: '',
          condition: '精裝版',
          image: 'https://readdy.ai/api/search-image?query=song%20dynasty%20famous%20paintings%20collection%20ancient%20chinese%20art%20landscape%20paintings%20court%20artists%20traditional%20artwork%20art%20book%20catalog&width=300&height=400&seq=art-1&orientation=portrait'
        },
        {
          title: '花鳥畫譜',
          author: '惲壽平',
          year: '清康熙版',
          price: '',
          condition: '極品收藏',
          image: 'https://readdy.ai/api/search-image?query=traditional%20chinese%20flower%20bird%20painting%20manual%20yun%20shouping%20style%20botanical%20art%20ancient%20painting%20techniques%20art%20instruction%20book&width=300&height=400&seq=art-2&orientation=portrait'
        },
        {
          title: '山水畫集',
          author: '石濤',
          year: '清代刻印',
          price: '',
          condition: '稀有版本',
          image: 'https://readdy.ai/api/search-image?query=landscape%20painting%20collection%20shitao%20style%20chinese%20traditional%20mountain%20water%20scenery%20artistic%20brushwork%20ancient%20art%20book%20rare%20edition&width=300&height=400&seq=art-3&orientation=portrait'
        }
      ]
    },
    philosophy: {
      title: '古典哲學',
      description: '儒道佛三家經典，古代哲學著作',
      books: [
        {
          title: '論語集注',
          author: '朱熹',
          year: '明代版本',
          price: '',
          condition: '完整保存',
          image: 'https://readdy.ai/api/search-image?query=analects%20confucius%20commentary%20zhu%20xi%20classical%20chinese%20philosophy%20ancient%20wisdom%20book%20traditional%20binding%20scholarly%20text&width=300&height=400&seq=philosophy-1&orientation=portrait'
        },
        {
          title: '道德經注疏',
          author: '老子',
          year: '宋刻本',
          price: '',
          condition: '國寶級',
          image: 'https://readdy.ai/api/search-image?query=tao%20te%20ching%20laozi%20dao%20de%20jing%20ancient%20chinese%20philosophy%20taoist%20classic%20commentary%20traditional%20text%20ancient%20manuscript&width=300&height=400&seq=philosophy-2&orientation=portrait'
        },
        {
          title: '心經注解',
          author: '玄奘',
          year: '元代刻本',
          price: '',
          condition: '罕見珍品',
          image: 'https://readdy.ai/api/search-image?query=heart%20sutra%20buddhist%20scripture%20xuanzang%20commentary%20ancient%20chinese%20buddhist%20text%20religious%20philosophy%20classic%20manuscript&width=300&height=400&seq=philosophy-3&orientation=portrait'
        }
      ]
    }
  };

  const categoryTabs: { key: CategoryKey; label: string; icon: string }[] = [
    { key: 'calligraphy', label: '書法字帖', icon: 'ri-brush-line' },
    { key: 'literature', label: '古典文學', icon: 'ri-book-line' },
    { key: 'art', label: '藝術圖錄', icon: 'ri-palette-line' },
    { key: 'philosophy', label: '古典哲學', icon: 'ri-mind-map' }
  ];

function BookCategories() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('calligraphy');

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            古書分類典藏
          </h2>
          <p className="text-xl text-gray-600">
            精選各類古文化典籍，傳承中華文化瑰寶
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center mb-12">
          <div className="bg-white rounded-full p-2 shadow-lg">
            {categoryTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  activeCategory === tab.key
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                <i className={`${tab.icon} text-lg`}></i>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.substring(0, 2)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Content */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {categories[activeCategory].title}
            </h3>
            <p className="text-lg text-gray-600">
              {categories[activeCategory].description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories[activeCategory].books.map((book, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative">
                  <img 
                    src={book.image} 
                    alt={book.title}
                    className="w-full h-64 object-cover object-top"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {book.condition}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{book.title}</h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <i className="ri-user-line w-5 h-5 mr-2"></i>
                      <span>{book.author}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="ri-calendar-line w-5 h-5 mr-2"></i>
                      <span>{book.year}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {book.price}
                    </div>
                    <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-full font-semibold transition-colors whitespace-nowrap cursor-pointer">
                      立即詢問
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              更多{categories[activeCategory].title}請至拍賣平台瀏覽
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={`https://tw.bid.yahoo.com/search/ac?p=姜軍府 ${categories[activeCategory].title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                奇摩拍賣查看更多
              </a>
              <a 
                href={`https://www.ruten.com.tw/find/?q=姜軍府 ${categories[activeCategory].title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                露天拍賣查看更多
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BookCategories;