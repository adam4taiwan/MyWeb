
'use client';

import { useState } from 'react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: string;
}

export default function EmailModal({ isOpen, onClose, service }: EmailModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    gender: '',
    maritalStatus: '',
    occupation: '',
    subject: '',
    priority: 'normal',
    consultationType: 'detailed',
    questions: '',
    attachments: [] as File[]
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email諮詢申請:', { service, ...formData });
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        birthTime: '',
        birthPlace: '',
        gender: '',
        maritalStatus: '',
        occupation: '',
        subject: '',
        priority: 'normal',
        consultationType: 'detailed',
        questions: '',
        attachments: []
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, attachments: Array.from(e.target.files) });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <i className="ri-mail-line text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">電子郵件諮詢</h3>
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
              <i className="ri-mail-check-line text-green-600 text-2xl"></i>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">郵件發送成功！</h4>
            <p className="text-gray-600 mb-4">我們已收到您的諮詢申請</p>
            <div className="bg-green-50 rounded-lg p-4 text-left">
              <h5 className="font-semibold text-green-800 mb-2">接下來的流程：</h5>
              <ul className="text-green-700 space-y-1 text-sm">
                <li>• 24小時內確認收件並回覆預估時間</li>
                <li>• 3-5個工作天內提供詳細分析報告</li>
                <li>• 如需補充資料會另行聯繫</li>
                <li>• 報告將以PDF格式寄送至您的信箱</li>
              </ul>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">基本資料</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">姓名 *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="請輸入您的姓名"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">電子郵件 *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="example@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">聯絡電話</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="09XX-XXX-XXX"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">生辰資料</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">出生日期 *</label>
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">出生時間</label>
                        <input
                          type="time"
                          name="birthTime"
                          value={formData.birthTime}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">出生地點</label>
                      <input
                        type="text"
                        name="birthPlace"
                        value={formData.birthPlace}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="縣市或國家"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">性別 *</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm pr-8"
                        >
                          <option value="">請選擇</option>
                          <option value="male">男性</option>
                          <option value="female">女性</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">婚姻狀況</label>
                        <select
                          name="maritalStatus"
                          value={formData.maritalStatus}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm pr-8"
                        >
                          <option value="">請選擇</option>
                          <option value="single">未婚</option>
                          <option value="married">已婚</option>
                          <option value="divorced">離婚</option>
                          <option value="widowed">喪偶</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">職業</label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="您的職業或工作領域"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">諮詢詳情</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">諮詢主題 *</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="請簡述諮詢主題"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">優先程度</label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm pr-8"
                        >
                          <option value="normal">一般</option>
                          <option value="urgent">緊急</option>
                          <option value="very-urgent">非常緊急</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">諮詢類型</label>
                        <select
                          name="consultationType"
                          value={formData.consultationType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm pr-8"
                        >
                          <option value="detailed">詳細分析</option>
                          <option value="brief">簡要回覆</option>
                          <option value="specific">特定問題</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">詳細問題描述 *</label>
                      <textarea
                        name="questions"
                        value={formData.questions}
                        onChange={handleChange}
                        required
                        rows={8}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                        placeholder="請詳細描述您的問題，包括具體想了解的方面、目前的困擾或期望獲得的建議等（限500字）"
                      ></textarea>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {formData.questions.length}/500
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">附件上傳</label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        可上傳相關資料（如手相照片、風水平面圖等），支援PDF、圖片、文檔格式
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-lg p-4">
                  <h5 className="font-semibold text-amber-800 mb-2">服務說明</h5>
                  <ul className="text-amber-700 space-y-1 text-sm">
                    <li>• 專業命理師將在3-5個工作天內回覆</li>
                    <li>• 詳細分析報告將以PDF格式提供</li>
                    <li>• 緊急諮詢將優先處理（額外收費）</li>
                    <li>• 一次諮詢包含一次免費追問機會</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                發送諮詢郵件
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
