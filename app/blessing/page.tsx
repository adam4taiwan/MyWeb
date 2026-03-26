'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';

const SERVICES = [
  {
    code: 'BLESSING_ANTAISUI',
    name: '安太歲',
    icon: '★',
    desc: '本命年或流年與太歲沖犯者，容易破財、意外、病災。透過安太歲儀式護佑，化解沖煞，保一年平安順遂。',
    price: 'NT$1,200',
  },
  {
    code: 'BLESSING_LIGHT',
    name: '光明燈',
    icon: '◈',
    desc: '點燃光明燈，照亮人生前程，增添智慧光芒，驅散陰霾晦氣，諸事光明順利。',
    price: 'NT$1,200',
  },
  {
    code: 'BLESSING_WEALTH',
    name: '補財庫',
    icon: '◆',
    desc: '財庫破損、財運受阻時，透過補財庫儀式，修補財運缺口，迎財納福，豐盛充裕。',
    price: 'NT$3,000',
  },
  {
    code: 'BLESSING_PRAYER',
    name: '祈福服務',
    icon: '◉',
    desc: '為命主設置祈福，消災解厄，增添福澤，合適各種人生重要時刻的祝禱儀式。',
    price: 'NT$600',
  },
];

interface FormState {
  serviceCode: string;
  name: string;
  birthDate: string;
  isLunar: boolean;
  contactType: string;
  contactInfo: string;
  notes: string;
}

export default function BlessingPage() {
  const { token } = useAuth();
  const [form, setForm] = useState<FormState>({
    serviceCode: '',
    name: '',
    birthDate: '',
    isLunar: false,
    contactType: 'line',
    contactInfo: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ecanapi.fly.dev/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceCode) { alert('請選擇服務項目'); return; }
    if (!form.name.trim()) { alert('請填寫姓名'); return; }
    if (!form.contactInfo.trim()) { alert('請填寫聯絡方式'); return; }

    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/Booking/blessing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          serviceCode: form.serviceCode,
          name: form.name,
          birthDate: form.birthDate,
          isLunar: form.isLunar,
          contactType: form.contactType,
          contactInfo: form.contactInfo,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: data.message || '登記成功！玉洞子將於 1-2 個工作日內與您聯繫確認。' });
        setForm({ serviceCode: '', name: '', birthDate: '', isLunar: false, contactType: 'line', contactInfo: '', notes: '' });
      } else {
        setResult({ ok: false, message: data.message || '提交失敗，請稍後再試' });
      }
    } catch {
      setResult({ ok: false, message: '連線失敗，請稍後再試' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = SERVICES.find(s => s.code === form.serviceCode);

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
              祈福服務登記
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-3" />
            <p className="text-amber-100/70 text-sm leading-relaxed max-w-sm mx-auto">
              玉洞子親自主持，為您消災解厄、迎福納祥。<br />
              登記後將於 1-2 個工作日內聯繫確認。
            </p>
          </div>

          {/* Service Selection */}
          <div className="bg-black/50 backdrop-blur-sm border border-amber-800/40 rounded-2xl p-6 mb-5">
            <h2 className="text-amber-300 font-bold text-sm mb-4 tracking-wide">選擇服務項目</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICES.map(svc => (
                <button
                  key={svc.code}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, serviceCode: svc.code }))}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    form.serviceCode === svc.code
                      ? 'border-amber-500 bg-amber-900/40'
                      : 'border-amber-800/30 bg-black/20 hover:border-amber-600/60 hover:bg-amber-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 text-base">{svc.icon}</span>
                      <span className="font-bold text-amber-200 text-sm">{svc.name}</span>
                    </div>
                    <span className="text-amber-400 font-bold text-xs ml-2 flex-shrink-0 bg-amber-900/40 px-2 py-0.5 rounded-full border border-amber-700/40">
                      {svc.price}
                    </span>
                  </div>
                  <p className="text-amber-100/60 text-xs leading-relaxed">{svc.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-black/50 backdrop-blur-sm border border-amber-800/40 rounded-2xl p-6 mb-5">
            <h2 className="text-amber-300 font-bold text-sm mb-4 tracking-wide">填寫登記資料</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-xs font-medium text-amber-300/80 mb-1.5">
                  姓名 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="請填寫真實姓名（用於法事記錄）"
                  required
                  className="w-full px-4 py-2.5 bg-black/40 border border-amber-700/40 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none text-sm text-amber-100 placeholder:text-amber-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-300/80 mb-1.5">出生日期</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={form.birthDate}
                    onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                    placeholder="例：1985/03/15"
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

              <div>
                <label className="block text-xs font-medium text-amber-300/80 mb-1.5">備註（可選）</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="如有特殊需求或想說明的事項，請填寫於此..."
                  rows={3}
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
                {submitting ? '提交中...' : `送出登記${selectedService ? ` - ${selectedService.name} ${selectedService.price}` : ''}`}
              </button>
            </form>
          </div>

          {/* Notes */}
          <div className="bg-amber-950/40 border border-amber-800/30 rounded-2xl p-5 text-xs text-amber-300/80 space-y-1.5 mb-6">
            <p className="font-bold text-amber-300 text-sm mb-2">服務說明</p>
            <p>- 登記後由玉洞子親自聯繫確認，確認後告知付款方式</p>
            <p>- 銀會員以上訂閱用戶，每年享有 1 次免費祈福服務</p>
            <p>- 服務採預約制，通常於 3-7 個工作日內完成</p>
            <p>- 若有疑問，可透過 LINE 直接聯繫玉洞子</p>
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
