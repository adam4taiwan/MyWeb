'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useTranslations } from 'next-intl';
import { useParams, usePathname, useRouter } from 'next/navigation';

const locales = [
  { code: 'zh-TW', label: '繁中' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: '日本語' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const t = useTranslations('Header');
  const params = useParams();
  const currentLocale = (params?.locale as string) || 'zh-TW';
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <header className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
              <i className="ri-book-open-line text-white text-xl"></i>
            </div>
            <span className="text-2xl font-bold text-amber-800" style={currentLocale === 'zh-TW' ? {fontFamily: 'var(--font-pacifico)'} : {fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900}}>{t('brand')}</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 ml-10">
            <Link href="/" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">{t('home')}</Link>
            <Link href="/heritage" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">{t('heritage')}</Link>
            <Link href="/blog" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">{t('blog')}</Link>
            {/* <Link href="/bookstore" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">二手書店</Link> */}
            {isAuthenticated && (
              <Link href="/disk" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">{t('disk')}</Link>
            )}
            <Link href="/blessing" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">{t('blessing')}</Link>
            <Link href="/appointment" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">{t('appointment')}</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {/* Language switcher */}
            <div className="flex items-center gap-1 text-xs">
              {locales.map(loc => (
                <button
                  key={loc.code}
                  onClick={() => switchLocale(loc.code)}
                  className={`px-1.5 py-0.5 rounded whitespace-nowrap ${currentLocale === loc.code ? 'bg-amber-600 text-white' : 'text-gray-600 hover:text-amber-600'}`}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            <Link href="/consultation">
              <button className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors whitespace-nowrap cursor-pointer font-semibold">
                {t('consultation')}
              </button>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/member">
                  <button className="px-4 py-2 text-amber-700 border border-amber-300 rounded-full hover:bg-amber-50 transition-colors font-semibold whitespace-nowrap">
                    {t('member')}
                  </button>
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors font-semibold whitespace-nowrap"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="px-4 py-2 text-white bg-amber-600 rounded-full hover:bg-amber-700 transition-colors font-semibold whitespace-nowrap">
                  {t('login')}
                </button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-2xl text-gray-700`}></i>
          </button>
        </div>

        {/* Mobile menu content */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-amber-200">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link href="/" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>{t('home')}</Link>
              {/*<Link href="/books" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>古書介紹</Link>*/}
              <Link href="/heritage" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>{t('heritage')}</Link>
              <Link href="/blog" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>{t('blog')}</Link>
              {/* <Link href="/bookstore" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>二手書店</Link> */}
              <Link href="/consultation" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>{t('consultationMobile')}</Link>
              {isAuthenticated && (
                <Link href="/disk" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>{t('disk')}</Link>
              )}
              <Link href="/blessing" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>{t('blessing')}</Link>
              <Link href="/appointment" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>{t('appointment')}</Link>
              {isAuthenticated && (
                <Link href="/member" className="text-gray-700 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setIsMenuOpen(false)}>{t('member')}</Link>
              )}
              {/* Language switcher in mobile */}
              <div className="flex items-center gap-2 pt-2">
                {locales.map(loc => (
                  <button
                    key={loc.code}
                    onClick={() => { switchLocale(loc.code); setIsMenuOpen(false); }}
                    className={`px-2 py-1 rounded text-sm ${currentLocale === loc.code ? 'bg-amber-600 text-white' : 'text-gray-600 border border-gray-300 hover:text-amber-600'}`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors font-semibold"
                >
                  {t('logout')}
                </button>
              ) : (
                <Link href="/login">
                  <button className="bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700 transition-colors font-semibold" onClick={() => setIsMenuOpen(false)}>
                    {t('login')}
                  </button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
