import LectureHero from './LectureHero';
import ServiceTypes from './ServiceTypes';
import PartnershipSection from './PartnershipSection';
import BookingSection from './BookingSection';
import ThemeEvents from './ThemeEvents';

export default function LecturesPage() {
  return (
    <main className="min-h-screen">
      <LectureHero />
      <ServiceTypes />
      <PartnershipSection />
      <ThemeEvents />
      <BookingSection />
    </main>
  );
}