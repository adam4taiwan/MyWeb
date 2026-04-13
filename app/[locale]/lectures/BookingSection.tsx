'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function BookingSection() {
  const t = useTranslations('Lectures');

  const [activeTab, setActiveTab] = useState('appointment');
  const [appointmentData, setAppointmentData] = useState({
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    duration: '',
    participants: '',
    location: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    companyName: '',
    requirements: ''
  });

  const [homeServiceData, setHomeServiceData] = useState({
    serviceType: '',
    address: '',
    preferredDate: '',
    preferredTime: '',
    participants: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    requirements: ''
  });

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('appointmentSuccess'));
    setAppointmentData({
      serviceType: '',
      preferredDate: '',
      preferredTime: '',
      duration: '',
      participants: '',
      location: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      companyName: '',
      requirements: ''
    });
  };

  const handleHomeServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('homeServiceSuccess'));
    setHomeServiceData({
      serviceType: '',
      address: '',
      preferredDate: '',
      preferredTime: '',
      participants: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      requirements: ''
    });
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('bookingTitle')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('bookingDesc')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-1 shadow-lg">
              <button
                onClick={() => setActiveTab('appointment')}
                className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'appointment'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-gray-700 hover:text-amber-600'
                }`}
              >
                {t('tabAppointment')}
              </button>
              <button
                onClick={() => setActiveTab('homeService')}
                className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'homeService'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-gray-700 hover:text-amber-600'
                }`}
              >
                {t('tabHomeService')}
              </button>
            </div>
          </div>

          {activeTab === 'appointment' && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('appointmentFormTitle')}</h3>
              <form id="lecture-appointment" onSubmit={handleAppointmentSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelServiceType')}</label>
                    <select
                      name="serviceType"
                      required
                      value={appointmentData.serviceType}
                      onChange={(e) => setAppointmentData({...appointmentData, serviceType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">{t('serviceTypeSelect')}</option>
                      <option value="enterprise">{t('serviceEnterprise')}</option>
                      <option value="restaurant">{t('serviceRestaurant')}</option>
                      <option value="hotel">{t('serviceHotel')}</option>
                      <option value="academy">{t('serviceAcademy')}</option>
                      <option value="theme">{t('serviceTheme')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelParticipants')}</label>
                    <select
                      name="participants"
                      required
                      value={appointmentData.participants}
                      onChange={(e) => setAppointmentData({...appointmentData, participants: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">{t('participantsSelect')}</option>
                      <option value="10-20">{t('participants1020')}</option>
                      <option value="21-50">{t('participants2150')}</option>
                      <option value="51-100">{t('participants51100')}</option>
                      <option value="100+">{t('participants100plus')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelPreferredDate')}</label>
                    <input
                      type="date"
                      name="preferredDate"
                      required
                      value={appointmentData.preferredDate}
                      onChange={(e) => setAppointmentData({...appointmentData, preferredDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelPreferredTime')}</label>
                    <select
                      name="preferredTime"
                      required
                      value={appointmentData.preferredTime}
                      onChange={(e) => setAppointmentData({...appointmentData, preferredTime: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">{t('timeSelect')}</option>
                      <option value="morning">{t('timeMorning')}</option>
                      <option value="afternoon">{t('timeAfternoon')}</option>
                      <option value="evening">{t('timeEvening')}</option>
                      <option value="discuss">{t('timeDiscuss')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelDuration')}</label>
                    <select
                      name="duration"
                      required
                      value={appointmentData.duration}
                      onChange={(e) => setAppointmentData({...appointmentData, duration: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">{t('durationSelect')}</option>
                      <option value="1-1.5">{t('duration1h')}</option>
                      <option value="1.5-2">{t('duration15h')}</option>
                      <option value="2-3">{t('duration2h')}</option>
                      <option value="half-day">{t('durationHalfDay')}</option>
                      <option value="full-day">{t('durationFullDay')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelLocation')}</label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={appointmentData.location}
                    onChange={(e) => setAppointmentData({...appointmentData, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    placeholder={t('placeholderLocation')}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelCompany')}</label>
                    <input
                      type="text"
                      name="companyName"
                      value={appointmentData.companyName}
                      onChange={(e) => setAppointmentData({...appointmentData, companyName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder={t('placeholderCompany')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelContactName')}</label>
                    <input
                      type="text"
                      name="contactName"
                      required
                      value={appointmentData.contactName}
                      onChange={(e) => setAppointmentData({...appointmentData, contactName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder={t('placeholderContactName')}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelContactPhone')}</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      required
                      value={appointmentData.contactPhone}
                      onChange={(e) => setAppointmentData({...appointmentData, contactPhone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder={t('placeholderContactPhone')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelContactEmail')}</label>
                    <input
                      type="email"
                      name="contactEmail"
                      required
                      value={appointmentData.contactEmail}
                      onChange={(e) => setAppointmentData({...appointmentData, contactEmail: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder={t('placeholderContactEmail')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelRequirements')}</label>
                  <textarea
                    name="requirements"
                    rows={4}
                    maxLength={500}
                    value={appointmentData.requirements}
                    onChange={(e) => setAppointmentData({...appointmentData, requirements: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                    placeholder={t('placeholderRequirements')}
                  ></textarea>
                  <div className="text-xs text-gray-500 mt-1">
                    {t('charCount', { count: appointmentData.requirements.length })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 text-white py-4 rounded-xl hover:bg-amber-700 transition-colors font-semibold text-lg whitespace-nowrap cursor-pointer"
                >
                  {t('submitAppointmentBtn')}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'homeService' && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('homeServiceFormTitle')}</h3>
              <form id="home-service" onSubmit={handleHomeServiceSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelServiceType')}</label>
                    <select
                      name="serviceType"
                      required
                      value={homeServiceData.serviceType}
                      onChange={(e) => setHomeServiceData({...homeServiceData, serviceType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">{t('homeServiceTypeSelect')}</option>
                      <option value="feng-shui">{t('homeFengShui')}</option>
                      <option value="family-analysis">{t('homeFamilyAnalysis')}</option>
                      <option value="private-consultation">{t('homePrivateConsult')}</option>
                      <option value="group-lecture">{t('homeGroupLecture')}</option>
                      <option value="business-consultation">{t('homeBusinessConsult')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelHomeParticipants')}</label>
                    <select
                      name="participants"
                      required
                      value={homeServiceData.participants}
                      onChange={(e) => setHomeServiceData({...homeServiceData, participants: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">{t('homeParticipantsSelect')}</option>
                      <option value="1">{t('home1person')}</option>
                      <option value="2-3">{t('home23people')}</option>
                      <option value="4-6">{t('home46people')}</option>
                      <option value="7-10">{t('home710people')}</option>
                      <option value="10+">{t('home10plus')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelAddress')}</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={homeServiceData.address}
                    onChange={(e) => setHomeServiceData({...homeServiceData, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    placeholder={t('placeholderAddress')}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelPreferredDate')}</label>
                    <input
                      type="date"
                      name="preferredDate"
                      required
                      value={homeServiceData.preferredDate}
                      onChange={(e) => setHomeServiceData({...homeServiceData, preferredDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelPreferredTime')}</label>
                    <select
                      name="preferredTime"
                      required
                      value={homeServiceData.preferredTime}
                      onChange={(e) => setHomeServiceData({...homeServiceData, preferredTime: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">{t('timeSelect')}</option>
                      <option value="morning">{t('timeMorning')}</option>
                      <option value="afternoon">{t('timeAfternoon')}</option>
                      <option value="evening">{t('timeEvening')}</option>
                      <option value="weekend">{t('timeWeekend')}</option>
                      <option value="discuss">{t('timeDiscuss')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelContactName')}</label>
                    <input
                      type="text"
                      name="contactName"
                      required
                      value={homeServiceData.contactName}
                      onChange={(e) => setHomeServiceData({...homeServiceData, contactName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder={t('placeholderContactName')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelContactPhone')}</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      required
                      value={homeServiceData.contactPhone}
                      onChange={(e) => setHomeServiceData({...homeServiceData, contactPhone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder={t('placeholderContactPhone')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelContactEmail')}</label>
                  <input
                    type="email"
                    name="contactEmail"
                    required
                    value={homeServiceData.contactEmail}
                    onChange={(e) => setHomeServiceData({...homeServiceData, contactEmail: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    placeholder={t('placeholderContactEmail')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelRequirements')}</label>
                  <textarea
                    name="requirements"
                    rows={4}
                    maxLength={500}
                    value={homeServiceData.requirements}
                    onChange={(e) => setHomeServiceData({...homeServiceData, requirements: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                    placeholder={t('placeholderHomeRequirements')}
                  ></textarea>
                  <div className="text-xs text-gray-500 mt-1">
                    {t('charCount', { count: homeServiceData.requirements.length })}
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                    <i className="ri-information-line mr-2"></i>
                    {t('homeServiceInfo')}
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• {t('homeServiceNote1')}</li>
                    <li>• {t('homeServiceNote2')}</li>
                    <li>• {t('homeServiceNote3')}</li>
                    <li>• {t('homeServiceNote4')}</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 text-white py-4 rounded-xl hover:bg-amber-700 transition-colors font-semibold text-lg whitespace-nowrap cursor-pointer"
                >
                  {t('submitHomeServiceBtn')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
