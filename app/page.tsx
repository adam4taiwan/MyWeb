'use client';

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
  const { isAuthenticated } = useAuth();

  // If still authenticating, return null to let AuthProvider show loading UI
  if (typeof isAuthenticated === 'undefined') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Main content sections */}
      <main className="flex-grow">
        {/* Hero Section - Main entry point */}
        <HeroSection />

        {/* Features/Services Section */}
        <FeaturesSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Final CTA Section */}
        <FinalCTASection />
      </main>

      <Footer />
    </div>
  );
}

