'use client';

import { Link } from '@/navigation';

export default function DivinationBanner() {
  return (
    <section
      className="relative py-16 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0d0800 0%, #1a0d00 50%, #0d0800 100%)',
      }}
    >
      {/* Atmospheric glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(160,80,0,0.2) 0%, transparent 70%)',
        }}
      />

      {/* Decorative side pillars */}
      <div className="absolute left-0 top-0 bottom-0 w-px opacity-20"
        style={{ background: 'linear-gradient(to bottom, transparent, #c8a44a, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-px opacity-20"
        style={{ background: 'linear-gradient(to bottom, transparent, #c8a44a, transparent)' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
        {/* Top ornament */}
        <div className="text-amber-700/40 text-sm tracking-[0.5em] mb-3">
          ◈───────────◈
        </div>

        {/* Feature name */}
        <div className="text-amber-600/50 text-xs tracking-[0.4em] mb-3 uppercase">
          先天占卜
        </div>

        {/* Title */}
        <h2
          className="text-4xl md:text-5xl font-bold mb-2 leading-tight"
          style={{
            color: '#f0d080',
            textShadow: '0 0 40px rgba(200,164,74,0.5), 0 0 80px rgba(200,164,74,0.15)',
            letterSpacing: '0.2em',
          }}
        >
          祖師顯靈
        </h2>
        <h3
          className="text-2xl md:text-3xl font-bold mb-6"
          style={{
            color: '#c8a44a',
            letterSpacing: '0.25em',
          }}
        >
          有求必應
        </h3>

        {/* Description */}
        <p
          className="text-sm leading-loose mb-8 max-w-xs mx-auto"
          style={{ color: 'rgba(200,164,74,0.5)' }}
        >
          以卦問事，自古靈驗<br />
          三步定卦，天機自現
        </p>

        {/* Bottom ornament */}
        <div className="text-amber-700/40 text-sm tracking-[0.5em] mb-8">
          ◈───────────◈
        </div>

        {/* CTA */}
        <Link href="/divination">
          <button
            className="px-10 py-4 rounded font-bold text-[#0d0800] text-base tracking-widest transition-all hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #c8a44a 0%, #f0d080 50%, #c8a44a 100%)',
              boxShadow: '0 0 30px rgba(200,164,74,0.4), 0 4px 20px rgba(0,0,0,0.5)',
              letterSpacing: '0.25em',
            }}
          >
            誠心占卜
          </button>
        </Link>

        {/* Hint */}
        <p className="mt-4 text-amber-800/40 text-xs tracking-wider">
          會員免費 · 先天占卜
        </p>
      </div>
    </section>
  );
}
