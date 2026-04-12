'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

const WECHAT_ID = 'wxid_22io062y9j1952';

export default function Footer() {
  const [qr, setQr] = useState<'line' | 'wechat' | null>(null);
  const [wechatCopied, setWechatCopied] = useState(false);
  const t = useTranslations('Footer');

  const copyWechatId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(WECHAT_ID).then(() => {
      setWechatCopied(true);
      setTimeout(() => setWechatCopied(false), 2000);
    });
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
                <i className="ri-book-open-line text-white text-lg"></i>
              </div>
              <span className="text-xl font-bold" style={{fontFamily: 'var(--font-pacifico)'}}>{t('brand')}</span>
            </div>
            <p className="text-gray-400 mb-4">{t('tagline')}</p>
            <div className="flex space-x-3">
              {/* WeChat */}
              <div className="relative">
                <div
                  onClick={() => setQr(qr === 'wechat' ? null : 'wechat')}
                  className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-600 transition-colors"
                  title="WeChat"
                >
                  <i className="ri-wechat-line text-sm"></i>
                </div>
                {qr === 'wechat' && (
                  <div className="absolute bottom-10 left-0 bg-white rounded-xl shadow-2xl p-3 w-44 text-center z-50">
                    <p className="text-xs font-bold text-gray-700 mb-2">{t('wechatFriend')}</p>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden hidden md:block">
                      <Image src="/image/WeChatID.jpg" alt="WeChat QR" fill className="object-contain" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">ID：{WECHAT_ID}</p>
                    <button
                      onClick={copyWechatId}
                      className="mt-1.5 inline-block w-full py-1.5 bg-emerald-500 text-white text-xs rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                    >
                      {wechatCopied ? t('wechatCopied') : t('wechatCopy')}
                    </button>
                  </div>
                )}
              </div>
              {/* Line */}
              <div className="relative">
                <div
                  onClick={() => setQr(qr === 'line' ? null : 'line')}
                  className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-500 transition-colors"
                  title="LINE"
                >
                  <i className="ri-line-line text-sm"></i>
                </div>
                {qr === 'line' && (
                  <div className="absolute bottom-10 left-0 bg-white rounded-xl shadow-2xl p-3 w-44 text-center z-50">
                    <p className="text-xs font-bold text-gray-700 mb-2">{t('lineFriend')}</p>
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden hidden md:block">
                      <Image src="/image/lineID.jpg" alt="Line QR" fill className="object-contain" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">ID：adam4taiwan</p>
                    <a
                      href="https://line.me/ti/p/adam4taiwan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block w-full py-1.5 bg-green-500 text-white text-xs rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      {t('lineJoin')}
                    </a>
                  </div>
                )}
              </div>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors">
                <i className="ri-facebook-line text-sm"></i>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('services')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/consultation" className="hover:text-white transition-colors cursor-pointer">{t('personalConsult')}</Link></li>
              <li><Link href="/heritage" className="hover:text-white transition-colors cursor-pointer">{t('heritageTeaching')}</Link></li>
              <li><Link href="/lectures" className="hover:text-white transition-colors cursor-pointer">{t('corporateLecture')}</Link></li>
              <li><Link href="/consultation" className="hover:text-white transition-colors cursor-pointer">{t('remoteService')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('resources')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/books" className="hover:text-white transition-colors cursor-pointer">{t('ancientBooks')}</Link></li>
              <li><Link href="/bookstore" className="hover:text-white transition-colors cursor-pointer">{t('usedBooks')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('contact')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <i className="ri-phone-line text-amber-500"></i>
                <span>0910-032-057</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="ri-mail-line text-amber-500"></i>
                <span>adam4taiwan@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="ri-time-line text-amber-500"></i>
                <span>{t('hours')}</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="ri-map-pin-line text-amber-500"></i>
                <span>Line id:adam4taiwan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
