'use client';

import { useState } from 'react';
import Image from 'next/image';

type Panel = 'line' | 'wechat' | null;

const WECHAT_ID = 'wxid_22io062y9j1952';

export default function ContactFloat() {
  const [open, setOpen] = useState<Panel>(null);
  const [wechatCopied, setWechatCopied] = useState(false);

  const copyWechatId = () => {
    navigator.clipboard.writeText(WECHAT_ID).then(() => {
      setWechatCopied(true);
      setTimeout(() => setWechatCopied(false), 2000);
    });
  };

  const toggle = (panel: Panel) => setOpen(prev => prev === panel ? null : panel);

  return (
    <>
      {/* QR Code Popup */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(null)}
        />
      )}

      <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3">

        {/* Line QR Panel */}
        {open === 'line' && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-52 text-center animate-fade-in">
            <p className="text-xs font-bold text-gray-700 mb-2">LINE 加我好友</p>
            <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-100 hidden md:block">
              <Image
                src="/image/lineID.jpg"
                alt="Line QR Code"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 hidden md:block">ID：adam4taiwan</p>
            <p className="text-xs text-gray-500 md:hidden mb-2">ID：adam4taiwan</p>
            <a
              href="https://line.me/ti/p/adam4taiwan"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block w-full py-2 bg-green-500 text-white text-sm rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              點擊加入 LINE
            </a>
          </div>
        )}

        {/* WeChat QR Panel */}
        {open === 'wechat' && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-52 text-center animate-fade-in">
            <p className="text-xs font-bold text-gray-700 mb-2">微信加我好友</p>
            <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-100 hidden md:block">
              <Image
                src="/image/WeChatID.jpg"
                alt="WeChat QR Code"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 hidden md:block">長按或掃描 QR Code</p>
            <p className="text-xs text-gray-500 mt-1 mb-2 md:mt-2">ID：{WECHAT_ID}</p>
            <button
              onClick={copyWechatId}
              className="inline-block w-full py-2 bg-emerald-500 text-white text-sm rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              {wechatCopied ? '已複製！' : '複製微信 ID'}
            </button>
            <p className="text-xs text-gray-400 mt-1.5 md:hidden">複製後開啟微信搜尋加好友</p>
          </div>
        )}

        {/* Line Button */}
        <button
          onClick={() => toggle('line')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-white text-sm font-medium transition-all ${
            open === 'line'
              ? 'bg-green-600 scale-105'
              : 'bg-green-500 hover:bg-green-600 hover:scale-105'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          LINE
        </button>

        {/* WeChat Button */}
        <button
          onClick={() => toggle('wechat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-white text-sm font-medium transition-all ${
            open === 'wechat'
              ? 'bg-emerald-700 scale-105'
              : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c-.325-.985-.493-2.015-.493-3.077 0-4.529 4.528-8.205 10.109-8.205h.028C17.608 3.93 13.393 2.188 8.691 2.188zm-2.71 3.814a1.053 1.053 0 1 1 0 2.105 1.053 1.053 0 0 1 0-2.105zm5.421 0a1.053 1.053 0 1 1 0 2.105 1.053 1.053 0 0 1 0-2.105zM24 14.892c0-3.484-3.3-6.312-7.374-6.312-4.073 0-7.374 2.828-7.374 6.312 0 3.485 3.301 6.312 7.374 6.312.871 0 1.71-.132 2.486-.37a.672.672 0 0 1 .562.076l1.489.871a.255.255 0 0 0 .131.042.23.23 0 0 0 .228-.228c0-.057-.023-.11-.037-.166l-.306-1.158a.462.462 0 0 1 .167-.521C23.025 18.718 24 16.903 24 14.892zm-9.62-1.058a.826.826 0 1 1 0-1.651.826.826 0 0 1 0 1.651zm4.493 0a.826.826 0 1 1 0-1.651.826.826 0 0 1 0 1.651z"/>
          </svg>
          微信
        </button>
      </div>
    </>
  );
}
