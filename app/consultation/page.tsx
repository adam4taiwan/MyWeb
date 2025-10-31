
'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ConsultationHero from './ConsultationHero';
import ServiceOptions from './ServiceOptions';
import ContactMethods from './ContactMethods';
import VideoCallModal from './VideoCallModal';
import MessageModal from './MessageModal';
import EmailModal from './EmailModal';

export default function ConsultationPage() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const handleServiceSelect = (service: string, type: string) => {
    setSelectedService(service);
    if (type === 'video') {
      setIsVideoModalOpen(true);
    } else if (type === 'message') {
      setIsMessageModalOpen(true);
    } else if (type === 'email') {
      setIsEmailModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <ConsultationHero />
      
      <ServiceOptions onServiceSelect={handleServiceSelect} />
      
      <ContactMethods />
      
      <Footer />

      <VideoCallModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)}
        service={selectedService}
      />
      
      <MessageModal 
        isOpen={isMessageModalOpen} 
        onClose={() => setIsMessageModalOpen(false)}
        service={selectedService}
      />
      
      <EmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)}
        service={selectedService}
      />
    </div>
  );
}
