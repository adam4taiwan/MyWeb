'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import PricingSection from '../components/PricingSection';
import TestimonialsSection from '../components/TestimonialsSection';
import FAQSection from '../components/FAQSection';
import FinalCTASection from '../components/FinalCTASection';
import { useAuth } from '@/components/AuthContext';

export default function Home() {
  const { isAuthenticated, token } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ecanapi.fly.dev/api';

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/Subscription/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => setIsSubscribed(data?.isSubscribed ?? false))
      .catch(() => setIsSubscribed(false));
  }, [token, API_URL]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="relative">
          <HeroSection />
          {/* Subscription nudge - overlaid on hero bottom-right, no layout impact */}
          {isAuthenticated && isSubscribed === false && (
            <div className="absolute bottom-8 right-6 z-10">
              <Link href="/subscribe">
                <div className="bg-amber-800/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-lg hover:bg-amber-700 transition-colors cursor-pointer max-w-[220px]">
                  <p className="text-xs text-amber-200 mb-0.5">會員專屬福利</p>
                  <p className="text-sm font-bold leading-snug">訂閱解鎖每日建議 + 命書折扣</p>
                  <p className="text-xs text-amber-300 mt-1">年費 NT$1,200 起 &rarr;</p>
                </div>
              </Link>
            </div>
          )}
        </div>
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
      </main>

      <Footer />
    </div>
  );
}

