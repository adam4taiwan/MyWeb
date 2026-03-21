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
          <div className="bg-amber-800 text-white py-2 px-4 text-center text-sm">
            <span className="opacity-90">每日建議 + 命書折扣 + 祈福服務，年費 NT$1,200 起</span>
            <Link href="/subscribe">
              <span className="ml-3 underline font-bold hover:text-amber-200 transition-colors cursor-pointer">
                訂閱方案
              </span>
            </Link>
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

