'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

const bookTagColors = [
  'bg-amber-100 text-amber-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
];

const bookBorders = [
  'border-amber-200',
  'border-blue-200',
  'border-green-200',
  'border-purple-200',
];

const bookHref = '/disk';

export default function TestimonialsSection() {
  const t = useTranslations('Testimonials');
  const benefits = t.raw('benefits') as Array<{
    icon: string;
    title: string;
    question: string;
    insight: string;
  }>;
  const books = t.raw('books') as Array<{
    name: string;
    tag: string;
    desc: string;
    points: string[];
  }>;

  return (
    <section className="section-container bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Part 1: Life directions */}
        <div className="text-center mb-12">
          <h2 className="section-title">{t('benefitsTitle')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            {t('benefitsDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {benefits.map((b, i) => (
            <div key={i} className="card-base space-y-3 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                  {b.icon}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{b.title}</p>
                  <p className="text-xs text-amber-600 mt-0.5">{b.question}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{b.insight}</p>
            </div>
          ))}
        </div>

        {/* Part 2: Four fortune books */}
        <div className="text-center mb-12">
          <h2 className="section-title">{t('booksTitle')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            {t('booksDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {books.map((book, i) => (
            <div key={i} className={`rounded-2xl border-2 ${bookBorders[i]} bg-white p-5 flex flex-col hover:-translate-y-1 transition-transform duration-300`}>
              <div className="mb-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bookTagColors[i]}`}>{book.tag}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{book.name}</h3>
              <p className="text-xs text-gray-500 mb-4">{book.desc}</p>
              <ul className="space-y-2 flex-grow">
                {book.points.map((pt, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-500 font-bold flex-shrink-0 mt-0.5">·</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <Link href={bookHref} className="mt-5 block text-center text-xs font-bold text-amber-700 border border-amber-300 rounded-xl py-2 hover:bg-amber-50 transition-colors">
                {t('learnMore')}
              </Link>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-gray-600 mb-6">{t('ctaPrompt')}</p>
          <Link href="/disk" className="btn-primary">
            {t('ctaBtn')}
          </Link>
        </div>

      </div>
    </section>
  );
}
