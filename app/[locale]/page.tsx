'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import PricingSection from '@/components/PricingSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import FinalCTASection from '@/components/FinalCTASection';
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
        <HeroSection showSubscribeNudge={isAuthenticated && isSubscribed === false} />
        <FeaturesSection />
        <FAQSection />
        <TestimonialsSection />
        <PricingSection />
        <FinalCTASection />
      </main>

      <Footer />
    </div>
  );
}

