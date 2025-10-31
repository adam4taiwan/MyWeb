'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

export default function Heritage() {
  const [activeTab, setActiveTab] = useState('life');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  const handleRegistration = (courseType: string) => {
    setSelectedCourse(courseType);
    setShowRegistrationForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // 表單驗證
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    
    if (!name || !phone || !email) {
      alert('請填寫所有必填欄位');
      return;
    }
    
    // 模擬提交成功
    alert('報名表已成功提交！我們將在24小時內與您聯絡。');
    setShowRegistrationForm(false);
    form.reset();
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const name = formData.get('contact_name') as string;
    const message = formData.get('message') as string;
    
    if (!name || !message) {
      alert('請填寫姓名和留言內容');
      return;
    }
    
    if (message.length > 500) {
      alert('留言內容不得超過500字');
      return;
    }
    
    alert('留言已送出！我們會盡快回覆您。');
    setShowContactForm(false);
    form.reset();
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative py-20 md:py-32 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://readdy.ai/api/search-image?query=traditional%20chinese%20academy%20classroom%20with%20students%20learning%20ancient%20wisdom%20books%20calligraphy%20scrolls%20warm%20golden%20lighting%20peaceful%20study%20atmosphere%20wooden%20furniture%20bamboo%20elements%20scholarly%20environment&width=1920&height=800&seq=heritage-hero&orientation=landscape')`
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">命學傳承</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            傳承千年智慧，培育現代命理人才。提供從個人應用到職業傳承的完整學習體系，讓古典命理學在現代社會中煥發新的生命力。
          </p>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-16 bg-gradient-to-b from-white to-amber-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">課程體系</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              從基礎應用到專業傳承，階梯式學習設計，滿足不同程度學習者的需求
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center mb-12 bg-white rounded-full p-2 shadow-lg max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('life')}
              className={`px-6 py-3 rounded-full transition-all duration-300 whitespace-nowrap cursor-pointer ${
                activeTab === 'life' 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-amber-600'
              }`}
            >
              生活應用班
            </button>
            <button
              onClick={() => setActiveTab('professional')}
              className={`px-6 py-3 rounded-full transition-all duration-300 whitespace-nowrap cursor-pointer ${
                activeTab === 'professional' 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-amber-600'
              }`}
            >
              授業弟子班
            </button>
          </div>

          {/* Life Application Course */}
          {activeTab === 'life' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-6">個人生活應用班</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  專為現代人設計的實用命理課程，學習如何將古典智慧應用於日常生活決策，提升人生品質與幸福感。
                </p>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-user-line text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">個人命盤解讀</h4>
                      <p className="text-gray-600">學習解讀自己的八字命盤，了解個性特質與人生趨勢</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-calendar-line text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">擇日應用技巧</h4>
                      <p className="text-gray-600">掌握日常生活中的擇日原則，重要決策時機的選擇</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-home-line text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">居家風水佈局</h4>
                      <p className="text-gray-600">學習基礎風水原理，改善居住環境能量場</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-heart-line text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">人際關係分析</h4>
                      <p className="text-gray-600">運用命理知識改善人際關係，增進溝通效果</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-6 rounded-xl mb-8">
                  <h4 className="font-semibold text-gray-800 mb-4">課程資訊</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">授課方式：</span>小班制教學 (8-12人)</div>
                    <div><span className="font-medium">課程時數：</span>36小時 (12週)</div>
                    <div><span className="font-medium">上課時間：</span>週末班 / 平日班</div>
                    <div><span className="font-medium">學費：</span>面議</div>
                  </div>
                </div>

                <button 
                  onClick={() => handleRegistration('個人生活應用班')}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-semibold transition-colors whitespace-nowrap cursor-pointer w-full sm:w-auto"
                >
                  立即報名
                </button>
              </div>
              
              <div className="relative">
                <img 
                  src="https://readdy.ai/api/search-image?query=modern%20students%20learning%20traditional%20chinese%20metaphysics%20in%20bright%20classroom%20with%20ancient%20books%20feng%20shui%20compass%20personal%20development%20study%20materials%20warm%20natural%20lighting%20contemporary%20learning%20environment&width=600&height=700&seq=life-class&orientation=portrait"
                  alt="個人生活應用班"
                  className="rounded-2xl shadow-2xl object-cover object-top w-full h-96 lg:h-[500px]"
                />
              </div>
            </div>
          )}

          {/* Professional Course */}
          {activeTab === 'professional' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative">
                <img 
                  src="https://readdy.ai/api/search-image?query=professional%20chinese%20metaphysics%20master%20teaching%20advanced%20students%20with%20ancient%20texts%20divination%20tools%20traditional%20ceremony%20formal%20academic%20setting%20scholarly%20atmosphere%20wooden%20furniture&width=600&height=700&seq=professional-class&orientation=portrait"
                  alt="職業傳承弟子班"
                  className="rounded-2xl shadow-2xl object-cover object-top w-full h-96 lg:h-[500px]"
                />
              </div>
              
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold text-gray-800 mb-6">職業傳承弟子班</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  正統命理學傳承課程，培養專業命理師。從基礎到高階，系統性學習山醫命卜相五大學科，成為合格的命理諮詢師。
                </p>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-book-open-line text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">古典命理典籍研讀</h4>
                      <p className="text-gray-600">深入學習《子平真詮》、《滴天髓》等經典著作</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-compass-line text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">五術全科傳授</h4>
                      <p className="text-gray-600">山、醫、命、卜、相五大學科完整傳承</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-customer-service-2-line text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">實戰諮詢技巧</h4>
                      <p className="text-gray-600">專業諮詢技巧與個案分析實務操作</p>
                    </div>
                  </div>
                  

                </div>

                <div className="bg-blue-50 p-6 rounded-xl mb-8">
                  <h4 className="font-semibold text-gray-800 mb-4">課程資訊</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">授課方式：</span>師徒制傳承 (限收22名)</div>
                    <div><span className="font-medium">課程時數：</span>360小時密傳 (終身指導)</div>
                    <div><span className="font-medium">上課時間：</span>週末密集班</div>
                    <div><span className="font-medium">學費：</span>面議</div>
                  </div>
                </div>

                <button 
                  onClick={() => handleRegistration('職業傳承弟子班')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-colors whitespace-nowrap cursor-pointer w-full sm:w-auto"
                >
                  申請入門
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Teaching Method */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">創新教學方法</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              結合傳統師承與現代教學技術，讓學習更加生動有趣
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-user-line text-white text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">一對一指導</h3>
              <p className="text-gray-600">個人化教學計畫，針對性解決學習難點</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-team-line text-white text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">小組討論</h3>
              <p className="text-gray-600">同儕學習交流，加深理解與記憶</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-pie-chart-line text-white text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">圖形化教學</h3>
              <p className="text-gray-600">運用圖表視覺化複雜理論概念</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-smartphone-line text-white text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">數位化工具</h3>
              <p className="text-gray-600">結合現代科技輔助學習與實務應用</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Registration Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">開始您的學習之旅</h2>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
              歡迎與我們聯絡，了解更多課程詳情或直接報名參加
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => setShowContactForm(true)}
              className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              與我聯絡
            </button>
            <button 
              onClick={() => {
                setSelectedCourse('');
                setShowRegistrationForm(true);
              }}
              className="border-2 border-white text-white hover:bg-white hover:text-amber-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer"
            >
              填寫報名表
            </button>
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">與我聯絡</h3>
              <button 
                onClick={() => setShowContactForm(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <form id="contact-form" onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
                <input 
                  type="text" 
                  name="contact_name" 
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="請輸入您的姓名"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">電話</label>
                <input 
                  type="tel" 
                  name="contact_phone"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="請輸入聯絡電話"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">電子信箱</label>
                <input 
                  type="email" 
                  name="contact_email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="請輸入電子信箱"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">留言內容 * (限500字)</label>
                <textarea 
                  name="message" 
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  placeholder="請描述您想了解的內容或問題"
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                送出留言
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">課程報名表</h3>
              <button 
                onClick={() => setShowRegistrationForm(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <form id="registration-form" onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">報名課程 *</label>
                <select 
                  name="course_type" 
                  required
                  defaultValue={selectedCourse}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-8"
                >
                  <option value="">請選擇課程</option>
                  <option value="個人生活應用班">個人生活應用班</option>
                  <option value="職業傳承弟子班">職業傳承弟子班</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="請輸入您的姓名"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">聯絡電話 *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="請輸入聯絡電話"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">電子信箱 *</label>
                <input 
                  type="email" 
                  name="email" 
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="請輸入電子信箱"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">年齡</label>
                <input 
                  type="number" 
                  name="age"
                  min="18"
                  max="80"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="請輸入年齡"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">職業</label>
                <input 
                  type="text" 
                  name="occupation"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="請輸入職業"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">命理學習經驗</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="experience" value="無經驗" className="mr-2" />
                    <span>完全沒有經驗</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="experience" value="初學者" className="mr-2" />
                    <span>初學者（1年以下）</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="experience" value="有基礎" className="mr-2" />
                    <span>有基礎（1-3年）</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="experience" value="進階" className="mr-2" />
                    <span>進階（3年以上）</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">學習動機 (限500字)</label>
                <textarea 
                  name="motivation"
                  maxLength={500}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  placeholder="請簡述您的學習動機與期望"
                ></textarea>
              </div>
              
              <div>
                <label className="flex items-start">
                  <input type="checkbox" name="agree_terms" required className="mr-2 mt-1" />
                  <span className="text-sm text-gray-600">我同意接受課程相關資訊通知，並了解個人資料使用規範 *</span>
                </label>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                提交報名表
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}