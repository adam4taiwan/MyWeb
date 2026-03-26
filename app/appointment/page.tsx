'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';

const TOPICS = ['婚姻感情', '事業工作', '財運投資', '健康身體', '子女教育', '其他'];

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
        setResult({ ok: true, message: data.message || '預約申請成功！玉洞子將於 1-2 個工作日內與您聯繫安排時間。' });
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
    <div className="min-h-screen flex flex-col">
      {/* Fixed background - show full portrait image without cropping */}
      <div className="fixed inset-0 bg-stone-950" />
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: "url('/images/blessing-bg.jpg')",
          backgroundSize: 'auto 100vh',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/75" />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow w-full max-w-2xl mx-auto px-4 py-10">

          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-block mb-3 px-4 py-1 border border-amber-600/50 rounded-full text-amber-400 text-xs tracking-widest uppercase">
              玉洞子星相古學堂
            </div>
            <h1
              className="text-3xl font-bold text-amber-200 mb-3 tracking-wide"
              style={{ textShadow: '0 2px 12px rgba(180,120,0,0.6)' }}
            >
              問事預約
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-3" />
            <p className="text-amber-100/70 text-sm leading-relaxed max-w-sm mx-auto">
              玉洞子透過線上為您解惑指引。<br />
              填寫以下資料，將安排合適時段與您聯繫。
            </p>
          </div>

          {/* Flow steps */}
          <div className="bg-black/50 backdrop-blur-sm border border-amber-800/40 rounded-2xl p-5 mb-5">
            <h2 className="text-amber-300 font-bold text-xs mb-4 tracking-wide">問事流程</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { step: '1', label: '填寫申請', desc: '提交問事資料' },
                { step: '2', label: '確認預約', desc: '玉洞子聯繫安排時段' },
                { step: '3', label: '線上問事', desc: '依約定方式進行' },
              ].map(item => (
                <div key={item.step}>
                  <div className="w-9 h-9 bg-amber-900/60 border border-amber-600/50 text-amber-300 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">
                    {item.step}
                  </div>
                  <p className="text-xs font-bold text-amber-200">{item.label}</p>
                  <p className="text-xs text-amber-400/60 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-black/50 backdrop-blur-sm border border-amber-800/40 rounded-2xl p-6 mb-5">
            <h2 className="text-amber-300 font-bold text-sm mb-4 tracking-wide">問事申請表</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Topic */}
              <div>
                <label className="block text-xs font-medium text-amber-300/80 mb-1.5">
                  諮詢主題 <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, topic: t }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        form.topic === t
                          ? 'bg-amber-700 text-amber-100 border-amber-600'
                          : 'bg-black/30 text-amber-400 border-amber-700/40 hover:border-amber-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-amber-300/80 mb-1.5">
                  姓名 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="請填寫真實姓名"
                  required
                  className="w-full px-4 py-2.5 bg-black/40 border border-amber-700/40 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none text-sm text-amber-100 placeholder:text-amber-800"
                />
              </div>

              {/* Birth date */}
              <div>
                <label className="block text-xs font-medium text-amber-300/80 mb-1.5">出生日期（含時辰更佳）</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={form.birthDate}
                    onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                    placeholder="例：1985/03/15 午時"
                    className="flex-1 px-4 py-2.5 bg-black/40 border border-amber-700/40 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none text-sm text-amber-100 placeholder:text-amber-800"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-amber-300/80 flex-shrink-0 cursor-pointer">
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
                <label className="block text-xs font-medium text-amber-300/80 mb-1.5">
                  聯絡方式 <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  {([['line', 'LINE'], ['wechat', '微信'], ['phone', '電話']] as const).map(([type, label]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, contactType: type }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        form.contactType === type
                          ? 'bg-amber-700 text-amber-100 border-amber-600'
                          : 'bg-black/30 text-amber-400 border-amber-700/40 hover:border-amber-500'
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
                  className="w-full px-4 py-2.5 bg-black/40 border border-amber-700/40 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none text-sm text-amber-100 placeholder:text-amber-800"
                />
              </div>

              {/* Preferred date */}
              <div>
                <label className="block text-xs font-medium text-amber-300/80 mb-1.5">期望預約時間（可選）</label>
                <input
                  type="text"
                  value={form.preferredDate}
                  onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))}
                  placeholder="例：週末下午、4/1 之後皆可"
                  className="w-full px-4 py-2.5 bg-black/40 border border-amber-700/40 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none text-sm text-amber-100 placeholder:text-amber-800"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-amber-300/80 mb-1.5">問題描述（可選）</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="簡述您想諮詢的問題或目前困境，讓玉洞子提前了解..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-black/40 border border-amber-700/40 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none text-sm text-amber-100 placeholder:text-amber-800 resize-none"
                />
              </div>

              {result && (
                <div className={`rounded-xl p-4 text-sm border ${
                  result.ok
                    ? 'bg-green-900/40 text-green-300 border-green-700/50'
                    : 'bg-red-900/40 text-red-300 border-red-700/50'
                }`}>
                  {result.message}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-600 text-amber-100 rounded-xl font-bold hover:from-amber-600 hover:to-amber-500 disabled:opacity-50 transition-all text-sm tracking-wide shadow-lg shadow-amber-900/40"
              >
                {submitting ? '提交中...' : '送出預約申請'}
              </button>
            </form>
          </div>

          {/* Notes */}
          <div className="bg-amber-950/40 border border-amber-800/30 rounded-2xl p-5 text-xs text-amber-300/80 space-y-1.5 mb-6">
            <p className="font-bold text-amber-300 text-sm mb-2">注意事項</p>
            <p>- 問事採預約制，時間約 30-60 分鐘，玉洞子主動聯繫確認</p>
            <p>- 費用以玉洞子確認時告知為準（視問題性質而異）</p>
            <p>- 銀會員以上享有問事九折優惠，金會員八五折</p>
            <p>- 請確認聯絡方式正確，玉洞子將主動與您聯繫</p>
          </div>

          <div className="text-center">
            <Link href="/member" className="text-xs text-amber-600/80 hover:text-amber-400 transition-colors">
              返回會員中心
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
