'use client';

import { useState } from 'react';
import { Link } from '@/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import { useTranslations } from 'next-intl';

interface ServiceItem {
  code: string;
  name: string;
  icon: string;
  desc: string;
  price: string;
}

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
  const t = useTranslations('Blessing');
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

  const SERVICES = t.raw('services') as ServiceItem[];

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ecanapi.fly.dev/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceCode) { alert(t('alertSelectService')); return; }
    if (!form.name.trim()) { alert(t('alertFillName')); return; }
    if (!form.contactInfo.trim()) { alert(t('alertFillContact')); return; }

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
        setResult({ ok: true, message: data.message || t('successDefault') });
        setForm({ serviceCode: '', name: '', birthDate: '', isLunar: false, contactType: 'line', contactInfo: '', notes: '' });
      } else {
        setResult({ ok: false, message: data.message || t('errorDefault') });
      }
    } catch {
      setResult({ ok: false, message: t('errorNetwork') });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = SERVICES.find(s => s.code === form.serviceCode);

  const panelCls = "bg-black/65 backdrop-blur-sm border-amber-800/40";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed background - show full portrait without cropping */}
      <div className="fixed inset-0 bg-stone-950" />
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: "url('/images/blessing-bg.png')",
          backgroundSize: 'auto 100vh',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="fixed inset-0 bg-black/30" />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/* Two-side layout: left panel | deity center | right panel */}
        <div className="flex-1 flex overflow-hidden">

          {/* ===== LEFT PANEL: Title + Service Selection ===== */}
          <div className={`w-72 xl:w-80 ${panelCls} border-r flex-shrink-0 flex flex-col`}>
            <div className="overflow-y-auto flex-1 p-5 space-y-5">

              {/* Title */}
              <div className="text-center pt-4">
                <div className="inline-block mb-2 px-3 py-0.5 border border-amber-600/50 rounded-full text-amber-400 text-xs tracking-widest">
                  {t('brand')}
                </div>
                <h1
                  className="text-2xl font-bold text-amber-200 mb-2 tracking-wide leading-snug"
                  style={{ textShadow: '0 2px 12px rgba(180,120,0,0.7)' }}
                >
                  {t('pageTitle')}
                </h1>
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-2" />
                <p className="text-amber-100/60 text-xs leading-relaxed">
                  {t('pageDesc')}<br />
                  {t('pageDesc2')}<br />
                  {t('pageDesc3')}
                </p>
              </div>

              {/* Service Selection */}
              <div>
                <p className="text-amber-400 text-xs font-bold mb-3 tracking-wide">{t('selectService')}</p>
                <div className="space-y-2">
                  {SERVICES.map(svc => (
                    <button
                      key={svc.code}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, serviceCode: svc.code }))}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        form.serviceCode === svc.code
                          ? 'border-amber-500 bg-amber-900/40'
                          : 'border-amber-800/30 bg-black/20 hover:border-amber-600/60 hover:bg-amber-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-amber-200 text-xs flex items-center gap-1.5">
                          <span className="text-amber-500">{svc.icon}</span>
                          {svc.name}
                        </span>
                        <span className="text-amber-400 text-xs font-bold flex-shrink-0 ml-1">{svc.price}</span>
                      </div>
                      <p className="text-amber-100/55 text-xs leading-relaxed">{svc.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-amber-950/40 border border-amber-800/30 rounded-xl p-4 text-xs text-amber-300/70 space-y-1">
                <p className="font-bold text-amber-300 mb-1.5">{t('serviceNotes')}</p>
                <p>- {t('notePayment')}</p>
                <p>- {t('noteSilverFree')}</p>
                <p>- {t('noteComplete')}</p>
                <p>- {t('noteContact')}</p>
              </div>

              <div className="text-center pb-4">
                <Link href="/member" className="text-xs text-amber-700 hover:text-amber-400 transition-colors">
                  {t('backToMember')}
                </Link>
              </div>
            </div>
          </div>

          {/* ===== CENTER: empty — shows deity image ===== */}
          <div className="flex-1" />

          {/* ===== RIGHT PANEL: Registration Form ===== */}
          <div className={`w-72 xl:w-80 ${panelCls} border-l flex-shrink-0 flex flex-col`}>
            <div className="overflow-y-auto flex-1 p-5">
              <p className="text-amber-400 text-xs font-bold mb-4 tracking-wide pt-4">{t('formTitle')}</p>
              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="block text-xs font-medium text-amber-300/80 mb-1.5">
                    {t('labelName')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={t('placeholderName')}
                    required
                    className="w-full px-3 py-2 bg-black/40 border border-amber-700/40 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none text-sm text-amber-100 placeholder:text-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-amber-300/80 mb-1.5">{t('labelBirthDate')}</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={form.birthDate}
                      onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                      placeholder={t('placeholderBirthDate')}
                      className="flex-1 px-3 py-2 bg-black/40 border border-amber-700/40 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none text-sm text-amber-100 placeholder:text-amber-800"
                    />
                    <label className="flex items-center gap-1 text-xs text-amber-300/80 flex-shrink-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isLunar}
                        onChange={e => setForm(f => ({ ...f, isLunar: e.target.checked }))}
                        className="accent-amber-500"
                      />
                      {t('labelLunar')}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-amber-300/80 mb-1.5">
                    {t('labelContact')} <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-1.5 mb-2">
                    {([['line', t('contactLine')], ['wechat', t('contactWechat')], ['phone', t('contactPhone')]] as const).map(([type, label]) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, contactType: type }))}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
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
                    placeholder={form.contactType === 'phone' ? t('placeholderPhone') : `${form.contactType === 'line' ? t('contactLine') : t('contactWechat')} ID`}
                    required
                    className="w-full px-3 py-2 bg-black/40 border border-amber-700/40 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none text-sm text-amber-100 placeholder:text-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-amber-300/80 mb-1.5">{t('labelNotes')}</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder={t('placeholderNotes')}
                    rows={3}
                    className="w-full px-3 py-2 bg-black/40 border border-amber-700/40 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none text-sm text-amber-100 placeholder:text-amber-800 resize-none"
                  />
                </div>

                {result && (
                  <div className={`rounded-xl p-3 text-xs border ${
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
                  className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-600 text-amber-100 rounded-xl font-bold hover:from-amber-600 hover:to-amber-500 disabled:opacity-50 transition-all text-xs tracking-wide shadow-lg shadow-amber-900/40"
                >
                  {submitting ? t('submittingBtn') : (selectedService ? t('submitWithService', { name: selectedService.name }) : t('submitBtn'))}
                </button>
              </form>
            </div>
          </div>

        </div>

        <Footer />
      </div>
    </div>
  );
}
