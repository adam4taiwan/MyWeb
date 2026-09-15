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

// 六壬盤: 以午(6)為上方，順時針排列的外圈位置順序
// 上排(row0): 巳 午 未 → idx 5,6,7
// 右排(row1): 辰       申 → idx 4,8
// 右排(row2): 卯       酉 → idx 3,9
// 下排(row3): 寅       戌 → idx 2,10
// 下排(row4): 丑 子 亥 → idx 1,0,11
const CIRCLE_LAYOUT = [
  // row, col (5-col grid: 0..4)
  [0,1],[0,2],[0,3], // 巳(5)午(6)未(7)
  [1,4],             // 申(8)
  [2,4],             // 酉(9)
  [3,4],             // 戌(10)
  [4,3],[4,2],[4,1], // 亥(11)子(0)丑(1)
  [3,0],             // 寅(2)
  [2,0],             // 卯(3)
  [1,0],             // 辰(4)
] as const;
// 對應地支 idx (依上圖位置):
const LAYOUT_ZHI_ORDER = [5,6,7,8,9,10,11,0,1,2,3,4];

const JIANG_COLOR: Record<string, string> = {
  '貴人': 'text-amber-300',
  '青龍': 'text-amber-300',
  '太常': 'text-amber-300',
  '六合': 'text-amber-300',
  '天后': 'text-amber-300',
  '太陰': 'text-amber-300',
  '螣蛇': 'text-red-400',
  '朱雀': 'text-red-400',
  '白虎': 'text-red-400',
  '玄武': 'text-red-400',
  '勾陳': 'text-gray-400',
  '天空': 'text-gray-400',
};

const CHUAN_COLOR: Record<string, string> = {
  'chu':   'bg-amber-600/30 border-amber-400',
  'zhong': 'bg-blue-600/30 border-blue-400',
  'mo':    'bg-purple-600/30 border-purple-400',
};

