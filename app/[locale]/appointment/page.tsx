'use client';

import { useState } from 'react';
import { Link } from '@/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Appointment');
  const { token } = useAuth();
  const TOPICS = t.raw('topics') as string[];
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
    if (!form.topic) { alert(t('alertSelectTopic')); return; }
    if (!form.name.trim()) { alert(t('alertFillName')); return; }
    if (!form.contactInfo.trim()) { alert(t('alertFillContact')); return; }

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
        setResult({ ok: true, message: data.message || t('successDefault') });
        setForm({ name: '', birthDate: '', isLunar: false, topic: '', contactType: 'line', contactInfo: '', preferredDate: '', notes: '' });
      } else {
        setResult({ ok: false, message: data.message || t('errorDefault') });
      }
    } catch {
      setResult({ ok: false, message: t('errorNetwork') });
    } finally {
      setSubmitting(false);
    }
  };

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

          {/* ===== LEFT PANEL: Title + Flow + Notes ===== */}
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
                  {t('pageDesc2')}
                </p>
              </div>

              {/* Flow steps */}
              <div className="bg-black/30 border border-amber-800/30 rounded-xl p-4">
                <p className="text-amber-400 text-xs font-bold mb-3">{t('flowTitle')}</p>
                <div className="space-y-3">
                  {[
                    { step: '1', label: t('flowStep1Label'), desc: t('flowStep1Desc') },
                    { step: '2', label: t('flowStep2Label'), desc: t('flowStep2Desc') },
                    { step: '3', label: t('flowStep3Label'), desc: t('flowStep3Desc') },
                  ].map(item => (
                    <div key={item.step} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-amber-900/60 border border-amber-600/50 text-amber-300 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-200">{item.label}</p>
                        <p className="text-xs text-amber-400/60">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-amber-950/40 border border-amber-800/30 rounded-xl p-4 text-xs text-amber-300/70 space-y-1">
                <p className="font-bold text-amber-300 mb-1.5">{t('notesTitle')}</p>
                <p>- {t('note1')}</p>
                <p>- {t('note2')}</p>
                <p>- {t('note3')}</p>
                <p>- {t('note4')}</p>
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

          {/* ===== RIGHT PANEL: Appointment Form ===== */}
          <div className={`w-72 xl:w-80 ${panelCls} border-l flex-shrink-0 flex flex-col`}>
            <div className="overflow-y-auto flex-1 p-5">
              <p className="text-amber-400 text-xs font-bold mb-4 tracking-wide pt-4">{t('formTitle')}</p>
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Topic */}
                <div>
                  <label className="block text-xs font-medium text-amber-300/80 mb-1.5">
                    {t('labelTopic')} <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TOPICS.map(topic => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, topic }))}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          form.topic === topic
                            ? 'bg-amber-700 text-amber-100 border-amber-600'
                            : 'bg-black/30 text-amber-400 border-amber-700/40 hover:border-amber-500'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
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

                {/* Birth date */}
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

                {/* Contact */}
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

                {/* Preferred date */}
                <div>
                  <label className="block text-xs font-medium text-amber-300/80 mb-1.5">{t('labelPreferredDate')}</label>
                  <input
                    type="text"
                    value={form.preferredDate}
                    onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))}
                    placeholder={t('placeholderPreferredDate')}
                    className="w-full px-3 py-2 bg-black/40 border border-amber-700/40 rounded-lg focus:ring-2 focus:ring-amber-500/50 outline-none text-sm text-amber-100 placeholder:text-amber-800"
                  />
                </div>

                {/* Notes */}
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
                  {submitting ? t('submittingBtn') : t('submitBtn')}
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
