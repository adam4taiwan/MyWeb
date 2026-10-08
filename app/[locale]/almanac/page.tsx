'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Shichen {
  zhi: string;
  range: string;
  ganZhi: string;
  tianShen: string;
  tianShenType: string;
  luck: string;
  yi: string[];
  ji: string[];
  chong: string;
  sha: string;
}

interface AlmanacData {
  date: string;
  lunar: {
    year: number;
    month: string;
    day: string;
    isLeap: boolean;
    yearGanZhi: string;
    monthGanZhi: string;
    dayGanZhi: string;
  };
  jieQi: string | null;
  yi: string[];
  ji: string[];
  chong: string;
  sha: string;
  directions: {
    xi: string;
    cai: string;
    fu: string;
    yangGui: string;
    yinGui: string;
  };
  pengZu: {
    gan: string;
    zhi: string;
  };
  shichen: Shichen[];
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${y} 年 ${parseInt(m)} 月 ${parseInt(d)} 日`;
}

function prevDate(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function nextDate(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function todayTW(): string {
  const now = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

function getWeekday(dateStr: string): string {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return '星期' + days[new Date(dateStr).getDay()];
}

export default function AlmanacPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramDate = searchParams.get('date');
  const today = todayTW();
  const [currentDate, setCurrentDate] = useState(
    paramDate && /^\d{4}-\d{2}-\d{2}$/.test(paramDate) ? paramDate : today
  );
  const [data, setData] = useState<AlmanacData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/almanac?date=${currentDate}`)
      .then(r => r.ok ? r.json() : Promise.reject('fetch failed'))
      .then(setData)
      .catch(() => setError('資料載入失敗，請稍後再試'))
      .finally(() => setLoading(false));
  }, [currentDate]);

  function navigate(date: string) {
    setCurrentDate(date);
    router.replace(`?date=${date}`, { scroll: false });
  }

  const isToday = currentDate === today;

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <Header />

      <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-8">

        {/* Page title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-amber-400 mb-1">每日農民曆</h1>
          <p className="text-amber-200/60 text-sm">黃道吉日・宜忌時辰・神位方向</p>
        </div>

        {/* Date navigation */}
        <div className="flex items-center justify-between mb-6 bg-gray-900 rounded-xl px-4 py-3 border border-amber-900/40">
          <button
            onClick={() => navigate(prevDate(currentDate))}
            className="text-amber-400 hover:text-amber-300 px-3 py-1 rounded-lg hover:bg-amber-900/30 transition-colors text-lg"
          >
            &lt; 前一天
          </button>

          <div className="text-center">
            <div className="text-amber-200 font-bold text-lg">{formatDate(currentDate)}</div>
            <div className="text-amber-400/70 text-sm">{getWeekday(currentDate)}</div>
            {!isToday && (
              <button
                onClick={() => navigate(today)}
                className="mt-1 text-xs text-amber-500 hover:text-amber-300 underline"
              >
                回到今日
              </button>
            )}
          </div>

          <button
            onClick={() => navigate(nextDate(currentDate))}
            className="text-amber-400 hover:text-amber-300 px-3 py-1 rounded-lg hover:bg-amber-900/30 transition-colors text-lg"
          >
            後一天 &gt;
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 py-10">{error}</div>
        )}

        {data && !loading && (
          <div className="space-y-5">

            {/* Lunar info card */}
            <div className="bg-gray-900 rounded-xl border border-amber-900/40 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-amber-400/60 text-xs mb-1">農曆</div>
                  <div className="text-amber-200 font-bold">
                    {data.lunar.isLeap ? '閏' : ''}{data.lunar.month}{data.lunar.day}
                  </div>
                </div>
                <div>
                  <div className="text-amber-400/60 text-xs mb-1">日柱干支</div>
                  <div className="text-amber-200 font-bold">{data.lunar.dayGanZhi}</div>
                </div>
                <div>
                  <div className="text-amber-400/60 text-xs mb-1">月柱</div>
                  <div className="text-amber-200 font-bold">{data.lunar.monthGanZhi}</div>
                </div>
                <div>
                  <div className="text-amber-400/60 text-xs mb-1">年柱</div>
                  <div className="text-amber-200 font-bold">{data.lunar.yearGanZhi}</div>
                </div>
              </div>
              {data.jieQi && (
                <div className="mt-3 text-center">
                  <span className="bg-amber-700/40 text-amber-300 text-sm px-3 py-1 rounded-full border border-amber-600/40">
                    節氣：{data.jieQi}
                  </span>
                </div>
              )}
            </div>

            {/* Yi / Ji */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-xl border border-amber-900/40 p-4">
                <h2 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center text-xs text-white font-bold">宜</span>
                  今日宜
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.yi.map((item, i) => (
                    <span key={i} className="bg-amber-900/30 text-amber-300 text-sm px-2 py-1 rounded-md border border-amber-700/40">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl border border-red-900/30 p-4">
                <h2 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-red-700 rounded-full flex items-center justify-center text-xs text-white font-bold">忌</span>
                  今日忌
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.ji.map((item, i) => (
                    <span key={i} className="bg-red-900/20 text-red-300 text-sm px-2 py-1 rounded-md border border-red-700/30">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Chong / Sha / Directions */}
            <div className="bg-gray-900 rounded-xl border border-amber-900/40 p-4">
              <h2 className="text-amber-400 font-bold mb-3">神位方向 & 沖煞</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm mb-3">
                <div className="bg-gray-800/60 rounded-lg p-2">
                  <div className="text-amber-400/60 text-xs mb-1">喜神</div>
                  <div className="text-amber-200 font-bold">{data.directions.xi}</div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-2">
                  <div className="text-amber-400/60 text-xs mb-1">財神</div>
                  <div className="text-amber-200 font-bold">{data.directions.cai}</div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-2">
                  <div className="text-amber-400/60 text-xs mb-1">福神</div>
                  <div className="text-amber-200 font-bold">{data.directions.fu}</div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-2">
                  <div className="text-amber-400/60 text-xs mb-1">貴神</div>
                  <div className="text-amber-200 font-bold">{data.directions.yangGui} / {data.directions.yinGui}</div>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-center">
                <div className="flex-1 bg-gray-800/60 rounded-lg p-2">
                  <span className="text-amber-400/60 text-xs">沖</span>
                  <span className="text-amber-200 font-bold ml-2">{data.chong}</span>
                </div>
                <div className="flex-1 bg-gray-800/60 rounded-lg p-2">
                  <span className="text-amber-400/60 text-xs">煞</span>
                  <span className="text-amber-200 font-bold ml-2">{data.sha}方</span>
                </div>
              </div>
            </div>

            {/* PengZu */}
            <div className="bg-gray-900 rounded-xl border border-amber-900/40 p-4">
              <h2 className="text-amber-400 font-bold mb-2">彭祖百忌</h2>
              <p className="text-amber-200/80 text-sm">{data.pengZu.gan}</p>
              <p className="text-amber-200/80 text-sm mt-1">{data.pengZu.zhi}</p>
            </div>

            {/* 12 Shichen table */}
            <div className="bg-gray-900 rounded-xl border border-amber-900/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-amber-900/30">
                <h2 className="text-amber-400 font-bold">十二時辰吉凶</h2>
                <p className="text-amber-400/50 text-xs mt-0.5">黃道=吉時&nbsp;&nbsp;黑道=凶時</p>
              </div>
              <div className="divide-y divide-gray-800">
                {data.shichen.map((s, i) => {
                  const isJi = s.tianShenType === '黄道';
                  return (
                    <div
                      key={i}
                      className={`px-4 py-3 ${isJi ? 'bg-amber-950/20' : 'bg-gray-900'}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Time label */}
                        <div className="w-20 shrink-0 text-center">
                          <div className={`text-lg font-bold ${isJi ? 'text-amber-300' : 'text-gray-400'}`}>
                            {s.zhi}時
                          </div>
                          <div className="text-gray-500 text-xs">{s.range}</div>
                          <div className="text-gray-500 text-xs">{s.ganZhi}</div>
                        </div>

                        {/* Badge */}
                        <div className="shrink-0 pt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                            isJi
                              ? 'bg-amber-700/30 text-amber-300 border-amber-600/40'
                              : 'bg-gray-700/40 text-gray-400 border-gray-600/40'
                          }`}>
                            {s.tianShen}
                          </span>
                          <div className={`text-xs mt-1 text-center ${isJi ? 'text-amber-400' : 'text-gray-500'}`}>
                            {s.tianShenType}
                          </div>
                        </div>

                        {/* Yi / Ji */}
                        <div className="flex-1 min-w-0">
                          {s.yi.length > 0 && s.yi[0] !== '無' && (
                            <div className="mb-1">
                              <span className="text-amber-500/80 text-xs mr-1">宜</span>
                              <span className="text-amber-200/80 text-xs">{s.yi.join('・')}</span>
                            </div>
                          )}
                          {s.ji.length > 0 && s.ji[0] !== '無' && (
                            <div>
                              <span className="text-red-500/80 text-xs mr-1">忌</span>
                              <span className="text-red-300/70 text-xs">{s.ji.join('・')}</span>
                            </div>
                          )}
                          <div className="text-gray-600 text-xs mt-1">
                            沖{s.chong}&nbsp;煞{s.sha}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Credit */}
            <div className="text-center text-gray-700 text-xs pb-2">
              農曆資料來源：lunar-javascript © 6tail (MIT)
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
