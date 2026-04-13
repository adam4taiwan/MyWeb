
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: string;
}

export default function MessageModal({ isOpen, onClose, service }: MessageModalProps) {
  const t = useTranslations('Consultation');
  const msgResponses = t.raw('msgResponses') as string[];

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'received',
      content: t('msgWelcome'),
      time: '14:30',
      avatar: 'professional fortune teller portrait, wise elderly chinese master with traditional clothing, kind smile, warm lighting, professional headshot'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: '',
    birthDate: '',
    question: ''
  });
  const [showUserForm, setShowUserForm] = useState(true);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      type: 'sent' as const,
      content: newMessage,
      time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      avatar: ''
    };

    setMessages([...messages, message]);
    setNewMessage('');

    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        type: 'received' as const,
        content: msgResponses[Math.floor(Math.random() * msgResponses.length)],
        time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
        avatar: 'professional fortune teller portrait, wise elderly chinese master with traditional clothing, kind smile, warm lighting, professional headshot'
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowUserForm(false);

    const welcomeMessage = {
      id: messages.length + 1,
      type: 'received' as const,
      content: `${userInfo.name}${t('msgWelcome')}`,
      time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      avatar: 'professional fortune teller portrait, wise elderly chinese master with traditional clothing, kind smile, warm lighting, professional headshot'
    };

    setMessages(prev => [...prev, welcomeMessage]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[600px] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <i className="ri-message-line text-white text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('messageModalTitle')}</h3>
              <p className="text-sm text-gray-600">{service}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-gray-600"></i>
          </button>
        </div>

        {showUserForm ? (
          <div className="flex-1 p-6 flex items-center justify-center">
            <form onSubmit={handleUserInfoSubmit} className="w-full max-w-md space-y-4">
              <h4 className="text-xl font-bold text-center text-gray-900 mb-6">{t('msgFormTitle')}</h4>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('msgLabelName')}</label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={t('msgPlaceholderName')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('msgLabelBirthDate')}</label>
                <input
                  type="date"
                  value={userInfo.birthDate}
                  onChange={(e) => setUserInfo({...userInfo, birthDate: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('msgLabelQuestion')}</label>
                <textarea
                  value={userInfo.question}
                  onChange={(e) => setUserInfo({...userInfo, question: e.target.value})}
                  required
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  placeholder={t('msgPlaceholderQuestion')}
                ></textarea>
                <div className="text-right text-xs text-gray-500 mt-1">
                  {userInfo.question.length}/200
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                {t('msgStartBtn')}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${message.type === 'sent' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {message.type === 'received' && (
                      <div className="w-8 h-8 bg-cover bg-center bg-no-repeat rounded-full flex-shrink-0"
                        style={{
                          backgroundImage: `url('https://readdy.ai/api/search-image?query=${message.avatar}&width=100&height=100&seq=master-avatar&orientation=squarish')`
                        }}
                      ></div>
                    )}
                    <div className={`px-4 py-2 rounded-2xl ${
                      message.type === 'sent'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'sent'
                          ? 'text-blue-200'
                          : 'text-gray-500'
                      }`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('msgInputPlaceholder')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <i className="ri-send-plane-line"></i>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
