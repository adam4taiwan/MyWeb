'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface MonthDay {
  date: string;
  day: number;
  lunarDay: string;
  lunarMonth: string;
  isLeapMonth: boolean;
  isFirstDayOfLunarMonth: boolean;
  jieQi: string | null;
  dayGanZhi: string;
  luck: string;
  tianShenType: string;
  yi: string[];
  ji: string[];
}

interface MonthData {
  year: number;
  month: number;
  firstDayOfWeek: number;
  daysInMonth: number;
  days: MonthDay[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_NAMES = ['', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

function todayTW(): string {
  const now = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${y} 年 ${parseInt(m)} 月 ${parseInt(d)} 日`;
}

function getWeekday(dateStr: string): string {
  return '星期' + WEEKDAYS[new Date(dateStr).getDay()];
}

function prevDateStr(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function nextDateStr(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

// ─── Day Detail View ─────────────────────────────────────────────────────────

function DayDetail({ currentDate, onNavigate, today }: {
  currentDate: string;
  onNavigate: (date: string) => void;
  today: string;
}) {
  const [data, setData] = useState<AlmanacData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/almanac?date=${currentDate}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setError('資料載入失敗，請稍後再試'))
      .finally(() => setLoading(false));
  }, [currentDate]);

  const isToday = currentDate === today;

  return (
    <div>
      {/* Date navigation */}
      <div className="flex items-center justify-between mb-5 bg-gray-900 rounded-xl px-4 py-3 border border-amber-900/40">
        <button
          onClick={() => onNavigate(prevDateStr(currentDate))}
          className="text-amber-400 hover:text-amber-300 px-3 py-1 rounded-lg hover:bg-amber-900/30 transition-colors"
        >
          &lt; 前一天
        </button>
        <div className="text-center">
          <div className="text-amber-200 font-bold text-lg">{formatDate(currentDate)}</div>
          <div className="text-amber-400/70 text-sm">{getWeekday(currentDate)}</div>
          {!isToday && (
            <button onClick={() => onNavigate(today)} className="mt-1 text-xs text-amber-500 hover:text-amber-300 underline">
              回到今日
            </button>
          )}
        </div>
        <button
          onClick={() => onNavigate(nextDateStr(currentDate))}
          className="text-amber-400 hover:text-amber-300 px-3 py-1 rounded-lg hover:bg-amber-900/30 transition-colors"
        >
          後一天 &gt;
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {error && <div className="text-center text-red-400 py-10">{error}</div>}

      {data && !loading && (
        <div className="space-y-5">
          {/* Lunar info */}
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
                  <span key={i} className="bg-amber-900/30 text-amber-300 text-sm px-2 py-1 rounded-md border border-amber-700/40">{item}</span>
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
                  <span key={i} className="bg-red-900/20 text-red-300 text-sm px-2 py-1 rounded-md border border-red-700/30">{item}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Directions & Chong/Sha */}
          <div className="bg-gray-900 rounded-xl border border-amber-900/40 p-4">
            <h2 className="text-amber-400 font-bold mb-3">神位方向 & 沖煞</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm mb-3">
              {[
                { label: '喜神', val: data.directions.xi },
                { label: '財神', val: data.directions.cai },
                { label: '福神', val: data.directions.fu },
                { label: '貴神', val: `${data.directions.yangGui} / ${data.directions.yinGui}` },
              ].map(({ label, val }) => (
                <div key={label} className="bg-gray-800/60 rounded-lg p-2">
                  <div className="text-amber-400/60 text-xs mb-1">{label}</div>
                  <div className="text-amber-200 font-bold">{val}</div>
                </div>
              ))}
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

          {/* 12 Shichen */}
          <div className="bg-gray-900 rounded-xl border border-amber-900/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-amber-900/30">
              <h2 className="text-amber-400 font-bold">十二時辰吉凶</h2>
              <p className="text-amber-400/50 text-xs mt-0.5">黃道=吉時&nbsp;&nbsp;黑道=凶時</p>
            </div>
            <div className="divide-y divide-gray-800">
              {data.shichen.map((s, i) => {
                const isJi = s.tianShenType === '黄道';
                return (
                  <div key={i} className={`px-4 py-3 ${isJi ? 'bg-amber-950/20' : 'bg-gray-900'}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-20 shrink-0 text-center">
                        <div className={`text-lg font-bold ${isJi ? 'text-amber-300' : 'text-gray-400'}`}>{s.zhi}時</div>
                        <div className="text-gray-500 text-xs">{s.range}</div>
                        <div className="text-gray-500 text-xs">{s.ganZhi}</div>
                      </div>
                      <div className="shrink-0 pt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${isJi ? 'bg-amber-700/30 text-amber-300 border-amber-600/40' : 'bg-gray-700/40 text-gray-400 border-gray-600/40'}`}>
                          {s.tianShen}
                        </span>
                        <div className={`text-xs mt-1 text-center ${isJi ? 'text-amber-400' : 'text-gray-500'}`}>{s.tianShenType}</div>
                      </div>
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
                        <div className="text-gray-600 text-xs mt-1">沖{s.chong}&nbsp;煞{s.sha}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center text-gray-700 text-xs pb-2">
            農曆資料來源：lunar-javascript © 6tail (MIT)
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Month Calendar View ──────────────────────────────────────────────────────

function MonthCalendar({ initialYear, initialMonth, today, onDayClick }: {
  initialYear: number;
  initialMonth: number;
  today: string;
  onDayClick: (date: string) => void;
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [data, setData] = useState<MonthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMonth = useCallback((y: number, m: number) => {
    setLoading(true);
    fetch(`/api/almanac/month?year=${y}&month=${m}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchMonth(year, month); }, [year, month, fetchMonth]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  function goToday() {
    const [y, m] = today.split('-').map(Number);
    setYear(y); setMonth(m);
  }

  const isCurrentMonth = year === parseInt(today.slice(0, 4)) && month === parseInt(today.slice(5, 7));

  // Build grid: leading empty cells + days
  const cells: (MonthDay | null)[] = data
    ? [...Array(data.firstDayOfWeek).fill(null), ...data.days]
    : [];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4 bg-gray-900 rounded-xl px-4 py-3 border border-amber-900/40">
        <button onClick={prevMonth} className="text-amber-400 hover:text-amber-300 px-3 py-1 rounded-lg hover:bg-amber-900/30 transition-colors">
          &lt; 上個月
        </button>
        <div className="text-center">
          <div className="text-amber-200 font-bold text-lg">{year} 年 {MONTH_NAMES[month]}</div>
          {!isCurrentMonth && (
            <button onClick={goToday} className="text-xs text-amber-500 hover:text-amber-300 underline">
              回到本月
            </button>
          )}
        </div>
        <button onClick={nextMonth} className="text-amber-400 hover:text-amber-300 px-3 py-1 rounded-lg hover:bg-amber-900/30 transition-colors">
          下個月 &gt;
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-amber-900/40 overflow-hidden">
          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-amber-900/30">
            {WEEKDAYS.map((wd, i) => (
              <div key={wd} className={`py-2 text-center text-xs font-bold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-amber-400' : 'text-gray-400'}`}>
                {wd}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="aspect-square sm:aspect-auto sm:min-h-[5rem] border-r border-b border-gray-800/50 bg-gray-950/30" />;
              }

              const isToday = cell.date === today;
              const isJi = cell.tianShenType === '黄道';
              const dayOfWeek = (data!.firstDayOfWeek + cell.day - 1) % 7;
              const isSun = dayOfWeek === 0;
              const isSat = dayOfWeek === 6;

              return (
                <button
                  key={cell.date}
                  onClick={() => onDayClick(cell.date)}
                  className={`aspect-square sm:aspect-auto sm:min-h-[5rem] border-r border-b border-gray-800/50 p-1 text-left transition-colors hover:bg-amber-900/20 relative
                    ${isJi ? 'bg-amber-950/10' : 'bg-gray-900'}
                    ${isToday ? 'ring-2 ring-inset ring-amber-400' : ''}
                  `}
                >
                  {/* Day number */}
                  <div className={`text-sm sm:text-base font-bold leading-none mb-0.5
                    ${isToday ? 'text-amber-400' : isSun ? 'text-red-400' : isSat ? 'text-amber-300' : isJi ? 'text-amber-200' : 'text-gray-300'}
                  `}>
                    {cell.day}
                  </div>

                  {/* Lunar day */}
                  <div className="text-gray-500 text-[10px] sm:text-xs leading-none">
                    {cell.isFirstDayOfLunarMonth
                      ? <span className="text-amber-500/80">{cell.isLeapMonth ? '閏' : ''}{cell.lunarMonth}月</span>
                      : cell.lunarDay
                    }
                  </div>

                  {/* Jieqi badge */}
                  {cell.jieQi && (
                    <div className="hidden sm:block mt-1">
                      <span className="text-[9px] bg-amber-700/40 text-amber-300 px-1 rounded">{cell.jieQi}</span>
                    </div>
                  )}

                  {/* Yi summary (desktop only) */}
                  {cell.yi.length > 0 && cell.yi[0] !== '無' && (
                    <div className="hidden sm:block mt-1 text-[9px] text-amber-400/60 truncate">
                      宜 {cell.yi[0]}
                    </div>
                  )}

                  {/* 吉/凶 dot */}
                  <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${isJi ? 'bg-amber-400' : 'bg-gray-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-4 py-2 border-t border-amber-900/30 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>黃道吉日
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-600 inline-block"></span>黑道日
            </span>
            <span className="text-amber-400/60">點選日期查看詳情</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AlmanacPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const today = todayTW();
  const paramDate = searchParams.get('date');
  const paramView = searchParams.get('view');

  const [view, setView] = useState<'day' | 'month'>(paramView === 'month' ? 'month' : 'day');
  const [currentDate, setCurrentDate] = useState(
    paramDate && /^\d{4}-\d{2}-\d{2}$/.test(paramDate) ? paramDate : today
  );

  const [todayYear, todayMonth] = today.split('-').map(Number);

  function handleNavigate(date: string) {
    setCurrentDate(date);
    router.replace(`?view=day&date=${date}`, { scroll: false });
  }

  function handleViewSwitch(v: 'day' | 'month') {
    setView(v);
    if (v === 'month') {
      router.replace(`?view=month`, { scroll: false });
    } else {
      router.replace(`?view=day&date=${currentDate}`, { scroll: false });
    }
  }

  function handleDayClick(date: string) {
    setCurrentDate(date);
    setView('day');
    router.replace(`?view=day&date=${date}`, { scroll: false });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <Header />

      <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-8">

        {/* Page title */}
        <div className="text-center mb-5">
          <h1 className="text-3xl font-bold text-amber-400 mb-1">每日農民曆</h1>
          <p className="text-amber-200/60 text-sm">黃道吉日・宜忌時辰・神位方向</p>
        </div>

        {/* View toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-900 rounded-xl p-1 border border-amber-900/40 flex gap-1">
            <button
              onClick={() => handleViewSwitch('day')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'day' ? 'bg-amber-700 text-white' : 'text-gray-400 hover:text-amber-300'}`}
            >
              日詳情
            </button>
            <button
              onClick={() => handleViewSwitch('month')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'month' ? 'bg-amber-700 text-white' : 'text-gray-400 hover:text-amber-300'}`}
            >
              月曆視圖
            </button>
          </div>
        </div>

        {view === 'day' ? (
          <DayDetail
            currentDate={currentDate}
            onNavigate={handleNavigate}
            today={today}
          />
        ) : (
          <MonthCalendar
            initialYear={todayYear}
            initialMonth={todayMonth}
            today={today}
            onDayClick={handleDayClick}
          />
        )}

      </main>

      <Footer />
    </div>
  );
}
