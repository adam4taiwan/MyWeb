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
        {/* Subscription nudge banner - logged in but not subscribed */}
        {isAuthenticated && isSubscribed === false && (
          <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white py-3 px-4">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <p className="font-bold text-sm">訂閱會員方案，解鎖完整服務</p>
                <p className="text-amber-200 text-xs mt-0.5">
                  每日個人化建議 + 命書折扣 + 祈福服務，年費方案 NT$1,200 起
                </p>
              </div>
              <Link href="/subscribe" className="flex-shrink-0">
                <button className="bg-white text-amber-800 px-5 py-2 rounded-lg font-bold text-sm hover:bg-amber-50 transition-colors whitespace-nowrap">
                  查看方案
                </button>
              </Link>
            </div>
          </div>
        )}

        <HeroSection />
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