export default function LiuRenPage() {
  const router = useRouter();
  const { token } = useAuth();

  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const defaultHour = today.getHours();

  const [date, setDate]       = useState(defaultDate);
  const [hour, setHour]       = useState(defaultHour);
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

  // 建立 idx→position 快速查找
  const posMap = result
    ? Object.fromEntries(result.positions.map(p => [p.idx, p]))
    : {};

  function PosCell({ zhiIdx }: { zhiIdx: number }) {
    const p = posMap[zhiIdx] as Position | undefined;
    if (!p) return <div />;
    const chuanType = p.isChuChuan ? 'chu' : p.isZhongChuan ? 'zhong' : p.isMoChuan ? 'mo' : '';
    const border = chuanType ? CHUAN_COLOR[chuanType] : 'border-gray-600';
    return (
      <div className={`border rounded p-1 text-center text-xs leading-tight ${border} ${p.isHourBranch ? 'ring-1 ring-amber-400' : ''} ${p.isDayBranch ? 'ring-1 ring-blue-400' : ''}`}>
        <div className={`font-medium ${JIANG_COLOR[p.tianJiang] ?? 'text-gray-300'}`}>{p.tianJiang}</div>
        <div className="text-teal-300 font-bold text-sm">{p.tianPan}</div>
        <div className="text-gray-400 text-[10px]">{p.diPan}</div>
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
            <div className="bg-gray-800/50 rounded-lg p-4 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><span className="text-gray-400">日干支</span><div className="text-white font-medium">{result.dayGanZhi}</div></div>
              <div><span className="text-gray-400">占時</span><div className="text-white font-medium">{String(result.hour).padStart(2,'0')}時 {result.hourZhi}時</div></div>
              <div><span className="text-gray-400">節氣</span><div className="text-white font-medium">{result.jieQi}</div></div>
              <div><span className="text-gray-400">月將</span><div className="text-amber-300 font-bold">{result.yueJiangName}（{result.yueJiang}）</div></div>
              <div><span className="text-gray-400">晝夜</span><div className="text-white">{result.isDay}</div></div>
              <div><span className="text-gray-400">貴人</span><div className="text-amber-300">{result.guiRen}</div></div>
              <div><span className="text-gray-400">三傳法</span><div className="text-gray-300">{result.sanChuan.fa}</div></div>
            </div>

            {/* 天盤圓盤 (5×5 grid，中間空) */}
            <div className="mb-5">
              <div className="text-sm text-gray-400 mb-2">天將 / 天盤 / 地盤（每格由上到下）
                <span className="ml-3 text-amber-400 text-xs">■ 占時</span>
                <span className="ml-2 text-blue-400 text-xs">■ 日支</span>
                <span className="ml-3 text-amber-400/60 text-xs">初傳</span>
                <span className="ml-1 text-blue-400/60 text-xs">中傳</span>
                <span className="ml-1 text-purple-400/60 text-xs">末傳</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 5 }).map((_, row) =>
                  Array.from({ length: 5 }).map((_, col) => {
                    // 中央 3 格
                    if (row >= 1 && row <= 3 && col >= 1 && col <= 3) {
                      // 中心格顯示三傳
                      if (row === 2 && col === 2) return (
                        <div key={`${row}-${col}`} className="flex flex-col items-center justify-center p-1 text-center bg-gray-800/30 rounded border border-gray-700">
                          <div className="text-[10px] text-gray-400 mb-1">三傳</div>
                          <div className="flex gap-2 text-sm font-bold">
                            <span className="text-amber-300">{result.sanChuan.chu}</span>
                            <span className="text-blue-300">{result.sanChuan.zhong}</span>
                            <span className="text-purple-300">{result.sanChuan.mo}</span>
                          </div>
                          <div className="text-[9px] text-gray-500 mt-1">初 中 末</div>
                        </div>
                      );
                      return <div key={`${row}-${col}`} />;
                    }
                    // 找對應地支
                    const layoutIdx = CIRCLE_LAYOUT.findIndex(([r,c]) => r === row && c === col);
                    if (layoutIdx === -1) return <div key={`${row}-${col}`} />;
                    const zhiIdx = LAYOUT_ZHI_ORDER[layoutIdx];
                    return <PosCell key={`${row}-${col}`} zhiIdx={zhiIdx} />;
                  })
                )}
              </div>
            </div>

            {/* 四課 */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">四課（右一課→左四課）</div>
              <div className="grid grid-cols-4 gap-2">
                {result.siKe.map((k, i) => (
                  <div key={i} className="bg-gray-800/50 border border-gray-600 rounded p-2 text-center">
                    <div className="text-[10px] text-gray-500 mb-1">{k.label}</div>
                    <div className="text-teal-300 font-bold text-lg leading-tight">{k.tian}</div>
                    <div className="border-t border-gray-600 mt-1 pt-1">
                      <span className="text-white font-medium">{k.di}</span>
                      {k.diNote && <span className="text-gray-500 text-[10px] ml-1">({k.diNote})</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 三傳 */}
            <div>
              <div className="text-sm text-gray-400 mb-2">三傳（{result.sanChuan.fa}）</div>
              <div className="flex gap-3">
                {[
                  { label:'初傳', val: result.sanChuan.chu,   color:'text-amber-300 border-amber-400'   },
                  { label:'中傳', val: result.sanChuan.zhong, color:'text-blue-300 border-blue-400'     },
                  { label:'末傳', val: result.sanChuan.mo,    color:'text-purple-300 border-purple-400' },
                ].map(({ label, val, color }) => (
                  <div key={label} className={`flex-1 border rounded p-3 text-center bg-gray-800/40 ${color}`}>
                    <div className="text-[10px] text-gray-400 mb-1">{label}</div>
                    <div className={`text-2xl font-bold ${color.split(' ')[0]}`}>{val}</div>
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
