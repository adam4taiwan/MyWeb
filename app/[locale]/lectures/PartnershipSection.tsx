'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface PartnershipItem {
  type: string;
  title: string;
  description: string;
  features: string[];
  image: string;
}

export default function PartnershipSection() {
  const t = useTranslations('Lectures');
  const partnerships = t.raw('partnerships') as PartnershipItem[];

  const [showContactModal, setShowContactModal] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    industry: '',
    cooperationType: '',
    expectedBudget: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('partnerSubmitSuccess'));
    setShowContactModal(false);
    setFormData({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      industry: '',
      cooperationType: '',
      expectedBudget: '',
      description: ''
    });
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('partnershipTitle')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('partnershipDesc')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {partnerships.map((partnership, index) => (
            <div key={index} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-48 overflow-hidden">
                <Image
                  src={`https://readdy.ai/api/search-image?query=${partnership.image}&width=600&height=300&seq=partnership-${index}&orientation=landscape`}
                  alt={partnership.title}
                  width={600}
                  height={300}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="inline-block bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  {partnership.type}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{partnership.title}</h3>
                <p className="text-gray-600 mb-4">{partnership.description}</p>
                <div className="space-y-2 mb-6">
                  {partnership.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center space-x-2 text-sm text-gray-700">
                      <div className="w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-xs"></i>
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full bg-amber-600 text-white py-3 rounded-full hover:bg-amber-700 transition-colors font-semibold whitespace-nowrap cursor-pointer"
                >
                  {t('applyPartnershipBtn')}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">{t('newOpportunityTitle')}</h3>
            <p className="text-lg mb-6 opacity-90">
              {t('newOpportunityDesc')}
            </p>
            <button
              onClick={() => setShowContactModal(true)}
              className="bg-white text-amber-600 px-8 py-3 rounded-full hover:bg-gray-100 transition-colors font-semibold whitespace-nowrap cursor-pointer"
            >
              {t('contactNowBtn')}
            </button>
          </div>
        </div>
      </div>

      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{t('partnerModalTitle')}</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <i className="ri-close-line text-gray-600"></i>
                </button>
              </div>

              <form id="partnership-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelCompanyName')} *</label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder={t('placeholderCompanyName')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelContactPerson')} *</label>
                    <input
                      type="text"
                      name="contactPerson"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder={t('placeholderContactPerson')}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelPhone')} *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder={t('placeholderPhone')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelEmail')} *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder={t('placeholderEmail')}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelIndustry')} *</label>
                    <select
                      name="industry"
                      required
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">{t('industrySelect')}</option>
                      <option value="restaurant">{t('industryRestaurant')}</option>
                      <option value="hotel">{t('industryHotel')}</option>
                      <option value="education">{t('industryEducation')}</option>
                      <option value="corporate">{t('industryCorporate')}</option>
                      <option value="retail">{t('industryRetail')}</option>
                      <option value="other">{t('industryOther')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelCoopType')} *</label>
                    <select
                      name="cooperationType"
                      required
                      value={formData.cooperationType}
                      onChange={(e) => setFormData({...formData, cooperationType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                    >
                      <option value="">{t('coopTypeSelect')}</option>
                      <option value="lecture">{t('coopTypeLecture')}</option>
                      <option value="consultation">{t('coopTypeConsultation')}</option>
                      <option value="training">{t('coopTypeTraining')}</option>
                      <option value="event">{t('coopTypeEvent')}</option>
                      <option value="longterm">{t('coopTypeLongterm')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelBudget')}</label>
                  <select
                    name="expectedBudget"
                    value={formData.expectedBudget}
                    onChange={(e) => setFormData({...formData, expectedBudget: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm pr-8"
                  >
                    <option value="">{t('budgetSelect')}</option>
                    <option value="below-50k">{t('budgetBelow50k')}</option>
                    <option value="50k-100k">{t('budget50k100k')}</option>
                    <option value="100k-200k">{t('budget100k200k')}</option>
                    <option value="200k-500k">{t('budget200k500k')}</option>
                    <option value="above-500k">{t('budgetAbove500k')}</option>
                    <option value="discuss">{t('budgetDiscuss')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelDescription')} *</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                    placeholder={t('placeholderDescription')}
                  ></textarea>
                  <div className="text-xs text-gray-500 mt-1">
                    {t('charCount', { count: formData.description.length })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 text-white py-3 rounded-xl hover:bg-amber-700 transition-colors font-semibold whitespace-nowrap cursor-pointer"
                >
                  {t('submitPartnershipBtn')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
