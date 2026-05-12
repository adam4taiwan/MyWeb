'use client';

import { useState, useEffect, useCallback } from 'react';

interface MingGongPalace {
  palName: string;
  branch: string;
  dir: string;
  starChar: string;
  goodStar: string;
  badStar: string;
  yearGod: string;
  yearDesc: string;
  yearType: string;
}

interface MingGongData {
  chart: string;
  year: number;
  flowYear: string;
  mingGong: string;
  mingGongStar: string;
  palaces: MingGongPalace[];
}

interface Props {
  token: string;
  apiUrl: string;
  initialYear?: number;
  showYearSelector?: boolean;
}

const YEAR_GOD_BORDER: Record<string, string> = {
  '青龍': 'border-amber-400 bg-amber-50',
  '貴神': 'border-green-400 bg-green-50',
  '六合': 'border-green-400 bg-green-50',
  '太歲': 'border-gray-300 bg-gray-50',
  '朱雀': 'border-orange-300 bg-orange-50',
  '小耗': 'border-orange-400 bg-orange-50',
  '喪門': 'border-red-400 bg-red-50',
  '官符': 'border-red-400 bg-red-50',
  '白虎': 'border-red-400 bg-red-50',
  '吊客': 'border-red-400 bg-red-50',
  '病符': 'border-red-400 bg-red-50',
  '大耗': 'border-red-600 bg-red-100',
};

const YEAR_GOD_TEXT: Record<string, string> = {
  '青龍': 'text-amber-700 font-bold',
  '貴神': 'text-green-700',
  '六合': 'text-green-700',
  '太歲': 'text-gray-600',
  '朱雀': 'text-orange-500',
  '小耗': 'text-orange-600',
  '喪門': 'text-red-600',
  '官符': 'text-red-600',
  '白虎': 'text-red-600',
  '吊客': 'text-red-600',
  '病符': 'text-red-600',
  '大耗': 'text-red-700 font-bold',
};

// 4x4 grid index → palace array index (-1 = empty)
const GRID_TO_PAL = [9, 8, 7, 6, 10, -1, -1, 5, 11, -1, -1, 4, 0, 1, 2, 3];
const STD_ORDER = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const SANHE_GROUPS = [[1,5,9],[2,6,10],[3,7,11],[4,8,12]];

