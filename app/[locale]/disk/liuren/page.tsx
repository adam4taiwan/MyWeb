'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_URL  = process.env.NEXT_PUBLIC_API_URL || '';

interface Position {
  idx: number;
  diPan: string;
  tianPan: string;
  tianJiang: string;
  isHourBranch: boolean;
  isDayBranch: boolean;
  isChuChuan: boolean;
  isZhongChuan: boolean;
  isMoChuan: boolean;
}

interface SiKe {
  label: string;
  tian: string;
  di: string;
  diNote: string;
}

interface PaiPanResult {
  date: string;
  hour: number;
  hourZhi: string;
  dayGanZhi: string;
  dayStem: string;
  dayBranch: string;
  jieQi: string;
  yueJiang: string;
  yueJiangName: string;
  isDay: string;
  guiRen: string;
  siKe: SiKe[];
  sanChuan: { fa: string; chu: string; zhong: string; mo: string };
  positions: Position[];
}

// 紫微斗數標準12格排列 (同格局)
// 格式: [row, col, zhiIdx]
// 上排左→右: 巳(5) 午(6) 未(7) 申(8)
// 右排上→下: 酉(9) 戌(10)
// 下排右→左: 亥(11) 子(0) 丑(1) 寅(2)
// 左排下→上: 卯(3) 辰(4)
const PALACE_MAP: [number, number, number][] = [
  [0,0,5],[0,1,6],[0,2,7],[0,3,8],
  [1,3,9],[2,3,10],
  [3,3,11],[3,2,0],[3,1,1],[3,0,2],
  [2,0,3],[1,0,4],
];

const JIANG_COLOR: Record<string, string> = {
  '貴人':'text-amber-300','青龍':'text-amber-300','太常':'text-amber-300',
  '六合':'text-amber-300','天后':'text-amber-300','太陰':'text-amber-300',
  '螣蛇':'text-red-400','朱雀':'text-red-400','白虎':'text-red-400',
  '玄武':'text-red-400','勾陳':'text-gray-400','天空':'text-gray-400',
};

