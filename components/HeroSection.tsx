'use client';

import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function HeroSection({ showSubscribeNudge = false }: { showSubscribeNudge?: boolean }) {
  const { isAuthenticated } = useAuth();

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
            即刻知命，<br className="hidden md:block" />一生受用
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-brand-100 drop-shadow-md max-w-3xl mx-auto leading-relaxed font-light">
            30 年命理師的八字和紫微斗數分析。已為 5000+ 用戶提供人生指引。
          </p>
        </div>

        {/* Trust metrics row */}
        <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-2xl mx-auto py-6 border-t border-b border-brand-600/30">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-brand-300">5000+</p>
            <p className="text-sm text-brand-100 mt-2">活躍用戶</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-brand-300">95%</p>
            <p className="text-sm text-brand-100 mt-2">滿意度</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-brand-300">30年</p>
            <p className="text-sm text-brand-100 mt-2">專業經驗</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          {isAuthenticated ? (
            <Link href="/disk" className="inline-block">
              <button className="btn-primary w-full sm:w-auto">
                開始排盤分析
              </button>
            </Link>
          ) : (
            <Link href="/login" className="inline-block">
              <button className="btn-primary w-full sm:w-auto">
                立即加入會員
              </button>
            </Link>
          )}

          <Link href="#features" className="inline-block">
            <button className="btn-secondary w-full sm:w-auto">
              瞭解更多
            </button>
          </Link>

          <Link href="/subscribe" className="inline-block">
            <button className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-sm border border-amber-400 text-amber-300 hover:bg-amber-400/10 transition-colors">
              訂閱會員方案
            </button>
          </Link>
        </div>

        {/* Additional trust signal at bottom */}
        <div className="text-sm text-brand-200 pt-8 space-y-2">
          <p>✓ 訂閱會員即可查看每日個人化運勢</p>
          <p>✓ 下單前請確認了解服務內容</p>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
    </section>
  );
}
