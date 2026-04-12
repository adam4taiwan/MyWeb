'use client';

import { useState } from 'react';

export default function CharityService() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    bookType: '',
    quantity: '',
    description: '',
    address: '',
    pickup: false
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 基本驗證
    if (!formData.name || !formData.phone || !formData.bookType) {
      alert('請填寫必要資訊');
      return;
    }

    console.log('捐書申請資料:', formData);
    setIsSubmitted(true);
    
    // 重置表單
    setTimeout(() => {
      setFormData({
        name: '',
        phone: '',
        email: '',
        bookType: '',
        quantity: '',
        description: '',
        address: '',
        pickup: false
      });
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              慈善捐書服務
            </h2>
            <p className="text-xl text-gray-600">
              您的每一本書都是傳承文化的珍貴資源，歡迎捐贈給需要的人
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 捐書介紹 */}
            <div>
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <i className="ri-heart-line text-white"></i>
                  </div>
                  愛心捐書計畫
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-check-line text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">接受書籍類型</h4>
                      <p className="text-gray-600">古文化典籍、藝術書法、哲學經典、文學作品等</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-truck-line text-green-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">到府收書</h4>
                      <p className="text-gray-600">台北市區提供免費到府收書服務（大量書籍）</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-certificate-line text-purple-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">捐贈證明</h4>
                      <p className="text-gray-600">提供正式捐贈證明，可作為公益捐贈憑證</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-recycle-line text-amber-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">文化傳承</h4>
                      <p className="text-gray-600">將您的書籍轉贈給愛書人士，延續知識傳承</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 成果展示 */}
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">捐書成果</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">2,340</div>
                    <div className="text-green-100">累計捐贈書籍</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">856</div>
                    <div className="text-green-100">受惠讀者</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">125</div>
                    <div className="text-green-100">愛心捐贈者</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">6</div>
                    <div className="text-green-100">服務年數</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 捐書申請表單 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">捐書申請表單</h3>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-check-line text-white text-2xl"></i>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">申請提交成功！</h4>
                  <p className="text-gray-600">
                    感謝您的愛心捐贈，我們將在1-2個工作日內與您聯繫確認收書事宜。
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" id="charity-donation">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        姓名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        聯絡電話 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">電子信箱</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        書籍類型 <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="bookType"
                        value={formData.bookType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-8"
                        required
                      >
                        <option value="">請選擇書籍類型</option>
                        <option value="書法字帖">書法字帖</option>
                        <option value="古典文學">古典文學</option>
                        <option value="藝術圖錄">藝術圖錄</option>
                        <option value="古典哲學">古典哲學</option>
                        <option value="其他古籍">其他古籍</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">預估數量</label>
                      <input
                        type="text"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="例：約50本"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">書籍描述</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      maxLength={500}
                      placeholder="請簡述書籍狀況、出版年代等資訊..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {formData.description.length}/500
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">收書地址</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="如需到府收書請填寫地址"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="pickup"
                      checked={formData.pickup}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label className="ml-2 text-gray-700">
                      需要到府收書服務（限台北市區，大量書籍）
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-4 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer transform hover:scale-105"
                  >
                    提交捐書申請
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}