
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: string;
}

export default function EmailModal({ isOpen, onClose, service }: EmailModalProps) {
  const t = useTranslations('Consultation');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    gender: '',
    maritalStatus: '',
    occupation: '',
    subject: '',
    priority: 'normal',
    consultationType: 'detailed',
    questions: '',
    attachments: [] as File[]
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/consultation/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('btnSendEmail'));
      }

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
        setFormData({
          name: '',
          email: '',
          phone: '',
          birthDate: '',
          birthTime: '',
          birthPlace: '',
          gender: '',
          maritalStatus: '',
          occupation: '',
          subject: '',
          priority: 'normal',
          consultationType: 'detailed',
          questions: '',
          attachments: []
        });
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('btnSending');
      setError(errorMessage);
      console.error('email send error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, attachments: Array.from(e.target.files) });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <i className="ri-mail-line text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{t('emailModalTitle')}</h3>
                <p className="text-gray-600">{service}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-gray-600"></i>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-6">
            <div className="flex items-start space-x-3">
              <i className="ri-error-warning-line text-red-600 text-xl mt-1"></i>
              <div>
                <h5 className="font-semibold text-red-800">{t('emailSendFailed')}</h5>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isSubmitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-mail-check-line text-green-600 text-2xl"></i>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">{t('emailSendSuccess')}</h4>
            <p className="text-gray-600 mb-4">{t('emailReceived')}</p>
            <div className="bg-green-50 rounded-lg p-4 text-left">
              <h5 className="font-semibold text-green-800 mb-2">{t('emailNextSteps')}</h5>
              <ul className="text-green-700 space-y-1 text-sm">
                <li>- {t('emailStep1')}</li>
                <li>- {t('emailStep2')}</li>
                <li>- {t('emailStep3')}</li>
                <li>- {t('emailStep4')}</li>
              </ul>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">{t('basicInfoTitle')}</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelName')}</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder={t('placeholderName')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelEmailField')}</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="example@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelPhone')}</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="09XX-XXX-XXX"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">{t('birthInfoTitle')}</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelBirthDate')}</label>
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelBirthTime')}</label>
                        <input
                          type="time"
                          name="birthTime"
                          value={formData.birthTime}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelBirthPlace')}</label>
                      <input
                        type="text"
                        name="birthPlace"
                        value={formData.birthPlace}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder={t('placeholderBirthPlace')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelGender')}</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm pr-8"
                        >
                          <option value="">{t('selectPlaceholder')}</option>
                          <option value="male">{t('genderMale')}</option>
                          <option value="female">{t('genderFemale')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelMaritalStatus')}</label>
                        <select
                          name="maritalStatus"
                          value={formData.maritalStatus}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm pr-8"
                        >
                          <option value="">{t('selectPlaceholder')}</option>
                          <option value="single">{t('maritalSingle')}</option>
                          <option value="married">{t('maritalMarried')}</option>
                          <option value="divorced">{t('maritalDivorced')}</option>
                          <option value="widowed">{t('maritalWidowed')}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelOccupation')}</label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder={t('placeholderOccupation')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">{t('consultDetailTitle')}</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelSubject')}</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder={t('placeholderSubject')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelPriority')}</label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm pr-8"
                        >
                          <option value="normal">{t('priorityNormal')}</option>
                          <option value="urgent">{t('priorityUrgent')}</option>
                          <option value="very-urgent">{t('priorityVeryUrgent')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelConsultationType')}</label>
                        <select
                          name="consultationType"
                          value={formData.consultationType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm pr-8"
                        >
                          <option value="detailed">{t('typeDetailed')}</option>
                          <option value="brief">{t('typeBrief')}</option>
                          <option value="specific">{t('typeSpecific')}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('labelQuestions')}</label>
                      <textarea
                        name="questions"
                        value={formData.questions}
                        onChange={handleChange}
                        required
                        rows={8}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                        placeholder={t('placeholderQuestions')}
                      ></textarea>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {formData.questions.length}/500
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <i className="ri-yin-yang-2-line text-amber-600 mr-2"></i>
                        {t('labelAttachments')}
                      </label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        <i className="ri-book-2-line text-amber-600 mr-1"></i>
                        {t('attachmentNote')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-lg p-4">
                  <h5 className="font-semibold text-amber-800 mb-2">{t('serviceNoteTitle')}</h5>
                  <ul className="text-amber-700 space-y-1 text-sm">
                    <li>- {t('serviceNote1')}</li>
                    <li>- {t('serviceNote2')}</li>
                    <li>- {t('serviceNote3')}</li>
                    <li>- {t('serviceNote4')}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('btnCancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {t('btnSending')}
                  </>
                ) : (
                  t('btnSendEmail')
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
