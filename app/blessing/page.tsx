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
    desc: '太歲當頭坐，無喜必有禍。安太歲可化解流年太歲沖犯，保佑一年平安順遂。',
    price: 'NT$1,200',
  },
  {
    code: 'BLESSING_LIGHT',
    name: '光明燈',
    desc: '點燃光明燈，照亮人生前程，增添智慧光芒，驅散陰霾晦氣，諸事光明順利。',
    price: 'NT$800',
  },
  {
    code: 'BLESSING_WEALTH',
    name: '補財庫',
    desc: '財庫破損、財運受阻時，透過補財庫儀式，修補財運缺口，迎財納福，豐盛充裕。',
    price: 'NT$1,500',
  },
  {
    code: 'BLESSING_PRAYER',
    name: '祈福服務',
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
        setResult({ ok: true, message: data.message });
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">祈福服務登記</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            玉洞子親自主持，為您消災解厄、迎福納祥。填寫以下表單，我們將於 1-2 個工作日內聯繫確認。
          </p>
        </div>

        {/* Service Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">選擇服務項目</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SERVICES.map(svc => (
              <button
                key={svc.code}
                type="button"
                onClick={() => setForm(f => ({ ...f, serviceCode: svc.code }))}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  form.serviceCode === svc.code
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 bg-white hover:border-amber-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-900 text-sm">{svc.name}</span>
                  <span className="text-amber-600 font-bold text-sm ml-2 flex-shrink-0">{svc.price}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{svc.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">填寫登記資料</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                姓名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="請填寫真實姓名（用於法事記錄）"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">出生日期</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={form.birthDate}
                  onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                  placeholder="例：1985/03/15"
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

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                聯絡方式 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
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
                className="w-full mt-2 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">備註（可選）</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="如有特殊需求或想說明的事項，請填寫於此..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-300 outline-none text-sm resize-none"
              />
            </div>

            {result && (
              <div className={`rounded-xl p-4 text-sm ${result.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {result.message}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? '提交中...' : `送出登記${selectedService ? ` - ${selectedService.name}` : ''}`}
              </button>
            </div>
          </form>
        </div>

        {/* Notes */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-sm text-amber-800 space-y-2">
          <p className="font-bold">服務說明</p>
          <ul className="space-y-1 text-amber-700">
            <li>- 登記後由玉洞子親自聯繫確認，確認後告知付款方式</li>
            <li>- 銀會員以上訂閱用戶，每年享有 1 次免費祈福服務</li>
            <li>- 服務採預約制，通常於 3-7 個工作日內完成</li>
            <li>- 若有疑問，可透過 LINE 直接聯繫玉洞子</li>
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