export default function MingGongChart({ token, apiUrl, initialYear, showYearSelector = true }: Props) {
  const curYear = new Date().getFullYear();
  const [year, setYear] = useState(initialYear ?? curYear);
  const [data, setData] = useState<MingGongData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPalIdx, setSelectedPalIdx] = useState<number | null>(null);

  const fetchChart = useCallback(async (yr: number) => {
    if (!token) return;
    setLoading(true);
    setError('');
    setSelectedPalIdx(null);
    try {
      const res = await fetch(`${apiUrl}/Consultation/ming-gong-chart?year=${yr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setData(await res.json());
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err?.error || '載入失敗，請先完成命盤分析');
      }
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [token, apiUrl]);

  useEffect(() => {
    fetchChart(year);
  }, [fetchChart, year]);

  if (loading) return (
    <div className="py-10 text-center">
      <div className="inline-block w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-sm text-gray-400">歲星臨命圖載入中...</p>
    </div>
  );

  if (error) return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 text-center">
      {error}
    </div>
  );

  if (!data) return null;

  // 命宮、沖、三合 FlowIDs（子=1序，永遠不變）
  const mgFlowId = STD_ORDER.indexOf(data.mingGong) + 1;
  const chongFlowId = ((mgFlowId - 1 + 6) % 12) + 1;
  const sanheGroup = SANHE_GROUPS.find(g => g.includes(mgFlowId)) ?? [];
  const sanheFlowIds = sanheGroup.filter(id => id !== mgFlowId);

  const renderCell = (palIdx: number) => {
    const p = data.palaces[palIdx];
    const palFlowId = STD_ORDER.indexOf(p.branch) + 1;
    const isMingGong = palFlowId === mgFlowId;
    const isChong    = palFlowId === chongFlowId;
    const isSanhe    = sanheFlowIds.includes(palFlowId);
    const isSelected = selectedPalIdx === palIdx;

    const bgBase = YEAR_GOD_BORDER[p.yearGod] ?? 'border-gray-200 bg-white';
    const txt    = YEAR_GOD_TEXT[p.yearGod] ?? 'text-gray-600';
    const ringCls = isSelected    ? 'ring-2 ring-blue-400' :
                    isMingGong    ? 'ring-[3px] ring-gray-900' :
                    (isChong || isSanhe) ? 'ring-[3px] ring-blue-500' : '';
    const badge = isMingGong ? (
      <span className="text-[8px] bg-gray-900 text-white px-1 rounded leading-none">小限</span>
    ) : isChong ? (
      <span className="text-[8px] bg-blue-500 text-white px-1 rounded leading-none">沖</span>
    ) : isSanhe ? (
      <span className="text-[8px] bg-blue-500 text-white px-1 rounded leading-none">三合</span>
    ) : null;

    return (
      <button
        key={palIdx}
        onClick={() => setSelectedPalIdx(isSelected ? null : palIdx)}
        className={`border-2 rounded-lg p-1.5 text-left transition-all w-full h-full min-h-[76px] ${bgBase} ${ringCls} hover:opacity-80`}
      >
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-[10px] font-bold text-gray-500 leading-none">{p.palName}</p>
          {badge}
        </div>
        <p className="text-xs font-bold text-gray-800">{p.branch}</p>
        <p className={`text-[11px] mt-0.5 leading-none ${txt}`}>{p.yearGod || '-'}</p>
        {p.goodStar && <p className="text-[9px] text-green-600 mt-0.5 leading-tight truncate">{p.goodStar}</p>}
        {p.badStar && <p className="text-[9px] text-red-500 leading-tight truncate">{p.badStar}</p>}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="text-gray-600">命宮：<strong className="text-gray-900">{data.mingGong}</strong></span>
          <span className="text-gray-600">命宮星：<strong className="text-amber-700">{data.mingGongStar}</strong></span>
          <span className="text-gray-600">流年：<strong className="text-gray-900">{data.flowYear}（{data.year}年）</strong></span>
        </div>
        {showYearSelector && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { const y = year - 1; setYear(y); fetchChart(y); }}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm"
            >{'<'}</button>
            <span className="text-sm font-bold text-gray-700 w-14 text-center">{year} 年</span>
            <button
              onClick={() => { const y = year + 1; setYear(y); fetchChart(y); }}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm"
            >{'>'}</button>
          </div>
        )}
      </div>

      {/* 12-palace grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {GRID_TO_PAL.map((palIdx, gridPos) =>
          palIdx === -1 ? (
            <div key={gridPos} className="min-h-[76px] rounded-lg bg-gray-50" />
          ) : renderCell(palIdx)
        )}
      </div>

      {/* Selected palace detail */}
      {selectedPalIdx !== null && (() => {
        const p = data.palaces[selectedPalIdx];
        return (
          <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900">{p.palName}（{p.branch}）{p.dir}</p>
              <button onClick={() => setSelectedPalIdx(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">x</button>
            </div>
            {p.yearGod && (
              <p className="text-sm">
                <span className="font-bold text-gray-700">年神：</span>
                <span className={YEAR_GOD_TEXT[p.yearGod] ?? 'text-gray-600'}>{p.yearGod}</span>
              </p>
            )}
            {p.yearDesc && <p className="text-sm text-gray-700 leading-relaxed">{p.yearDesc}</p>}
            {p.yearType && <p className="text-xs text-blue-600">影響面向：{p.yearType}</p>}
            {p.goodStar && <p className="text-sm text-green-700">吉星：{p.goodStar}</p>}
            {p.badStar  && <p className="text-sm text-red-600">凶星：{p.badStar}</p>}
          </div>
        );
      })()}

      {/* Legend */}
      <div className="space-y-1.5 pt-1 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-center">
          <span className="px-2 py-1 rounded border ring-2 ring-gray-900 bg-white text-gray-900">小限（命宮）</span>
          <span className="px-2 py-1 rounded border ring-2 ring-blue-500 bg-white text-blue-600">三合宮 / 沖宮</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center">
          {[
            { label: '大吉 青龍', cls: 'bg-amber-100 text-amber-700 border border-amber-300' },
            { label: '吉 六合 貴神', cls: 'bg-green-100 text-green-700 border border-green-300' },
            { label: '中性 太歲', cls: 'bg-gray-100 text-gray-600 border border-gray-300' },
            { label: '小凶 朱雀 小耗', cls: 'bg-orange-100 text-orange-600 border border-orange-300' },
            { label: '凶 白虎 喪門等', cls: 'bg-red-100 text-red-600 border border-red-400' },
            { label: '大凶 大耗', cls: 'bg-red-200 text-red-700 border border-red-600' },
          ].map(({ label, cls }) => (
            <span key={label} className={`px-2 py-1 rounded ${cls}`}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
