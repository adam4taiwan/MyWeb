'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 121 }, (_, i) => currentYear - i);
};
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);

const LUNAR_MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '臘'];
const LUNAR_DAY_NAMES = [
  '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

interface LunarInfo {
  lunarMonth: number;
  lunarDay: number;
  yearGanzhi: string;
  monthGanzhi: string;
  dayGanzhi: string;
  solarTerm?: string;
  isLeap?: boolean;
}

export default function StudentPage() {
  const { token } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'http://localhost:5013/api'
      : 'https://ecanapi.fly.dev/api';

  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const [formData, setFormData] = useState({
    dateType: 'solar',
    name: '',
    gender: '1',
    year: 1990,
    month: 1,
    day: 1,
    hour: 6,
    minute: 0,
  });

  const [lunarInfo, setLunarInfo] = useState<LunarInfo | null>(null);
  const [lunarLoading, setLunarLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState('');

  // Check student whitelist access
  useEffect(() => {
    if (!token) { setAccessChecked(true); return; }
    fetch(`${API_URL}/Student/check-access`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : { hasAccess: false })
      .then(data => { setHasAccess(data.hasAccess); setAccessChecked(true); })
      .catch(() => setAccessChecked(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Lookup lunar date whenever solar date changes
  useEffect(() => {
    if (!formData.year || !formData.month || !formData.day) return;
    setLunarLoading(true);
    setLunarInfo(null);
    fetch(`${API_URL}/Calendar/${formData.year}/${formData.month}/${formData.day}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setLunarInfo({
            lunarMonth: data.lunarMonth,
            lunarDay: data.lunarDay,
            yearGanzhi: data.yearGanzhi,
            monthGanzhi: data.monthGanzhi,
            dayGanzhi: data.dayGanzhi,
            solarTerm: data.solarTerm || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLunarLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.year, formData.month, formData.day]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setDownloadMsg('');
  };

  const handleExportXLS = async () => {
    if (!token) { alert('請先登入'); return; }
    if (!formData.name.trim()) { alert('請輸入姓名'); return; }
    setIsLoading(true);
    setDownloadMsg('');
    try {
      const response = await fetch(`${API_URL}/Astrology/Export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.name}_命盤.xls`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setDownloadMsg('下載成功');
      } else {
        const errText = await response.text().catch(() => '');
        setDownloadMsg(`下載失敗 (${response.status})${errText ? '：' + errText : ''}`);
      }
    } catch (err) {
      setDownloadMsg(`下載錯誤：${String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLunar = (info: LunarInfo) => {
    const monthName = LUNAR_MONTH_NAMES[(info.lunarMonth - 1) % 12] ?? String(info.lunarMonth);
    const dayName = LUNAR_DAY_NAMES[info.lunarDay] ?? String(info.lunarDay);
    return `農曆 ${monthName}月${dayName}`;
  };

  // Not yet checked
  if (!accessChecked) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in
  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-300 text-lg mb-4">請先登入才能使用玉洞子專業排盤</p>
          <Link href="/login" className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition">前往登入</Link>
        </div>
      </div>
    );
  }

  // No access
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-amber-300 text-lg mb-2">此頁面僅供已登記學生使用</p>
          <p className="text-neutral-400 text-sm">請聯繫課程管理員開通存取權限</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 py-10 px-4">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-amber-200 text-sm">產生命盤中，請稍候...</p>
        </div>
      )}

      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-amber-300 mb-1">玉洞子專業排盤</h1>
          <p className="text-neutral-400 text-sm">輸入生辰資料，下載完整命盤 XLS</p>
        </div>

        <div className="bg-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">

          {/* Name */}
          <div>
            <label className="block text-sm text-amber-200 mb-1">姓名</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="請輸入姓名"
              className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm text-amber-200 mb-1">性別</label>
            <div className="flex gap-4">
              {[{ val: '1', label: '男' }, { val: '2', label: '女' }].map(g => (
                <label key={g.val} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="gender"
                    value={g.val}
                    checked={formData.gender === g.val}
                    onChange={() => handleChange('gender', g.val)}
                    className="accent-amber-500"
                  />
                  {g.label}
                </label>
              ))}
            </div>
          </div>

          {/* Birth date - solar */}
          <div>
            <label className="block text-sm text-amber-200 mb-1">出生日期（陽曆）</label>
            <div className="flex gap-2">
              <select
                value={formData.year}
                onChange={e => handleChange('year', Number(e.target.value))}
                className="flex-1 bg-neutral-700 border border-neutral-600 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                {generateYears().map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={formData.month}
                onChange={e => handleChange('month', Number(e.target.value))}
                className="w-20 bg-neutral-700 border border-neutral-600 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                {months.map(m => <option key={m} value={m}>{m} 月</option>)}
              </select>
              <select
                value={formData.day}
                onChange={e => handleChange('day', Number(e.target.value))}
                className="w-20 bg-neutral-700 border border-neutral-600 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                {days.map(d => <option key={d} value={d}>{d} 日</option>)}
              </select>
            </div>
          </div>

          {/* Lunar display */}
          <div className="bg-neutral-700/50 rounded-lg px-3 py-2 text-sm">
            {lunarLoading ? (
              <span className="text-neutral-400">查詢農曆中...</span>
            ) : lunarInfo ? (
              <div className="space-y-1">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-amber-200">
                  <span>{formatLunar(lunarInfo)}</span>
                  <span>年柱 {lunarInfo.yearGanzhi}</span>
                  <span>月柱 {lunarInfo.monthGanzhi}</span>
                  <span>日柱 {lunarInfo.dayGanzhi}</span>
                  {lunarInfo.solarTerm && <span className="text-emerald-300">節氣：{lunarInfo.solarTerm}</span>}
                </div>
              </div>
            ) : (
              <span className="text-neutral-500">選擇日期後自動顯示農曆</span>
            )}
          </div>

          {/* Birth time */}
          <div>
            <label className="block text-sm text-amber-200 mb-1">出生時間</label>
            <div className="flex gap-2">
              <select
                value={formData.hour}
                onChange={e => handleChange('hour', Number(e.target.value))}
                className="flex-1 bg-neutral-700 border border-neutral-600 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                {hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')} 時</option>)}
              </select>
              <select
                value={formData.minute}
                onChange={e => handleChange('minute', Number(e.target.value))}
                className="flex-1 bg-neutral-700 border border-neutral-600 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                {minutes.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')} 分</option>)}
              </select>
            </div>
          </div>

          {/* Download button */}
          <button
            onClick={handleExportXLS}
            disabled={isLoading}
            className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm shadow-md transition mt-2"
          >
            下載完整命盤 XLS
          </button>

          {downloadMsg && (
            <p className={`text-sm text-center ${downloadMsg.startsWith('下載成功') ? 'text-emerald-400' : 'text-red-400'}`}>
              {downloadMsg}
            </p>
          )}
        </div>

        <p className="text-center text-neutral-600 text-xs mt-6">此頁面僅供課程學生練習使用</p>
      </div>
    </div>
  );
}
