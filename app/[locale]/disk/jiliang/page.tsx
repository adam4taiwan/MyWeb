'use client';
import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  JiLiangApiData,
  BaziChart,
  Element,
  ELEMENT_NAMES,
  ELEMENT_COLORS,
  EARTHLY_BRANCH_DATA,
  FORTUNE_LEVELS,
  buildChartFromApi,
  calculateScores,
  getCalculationBreakdown,
  getTenGodsElements,
  getFortuneAnalysis,
  generateDynamicTimeline,
  mapStemToElement,
  DynamicYearScore,
  DaYunPeriod,
} from './calculator';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const ALL_ELEMENTS: Element[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

interface CustomerItem {
  id: number;
  name: string;
  customerCode: string;
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
  birthHour?: number;
  birthMinute?: number;
  birthGender?: number;
  dateType?: string;
}

// ---- Helper Components ----

function ElementBadge({ el }: { el: Element }) {
  const c = ELEMENT_COLORS[el];
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${c.badge}`}>
      {ELEMENT_NAMES[el]}
    </span>
  );
}

function PillarCard({ label, stem, branch }: { label: string; stem: string; branch: string }) {
  const stemEl = mapStemToElement(stem);
  const branchEl = EARTHLY_BRANCH_DATA[branch]?.mainElement || 'Earth';
  return (
    <div className="bg-stone-800 border border-stone-700 rounded-lg p-3 text-center">
      <div className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-2xl font-bold mb-0.5 ${ELEMENT_COLORS[stemEl].text}`}>{stem}</div>
      <div className={`text-xl font-bold ${ELEMENT_COLORS[branchEl].text}`}>{branch}</div>
      <div className="mt-1 flex justify-center gap-1">
        <ElementBadge el={stemEl} />
        <ElementBadge el={branchEl} />
      </div>
    </div>
  );
}

function ScoreBar({ label, score, maxScore, color }: { label: string; score: number; maxScore: number; color: string }) {
  const pct = Math.min(100, (score / maxScore) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-400 w-6 text-right">{label}</span>
      <div className="flex-1 bg-stone-700 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-stone-300 w-10 text-right">{score.toFixed(1)}</span>
    </div>
  );
}

// ---- Tab: 計量引擎 ----

