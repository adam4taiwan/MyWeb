'use client';

import { Link } from '@/navigation';
import { useAuth } from '@/components/AuthContext';
import { useTranslations } from 'next-intl';

export default function FinalCTASection() {
  const { isAuthenticated } = useAuth();
  const t = useTranslations('FinalCTA');

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-brand"
        style={{
          backgroundImage: `linear-gradient(135deg, #3d2d1a 0%, #1a1a1a 100%)`,
        }}
      ></div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-brand-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-8">
        {/* Main message */}
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
          {t('headline')}
        </h2>

        <p className="text-xl text-brand-100 max-w-2xl mx-auto leading-relaxed">
          {t('body')}
        </p>

        {/* Trust signals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 px-4 bg-white/5 rounded-brand backdrop-blur-sm">
          <div>
            <p className="text-2xl font-bold text-brand-300">✓</p>
            <p className="text-sm text-brand-100 mt-2">{t('trust1')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-300">✓</p>
            <p className="text-sm text-brand-100 mt-2">{t('trust2')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-300">✓</p>
            <p className="text-sm text-brand-100 mt-2">{t('trust3')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-300">✓</p>
            <p className="text-sm text-brand-100 mt-2">{t('trust4')}</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          {isAuthenticated ? (
            <Link href="/disk" className="inline-block">
              <button className="px-10 py-4 bg-brand-300 text-brand-900 font-bold rounded-lg hover:bg-brand-400 transition-colors transform hover:scale-105 shadow-lg">
                {t('ctaAuthenticated')}
              </button>
            </Link>
          ) : (
            <Link href="/login" className="inline-block">
              <button className="px-10 py-4 bg-brand-300 text-brand-900 font-bold rounded-lg hover:bg-brand-400 transition-colors transform hover:scale-105 shadow-lg">
                {t('ctaGuest')}
              </button>
            </Link>
          )}

          <Link href="/heritage" className="inline-block">
            <button className="px-10 py-4 border-2 border-brand-300 text-brand-300 font-bold rounded-lg hover:bg-brand-300/10 transition-colors">
              {t('ctaHeritage')}
            </button>
          </Link>
        </div>

        {/* Bottom text */}
        <p className="text-sm text-brand-200 pt-4">
          {t('bottomText')}<br />
          {t('bottomText2')}
        </p>
      </div>
    </section>
  );
}
