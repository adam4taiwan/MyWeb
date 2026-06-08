'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

// Course data - update content arrays with actual lesson notes from PPT
const BAZI_LESSONS = [
  {
    id: 1,
    title: '八字命理第一課',
    subtitle: '基礎入門',
    topics: ['天干地支介紹', '五行生剋制化', '四柱排法基礎'],
    content: null, // TODO: fill in from PPT
  },
  {
    id: 2,
    title: '八字命理第二課',
    subtitle: '天干至十神',
    topics: ['十天干特性與象意', '十神定義與作用', '干支組合規則'],
    content: null, // TODO: fill in from PPT
  },
  {
    id: 3,
    title: '八字命理第三課',
    subtitle: '格局論命',
    topics: ['正官・食神・印綬格', '財星・比劫格局', '月令取格方法'],
    content: null, // TODO: fill in from PPT
  },
  {
    id: 4,
    title: '八字命理第四課',
    subtitle: '外格・行運・善惡斷',
    topics: ['特殊外格種類', '大運行運吉凶判斷', '善惡論斷方法'],
    content: null, // TODO: fill in from PPT
  },
  {
    id: 5,
    title: '八字命理第五課',
    subtitle: '運限流年・六親・富貴',
    topics: ['大運流年推算', '六親宮位論命', '富貴貧賤判斷依據'],
    content: null, // TODO: fill in from PPT
  },
  {
    id: 6,
    title: '八字命理第六課',
    subtitle: '論斷篇',
    topics: ['論斷技巧精要', '貧賤凶夭判斷', '補充評斷與綜合應用'],
    content: null, // TODO: fill in from PPT
  },
];

export default function CoursesPage() {
  const t = useTranslations('Courses');
  const { token } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) {
      setLoadingAuth(false);
      return;
    }
    fetch(`${API_URL}/Subscription/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setIsSubscribed(!!data?.isSubscribed))
      .catch(() => setIsSubscribed(false))
      .finally(() => setLoadingAuth(false));
  }, [token]);

  const toggleLesson = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-300 text-sm font-medium mb-3 tracking-widest uppercase">
            {t('seriesBazi')} &nbsp;·&nbsp; {t('seriesLessonsCount')}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('heroTitle')}</h1>
          <p className="text-amber-100 text-lg max-w-xl mx-auto">{t('heroDesc')}</p>
        </div>
      </section>

      {/* Course list */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="space-y-4">
          {BAZI_LESSONS.map(lesson => {
            const isOpen = expandedId === lesson.id;
            return (
              <div
                key={lesson.id}
                className="border border-amber-200 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Card header - always visible */}
                <button
                  className="w-full text-left px-6 py-5 flex items-center gap-4 hover:bg-amber-50 transition-colors"
                  onClick={() => toggleLesson(lesson.id)}
                >
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                    {lesson.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base">{lesson.title}</p>
                    <p className="text-amber-700 text-sm">{lesson.subtitle}</p>
                  </div>
                  <div className="hidden sm:flex flex-wrap gap-1 flex-shrink-0 max-w-xs">
                    {lesson.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  <i
                    className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-amber-500 text-xl flex-shrink-0 ml-2`}
                  />
                </button>

                {/* Mobile topics */}
                <div className="sm:hidden flex flex-wrap gap-1 px-6 pb-3">
                  {lesson.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div className="border-t border-amber-100">
                    {loadingAuth ? (
                      <div className="px-6 py-8 flex justify-center">
                        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : !isSubscribed ? (
                      // Lock overlay for non-subscribers
                      <div className="px-6 py-10 text-center bg-amber-50">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                          <i className="ri-lock-2-line text-amber-500 text-2xl" />
                        </div>
                        <p className="font-bold text-gray-800 mb-1">{t('lockedTitle')}</p>
                        <p className="text-gray-500 text-sm mb-5">{t('lockedDesc')}</p>
                        <Link href="/subscribe">
                          <button className="bg-amber-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-amber-700 transition-colors text-sm">
                            {t('subscribeCta')}
                          </button>
                        </Link>
                      </div>
                    ) : lesson.content ? (
                      // Member content (populated from PPT)
                      <div className="px-6 py-6">
                        <p className="font-semibold text-gray-800 mb-4">{t('contentTitle')}</p>
                        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
                          {(lesson.content as { heading: string; points: string[] }[]).map(
                            (section, i) => (
                              <div key={i}>
                                <p className="font-semibold text-amber-800 mb-1">
                                  {section.heading}
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                  {section.points.map((pt, j) => (
                                    <li key={j}>{pt}</li>
                                  ))}
                                </ul>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      // Content not ready yet
                      <div className="px-6 py-8 text-center bg-gray-50">
                        <i className="ri-time-line text-gray-400 text-3xl mb-2 block" />
                        <p className="font-semibold text-gray-600 mb-1">{t('comingSoonLabel')}</p>
                        <p className="text-gray-400 text-sm">{t('comingSoonDesc')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Non-subscriber CTA banner */}
        {!loadingAuth && !isSubscribed && (
          <div className="mt-10 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-2xl p-8 text-center">
            <p className="text-lg font-bold mb-2">{t('lockedTitle')}</p>
            <p className="text-amber-100 text-sm mb-5">{t('lockedDesc')}</p>
            <Link href="/subscribe">
              <button className="bg-white text-amber-700 font-bold px-8 py-3 rounded-full hover:bg-amber-50 transition-colors">
                {t('subscribeCta')}
              </button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
