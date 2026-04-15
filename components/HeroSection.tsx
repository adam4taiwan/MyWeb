'use client';

import { useAuth } from '@/components/AuthContext';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function HeroSection({ showSubscribeNudge: _showSubscribeNudge = false }: { showSubscribeNudge?: boolean }) {
  const { isAuthenticated } = useAuth();
  const t = useTranslations('Hero');

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(61, 45, 26, 0.85) 0%, rgba(26, 26, 26, 0.9) 100%), url('/image/hero-main.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Decorative elements for visual interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-brand-300/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-32 text-center space-y-8">
        {/* Main headline */}
        <div className="space-y-4">
          <h1 className="hero-title drop-shadow-lg">
            {t('headline')}
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-brand-100 drop-shadow-md max-w-3xl mx-auto leading-relaxed font-light">
            {t('subheading')}
          </p>
        </div>

        {/* Trust metrics row - temporarily hidden */}
        {/* <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-2xl mx-auto py-6 border-t border-b border-brand-600/30">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-brand-300">{t('stat1Value')}</p>
            <p className="text-sm text-brand-100 mt-2">{t('stat1Label')}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-brand-300">{t('stat2Value')}</p>
            <p className="text-sm text-brand-100 mt-2">{t('stat2Label')}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-brand-300">{t('stat3Value')}</p>
            <p className="text-sm text-brand-100 mt-2">{t('stat3Label')}</p>
          </div>
        </div> */}

        {/* CTA Buttons - temporarily hidden */}
        {/* <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/disk" className="inline-block">
            <button className="btn-primary w-full sm:w-auto">
              {isAuthenticated ? t('ctaAuthenticated') : t('ctaGuest')}
            </button>
          </Link>

          <Link href="#features" className="inline-block">
            <button className="btn-secondary w-full sm:w-auto">
              {t('ctaLearnMore')}
            </button>
          </Link>

          <Link href="/subscribe" className="inline-block">
            <button className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-sm border border-amber-400 text-amber-300 hover:bg-amber-400/10 transition-colors">
              {t('ctaSubscribe')}
            </button>
          </Link>
        </div> */}

        {/* Additional trust signal at bottom */}
        <div className="text-sm text-brand-200 pt-8 space-y-2">
          <p>{t('trustSignal1')}</p>
          <p>{t('trustSignal2')}</p>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
    </section>
  );
}
