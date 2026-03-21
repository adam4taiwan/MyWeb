'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';

const TOPICS = ['婚姻', '事業', '財運', '健康', '其他'];

interface FormState {
  name: string;
  birthDate: string;
  isLunar: boolean;
  topic: string;
  contactType: string;
  contactInfo: string;
  preferredDate: string;
  notes: string;
}

export default function AppointmentPage() {
  const { token } = useAuth();
  const [form, setForm] = useState<FormState>({
    name: '',
    birthDate: '',
    isLunar: false,
    topic: '',
    contactType: 'line',
    contactInfo: '',
    preferredDate: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ecanapi.fly.dev/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic) { alert('請選擇諮詢主題'); return; }
    if (!form.name.trim()) { alert('請填寫姓名'); return; }
    if (!form.contactInfo.trim()) { alert('請填寫聯絡方式'); return; }

    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/Booking/consultation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          birthDate: form.birthDate,
          isLunar: form.isLunar,
          topic: form.topic,
          contactType: form.contactType,
          contactInfo: form.contactInfo,
          preferredDate: form.preferredDate,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: data.message });
        setForm({ name: '', birthDate: '', isLunar: false, topic: '', contactType: 'line', contactInfo: '', preferredDate: '', notes: '' });
      } else {
        setResult({ ok: false, message: data.message || '提交失敗，請稍後再試' });
      }
    } catch {
      setResult({ ok: false, message: '連線失敗，請稍後再試' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">問事預約</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            玉洞子透過線上視訊（LINE / 微信）為您解惑指引。填寫以下資料，我們將安排合適時段與您聯繫。
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h2 className="text-sm font-bold text-gray-800 mb-3">問事流程</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { step: '1', label: '填寫表單', desc: '提交問事申請' },
              { step: '2', label: '確認預約', desc: '玉洞子聯繫確認時間' },
              { step: '3', label: '視訊問事', desc: 'LINE / 微信線上進行' },
            ].map(item => (
              <div key={item.step}>
                <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">
                  {item.step}
                </div>
                <p className="text-xs font-bold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">問事申請表</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                諮詢主題 <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, topic: t }))}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      form.topic === t
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                姓名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="請填寫真實姓名"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm"
              />
            </div>

            {/* Birth date */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">出生日期（含時辰更佳）</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={form.birthDate}
                  onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                  placeholder="例：1985/03/15 午時"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm"
                />
                <label className="flex items-center gap-1.5 text-sm text-gray-600 flex-shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isLunar}
                    onChange={e => setForm(f => ({ ...f, isLunar: e.target.checked }))}
                    className="accent-amber-500"
                  />
                  農曆
                </label>
              </div>
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                聯絡方式 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                {([['line', 'LINE'], ['wechat', '微信'], ['phone', '電話']] as const).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, contactType: type }))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      form.contactType === type
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={form.contactInfo}
                onChange={e => setForm(f => ({ ...f, contactInfo: e.target.value }))}
                placeholder={
                  form.contactType === 'phone' ? '請填寫手機號碼' : `請填寫 ${form.contactType === 'line' ? 'LINE' : '微信'} ID`
                }
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm"
              />
            </div>

            {/* Preferred date */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">期望預約時間（可選）</label>
              <input
                type="text"
                value={form.preferredDate}
                onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))}
                placeholder="例：週末下午、3/25 之後"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm"
              />
            </div>

            {/* Notes / question */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">問題描述（可選）</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="簡述您想諮詢的問題或目前困境，讓玉洞子提前了解..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm resize-none"
              />
            </div>

            {result && (
              <div className={`rounded-xl p-4 text-sm ${result.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {result.message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? '提交中...' : '送出預約申請'}
            </button>
          </form>
        </div>

        {/* Notes */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-sm text-amber-800 space-y-2">
          <p className="font-bold">注意事項</p>
          <ul className="space-y-1 text-amber-700">
            <li>- 問事採預約制，視訊時間約 30-60 分鐘</li>
            <li>- 費用以玉洞子確認時告知為準（視問題性質而異）</li>
            <li>- 銀會員以上享有問事九折優惠，金會員八五折</li>
            <li>- 請確認聯絡方式正確，玉洞子將主動與您聯繫</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <Link href="/member" className="text-sm text-amber-600 hover:underline">
            返回會員中心
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
