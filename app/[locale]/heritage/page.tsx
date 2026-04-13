'use client';

import { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslations } from 'next-intl';

export default function Heritage() {
  const t = useTranslations('Heritage');
  const [activeTab, setActiveTab] = useState('life');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  const handleRegistration = (courseType: string) => {
    setSelectedCourse(courseType);
    setShowRegistrationForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;

    if (!name || !phone || !email) {
      alert(t('alertFillRequired'));
      return;
    }

    alert(t('alertSubmitSuccess'));
    setShowRegistrationForm(false);
    form.reset();
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const name = formData.get('contact_name') as string;
    const message = formData.get('message') as string;

    if (!name || !message) {
      alert(t('alertFillNameMessage'));
      return;
    }

    if (message.length > 500) {
      alert(t('alertMessageTooLong'));
      return;
    }

    alert(t('alertContactSent'));
    setShowContactForm(false);
    form.reset();
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section
        className="relative py-20 md:py-32 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://readdy.ai/api/search-image?query=traditional%20chinese%20academy%20classroom%20with%20students%20learning%20ancient%20wisdom%20books%20calligraphy%20scrolls%20warm%20golden%20lighting%20peaceful%20study%20atmosphere%20wooden%20furniture%20bamboo%20elements%20scholarly%20environment&width=1920&height=800&seq=heritage-hero&orientation=landscape')`
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('heroTitle')}</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            {t('heroDesc')}
          </p>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-16 bg-gradient-to-b from-white to-amber-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('sectionTitle')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('sectionDesc')}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center mb-12 bg-white rounded-full p-2 shadow-lg max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('life')}
              className={`px-6 py-3 rounded-full transition-all duration-300 whitespace-nowrap cursor-pointer ${
                activeTab === 'life'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-amber-600'
              }`}
            >
              {t('tabLife')}
            </button>
            <button
              onClick={() => setActiveTab('professional')}
              className={`px-6 py-3 rounded-full transition-all duration-300 whitespace-nowrap cursor-pointer ${
                activeTab === 'professional'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-amber-600'
              }`}
            >
              {t('tabProfessional')}
            </button>
          </div>

          {/* Life Application Course */}
          {activeTab === 'life' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-6">{t('lifeCourseTitle')}</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {t('lifeCourseDesc')}
                </p>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-user-line text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">{t('lifeFeature1Title')}</h4>
                      <p className="text-gray-600">{t('lifeFeature1Desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-calendar-line text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">{t('lifeFeature2Title')}</h4>
                      <p className="text-gray-600">{t('lifeFeature2Desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-home-line text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">{t('lifeFeature3Title')}</h4>
                      <p className="text-gray-600">{t('lifeFeature3Desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-heart-line text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">{t('lifeFeature4Title')}</h4>
                      <p className="text-gray-600">{t('lifeFeature4Desc')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-6 rounded-xl mb-8">
                  <h4 className="font-semibold text-gray-800 mb-4">{t('courseInfoTitle')}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">{t('teachingMethod')}</span>{t('lifeTeachingMethod')}</div>
                    <div><span className="font-medium">{t('courseHours')}</span>{t('lifeCourseHours')}</div>
                    <div><span className="font-medium">{t('classTime')}</span>{t('lifeClassTime')}</div>
                    <div><span className="font-medium">{t('tuition')}</span>{t('lifeTuition')}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleRegistration(t('lifeCourseTitle'))}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-semibold transition-colors whitespace-nowrap cursor-pointer w-full sm:w-auto"
                >
                  {t('lifeRegisterBtn')}
                </button>
              </div>

              <div className="relative">
                <Image
                  src="/上課.jpg"
                  alt={t('lifeCourseTitle')}
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl object-cover object-top w-full h-96 lg:h-[500px]"
                />
              </div>
            </div>
          )}

          {/* Professional Course */}
          {activeTab === 'professional' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative">
                <Image
                  src="/上課.jpg"
                  alt={t('professionalCourseTitle')}
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl object-cover object-top w-full h-96 lg:h-[500px]"
                />
              </div>

              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold text-gray-800 mb-6">{t('professionalCourseTitle')}</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {t('professionalCourseDesc')}
                </p>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-book-open-line text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">{t('professionalFeature1Title')}</h4>
                      <p className="text-gray-600">{t('professionalFeature1Desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-compass-line text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">{t('professionalFeature2Title')}</h4>
                      <p className="text-gray-600">{t('professionalFeature2Desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-customer-service-2-line text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">{t('professionalFeature3Title')}</h4>
                      <p className="text-gray-600">{t('professionalFeature3Desc')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl mb-8">
                  <h4 className="font-semibold text-gray-800 mb-4">{t('courseInfoTitle')}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">{t('teachingMethod')}</span>{t('professionalTeachingMethod')}</div>
                    <div><span className="font-medium">{t('courseHours')}</span>{t('professionalCourseHours')}</div>
                    <div><span className="font-medium">{t('classTime')}</span>{t('professionalClassTime')}</div>
                    <div><span className="font-medium">{t('tuition')}</span>{t('professionalTuition')}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleRegistration(t('professionalCourseTitle'))}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-colors whitespace-nowrap cursor-pointer w-full sm:w-auto"
                >
                  {t('professionalRegisterBtn')}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Teaching Method */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('teachingMethodTitle')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('teachingMethodDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-user-line text-white text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{t('method1Title')}</h3>
              <p className="text-gray-600">{t('method1Desc')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-team-line text-white text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{t('method2Title')}</h3>
              <p className="text-gray-600">{t('method2Desc')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-pie-chart-line text-white text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{t('method3Title')}</h3>
              <p className="text-gray-600">{t('method3Desc')}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-smartphone-line text-white text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{t('method4Title')}</h3>
              <p className="text-gray-600">{t('method4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Registration Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('ctaSectionTitle')}</h2>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
              {t('ctaSectionDesc')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => setShowContactForm(true)}
              className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              {t('btnContact')}
            </button>
            <button
              onClick={() => {
                setSelectedCourse('');
                setShowRegistrationForm(true);
              }}
              className="border-2 border-white text-white hover:bg-white hover:text-amber-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer"
            >
              {t('btnRegisterForm')}
            </button>
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">{t('contactModalTitle')}</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form id="contact-form" onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelName')}</label>
                <input
                  type="text"
                  name="contact_name"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t('placeholderContactName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelPhone')}</label>
                <input
                  type="tel"
                  name="contact_phone"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t('placeholderContactPhone')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelEmail')}</label>
                <input
                  type="email"
                  name="contact_email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t('placeholderContactEmail')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelMessage')}</label>
                <textarea
                  name="message"
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  placeholder={t('placeholderMessage')}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                {t('btnSendMessage')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">{t('registrationModalTitle')}</h3>
              <button
                onClick={() => setShowRegistrationForm(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form id="registration-form" onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelCourse')}</label>
                <select
                  name="course_type"
                  required
                  defaultValue={selectedCourse}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-8"
                >
                  <option value="">{t('selectCourse')}</option>
                  <option value="personal-life">{t('optionLifeCourse')}</option>
                  <option value="professional">{t('optionProfessionalCourse')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelFullName')}</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t('placeholderRegistrationName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelContactPhone')}</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t('placeholderRegistrationPhone')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelContactEmail')}</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t('placeholderRegistrationEmail')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelAge')}</label>
                <input
                  type="number"
                  name="age"
                  min="18"
                  max="80"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t('placeholderAge')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelOccupation')}</label>
                <input
                  type="text"
                  name="occupation"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t('placeholderOccupation')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelExperience')}</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="experience" value="none" className="mr-2" />
                    <span>{t('expNone')}</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="experience" value="beginner" className="mr-2" />
                    <span>{t('expBeginner')}</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="experience" value="intermediate" className="mr-2" />
                    <span>{t('expIntermediate')}</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="experience" value="advanced" className="mr-2" />
                    <span>{t('expAdvanced')}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('labelMotivation')}</label>
                <textarea
                  name="motivation"
                  maxLength={500}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  placeholder={t('placeholderMotivation')}
                ></textarea>
              </div>

              <div>
                <label className="flex items-start">
                  <input type="checkbox" name="agree_terms" required className="mr-2 mt-1" />
                  <span className="text-sm text-gray-600">{t('labelAgreeTerms')}</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                {t('btnSubmitRegistration')}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