export default function LiuRenPage() {
  const router = useRouter();
  const { token } = useAuth();

  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const [date, setDate]       = useState(defaultDate);
  const [hour, setHour]       = useState(today.getHours());
  const [result, setResult]   = useState<PaiPanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    fetch(`${API_URL}/Auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.isAdmin !== true) router.replace('/disk'); else setIsAdmin(true); })
      .catch(() => router.replace('/disk'));
  }, [token, router]);

  async function handleSubmit() {
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/LiuRen/paipan?date=${date}&hour=${hour}`);
      if (!res.ok) { setError(await res.text()); return; }
      setResult(await res.json());
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  }

  if (isAdmin === null) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const HOUR_LABELS = [
    '子(23)','子(0)','丑(1)','丑(2)','寅(3)','寅(4)',
    '卯(5)','卯(6)','辰(7)','辰(8)','巳(9)','巳(10)',
    '午(11)','午(12)','未(13)','未(14)','申(15)','申(16)',
    '酉(17)','酉(18)','戌(19)','戌(20)','亥(21)','亥(22)',
  ];

  const posMap = result
    ? Object.fromEntries(result.positions.map(p => [p.idx, p]))
    : {} as Record<number, Position>;

  // 宮格元件
  function PalaceCell({ zhiIdx }: { zhiIdx: number }) {
    const p = posMap[zhiIdx];
    if (!p) return <div className="border border-gray-700 rounded min-h-[72px] bg-gray-900/30" />;

    const chuanBorder = p.isChuChuan
      ? 'border-amber-400 border-2'
      : p.isZhongChuan
      ? 'border-blue-400 border-2'
      : p.isMoChuan
      ? 'border-purple-400 border-2'
      : 'border-gray-600';

    const ringClass = p.isHourBranch
      ? 'ring-2 ring-amber-500'
      : p.isDayBranch
      ? 'ring-2 ring-blue-500'
      : '';

    return (
      <div className={`border rounded p-1.5 text-center bg-gray-900/50 min-h-[72px] flex flex-col justify-between ${chuanBorder} ${ringClass}`}>
        {/* 天將 */}
        <div className={`text-[11px] font-medium leading-tight ${JIANG_COLOR[p.tianJiang] ?? 'text-gray-300'}`}>
          {p.tianJiang}
        </div>
        {/* 天盤 */}
        <div className="text-base font-bold text-teal-300 leading-tight">{p.tianPan}</div>
        {/* 地盤 */}
        <div className="text-[11px] text-gray-400">{p.diPan}</div>
      </div>
    );
  }

  // 三傳直排元件 (末在上, 初在下)
  function SanChuanVertical() {
    if (!result) return null;
    const items = [
      { label:'末傳', val: result.sanChuan.mo,    color:'text-purple-300', border:'border-purple-400' },
      { label:'中傳', val: result.sanChuan.zhong, color:'text-blue-300',   border:'border-blue-400'   },
      { label:'初傳', val: result.sanChuan.chu,   color:'text-amber-300',  border:'border-amber-400'  },
    ];
    return (
      <div className="flex flex-col gap-1 h-full justify-around py-1">
        {items.map(({ label, val, color, border }) => (
          <div key={label} className={`border rounded px-2 py-1 text-center bg-gray-800/40 ${border}`}>
            <div className="text-[9px] text-gray-500">{label}</div>
            <div className={`text-xl font-bold ${color}`}>{val}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-amber-400 mb-6">大六壬排盤（玉洞子）</h1>

        {/* 輸入 */}
        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm text-gray-400 mb-1">日期</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">時辰（24時制）</label>
            <select value={hour} onChange={e => setHour(Number(e.target.value))}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white">
              {HOUR_LABELS.map((lb, h) => (
                <option key={h} value={h}>{String(h).padStart(2,'0')}時 {lb}</option>
              ))}
            </select>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-5 py-2 rounded font-medium">
            {loading ? '排盤中...' : '起課'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-600 rounded p-3 mb-4 text-red-300 text-sm">{error}</div>
        )}

        {result && (
          <>
            {/* 元資訊 */}
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4 grid grid-cols-3 sm:grid-cols-6 gap-2 text-sm">
              <div><div className="text-gray-400 text-xs">日干支</div><div className="text-white font-medium">{result.dayGanZhi}</div></div>
              <div><div className="text-gray-400 text-xs">占時</div><div className="text-white font-medium">{result.hourZhi}時</div></div>
              <div><div className="text-gray-400 text-xs">節氣</div><div className="text-white">{result.jieQi}</div></div>
              <div><div className="text-gray-400 text-xs">月將</div><div className="text-amber-300 font-bold">{result.yueJiangName}（{result.yueJiang}）</div></div>
              <div><div className="text-gray-400 text-xs">晝夜</div><div className="text-white">{result.isDay}</div></div>
              <div><div className="text-gray-400 text-xs">貴人</div><div className="text-amber-300">{result.guiRen}</div></div>
            </div>

            {/* 說明 */}
            <div className="flex gap-4 text-xs text-gray-500 mb-2">
              <span><span className="inline-block w-2.5 h-2.5 rounded ring-2 ring-amber-500 mr-1 align-middle bg-transparent"></span>占時</span>
              <span><span className="inline-block w-2.5 h-2.5 rounded ring-2 ring-blue-500 mr-1 align-middle bg-transparent"></span>日支</span>
              <span><span className="inline-block w-2.5 h-2.5 border-2 border-amber-400 rounded mr-1 align-middle bg-transparent"></span>初傳</span>
              <span><span className="inline-block w-2.5 h-2.5 border-2 border-blue-400 rounded mr-1 align-middle bg-transparent"></span>中傳</span>
              <span><span className="inline-block w-2.5 h-2.5 border-2 border-purple-400 rounded mr-1 align-middle bg-transparent"></span>末傳</span>
              <span className="ml-auto">天將 / 天盤 / 地盤</span>
            </div>

            {/* 標準12格 + 中央三傳 */}
            <div className="grid grid-cols-4 gap-1 mb-5">
              {/* Row 0: 巳 午 未 申 */}
              <PalaceCell zhiIdx={5} />
              <PalaceCell zhiIdx={6} />
              <PalaceCell zhiIdx={7} />
              <PalaceCell zhiIdx={8} />

              {/* Row 1: 辰 [center-top-left] [center-top-right] 酉 */}
              <PalaceCell zhiIdx={4} />
              <div className="col-span-2 row-span-2 border border-gray-700 rounded bg-gray-900/20 p-1">
                <div className="text-[10px] text-gray-500 text-center mb-1">
                  三傳（{result.sanChuan.fa}）
                </div>
                <SanChuanVertical />
              </div>
              <PalaceCell zhiIdx={9} />

              {/* Row 2: 卯 [center已佔] 戌 */}
              <PalaceCell zhiIdx={3} />
              <PalaceCell zhiIdx={10} />

              {/* Row 3: 寅 丑 子 亥 */}
              <PalaceCell zhiIdx={2} />
              <PalaceCell zhiIdx={1} />
              <PalaceCell zhiIdx={0} />
              <PalaceCell zhiIdx={11} />
            </div>

            {/* 四課：第一課最右，從右至左排列 */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">四課（第一課在右，從右至左）</div>
              <div className="grid grid-cols-4 gap-2">
                {[...result.siKe].reverse().map((k, i) => (
                  <div key={i} className="bg-gray-800/50 border border-gray-600 rounded p-2 text-center">
                    <div className="text-[10px] text-gray-500 mb-1">{k.label}</div>
                    <div className="text-teal-300 font-bold text-xl leading-tight">{k.tian}</div>
                    <div className="border-t border-gray-600 mt-1 pt-1">
                      <span className="text-white font-medium">{k.di}</span>
                      {k.diNote && <span className="text-gray-500 text-[10px] ml-1">({k.diNote})</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 三傳大字展示 */}
            <div>
              <div className="text-sm text-gray-400 mb-2">三傳（{result.sanChuan.fa}）</div>
              <div className="flex gap-3">
                {[
                  { label:'末傳', val: result.sanChuan.mo,    color:'text-purple-300', border:'border-purple-400' },
                  { label:'中傳', val: result.sanChuan.zhong, color:'text-blue-300',   border:'border-blue-400'   },
                  { label:'初傳', val: result.sanChuan.chu,   color:'text-amber-300',  border:'border-amber-400'  },
                ].map(({ label, val, color, border }) => (
                  <div key={label} className={`flex-1 border-2 rounded p-3 text-center bg-gray-800/40 ${border}`}>
                    <div className="text-xs text-gray-400 mb-1">{label}</div>
                    <div className={`text-3xl font-bold ${color}`}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
