'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Palace {
  gong: number;
  gongName: string;
  row: number;
  col: number;
  diPanStem: string;
  tianXing: string;
  baMen: string;
  baShen: string;
  isValueFu: boolean;
  isValueShui: boolean;
}

interface PaiPanResult {
  date: string;
  hour: number;
  hourGanZhi: string;
  dayGanZhi: string;
  jieQi: string;
  jieQiDay: number;
  yuan: string;
  yinYang: string;
  juShu: number;
  xunShouLiuYi: string;
  xunShouGong: number;
  valueFuXing: string;
  valueFuGong: number;
  valueShuiMen: string;
  valueShuiGong: number;
  palaces: Palace[];
}

const JI_XIONG_COLOR: Record<string, string> = {
  '休門': 'text-amber-300',
  '生門': 'text-amber-300',
  '開門': 'text-amber-300',
  '傷門': 'text-gray-300',
  '杜門': 'text-gray-300',
  '景門': 'text-gray-300',
  '死門': 'text-red-400',
  '驚門': 'text-red-400',
  '無門': 'text-gray-500',
};

const XING_COLOR: Record<string, string> = {
  '天心': 'text-amber-300',
  '天任': 'text-amber-300',
  '天輔': 'text-amber-300',
  '天沖': 'text-gray-300',
  '天英': 'text-gray-300',
  '天柱': 'text-gray-300',
  '天芮': 'text-red-400',
  '天蓬': 'text-red-400',
  '天禽': 'text-gray-400',
};

const SHEN_COLOR: Record<string, string> = {
  '值符': 'text-amber-400',
  '九天': 'text-amber-300',
  '九地': 'text-amber-300',
  '太陰': 'text-amber-300',
  '六合': 'text-amber-300',
  '騰蛇': 'text-red-400',
  '白虎': 'text-red-400',
  '玄武': 'text-red-400',
};

function PalaceCell({ palace }: { palace: Palace }) {
  const isCenter = palace.gong === 5;
  const borderClass = palace.isValueFu
    ? 'border-amber-400 border-2'
    : palace.isValueShui
    ? 'border-blue-400 border-2'
    : 'border-gray-600';

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-2 border ${borderClass} rounded ${
        isCenter ? 'bg-gray-800/60' : 'bg-gray-900/60'
      } min-h-[110px]`}
    >
      {/* Gong label top-left */}
      <span className="absolute top-1 left-2 text-xs text-gray-500">
        {palace.gongName}({palace.gong})
      </span>

      {/* Markers top-right */}
      <div className="absolute top-1 right-2 flex gap-1 text-[10px]">
        {palace.isValueFu && (
          <span className="bg-amber-600/80 text-white px-1 rounded">符</span>
        )}
        {palace.isValueShui && (
          <span className="bg-blue-600/80 text-white px-1 rounded">使</span>
        )}
      </div>

      {/* 八神 */}
      <span className={`text-xs font-medium ${SHEN_COLOR[palace.baShen] ?? 'text-gray-400'}`}>
        {palace.baShen}
      </span>

      {/* 天星 */}
      <span className={`text-sm font-bold mt-0.5 ${XING_COLOR[palace.tianXing] ?? 'text-gray-300'}`}>
        {palace.tianXing}
      </span>

      {/* 八門 */}
      <span className={`text-sm font-medium ${JI_XIONG_COLOR[palace.baMen] ?? 'text-gray-400'}`}>
        {palace.baMen}
      </span>

      {/* 地盤天干 */}
      <span className="text-base font-bold text-teal-300 mt-0.5">
        {palace.diPanStem}
      </span>
    </div>
  );
}

export default function QiMenPage() {
  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const defaultHour = today.getHours();

  const [date, setDate] = useState(defaultDate);
  const [hour, setHour] = useState(defaultHour);
  const [result, setResult] = useState<PaiPanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/QiMen/paipan?date=${date}&hour=${hour}`);
      if (!res.ok) {
        const msg = await res.text();
        setError(msg || `HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  // Build 3x3 grid from palaces
  function buildGrid(palaces: Palace[]) {
    const grid: (Palace | null)[][] = Array.from({ length: 3 }, () => Array(3).fill(null));
    for (const p of palaces) {
      grid[p.row][p.col] = p;
    }
    return grid;
  }

  const HOUR_LABELS = [
    '子(23)', '子(0)', '丑(1)', '丑(2)', '寅(3)', '寅(4)',
    '卯(5)', '卯(6)', '辰(7)', '辰(8)', '巳(9)', '巳(10)',
    '午(11)', '午(12)', '未(13)', '未(14)', '申(15)', '申(16)',
    '酉(17)', '酉(18)', '戌(19)', '戌(20)', '亥(21)', '亥(22)',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-amber-400 mb-6">奇門遁甲排盤（妙派）</h1>

        {/* Input */}
        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm text-gray-400 mb-1">日期</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">時辰（24時制）</label>
            <select
              value={hour}
              onChange={e => setHour(Number(e.target.value))}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
            >
              {HOUR_LABELS.map((label, h) => (
                <option key={h} value={h}>{String(h).padStart(2,'0')}時 {label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-5 py-2 rounded font-medium"
          >
            {loading ? '排盤中...' : '排盤'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-600 rounded p-3 mb-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {result && (
          <>
            {/* Metadata */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-400">日干支</span>
                <div className="text-white font-medium">{result.dayGanZhi}</div>
              </div>
              <div>
                <span className="text-gray-400">時干支</span>
                <div className="text-white font-medium">{result.hourGanZhi}</div>
              </div>
              <div>
                <span className="text-gray-400">節氣</span>
                <div className="text-white font-medium">{result.jieQi} 第{result.jieQiDay}天</div>
              </div>
              <div>
                <span className="text-gray-400">元局</span>
                <div className="text-amber-300 font-bold">{result.yinYang} {result.yuan} {result.juShu}局</div>
              </div>
              <div>
                <span className="text-gray-400">旬首六儀</span>
                <div className="text-teal-300 font-medium">{result.xunShouLiuYi}（{result.xunShouGong}宮）</div>
              </div>
              <div>
                <span className="text-gray-400">值符天星</span>
                <div className="text-amber-400 font-medium">{result.valueFuXing}（{result.valueFuGong}宮）</div>
              </div>
              <div>
                <span className="text-gray-400">值使門</span>
                <div className="text-blue-300 font-medium">{result.valueShuiMen}（{result.valueShuiGong}宮）</div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs text-gray-400 mb-3">
              <span><span className="inline-block w-3 h-3 bg-amber-600/80 rounded mr-1 align-middle"></span>值符宮</span>
              <span><span className="inline-block w-3 h-3 bg-blue-600/80 rounded mr-1 align-middle"></span>值使宮</span>
              <span className="ml-2">每格由上到下：八神 / 天星 / 八門 / 地盤天干</span>
            </div>

            {/* 9-Palace Grid */}
            <div className="grid grid-cols-3 gap-1">
              {buildGrid(result.palaces).map((row, ri) =>
                row.map((palace, ci) =>
                  palace ? (
                    <PalaceCell key={`${ri}-${ci}`} palace={palace} />
                  ) : (
                    <div key={`${ri}-${ci}`} className="min-h-[110px] border border-gray-700 rounded bg-gray-900/40" />
                  )
                )
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