function EngineTab({ chart, apiData }: { chart: BaziChart; apiData: JiLiangApiData }) {
  const { scores, breakdown } = useMemo(() => getCalculationBreakdown(chart), [chart]);
  const maxScore = Math.max(...Object.values(scores), 1);

  const radarData = ALL_ELEMENTS.map(el => ({
    subject: ELEMENT_NAMES[el],
    score: scores[el],
    fullMark: 120,
  }));

  const dayMaster = chart.heavenlyStems[2];
  const tenGods = getTenGodsElements(dayMaster);
  const selfScore = scores[tenGods.self] || 0;
  const resourceScore = scores[tenGods.resource] || 0;
  const supportScore = selfScore + resourceScore;
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const supportRatio = totalScore > 0 ? supportScore / totalScore : 0.5;
  const bodyLabel = supportRatio >= 0.65 ? '極旺' : supportRatio >= 0.5 ? '偏旺' : supportRatio >= 0.42 ? '中和' : supportRatio >= 0.2 ? '偏弱' : '極弱';

  return (
    <div className="space-y-6">
      {/* 四柱排盤 */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl p-5">
        <div className="text-xs text-amber-400 uppercase tracking-widest mb-3 font-bold">四柱排盤</div>
        <div className="grid grid-cols-4 gap-3">
          {(['年柱', '月柱', '日柱', '時柱'] as const).map((label, i) => (
            <PillarCard
              key={i}
              label={label}
              stem={chart.heavenlyStems[i]}
              branch={chart.earthlyBranches[i].name}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-stone-300">
          <span className="bg-stone-800 px-3 py-1 rounded-lg">
            日主：<span className={`font-bold ${ELEMENT_COLORS[tenGods.self].text}`}>{dayMaster}（{ELEMENT_NAMES[tenGods.self]}）</span>
          </span>
          <span className="bg-stone-800 px-3 py-1 rounded-lg">
            身強弱：<span className="font-bold text-amber-300">{bodyLabel}（生扶 {(supportRatio * 100).toFixed(1)}%）</span>
          </span>
          <span className="bg-stone-800 px-3 py-1 rounded-lg">
            格局：<span className="font-bold text-amber-300">{apiData.pattern}</span>
          </span>
          <span className="bg-stone-800 px-3 py-1 rounded-lg">
            用神：<span className="font-bold text-green-400">【{apiData.yongShenElem}】</span>
          </span>
          {apiData.fuYiElem && (
            <span className="bg-stone-800 px-3 py-1 rounded-lg">
              喜神：<span className="font-bold text-blue-400">【{apiData.fuYiElem}】</span>
            </span>
          )}
          {apiData.jiShenElem && (
            <span className="bg-stone-800 px-3 py-1 rounded-lg">
              忌神：<span className="font-bold text-red-400">【{apiData.jiShenElem}】</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 四階梯計量 */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-700 rounded-xl p-5 space-y-5">
          <div className="text-xs text-amber-400 uppercase tracking-widest font-bold">四階梯計量引擎</div>

          {/* 五行總分條 */}
          <div className="space-y-2">
            <div className="text-xs text-stone-400 mb-2">原局五行總分</div>
            {ALL_ELEMENTS.map(el => (
              <ScoreBar
                key={el}
                label={ELEMENT_NAMES[el]}
                score={scores[el]}
                maxScore={maxScore}
                color={ELEMENT_COLORS[el].badge.split(' ')[0]}
              />
            ))}
          </div>

          {/* 階梯一 */}
          <div>
            <div className="text-xs text-amber-300 font-bold mb-2">階梯一：天干透干（+10 分/干）</div>
            <div className="flex flex-wrap gap-2">
              {breakdown.tier1Stems.map((t, i) => (
                <span key={i} className={`text-xs px-2 py-1 rounded border ${ELEMENT_COLORS[t.element].border} ${ELEMENT_COLORS[t.element].text}`}>
                  {t.pillar} {t.stem}（{ELEMENT_NAMES[t.element]}） +{t.points}
                </span>
              ))}
            </div>
          </div>

          {/* 階梯二 */}
          <div>
            <div className="text-xs text-amber-300 font-bold mb-2">階梯二：地支通根（本氣 +15，藏干 +5）</div>
            <div className="grid grid-cols-2 gap-2">
              {breakdown.tier2Branches.map((b, i) => (
                <div key={i} className="bg-stone-800 rounded p-2 text-xs space-y-1">
                  <div className={`font-bold ${ELEMENT_COLORS[b.main.element].text}`}>{b.pillar} {b.branch} 本氣（{ELEMENT_NAMES[b.main.element]}） +{b.main.points}</div>
                  {b.hidden.map((h, j) => (
                    <div key={j} className={`text-stone-400 ${ELEMENT_COLORS[h.element].text}`}>
                      &nbsp;&nbsp;藏干 {h.stem}（{ELEMENT_NAMES[h.element]}） +{h.points}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 階梯三 */}
          {breakdown.tier3GongHui.length > 0 && (
            <div>
              <div className="text-xs text-amber-300 font-bold mb-2">階梯三：暗拱暗會（+12 分）</div>
              <div className="space-y-1">
                {breakdown.tier3GongHui.map((g, i) => (
                  <div key={i} className={`text-xs px-2 py-1 rounded ${ELEMENT_COLORS[g.targetElement].bg} ${ELEMENT_COLORS[g.targetElement].text}`}>
                    {g.explanation}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 階梯四 */}
          <div>
            <div className="text-xs text-amber-300 font-bold mb-2">階梯四：月令司令加權（×1.3）</div>
            <div className="text-xs text-stone-300 bg-stone-800 rounded px-3 py-2">
              月支【{breakdown.tier4MonthWeight.monthBranch}】本氣（{ELEMENT_NAMES[breakdown.tier4MonthWeight.monthElement]}）：
              {breakdown.tier4MonthWeight.originalScore} × 1.3 =
              <span className={`font-bold ml-1 ${ELEMENT_COLORS[breakdown.tier4MonthWeight.monthElement].text}`}>
                {breakdown.tier4MonthWeight.finalScore}
              </span>
            </div>
          </div>
        </div>

        {/* 五行雷達圖 */}
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-5">
          <div className="text-xs text-amber-400 uppercase tracking-widest font-bold mb-4">五行能量雷達圖</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#44403c" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#d6d3d1', fontSize: 13 }} />
              <PolarRadiusAxis tick={{ fill: '#78716c', fontSize: 9 }} />
              <Radar dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
              <Tooltip
                contentStyle={{ background: '#1c1917', border: '1px solid #44403c', color: '#d6d3d1', fontSize: 12 }}
                formatter={(v: number | undefined) => [`${(v ?? 0).toFixed(1)} 分`, '能量']}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {ALL_ELEMENTS.map(el => (
              <div key={el} className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full inline-block`} style={{ background: ELEMENT_COLORS[el].hex }} />
                <span className="text-stone-400 w-4">{ELEMENT_NAMES[el]}</span>
                <div className="flex-1 bg-stone-700 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, (scores[el] / maxScore) * 100)}%`, background: ELEMENT_COLORS[el].hex }} />
                </div>
                <span className="text-stone-300 w-12 text-right">{scores[el].toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Tab: 財官格局 ----

function FortuneTab({ chart, scores, apiData }: { chart: BaziChart; scores: Record<Element, number>; apiData: JiLiangApiData }) {
  const dayMaster = chart.heavenlyStems[2];
  const tenGods = getTenGodsElements(dayMaster);
  const [simScore, setSimScore] = useState(50);
  const [simCat, setSimCat] = useState<'WEALTH' | 'GOV'>('WEALTH');

  let wealthScore = scores[tenGods.wealth] || 0;
  let govScore = scores[tenGods.officer] || 0;
  const selfScore = scores[tenGods.self] || 0;
  const resourceScore = scores[tenGods.resource] || 0;
  const supportScore = selfScore + resourceScore;
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const supportRatio = totalScore > 0 ? supportScore / totalScore : 0.5;
  const isStrong = supportRatio >= 0.5;

  if (isStrong) {
    wealthScore = wealthScore * 0.75 + (scores[tenGods.output] || 0) * 0.25;
    govScore    = govScore    * 0.75 + (scores[tenGods.wealth] || 0) * 0.25;
  } else {
    wealthScore = wealthScore * 0.6 + resourceScore * 0.25 + selfScore * 0.15;
    govScore    = govScore    * 0.6 + resourceScore * 0.4;
  }

  const wealthAnalysis = getFortuneAnalysis(wealthScore, 'WEALTH', tenGods.wealth);
  const govAnalysis    = getFortuneAnalysis(govScore,    'GOV',    tenGods.officer);
  const simAnalysis    = getFortuneAnalysis(simScore,    simCat,   simCat === 'WEALTH' ? tenGods.wealth : tenGods.officer);

  function LevelCard({ analysis, label }: { analysis: ReturnType<typeof getFortuneAnalysis>; label: string }) {
    const levelColor = analysis.levelId >= 7 ? 'text-amber-400' : analysis.levelId >= 5 ? 'text-green-400' : 'text-stone-400';
    const levelBg = analysis.levelId >= 7 ? 'bg-amber-900/20 border-amber-700' : analysis.levelId >= 5 ? 'bg-green-900/20 border-green-800' : 'bg-stone-800 border-stone-700';
    return (
      <div className={`border rounded-xl p-5 space-y-3 ${levelBg}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-stone-500 font-sans">{label}</div>
            <div className="text-xs text-stone-400 mt-0.5">
              {analysis.categoryType === 'WEALTH' ? `財星【${ELEMENT_NAMES[analysis.targetElement]}】` : `官星【${ELEMENT_NAMES[analysis.targetElement]}】`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-stone-500">喜用得分</div>
            <div className="text-2xl font-bold text-stone-100">{analysis.calculatedScore}<span className="text-xs text-stone-500 ml-1">分</span></div>
          </div>
        </div>
        <div className="flex items-center justify-between bg-stone-800/60 rounded px-3 py-2">
          <span className="text-xs text-stone-400">命中格局：</span>
          <span className={`font-bold text-lg ${levelColor}`}>{analysis.levelName}</span>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-stone-400">社會階層定位：</div>
          <div className="text-sm font-bold text-stone-100">{analysis.socialStatus}</div>
          <div className="text-xs text-stone-400 mt-1">資產規模：</div>
          <div className="text-xs text-stone-300">{analysis.assetScale}</div>
        </div>
        {/* Score bar showing level */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-stone-500">
            <span>1級</span><span>3級</span><span>5級</span><span>7級</span><span>9級</span>
          </div>
          <div className="w-full bg-stone-700 rounded-full h-2 relative">
            <div className={`h-2 rounded-full ${analysis.levelId >= 7 ? 'bg-amber-500' : analysis.levelId >= 5 ? 'bg-green-600' : 'bg-stone-500'}`}
              style={{ width: `${(analysis.levelId / 9) * 100}%` }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LevelCard analysis={wealthAnalysis} label="財富格局評估 (WEALTH)" />
        <LevelCard analysis={govAnalysis}    label="官貴格局評估 (GOV)" />
      </div>

      {/* 互動模擬器 */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl p-5">
        <div className="text-xs text-amber-400 uppercase tracking-widest font-bold mb-4">格局級數模擬器</div>
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-stone-400">分類：</label>
            <button onClick={() => setSimCat('WEALTH')} className={`text-xs px-3 py-1 rounded-lg border ${simCat === 'WEALTH' ? 'bg-amber-800 border-amber-600 text-amber-100' : 'border-stone-600 text-stone-400'}`}>財富</button>
            <button onClick={() => setSimCat('GOV')}    className={`text-xs px-3 py-1 rounded-lg border ${simCat === 'GOV'    ? 'bg-amber-800 border-amber-600 text-amber-100' : 'border-stone-600 text-stone-400'}`}>官貴</button>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-48">
            <label className="text-xs text-stone-400">分數：<span className="text-amber-300 font-bold">{simScore}</span></label>
            <input type="range" min={0} max={100} value={simScore} onChange={e => setSimScore(Number(e.target.value))}
              className="flex-1 accent-amber-500" />
          </div>
        </div>
        <div className="bg-stone-800 rounded-lg px-4 py-3 text-sm text-stone-300">
          <span className="text-stone-400">輸入分數 </span>
          <span className="text-amber-300 font-bold">{simScore}</span>
          <span className="text-stone-400"> → 對應格局：</span>
          <span className="font-bold text-lg text-amber-200 ml-2">{simAnalysis.levelName}</span>
          <span className="text-xs text-stone-400 ml-3">（{simAnalysis.socialStatus}）</span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1 text-center text-xs">
          {([1, 3, 5, 7, 9] as const).map(lv => {
            const lInfo = FORTUNE_LEVELS.find(l => l.levelId === lv && l.categoryType === simCat);
            return (
              <div key={lv} onClick={() => setSimScore(lv === 1 ? 10 : lv === 3 ? 30 : lv === 5 ? 50 : lv === 7 ? 70 : 90)}
                className={`cursor-pointer rounded border p-2 transition-all ${simAnalysis.levelId === lv ? 'bg-amber-800/40 border-amber-600 text-amber-200' : 'border-stone-700 text-stone-400 hover:border-stone-500'}`}>
                <div className="font-bold">{lv}級</div>
                <div className="text-[9px] leading-tight mt-0.5">{lInfo?.socialStatus || ''}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Tab: 動態歲運 ----

function DynamicTab({
  chart, birthYear, apiData,
}: {
  chart: BaziChart;
  birthYear: number;
  apiData: JiLiangApiData;
}) {
  const currentYear = new Date().getFullYear();
  const defaultIdx = Math.max(0, Math.min(79, currentYear - birthYear));
  const [selectedIdx, setSelectedIdx] = useState(defaultIdx);
  const [filterType, setFilterType] = useState<'ALL' | 'BOOM' | 'DEBT' | 'TEACHING'>('ALL');

  const { timeline, boomYearsWealth, boomYearsGov, debtYears, daYunList } = useMemo(() => {
    return generateDynamicTimeline(
      chart, birthYear, apiData.luckCycles,
      apiData.yongShenElem, apiData.fuYiElem, apiData.jiShenElem
    );
  }, [chart, birthYear, apiData]);

  const teachingYears = useMemo(() => timeline.filter(t => t.cycleNature === 'TEACHING_LEISURE'), [timeline]);

  const displayedList = useMemo(() => {
    if (filterType === 'BOOM')     return boomYearsWealth;
    if (filterType === 'DEBT')     return debtYears;
    if (filterType === 'TEACHING') return teachingYears;
    return timeline;
  }, [filterType, timeline, boomYearsWealth, debtYears, teachingYears]);

  const currentYearData: DynamicYearScore = timeline[selectedIdx] || timeline[0];

  function NatureTag({ nature, tag }: { nature: DynamicYearScore['cycleNature']; tag: string }) {
    const cls = nature === 'BOOM' ? 'bg-amber-800/50 text-amber-300 border-amber-700'
      : nature === 'DEBT_HARDSHIP' || nature === 'PRESSURE' ? 'bg-red-900/50 text-red-300 border-red-800'
      : nature === 'TEACHING_LEISURE' ? 'bg-blue-900/50 text-blue-300 border-blue-800'
      : nature === 'FAVORABLE' ? 'bg-green-900/50 text-green-300 border-green-800'
      : 'bg-stone-700 text-stone-400 border-stone-600';
    return <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${cls}`}>{tag}</span>;
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-stone-400">篩選：</span>
        {([
          { key: 'ALL',      label: '全部' },
          { key: 'BOOM',     label: `黃金大爆發（${boomYearsWealth.length}年）` },
          { key: 'DEBT',     label: `磨礪沉潛（${debtYears.length}年）` },
          { key: 'TEACHING', label: `講學清福（${teachingYears.length}年）` },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFilterType(f.key)}
            className={`text-xs px-3 py-1 rounded-lg border transition-all ${filterType === f.key ? 'bg-amber-800 border-amber-600 text-amber-100' : 'border-stone-600 text-stone-400 hover:border-stone-500'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Timeline list */}
        <div className="xl:col-span-2 bg-stone-900 border border-stone-700 rounded-xl overflow-hidden">
          <div className="text-xs text-amber-400 uppercase tracking-widest font-bold px-4 py-3 border-b border-stone-700">
            動態歲運軌跡（{displayedList.length} 年）
          </div>
          <div className="overflow-y-auto max-h-[480px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-stone-800 text-stone-400">
                <tr>
                  <th className="px-3 py-2 text-left">流年</th>
                  <th className="px-3 py-2 text-center">歲</th>
                  <th className="px-3 py-2 text-left">大運</th>
                  <th className="px-3 py-2 text-center">財</th>
                  <th className="px-3 py-2 text-center">官</th>
                  <th className="px-3 py-2 text-left">性質</th>
                </tr>
              </thead>
              <tbody>
                {displayedList.map((y, i) => {
                  const isSelected = filterType === 'ALL' ? selectedIdx === y.age : false;
                  const rowBg = isSelected ? 'bg-amber-900/30' : i % 2 === 0 ? '' : 'bg-stone-800/30';
                  return (
                    <tr key={y.calYear}
                      className={`cursor-pointer hover:bg-amber-900/20 transition-colors ${rowBg}`}
                      onClick={() => { setSelectedIdx(y.age); setFilterType('ALL'); }}>
                      <td className="px-3 py-1.5 font-bold text-stone-200">
                        {y.calYear} <span className="text-stone-500 font-normal">{y.yearName}</span>
                      </td>
                      <td className="px-3 py-1.5 text-center text-stone-400">{y.age}</td>
                      <td className="px-3 py-1.5 text-amber-300">{y.daYunName}</td>
                      <td className="px-3 py-1.5 text-center">
                        <span className={y.isBoomYearWealth ? 'font-bold text-amber-400' : 'text-stone-400'}>{y.wealthLevel.levelId}</span>
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <span className={y.isBoomYearGov ? 'font-bold text-amber-400' : 'text-stone-400'}>{y.govLevel.levelId}</span>
                      </td>
                      <td className="px-3 py-1.5">
                        <NatureTag nature={y.cycleNature} tag={y.cycleNatureTag} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail card */}
        {currentYearData && (
          <div className="space-y-4">
            <div className="bg-stone-900 border border-stone-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-lg font-bold text-stone-100">{currentYearData.calYear} 年</div>
                  <div className="text-sm text-stone-400">{currentYearData.yearName} · 虛歲 {currentYearData.age + 1}</div>
                </div>
                <NatureTag nature={currentYearData.cycleNature} tag={currentYearData.cycleNatureTag} />
              </div>
              <div className="text-xs text-stone-400 mb-2">大運：<span className="text-amber-300 font-bold">{currentYearData.daYunName}</span></div>
              <div className="text-xs text-stone-300 leading-relaxed">{currentYearData.cycleExplanation}</div>
            </div>

            <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 space-y-3">
              <div className="text-xs text-amber-400 font-bold">財官格局得分</div>
              <div className="grid grid-cols-2 gap-2">
                <div className={`rounded-lg p-3 text-center border ${currentYearData.isBoomYearWealth ? 'bg-amber-800/30 border-amber-700' : 'bg-stone-800 border-stone-700'}`}>
                  <div className="text-[10px] text-stone-400">財富格局</div>
                  <div className={`text-xl font-bold ${currentYearData.isBoomYearWealth ? 'text-amber-400' : 'text-stone-300'}`}>{currentYearData.wealthLevel.levelId}級</div>
                  <div className="text-xs text-stone-400">{currentYearData.wealthScore} 分</div>
                </div>
                <div className={`rounded-lg p-3 text-center border ${currentYearData.isBoomYearGov ? 'bg-amber-800/30 border-amber-700' : 'bg-stone-800 border-stone-700'}`}>
                  <div className="text-[10px] text-stone-400">官貴格局</div>
                  <div className={`text-xl font-bold ${currentYearData.isBoomYearGov ? 'text-amber-400' : 'text-stone-300'}`}>{currentYearData.govLevel.levelId}級</div>
                  <div className="text-xs text-stone-400">{currentYearData.govScore} 分</div>
                </div>
              </div>
            </div>

            {currentYearData.dynamicGongHuiList.length > 0 && (
              <div className="bg-stone-900 border border-amber-900/50 rounded-xl p-4">
                <div className="text-xs text-amber-400 font-bold mb-2">動態暗拱暗會 (+20分)</div>
                <div className="space-y-1">
                  {currentYearData.dynamicGongHuiList.map((g, i) => (
                    <div key={i} className="text-xs text-amber-200 bg-amber-900/20 rounded px-2 py-1">
                      {g.pair[0]}+{g.pair[1]} → 暗拱【{g.targetName}】+{g.points}分
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 五行動態分數 */}
            <div className="bg-stone-900 border border-stone-700 rounded-xl p-4">
              <div className="text-xs text-amber-400 font-bold mb-2">本年五行動態總分</div>
              <div className="space-y-1.5">
                {ALL_ELEMENTS.map(el => {
                  const max = Math.max(...Object.values(currentYearData.scores), 1);
                  return (
                    <ScoreBar key={el} label={ELEMENT_NAMES[el]} score={currentYearData.scores[el]} maxScore={max}
                      color={ELEMENT_COLORS[el].badge.split(' ')[0]} />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 大運一覽 */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl p-5">
        <div className="text-xs text-amber-400 uppercase tracking-widest font-bold mb-3">大運一覽</div>
        <div className="flex flex-wrap gap-2">
          {daYunList.map(dy => {
            const dyBoomCount = boomYearsWealth.filter(y => y.daYunName === dy.name).length;
            const dyDebtCount = debtYears.filter(y => y.daYunName === dy.name).length;
            const qual = dyBoomCount >= 3 ? 'text-amber-400 border-amber-700 bg-amber-900/20'
              : dyDebtCount >= 3 ? 'text-red-400 border-red-800 bg-red-900/10'
              : 'text-stone-300 border-stone-700 bg-stone-800';
            return (
              <div key={dy.name} className={`text-xs border rounded-lg px-3 py-2 text-center min-w-20 ${qual}`}>
                <div className="font-bold text-sm">{dy.name}</div>
                <div className="text-[10px] text-stone-500">{birthYear + dy.startAge}–{birthYear + dy.endAge}</div>
                {dyBoomCount > 0 && <div className="text-[10px] text-amber-400">黃金 {dyBoomCount}年</div>}
                {dyDebtCount > 0 && <div className="text-[10px] text-red-400">磨礪 {dyDebtCount}年</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----

export default function JiLiangPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  const [custSearchQ, setCustSearchQ] = useState('');
  const [custResults, setCustResults] = useState<CustomerItem[]>([]);
  const [selectedCust, setSelectedCust] = useState<CustomerItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<JiLiangApiData | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'engine' | 'fortune' | 'dynamic'>('engine');

  const searchCustomers = useCallback(async (q: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/Customers/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCustResults(await res.json());
    } catch { /* ignore */ }
  }, [token]);

  const loadCustomerAndAnalyze = useCallback(async (c: CustomerItem) => {
    if (!token || !c) return;
    setSelectedCust(c);
    setApiData(null);
    setError('');
    setIsLoading(true);

    try {
      // Auto-save: PUT profile
      const profileRes = await fetch(`${API_URL}/Auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          chartName: c.name,
          birthYear: c.birthYear,
          birthMonth: c.birthMonth,
          birthDay: c.birthDay,
          birthHour: c.birthHour,
          birthMinute: c.birthMinute ?? 0,
          birthGender: c.birthGender,
          dateType: c.dateType || 'solar',
        }),
      });
      if (!profileRes.ok) throw new Error('儲存生辰失敗');

      // POST calculate
      const calcBody = {
        year: c.birthYear, month: c.birthMonth, day: c.birthDay,
        hour: c.birthHour, minute: c.birthMinute ?? 0,
        gender: c.birthGender, name: c.name, dateType: c.dateType || 'solar',
      };
      const calcRes = await fetch(`${API_URL}/Astrology/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(calcBody),
      });
      if (!calcRes.ok) throw new Error('計算命盤失敗');
      const chartData = await calcRes.json();

      // POST save-chart
      const saveRes = await fetch(`${API_URL}/Astrology/save-chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(chartData),
      });
      if (!saveRes.ok) throw new Error('儲存命盤失敗');

      // GET jiliang-bazi-data
      const jiRes = await fetch(`${API_URL}/Consultation/jiliang-bazi-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!jiRes.ok) throw new Error('取得計量資料失敗');
      setApiData(await jiRes.json());
      setActiveTab('engine');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '發生錯誤');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const chart: BaziChart | null = useMemo(() => {
    if (!apiData) return null;
    return buildChartFromApi(apiData);
  }, [apiData]);

  const scores = useMemo(() => {
    if (!chart) return null;
    return calculateScores(chart);
  }, [chart]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400">
        請先登入
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-amber-200 text-sm">計量分析中，請稍候...</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-stone-900 border-b border-stone-700 px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-stone-400 hover:text-stone-200 text-sm">
          ← 返回
        </button>
        <div>
          <h1 className="font-bold text-amber-300 text-sm">八字科學計量分析</h1>
          <p className="text-[10px] text-stone-500">四柱虛浮 · 通根地基 · 暗拱暗會 · 歲運催化</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Customer selector */}
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-4">
          <div className="text-xs text-amber-400 uppercase tracking-widest font-bold mb-3">選擇客戶</div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={custSearchQ}
              onChange={e => setCustSearchQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchCustomers(custSearchQ)}
              placeholder="輸入姓名或編號搜尋..."
              className="flex-1 bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            <button onClick={() => searchCustomers(custSearchQ)}
              className="bg-amber-700 hover:bg-amber-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              搜尋
            </button>
          </div>

          {selectedCust && (
            <div className="mb-3 text-xs text-stone-400">
              已選：<span className="text-amber-300 font-bold">{selectedCust.name}</span>
              {selectedCust.customerCode && <span className="ml-2 text-stone-500">#{selectedCust.customerCode}</span>}
            </div>
          )}

          {custResults.length > 0 && (
            <div className="border border-stone-700 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              {custResults.map(c => (
                <div key={c.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-stone-800 cursor-pointer border-b border-stone-800 last:border-0"
                  onClick={() => { loadCustomerAndAnalyze(c); setCustResults([]); }}>
                  <div>
                    <div className="text-sm text-stone-200 font-medium">{c.name}</div>
                    <div className="text-xs text-stone-500">
                      #{c.customerCode} · {c.birthYear}/{c.birthMonth}/{c.birthDay} · {c.birthGender === 2 ? '女' : '男'}
                    </div>
                  </div>
                  <span className="text-xs text-amber-400">分析 →</span>
                </div>
              ))}
            </div>
          )}

          {error && <div className="mt-2 text-xs text-red-400">{error}</div>}
        </div>

        {/* Analysis result */}
        {chart && scores && apiData && (
          <>
            {/* Tab buttons */}
            <div className="flex gap-2">
              {([
                { key: 'engine',  label: '計量引擎' },
                { key: 'fortune', label: '財官格局' },
                { key: 'dynamic', label: '動態歲運' },
              ] as const).map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`text-sm px-5 py-2 rounded-lg border transition-all font-medium ${activeTab === t.key
                    ? 'bg-amber-800 border-amber-600 text-amber-100'
                    : 'border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200'}`}>
                  {t.label}
                </button>
              ))}
              <div className="flex-1" />
              <div className="text-xs text-stone-500 self-center">
                {apiData.name} · {apiData.birthYear}年 · {apiData.gender === 2 ? '女' : '男'}
              </div>
            </div>

            {activeTab === 'engine'  && <EngineTab  chart={chart} apiData={apiData} />}
            {activeTab === 'fortune' && <FortuneTab chart={chart} scores={scores} apiData={apiData} />}
            {activeTab === 'dynamic' && <DynamicTab chart={chart} birthYear={apiData.birthYear} apiData={apiData} />}
          </>
        )}

        {!apiData && !isLoading && (
          <div className="text-center py-16 text-stone-600">
            <div className="text-4xl mb-4">八</div>
            <p className="text-sm">請先搜尋並選擇客戶，系統將自動執行八字科學計量分析</p>
          </div>
        )}
      </div>
    </div>
  );
}
