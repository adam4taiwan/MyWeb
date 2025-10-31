'use client';

import { useState } from 'react';

export default function PartnershipSection() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    industry: '',
    cooperationType: '',
    expectedBudget: '',
    description: ''
  });

  const partnerships = [
    {
      type: '高端餐廳',
      title: '美食命理體驗',
      description: '結合精緻料理與命理文化，打造獨特用餐體驗',
      features: ['主題套餐設計', '包廂命理諮詢', '節慶特別活動', '會員專屬服務'],
      image: 'Luxury restaurant interior with traditional Chinese elements, elegant dining atmosphere, warm golden lighting, sophisticated table settings with cultural decorative touches, upscale ambiance for fine dining and cultural experiences'
    },
    {
      type: '精品飯店',
      title: '尊榮住宿服務',
      description: '為貴賓提供專業命理諮詢與風水建議',
      features: ['VIP專屬諮詢', '套房風水評估', '商務決策支援', '文化體驗行程'],
      image: 'Luxurious hotel suite with elegant Chinese cultural elements, sophisticated interior design, comfortable seating area, premium hospitality environment with traditional decorative accents, upscale accommodation atmosphere'
    },
    {
      type: '企業培訓',
      title: '智慧管理講座',
      description: '將古典智慧應用於現代企業管理',
      features: ['領導力提升', '團隊建設指導', '決策思維訓練', '企業文化融合'],
      image: 'Modern corporate training room with professional presentation setup, contemporary business environment, comfortable seating arrangement, sophisticated meeting space with cultural wisdom integration elements'
    },
    {
      type: '文化學苑',
      title: '傳統文化教育',
      description: '系統性傳承命理文化知識',
      features: ['課程體系設計', '師資培訓認證', '教材編撰服務', '學員考核制度'],
      image: 'Traditional Chinese study room with modern educational facilities, cultural learning environment, elegant wooden furniture, scholarly atmosphere with books and traditional decorative elements'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('合作申請已提交，我們將於24小時內與您聯繫！');
    setShowContactModal(false);
    setFormData({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      industry: '',
      cooperationType: '',
      expectedBudget: '',
      description: ''
    });
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">異業結合合作</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            與各行業深度合作，創造獨特的文化體驗服務，為您的事業增添傳統智慧的價值
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {partnerships.map((partnership, index) => (
            <div key={index} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src={`https://readdy.ai/api/search-image?query=$%7Bpartnership.image%7D&width=600&height=300&seq=partnership-${index}&orientation=landscape`}
                  alt={partnership.title}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="inline-block bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  {partnership.type}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{partnership.title}</h3>
                <p className="text-gray-600 mb-4">{partnership.description}</p>
                <div className="space-y-2 mb-6">
                  {partnership.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center space-x-2 text-sm text-gray-700">
                      <div className="w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-xs"></i>
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="w-full bg-amber-600 text-white py-3 rounded-full hover:bg-amber-700 transition-colors font-semibold whitespace-nowrap cursor-pointer"
                >
                  申請合作
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">開創合作新機會</h3>
            <p className="text-lg mb-6 opacity-90">
              不論您是餐飲業、飯店業、教育機構或其他行業，我們都能為您量身打造合適的合作方案
            </p>
            <button 
              onClick={() => setShowContactModal(true)}
              className="bg-white text-amber-600 px-8 py-3 rounded-full hover:bg-gray-100 transition-colors font-semibold whitespace-nowrap cursor-pointer"
            >
              立即洽談合作
            </button>
          </div>
        </div>
      </div>

      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">合作申請表</h3>
                <button 
                  onClick={() => setShowContactModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <i className="ri-close-line text-gray-600"></i>
                </button>
              </div>

              <form id="partnership-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">公司名稱 *</label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="請輸入公司名稱"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">聯絡人 *</label>
                    <input
                      type="text"
                      name="contactPerson"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="請輸入聯絡人姓名"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">聯絡電話 *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="請輸入聯絡電話"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">電子信箱 *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="請輸入電子信箱"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">行業類別 *</label>
                    <select
                      name="industry"
                      required
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">請選擇行業類別</option>
                      <option value="restaurant">餐飲業</option>
                      <option value="hotel">飯店業</option>
                      <option value="education">教育機構</option>
                      <option value="corporate">企業培訓</option>
                      <option value="retail">零售業</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">合作類型 *</label>
                    <select
                      name="cooperationType"
                      required
                      value={formData.cooperationType}
                      onChange={(e) => setFormData({...formData, cooperationType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">請選擇合作類型</option>
                      <option value="lecture">講座服務</option>
                      <option value="consultation">諮詢服務</option>
                      <option value="training">培訓課程</option>
                      <option value="event">活動合作</option>
                      <option value="longterm">長期合作</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">預期預算範圍</label>
                  <select
                    name="expectedBudget"
                    value={formData.expectedBudget}
                    onChange={(e) => setFormData({...formData, expectedBudget: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                  >
                    <option value="">請選擇預算範圍</option>
                    <option value="below-50k">5萬以下</option>
                    <option value="50k-100k">5-10萬</option>
                    <option value="100k-200k">10-20萬</option>
                    <option value="200k-500k">20-50萬</option>
                    <option value="above-500k">50萬以上</option>
                    <option value="discuss">面議</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">合作需求描述 *</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                    placeholder="請詳細描述您的合作需求、期望達成的目標、預計時間等（限500字）"
                  ></textarea>
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/500 字
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 text-white py-3 rounded-xl hover:bg-amber-700 transition-colors font-semibold whitespace-nowrap cursor-pointer"
                >
                  提交合作申請
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}