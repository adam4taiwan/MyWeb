
'use client';

import { useState } from 'react';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: string;
}

export default function VideoCallModal({ isOpen, onClose, service }: VideoCallModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    birthTime: '',
    gender: '',
    preferredDate: '',
    preferredTime: '',
    questions: '',
    platform: 'zoom'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('視訊諮詢預約:', { service, ...formData });
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      setFormData({
        name: '',
        phone: '',
        email: '',
        birthDate: '',
        birthTime: '',
        gender: '',
        preferredDate: '',
        preferredTime: '',
        questions: '',
        platform: 'zoom'
      });
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                <i className="ri-video-line text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">視訊諮詢預約</h3>
                <p className="text-gray-600">{service}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-gray-600"></i>
            </button>
          </div>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-green-600 text-2xl"></i>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">預約成功！</h4>
            <p className="text-gray-600">我們將於24小時內與您聯繫確認視訊時間</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">姓名 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  placeholder="請輸入您的姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">聯絡電話 *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  placeholder="09XX-XXX-XXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">電子郵件 *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                placeholder="example@email.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">出生日期 *</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">出生時間</label>
                <input
                  type="time"
                  name="birthTime"
                  value={formData.birthTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">性別 *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm pr-8"
                >
                  <option value="">請選擇</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">希望諮詢日期 *</label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">希望時段 *</label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm pr-8"
                >
                  <option value="">請選擇時段</option>
                  <option value="morning">上午 9:00-12:00</option>
                  <option value="afternoon">下午 13:00-17:00</option>
                  <option value="evening">晚間 18:00-21:00</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">視訊平台偏好</label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm pr-8"
              >
                <option value="zoom">Zoom</option>
                <option value="meet">Google Meet</option>
                <option value="teams">Microsoft Teams</option>
                <option value="line">LINE通話</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">諮詢問題描述</label>
              <textarea
                name="questions"
                value={formData.questions}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none"
                placeholder="請簡述您希望諮詢的問題（限500字）"
              ></textarea>
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.questions.length}/500
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                確認預約
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
