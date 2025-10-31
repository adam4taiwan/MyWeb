'use client';

import { useState } from 'react';

export default function BookingSection() {
  const [activeTab, setActiveTab] = useState('appointment');
  const [appointmentData, setAppointmentData] = useState({
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    duration: '',
    participants: '',
    location: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    companyName: '',
    requirements: ''
  });

  const [homeServiceData, setHomeServiceData] = useState({
    serviceType: '',
    address: '',
    preferredDate: '',
    preferredTime: '',
    participants: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    requirements: ''
  });

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('預約申請已提交！我們將於24小時內與您聯繫確認詳細安排。');
    setAppointmentData({
      serviceType: '',
      preferredDate: '',
      preferredTime: '',
      duration: '',
      participants: '',
      location: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      companyName: '',
      requirements: ''
    });
  };

  const handleHomeServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('到府服務申請已提交！我們將於24小時內與您聯繫確認服務細節。');
    setHomeServiceData({
      serviceType: '',
      address: '',
      preferredDate: '',
      preferredTime: '',
      participants: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      requirements: ''
    });
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">預約服務</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            選擇適合的服務方式，我們將為您量身打造專業的講座體驗
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-1 shadow-lg">
              <button
                onClick={() => setActiveTab('appointment')}
                className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'appointment' 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'text-gray-700 hover:text-amber-600'
                }`}
              >
                講座預約
              </button>
              <button
                onClick={() => setActiveTab('homeService')}
                className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'homeService' 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'text-gray-700 hover:text-amber-600'
                }`}
              >
                到府服務
              </button>
            </div>
          </div>

          {activeTab === 'appointment' && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">講座預約申請</h3>
              <form id="lecture-appointment" onSubmit={handleAppointmentSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">服務類型 *</label>
                    <select
                      name="serviceType"
                      required
                      value={appointmentData.serviceType}
                      onChange={(e) => setAppointmentData({...appointmentData, serviceType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">請選擇服務類型</option>
                      <option value="enterprise">企業講座服務</option>
                      <option value="restaurant">餐飲業合作</option>
                      <option value="hotel">飯店合作服務</option>
                      <option value="academy">學苑教育合作</option>
                      <option value="theme">主題式活動</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">預計參與人數 *</label>
                    <select
                      name="participants"
                      required
                      value={appointmentData.participants}
                      onChange={(e) => setAppointmentData({...appointmentData, participants: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">請選擇人數範圍</option>
                      <option value="10-20">10-20人</option>
                      <option value="21-50">21-50人</option>
                      <option value="51-100">51-100人</option>
                      <option value="100+">100人以上</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">希望日期 *</label>
                    <input
                      type="date"
                      name="preferredDate"
                      required
                      value={appointmentData.preferredDate}
                      onChange={(e) => setAppointmentData({...appointmentData, preferredDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">希望時間 *</label>
                    <select
                      name="preferredTime"
                      required
                      value={appointmentData.preferredTime}
                      onChange={(e) => setAppointmentData({...appointmentData, preferredTime: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">請選擇時間</option>
                      <option value="morning">上午 9:00-12:00</option>
                      <option value="afternoon">下午 2:00-5:00</option>
                      <option value="evening">晚上 7:00-9:00</option>
                      <option value="discuss">時間可議</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">講座時長 *</label>
                    <select
                      name="duration"
                      required
                      value={appointmentData.duration}
                      onChange={(e) => setAppointmentData({...appointmentData, duration: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">請選擇時長</option>
                      <option value="1-1.5">1-1.5小時</option>
                      <option value="1.5-2">1.5-2小時</option>
                      <option value="2-3">2-3小時</option>
                      <option value="half-day">半天</option>
                      <option value="full-day">全天</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">地點 *</label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={appointmentData.location}
                    onChange={(e) => setAppointmentData({...appointmentData, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    placeholder="請輸入講座地點（詳細地址）"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">公司/機構名稱</label>
                    <input
                      type="text"
                      name="companyName"
                      value={appointmentData.companyName}
                      onChange={(e) => setAppointmentData({...appointmentData, companyName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="請輸入公司或機構名稱"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">聯絡人姓名 *</label>
                    <input
                      type="text"
                      name="contactName"
                      required
                      value={appointmentData.contactName}
                      onChange={(e) => setAppointmentData({...appointmentData, contactName: e.target.value})}
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
                      name="contactPhone"
                      required
                      value={appointmentData.contactPhone}
                      onChange={(e) => setAppointmentData({...appointmentData, contactPhone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="請輸入聯絡電話"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">電子信箱 *</label>
                    <input
                      type="email"
                      name="contactEmail"
                      required
                      value={appointmentData.contactEmail}
                      onChange={(e) => setAppointmentData({...appointmentData, contactEmail: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="請輸入電子信箱"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">特殊需求或備註</label>
                  <textarea
                    name="requirements"
                    rows={4}
                    maxLength={500}
                    value={appointmentData.requirements}
                    onChange={(e) => setAppointmentData({...appointmentData, requirements: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                    placeholder="請描述您的特殊需求、主題偏好、設備需求等（限500字）"
                  ></textarea>
                  <div className="text-xs text-gray-500 mt-1">
                    {appointmentData.requirements.length}/500 字
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 text-white py-4 rounded-xl hover:bg-amber-700 transition-colors font-semibold text-lg whitespace-nowrap cursor-pointer"
                >
                  提交預約申請
                </button>
              </form>
            </div>
          )}

          {activeTab === 'homeService' && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">到府服務申請</h3>
              <form id="home-service" onSubmit={handleHomeServiceSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">服務類型 *</label>
                    <select
                      name="serviceType"
                      required
                      value={homeServiceData.serviceType}
                      onChange={(e) => setHomeServiceData({...homeServiceData, serviceType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">請選擇服務類型</option>
                      <option value="feng-shui">居家風水勘察</option>
                      <option value="family-analysis">家族命理分析</option>
                      <option value="private-consultation">私人專屬諮詢</option>
                      <option value="group-lecture">小團體講座</option>
                      <option value="business-consultation">商務決策諮詢</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">參與人數 *</label>
                    <select
                      name="participants"
                      required
                      value={homeServiceData.participants}
                      onChange={(e) => setHomeServiceData({...homeServiceData, participants: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">請選擇人數</option>
                      <option value="1">個人（1人）</option>
                      <option value="2-3">夫妻/情侶（2-3人）</option>
                      <option value="4-6">小型家庭（4-6人）</option>
                      <option value="7-10">大家庭（7-10人）</option>
                      <option value="10+">10人以上</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">服務地址 *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={homeServiceData.address}
                    onChange={(e) => setHomeServiceData({...homeServiceData, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    placeholder="請輸入詳細地址（含縣市、區域、街道號碼）"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">希望日期 *</label>
                    <input
                      type="date"
                      name="preferredDate"
                      required
                      value={homeServiceData.preferredDate}
                      onChange={(e) => setHomeServiceData({...homeServiceData, preferredDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">希望時間 *</label>
                    <select
                      name="preferredTime"
                      required
                      value={homeServiceData.preferredTime}
                      onChange={(e) => setHomeServiceData({...homeServiceData, preferredTime: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">請選擇時間</option>
                      <option value="morning">上午 9:00-12:00</option>
                      <option value="afternoon">下午 2:00-5:00</option>
                      <option value="evening">晚上 7:00-9:00</option>
                      <option value="weekend">週末時間</option>
                      <option value="discuss">時間可議</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">聯絡人姓名 *</label>
                    <input
                      type="text"
                      name="contactName"
                      required
                      value={homeServiceData.contactName}
                      onChange={(e) => setHomeServiceData({...homeServiceData, contactName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="請輸入聯絡人姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">聯絡電話 *</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      required
                      value={homeServiceData.contactPhone}
                      onChange={(e) => setHomeServiceData({...homeServiceData, contactPhone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="請輸入聯絡電話"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">電子信箱 *</label>
                  <input
                    type="email"
                    name="contactEmail"
                    required
                    value={homeServiceData.contactEmail}
                    onChange={(e) => setHomeServiceData({...homeServiceData, contactEmail: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    placeholder="請輸入電子信箱"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">特殊需求或備註</label>
                  <textarea
                    name="requirements"
                    rows={4}
                    maxLength={500}
                    value={homeServiceData.requirements}
                    onChange={(e) => setHomeServiceData({...homeServiceData, requirements: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                    placeholder="請描述您的具體需求、關注重點、家庭狀況等（限500字）"
                  ></textarea>
                  <div className="text-xs text-gray-500 mt-1">
                    {homeServiceData.requirements.length}/500 字
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                    <i className="ri-information-line mr-2"></i>
                    到府服務說明
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• 服務範圍：大台北地區免交通費，其他地區另計交通費</li>
                    <li>• 服務時間：每次服務約2-3小時</li>
                    <li>• 服務費用：8,000-20,000元（依服務內容而定）</li>
                    <li>• 預約確認：我們將於24小時內電話確認服務細節</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 text-white py-4 rounded-xl hover:bg-amber-700 transition-colors font-semibold text-lg whitespace-nowrap cursor-pointer"
                >
                  提交到府服務申請
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}