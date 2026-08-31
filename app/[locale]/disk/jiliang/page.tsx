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
  applyXingChongHeHai,
  mapStemToElement,
  STEM_YIN_YANG,
  BRANCH_YIN_YANG,
  getStemTenGodLabel,
  DynamicYearScore,
  DaYunPeriod,
  XCHHEntry,
  ScoreStepBreakdown,
  EarthlyBranchInfo,
  getBranchXingChongHaiPenalty,
} from './calculator';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const ALL_ELEMENTS: Element[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

interface CustomerItem {
  id: number;
  name: string;
  customerCode: string;
  birthDateTime: string;
  gender: number;
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

const PILLAR_NAMES = ['年柱', '月柱', '日柱', '時柱'];
const PILLAR_SUBTITLES = ['祖上 / 根基 / 早年', '父母 / 格局 / 青年', '日主自身 / 夫妻 / 中年', '子息 / 歸宿 / 晚年'];

interface PillarCardProps {
  pillarIndex: number;
  stem: string;
  branchInfo: EarthlyBranchInfo;
  dayMaster: string;
  branchBreakdown: ScoreStepBreakdown['tier2Branches'][0];
}

function PillarCard({ pillarIndex, stem, branchInfo, dayMaster, branchBreakdown }: PillarCardProps) {
  const stemEl = mapStemToElement(stem);
  const branchEl = branchInfo.mainElement;
  const isDay   = pillarIndex === 2;
  const isMonth = pillarIndex === 1;

  const tenGodLabel = isDay ? '日元(自身)' : getStemTenGodLabel(stem, dayMaster);
  const stemYY  = STEM_YIN_YANG[stem]  || '陽';
  const branchYY = BRANCH_YIN_YANG[branchInfo.name] || '陽';

  // 本氣 stem (hiddenStems[0] = main element stem)
  const mainStem    = branchInfo.hiddenStems[0] || '';
  const mainTenGod  = getStemTenGodLabel(mainStem, dayMaster, true);

  const borderCls = isDay
    ? 'border-2 border-stone-400'
    : isMonth
    ? 'border-2 border-red-600'
    : 'border border-stone-700';

  return (
    <div className={`bg-stone-900 rounded-lg overflow-hidden flex flex-col ${borderCls}`}>
      {/* Special header */}
      {isDay   && <div className="bg-stone-600 text-stone-100 text-[9px] text-center py-1 font-bold tracking-widest">本命元神</div>}
      {isMonth && <div className="bg-red-900/80 text-red-200 text-[9px] text-center py-1 font-bold tracking-widest">提綱月令（×1.3）</div>}

      {/* 柱 label */}
      <div className="px-3 pt-2 pb-1.5 border-b border-stone-800">
        <div className="text-xs font-bold text-stone-200">{PILLAR_NAMES[pillarIndex]}</div>
        <div className="text-[9px] text-stone-500 mt-0.5">{PILLAR_SUBTITLES[pillarIndex]}</div>
      </div>

      {/* 天干 */}
      <div className="px-3 py-2 border-b border-stone-800">
        {tenGodLabel && (
          <div className="mb-1">
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isDay ? 'bg-stone-600 text-stone-200' : ELEMENT_COLORS[stemEl].badge}`}>
              {tenGodLabel}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className={`text-4xl font-bold leading-none ${ELEMENT_COLORS[stemEl].text}`}>{stem}</span>
          <div>
            <ElementBadge el={stemEl} />
            <div className="text-[9px] text-stone-400 mt-0.5">{stemYY}干 · +10分</div>
          </div>
        </div>
      </div>

      {/* 地支 */}
      <div className="px-3 py-2 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className={`text-4xl font-bold leading-none ${ELEMENT_COLORS[branchEl].text}`}>{branchInfo.name}</span>
          <div>
            <ElementBadge el={branchEl} />
            <div className="text-[9px] text-stone-400 mt-0.5">{branchInfo.animal}·{branchYY}支</div>
          </div>
        </div>
        <div className="text-[9px] text-stone-500 mt-1.5">本氣有力通根：+15分</div>
      </div>

      {/* 地支藏干表 */}
      <div className="px-2 py-2 flex-1">
        <div className="flex justify-between text-[8px] text-stone-600 mb-1">
          <span>地支藏干（中餘氣）</span><span>+5分/神</span>
        </div>
        <div className="space-y-0.5">
          {/* 本氣 */}
          <div className="flex items-center gap-1 bg-stone-800/60 rounded px-1 py-0.5">
            <span className={`text-[10px] font-bold w-3 ${ELEMENT_COLORS[branchEl].text}`}>{mainStem}</span>
            <ElementBadge el={branchEl} />
            <span className="text-[8px] text-stone-400 flex-1 ml-0.5">{mainTenGod}</span>
            <span className="text-[8px] text-stone-500">本氣(+15)</span>
          </div>
          {/* 餘氣 - filter out empty stems (pure branches like 子卯酉) */}
          {branchBreakdown.hidden.filter(h => h.stem).map((h, j) => (
            <div key={j} className="flex items-center gap-1 rounded px-1 py-0.5">
              <span className={`text-[10px] font-bold w-3 ${ELEMENT_COLORS[h.element].text}`}>{h.stem}</span>
              <ElementBadge el={h.element} />
              <span className="text-[8px] text-stone-400 flex-1 ml-0.5">{getStemTenGodLabel(h.stem, dayMaster, true)}</span>
              <span className="text-[8px] text-stone-500">餘氣(+5)</span>
            </div>
          ))}
        </div>
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

// ---- XCHH severity label ----

const XCHH_SEVERITY_COLORS: Record<XCHHEntry['severity'], string> = {
  major:    'bg-red-900/40 border-red-700 text-red-300',
  moderate: 'bg-orange-900/40 border-orange-700 text-orange-300',
  minor:    'bg-yellow-900/30 border-yellow-800 text-yellow-400',
};

const XCHH_TYPE_LABELS: Record<string, string> = {
  '六沖': '六沖 (-30%/-60%)',
  '三刑': '三刑 (-35%)',
  '子卯刑': '子卯刑 (-30%)',
  '六合(絆住)': '六合 絆住 (×0.8)',
  '六合(化)': '六合 化 (+注入化神)',
  '六害': '六害 (-25%藏干)',
};

// ---- Tab: 計量引擎 ----

function EngineTab({
  chart, apiData, xchhResult,
}: {
  chart: BaziChart;
  apiData: JiLiangApiData;
  xchhResult: { scores: Record<Element, number>; entries: XCHHEntry[] };
}) {
  const { scores: baseScores, breakdown } = useMemo(() => getCalculationBreakdown(chart), [chart]);
  const modifiedScores = xchhResult.scores;
  const xchhEntries = xchhResult.entries;
  const maxScore = Math.max(...Object.values(modifiedScores), 1);

  const radarData = ALL_ELEMENTS.map(el => ({
    subject: ELEMENT_NAMES[el],
    score: modifiedScores[el],
    fullMark: 120,
  }));

  const dayMaster = chart.heavenlyStems[2];
  const tenGods = getTenGodsElements(dayMaster);
  const selfScore = modifiedScores[tenGods.self] || 0;
  const resourceScore = modifiedScores[tenGods.resource] || 0;
  const supportScore = selfScore + resourceScore;
  const totalScore = Object.values(modifiedScores).reduce((a, b) => a + b, 0);
  const supportRatio = totalScore > 0 ? supportScore / totalScore : 0.5;
  const bodyLabel = supportRatio >= 0.70 ? '極強' : supportRatio >= 0.55 ? '偏強' : supportRatio >= 0.45 ? '中和' : supportRatio >= 0.30 ? '偏弱' : supportRatio >= 0.20 ? '身弱' : '極弱';

  return (
    <div className="space-y-6">
      {/* 四柱排盤 */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl p-5">
        <div className="text-xs text-amber-400 uppercase tracking-widest mb-3 font-bold">四柱排盤（時→日→月→年）</div>
        <div className="grid grid-cols-4 gap-3">
          {[3, 2, 1, 0].map(i => (
            <PillarCard
              key={i}
              pillarIndex={i}
              stem={chart.heavenlyStems[i]}
              branchInfo={chart.earthlyBranches[i]}
              dayMaster={dayMaster}
              branchBreakdown={breakdown.tier2Branches[i]}
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
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-stone-400">五行能量總分（刑沖合害修正{xchhEntries.length > 0 ? `後，${xchhEntries.length}組` : '：無'}）</span>
            </div>
            {ALL_ELEMENTS.map(el => {
              const base = baseScores[el];
              const mod  = modifiedScores[el];
              const delta = mod - base;
              return (
                <div key={el}>
                  <ScoreBar label={ELEMENT_NAMES[el]} score={mod} maxScore={maxScore} color={ELEMENT_COLORS[el].badge.split(' ')[0]} />
                  {Math.abs(delta) > 0.01 && (
                    <div className="text-[10px] text-stone-500 pl-8 -mt-0.5">
                      原 {base.toFixed(1)} → 修正後 {mod.toFixed(1)}
                      <span className={delta > 0 ? 'text-green-500 ml-1' : 'text-red-500 ml-1'}>
                        ({delta > 0 ? '+' : ''}{delta.toFixed(1)})
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
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

          {/* Step 5: 刑沖合害修正 */}
          <div>
            <div className="text-xs text-amber-300 font-bold mb-2">
              Step 5：刑沖合害動態修正
              {xchhEntries.length === 0 && <span className="text-stone-500 font-normal ml-2">（原局無刑沖合害）</span>}
            </div>
            {xchhEntries.length > 0 && (
              <div className="space-y-2">
                {xchhEntries.map((entry, i) => (
                  <div key={i} className={`border rounded-lg px-3 py-2 text-xs space-y-1 ${XCHH_SEVERITY_COLORS[entry.severity]}`}>
                    <div className="flex items-center gap-2 font-bold">
                      <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px]">{XCHH_TYPE_LABELS[entry.type] || entry.type}</span>
                      <span>{entry.branches.join(' + ')}</span>
                      <span className="text-stone-400 font-normal">（{entry.pillarLabels.join('/')}）</span>
                    </div>
                    <div className="text-stone-300">{entry.description}</div>
                    <div className="flex flex-wrap gap-2">
                      {(Object.entries(entry.deltas) as [Element, number][]).map(([el, d]) => (
                        <span key={el} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${d >= 0 ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                          {ELEMENT_NAMES[el]} {d > 0 ? '+' : ''}{d.toFixed(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, (modifiedScores[el] / maxScore) * 100)}%`, background: ELEMENT_COLORS[el].hex }} />
                </div>
                <span className="text-stone-300 w-12 text-right">{modifiedScores[el].toFixed(1)}</span>
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
          <span className="text-xs text-stone-400">先天格局上限：</span>
          <span className={`font-bold text-lg ${levelColor}`}>{analysis.levelName}</span>
        </div>
        <div className="text-[10px] text-stone-500 leading-relaxed">
          此為命局先天潛力天花板，實際兌現需大運走到喜用方能顯現；大運走忌神則格局折損難兌現。詳見「動態歲運」頁面的大運調整分析。
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
  chart, birthYear, apiData, natalScores,
}: {
  chart: BaziChart;
  birthYear: number;
  apiData: JiLiangApiData;
  natalScores: Record<Element, number>;
}) {
  const currentYear = new Date().getFullYear();
  const defaultIdx = Math.max(0, Math.min(79, currentYear - birthYear));
  const [selectedIdx, setSelectedIdx] = useState(defaultIdx);
  const [filterType, setFilterType] = useState<'ALL' | 'SURGE' | 'GUARD'>('ALL');

  const { timeline, boomYearsWealth, boomYearsGov, debtYears, daYunList } = useMemo(() => {
    return generateDynamicTimeline(
      chart, birthYear, apiData.luckCycles,
      apiData.yongShenElem, apiData.fuYiElem, apiData.jiShenElem
    );
  }, [chart, birthYear, apiData]);

  const surgeYears  = useMemo(() => timeline.filter(t => t.cycleNature === 'BOOM' || t.cycleNature === 'FAVORABLE'), [timeline]);
  const guardYears  = useMemo(() => timeline.filter(t => t.cycleNature === 'DEBT_HARDSHIP' || t.cycleNature === 'PRESSURE'), [timeline]);

  const displayedList = useMemo(() => {
    if (filterType === 'SURGE') return surgeYears;
    if (filterType === 'GUARD') return guardYears;
    return timeline;
  }, [filterType, timeline, surgeYears, guardYears]);

  const currentYearData: DynamicYearScore = timeline[selectedIdx] || timeline[0];

  // ── 大運財官調整分析 ──
  const dayMasterDyn = chart.heavenlyStems[2];
  const tenGodsDyn = getTenGodsElements(dayMasterDyn);

  // 先天格局得分（複製 FortuneTab 的計算，使用 natalScores）
  const natalSelf     = natalScores[tenGodsDyn.self]     || 0;
  const natalResource = natalScores[tenGodsDyn.resource] || 0;
  const natalTotal    = Object.values(natalScores).reduce((a, b) => a + b, 0);
  const natalSupport  = natalTotal > 0 ? (natalSelf + natalResource) / natalTotal : 0.5;
  const natalIsStrong = natalSupport >= 0.5;
  let natalW = natalScores[tenGodsDyn.wealth]  || 0;
  let natalG = natalScores[tenGodsDyn.officer] || 0;
  if (natalIsStrong) {
    natalW = natalW * 0.75 + (natalScores[tenGodsDyn.output] || 0) * 0.25;
    natalG = natalG * 0.75 + (natalScores[tenGodsDyn.wealth] || 0) * 0.25;
  } else {
    natalW = natalW * 0.6 + natalResource * 0.25 + natalSelf * 0.15;
    natalG = natalG * 0.6 + natalResource * 0.4;
  }
  const natalWealthAnalysis = getFortuneAnalysis(natalW, 'WEALTH', tenGodsDyn.wealth);
  const natalGovAnalysis    = getFortuneAnalysis(natalG, 'GOV',    tenGodsDyn.officer);

  // 先天格局天花板（用於兌現率計算）
  const ceilW = natalWealthAnalysis.levelId;
  const ceilG = natalGovAnalysis.levelId;
  const natalDayBranch   = chart.earthlyBranches[2].name;

  // 人生階段 helper
  function getLifeStage(midAge: number) {
    if (midAge < 15) return { label: '成長奠基期', focus: ['學習啟蒙', '天賦培育'], canAnalyze: false };
    if (midAge < 20) return { label: '奠基期',     focus: ['學業方向', '才能開發', '貴人扶持'], canAnalyze: false };
    if (midAge < 40) return { label: '決策期',     focus: ['事業起步', '感情婚姻', '財富方向'], canAnalyze: true };
    if (midAge < 55) return { label: '收成守成期', focus: ['事業突破', '置產投資', '健康關卡'], canAnalyze: true };
    if (midAge < 70) return { label: '交棒期',     focus: ['退場時機', '財庫守護', '身體關卡'], canAnalyze: true };
    return              { label: '安樂期',         focus: ['壽元健康', '子孫陪伴', '財產傳承'], canAnalyze: false };
  }

  // 流年天干/地支喜忌標記
  function getShenLabel(elem: Element): { label: string; color: string } {
    const cn = ELEMENT_NAMES[elem];
    if (cn === apiData.yongShenElem) return { label: '用', color: 'text-green-400 bg-green-900/30' };
    if (cn === apiData.fuYiElem)     return { label: '喜', color: 'text-blue-400 bg-blue-900/30' };
    if (cn === apiData.jiShenElem)   return { label: '忌', color: 'text-red-400 bg-red-900/30' };
    return { label: '中', color: 'text-stone-500 bg-stone-800' };
  }

  // 大運生活事件提示（喜忌+財官%+年齡段 → 具體生活預測）
  function getDaYunEventHints(s: DaYunStat): string[] {
    const hints: string[] = [];
    const wH = s.realPctW >= 70;
    const wL = s.realPctW < 40;
    const gH = s.realPctG >= 70;
    const gL = s.realPctG < 40;
    const isMale = apiData.gender === 1;
    const dyBrEl = EARTHLY_BRANCH_DATA[s.dy.branch]?.mainElement ?? 'Earth';
    const dyBrElCn = ELEMENT_NAMES[dyBrEl];
    const isFavor = dyBrElCn === apiData.yongShenElem || dyBrElCn === apiData.fuYiElem;
    const isJi    = dyBrElCn === apiData.jiShenElem;
    const stage   = s.lifeStage.label;

    if (stage === '成長奠基期') {
      hints.push(wH ? '家庭財力尚可，成長環境資源充足' : '家庭財力有限，從小養成自立性格');
      hints.push(gH ? '學業基礎佳，讀書有競爭力' : '學業普通，才藝/運動等實作面向更有潛力');

    } else if (stage === '奠基期') {
      hints.push(gH ? '考試競爭力強，宜拼學業（高中/大學/研究所）' : '不以考試見長，技職/才藝/實作方向更適合');
      hints.push(isFavor ? '有貴人師長引導，此段奠定日後方向，方向選對事半功倍' : '少貴人，靠自己摸索方向，需花時間確立目標');
      hints.push(wH ? '家境支援升學無礙' : '家庭資源有限，宜爭取獎學金或半工半讀');

    } else if (stage === '決策期') {
      if (wH && gL) {
        hints.push('財高官低，適合業務/自雇/創業，靠業績賺錢，不宜長期在大機構等升遷');
      } else if (gH && wL) {
        hints.push('官高財低，薪水型命格，大機構/公家機關求穩，此段升遷機會有望');
      } else if (wH && gH) {
        hints.push(isFavor ? '財官俱旺，創業升遷雙軌均可，全力把握' : '財官數字可但運逆，機遇打折，穩中求進即可');
      } else if (isJi) {
        hints.push('逆風期，職場少躁進，守穩現有技能平台，靜待時機');
      } else {
        hints.push('財官均普通，靠技能積累實力，不宜大賭大押');
      }
      if (isMale) {
        hints.push(wH && s.decadeRating !== '逆運'
          ? `財星旺，桃花有機，${s.wPeakYear}年前後是感情/婚姻關鍵時機`
          : wL ? '財星弱，感情需主動出擊，不會自動送上門'
          : `感情平穩推進，${s.wPeakYear}年留意感情重要節點`);
      } else {
        hints.push(gH && s.decadeRating !== '逆運'
          ? `官星旺，緣分易成，${s.gPeakYear}年前後婚緣成熟`
          : gL ? '官星弱，感情需主動把握，不宜被動等待'
          : `感情平穩，${s.gPeakYear}年留意重要感情節點`);
      }
      if (s.dyInteract === 'chong') hints.push('大運沖日支，此段感情婚姻波折大，婚前務必審慎');

    } else if (stage === '收成守成期') {
      hints.push(wH
        ? `財運收成期，${s.wPeakYear}年是置產/投資最佳時機，宜主動出手`
        : wL ? '財運弱，守成為主，嚴防借貸大投資失血'
        : `財運普通，${s.wPeakYear}年小幅理財出手尚可`);
      hints.push(gH
        ? `官運仍旺，${s.gPeakYear}年前後可爭取升遷或轉更大平台`
        : gL ? '升遷機會到頂，轉向資產收入或二線發展'
        : '職場進入穩定期，守住現有成果為主');
      if (s.dyInteract === 'chong') hints.push('大運沖日支，婚姻穩定性是此段最大隱患，健康也需注意');

    } else if (stage === '交棒期') {
      hints.push(wH
        ? '財庫仍有餘裕，保守理財為主，不宜追高風險投資'
        : wL ? '財庫緊縮，需提前規劃退休金，評估子女能否接手'
        : '財務穩健，保守理財即可，不需大動作');
      hints.push(gH
        ? '仍具社會影響力，可轉顧問/授課/傳承角色延伸價值'
        : '退場時機成熟，交棒比堅守更明智，享清福');
      if (s.dyInteract === 'chong') hints.push('大運沖日支，身體健康是此段最大關卡，定期健檢不可少');

    } else if (stage === '安樂期') {
      hints.push(wH ? '晚年財庫充足，生活自在無憂' : wL ? '晚年財力有限，傳承安排需提前做好' : '晚年生活尚可，細水長流');
      hints.push(isFavor ? '此段運勢仍順，晚年有福享，保持生活規律' : '晚年少折騰，養生靜心第一');
    }

    return hints.filter(h => h.length > 0);
  }

  // 逐大運統計：兌現值 = min(動態等級, 先天上限) - 刑沖害懲罰
  type DaYunStat = {
    dy: DaYunPeriod; yrs: number;
    avgAdjW: number; avgAdjG: number;
    peakAdjW: number; peakAdjG: number;
    realPctW: number; realPctG: number;
    dyInteract: 'chong' | 'xing' | 'hai' | null;
    lifeStage: ReturnType<typeof getLifeStage>;
    decadeRating: '旺運' | '平運' | '逆運';
    effortLabel: string; effortSymbol: string; effortColor: string;
    wPeakYear: number; gPeakYear: number;
  };
  const daYunStats = useMemo(() => daYunList.map(dy => {
    const yrs = timeline.filter(y => y.age >= dy.startAge && y.age <= dy.endAge);
    if (yrs.length === 0) return null;
    // 大運地支對日支的背景影響
    const dyInteract = getBranchXingChongHaiPenalty(dy.branch, natalDayBranch);
    const dyPenalty  = dyInteract === 'chong' ? 0.8 : dyInteract === 'xing' ? 0.5 : dyInteract === 'hai' ? 0.3 : 0;
    const adjW = yrs.map(y => {
      const capped = Math.min(y.wealthLevel.levelId, ceilW);
      const lnType = getBranchXingChongHaiPenalty(y.liuNianBranch, natalDayBranch);
      const lnPenalty = lnType === 'chong' ? 1.0 : lnType === 'xing' ? 0.8 : lnType === 'hai' ? 0.5 : 0;
      return Math.max(0, capped - lnPenalty - dyPenalty);
    });
    const adjG = yrs.map(y => {
      const capped = Math.min(y.govLevel.levelId, ceilG);
      const lnType = getBranchXingChongHaiPenalty(y.liuNianBranch, natalDayBranch);
      const lnPenalty = lnType === 'chong' ? 1.0 : lnType === 'xing' ? 0.8 : lnType === 'hai' ? 0.5 : 0;
      return Math.max(0, capped - lnPenalty - dyPenalty);
    });
    const avgAdjW  = adjW.reduce((s, v) => s + v, 0) / adjW.length;
    const avgAdjG  = adjG.reduce((s, v) => s + v, 0) / adjG.length;
    const peakAdjW = Math.max(...adjW);
    const peakAdjG = Math.max(...adjG);
    const realPctW = ceilW > 0 ? Math.round(avgAdjW / ceilW * 100) : 0;
    const realPctG = ceilG > 0 ? Math.round(avgAdjG / ceilG * 100) : 0;

    const midAge = (dy.startAge + dy.endAge) / 2;
    const lifeStage = getLifeStage(midAge);
    const avgRealPct = lifeStage.canAnalyze ? (realPctW + realPctG) / 2 : -1;
    const hasChong = dyInteract === 'chong';

    let decadeRating: '旺運' | '平運' | '逆運';
    if (!lifeStage.canAnalyze)               decadeRating = '平運';
    else if (avgRealPct >= 65 && !hasChong)  decadeRating = '旺運';
    else if (avgRealPct >= 35)               decadeRating = '平運';
    else                                     decadeRating = '逆運';

    let effortLabel: string; let effortSymbol: string; let effortColor: string;
    if (decadeRating === '旺運')      { effortLabel = '努力有用'; effortSymbol = '▲'; effortColor = 'text-green-400'; }
    else if (decadeRating === '逆運') { effortLabel = '守成待時'; effortSymbol = '▼'; effortColor = 'text-red-400'; }
    else if (hasChong)                { effortLabel = '謹慎行事'; effortSymbol = '→'; effortColor = 'text-orange-400'; }
    else                              { effortLabel = '慢工出細活'; effortSymbol = '→'; effortColor = 'text-amber-300'; }

    const wPeakIdx = adjW.indexOf(Math.max(...adjW));
    const gPeakIdx = adjG.indexOf(Math.max(...adjG));
    const wPeakYear = birthYear + yrs[wPeakIdx].age;
    const gPeakYear = birthYear + yrs[gPeakIdx].age;

    return { dy, yrs: yrs.length, avgAdjW, avgAdjG, peakAdjW, peakAdjG, realPctW, realPctG, dyInteract, lifeStage, decadeRating, effortLabel, effortSymbol, effortColor, wPeakYear, gPeakYear } as DaYunStat;
  }).filter(Boolean) as DaYunStat[], [daYunList, timeline, ceilW, ceilG, natalDayBranch]);

  // 生涯匯總：以大運兌現值計算
  const lifeMaxRealW = daYunStats.length > 0 ? Math.max(...daYunStats.map(s => s.peakAdjW)) : 0;
  const lifeMaxRealG = daYunStats.length > 0 ? Math.max(...daYunStats.map(s => s.peakAdjG)) : 0;
  const lifeAvgPctW  = daYunStats.length > 0 ? Math.round(daYunStats.reduce((s, d) => s + d.realPctW, 0) / daYunStats.length) : 0;
  const lifeAvgPctG  = daYunStats.length > 0 ? Math.round(daYunStats.reduce((s, d) => s + d.realPctG, 0) / daYunStats.length) : 0;

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

      {/* ── 大運人生階段總覽 ── */}
      <div className="bg-stone-900 border border-amber-800/50 rounded-xl p-5 space-y-4">
        <div className="text-xs text-amber-400 uppercase tracking-widest font-bold">
          大運人生階段總覽
          <span className="ml-2 text-stone-500 normal-case tracking-normal font-normal">
            （依年齡階段判斷關注重點，運勢評等已扣除刑沖害影響）
          </span>
        </div>

        {/* 大運人生階段卡片列 */}
        <div className="space-y-2">
          {daYunStats.map(s => {
            const ratingColor = s.decadeRating === '旺運' ? 'text-green-400' : s.decadeRating === '逆運' ? 'text-red-400' : 'text-amber-300';
            const ratingBg    = s.decadeRating === '旺運' ? 'border-green-800/50 bg-green-900/10' : s.decadeRating === '逆運' ? 'border-red-800/50 bg-red-900/10' : 'border-stone-700 bg-stone-800/40';
            const interactTip = s.dyInteract === 'chong' ? '大運沖日支' : s.dyInteract === 'xing' ? '大運刑日支' : s.dyInteract === 'hai' ? '大運害日支' : '';
            const isCurrent = timeline.some(y => y.daYunName === s.dy.name && y.calYear === new Date().getFullYear());
            return (
              <div key={s.dy.index} className={`rounded-lg border px-4 py-2.5 ${ratingBg} ${isCurrent ? 'ring-1 ring-amber-500/50' : ''}`}>
                {/* 第一行：基本資訊 */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* 大運名 + 年齡 */}
                  <div className="min-w-[4rem]">
                    <span className="font-bold text-amber-300 text-sm">{s.dy.name}</span>
                    <span className="text-[10px] text-stone-500 ml-1">{s.dy.startAge}-{s.dy.endAge}歲</span>
                    {isCurrent && <span className="ml-1 text-[9px] bg-amber-700 text-amber-100 px-1 rounded">現在</span>}
                  </div>
                  {/* 人生階段 */}
                  <span className="text-[10px] bg-stone-700 text-stone-300 px-2 py-0.5 rounded whitespace-nowrap">{s.lifeStage.label}</span>
                  {/* 運勢評等 */}
                  <span className={`text-xs font-bold ${ratingColor} whitespace-nowrap`}>{s.decadeRating}</span>
                  {/* 效能 */}
                  <span className={`text-xs font-bold ${s.effortColor} whitespace-nowrap`}>{s.effortSymbol} {s.effortLabel}</span>
                  {/* 財官兌現率 + 峰值年 */}
                  {s.lifeStage.canAnalyze && (
                    <>
                      <span className="text-[10px] text-stone-400 whitespace-nowrap">財{s.realPctW}%</span>
                      <span className="text-[10px] text-stone-400 whitespace-nowrap">官{s.realPctG}%</span>
                      <span className="text-[9px] text-stone-500 whitespace-nowrap">峰{s.wPeakYear}</span>
                    </>
                  )}
                  {/* 刑沖警示 */}
                  {interactTip && <span className="text-[10px] text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded">{interactTip}</span>}
                </div>
                {/* 第二行：生活事件提示 */}
                {(() => {
                  const hints = getDaYunEventHints(s);
                  return hints.length > 0 ? (
                    <div className="mt-1.5 pt-1.5 border-t border-stone-700/40 space-y-0.5">
                      {hints.map((h, i) => (
                        <div key={i} className="text-[10px] text-stone-300 leading-relaxed">
                          <span className="text-stone-500 mr-1">▸</span>{h}
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-stone-400">篩選：</span>
        {([
          { key: 'ALL',   label: `全部（${timeline.length}年）` },
          { key: 'SURGE', label: `宜衝刺年（${surgeYears.length}年）` },
          { key: 'GUARD', label: `宜守成年（${guardYears.length}年）` },
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
                  <th className="px-2 py-2 text-center">天干</th>
                  <th className="px-2 py-2 text-center">地支</th>
                  <th className="px-3 py-2 text-center">效能</th>
                  <th className="px-3 py-2 text-left">本年性質</th>
                </tr>
              </thead>
              <tbody>
                {displayedList.map((y, i) => {
                  const isSelected = filterType === 'ALL' ? selectedIdx === y.age : false;
                  const rowBg = isSelected ? 'bg-amber-900/30' : i % 2 === 0 ? '' : 'bg-stone-800/30';
                  const isSurge = y.cycleNature === 'BOOM' || y.cycleNature === 'FAVORABLE';
                  const isGuard = y.cycleNature === 'DEBT_HARDSHIP' || y.cycleNature === 'PRESSURE';
                  const effortSymbol = isSurge ? '▲' : isGuard ? '▼' : '→';
                  const effortColor  = isSurge ? 'text-green-400 font-bold' : isGuard ? 'text-red-400 font-bold' : 'text-stone-500';
                  return (
                    <tr key={y.calYear}
                      className={`cursor-pointer hover:bg-amber-900/20 transition-colors ${rowBg}`}
                      onClick={() => { setSelectedIdx(y.age); setFilterType('ALL'); }}>
                      <td className="px-3 py-1.5 font-bold text-stone-200">
                        {y.calYear} <span className="text-stone-500 font-normal">{y.yearName}</span>
                      </td>
                      <td className="px-3 py-1.5 text-center text-stone-400">{y.age}</td>
                      <td className="px-3 py-1.5 text-amber-300">{y.daYunName}</td>
                      <td className="px-2 py-1.5 text-center">
                        {(() => { const s2 = getShenLabel(mapStemToElement(y.yearName[0])); return <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${s2.color}`}>{s2.label}</span>; })()}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {(() => { const s2 = getShenLabel(EARTHLY_BRANCH_DATA[y.liuNianBranch]?.mainElement ?? 'Earth'); return <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${s2.color}`}>{s2.label}</span>; })()}
                      </td>
                      <td className={`px-3 py-1.5 text-center ${effortColor}`}>{effortSymbol}</td>
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
              <div className="text-xs text-amber-400 font-bold">本年財官實力（已調整至先天上限）</div>
              <div className="grid grid-cols-2 gap-2">
                {(() => {
                  const adjW = Math.min(currentYearData.wealthLevel.levelId, ceilW);
                  const adjG = Math.min(currentYearData.govLevel.levelId, ceilG);
                  const wBoom = adjW >= ceilW && currentYearData.isBoomYearWealth;
                  const gBoom = adjG >= ceilG && currentYearData.isBoomYearGov;
                  return (<>
                    <div className={`rounded-lg p-3 text-center border ${wBoom ? 'bg-amber-800/30 border-amber-700' : 'bg-stone-800 border-stone-700'}`}>
                      <div className="text-[10px] text-stone-400">財富</div>
                      <div className={`text-xl font-bold ${wBoom ? 'text-amber-400' : 'text-stone-300'}`}>{adjW}<span className="text-xs">級</span></div>
                      <div className="text-[9px] text-stone-500">上限 {ceilW} 級</div>
                    </div>
                    <div className={`rounded-lg p-3 text-center border ${gBoom ? 'bg-amber-800/30 border-amber-700' : 'bg-stone-800 border-stone-700'}`}>
                      <div className="text-[10px] text-stone-400">官貴</div>
                      <div className={`text-xl font-bold ${gBoom ? 'text-amber-400' : 'text-stone-300'}`}>{adjG}<span className="text-xs">級</span></div>
                      <div className="text-[9px] text-stone-500">上限 {ceilG} 級</div>
                    </div>
                  </>);
                })()}
              </div>
              {/* 人生階段關注重點 */}
              {(() => {
                const stage = getLifeStage(currentYearData.age);
                return (
                  <div className="mt-1 pt-2 border-t border-stone-700">
                    <div className="text-[10px] text-stone-500 mb-1">{stage.label} · 此階段關注</div>
                    <div className="flex flex-wrap gap-1">
                      {stage.focus.map(f => (
                        <span key={f} className="text-[10px] text-stone-300 bg-stone-700 px-2 py-0.5 rounded">{f}</span>
                      ))}
                    </div>
                  </div>
                );
              })()}
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
          {daYunStats.map(s => {
            const ratingBorder = s.decadeRating === '旺運' ? 'border-green-800 bg-green-900/10'
              : s.decadeRating === '逆運' ? 'border-red-800 bg-red-900/10'
              : 'border-stone-700 bg-stone-800';
            const ratingColor = s.decadeRating === '旺運' ? 'text-green-400'
              : s.decadeRating === '逆運' ? 'text-red-400'
              : 'text-amber-300';
            return (
              <div key={s.dy.name} className={`text-xs border rounded-lg px-3 py-2 text-center min-w-24 ${ratingBorder}`}>
                <div className="font-bold text-sm text-stone-100">{s.dy.name}</div>
                <div className="text-[10px] text-stone-500">{birthYear + s.dy.startAge}–{birthYear + s.dy.endAge}</div>
                <div className={`text-xs font-bold mt-1 ${ratingColor}`}>{s.decadeRating}</div>
                {s.lifeStage.canAnalyze && (
                  <>
                    <div className="text-[10px] text-stone-400 mt-0.5">財{s.realPctW}%·官{s.realPctG}%</div>
                    <div className="text-[9px] text-stone-500">峰{s.wPeakYear}</div>
                  </>
                )}
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
      // Parse birthDateTime (stored as UTC ISO, no timezone shift)
      const raw = c.birthDateTime.replace('Z', '').replace(/\+.*$/, '');
      const parts = raw.split(/[-T:]/);
      const birthYear   = parseInt(parts[0]);
      const birthMonth  = parseInt(parts[1]);
      const birthDay    = parseInt(parts[2]);
      const birthHour   = parts.length > 3 ? parseInt(parts[3]) : 0;
      const birthMinute = parts.length > 4 ? parseInt(parts[4]) : 0;
      const birthGender = c.gender;

      // Auto-save: PUT profile
      const profileRes = await fetch(`${API_URL}/Auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          chartName: c.name,
          birthYear, birthMonth, birthDay, birthHour,
          birthMinute, birthGender, dateType: 'solar',
        }),
      });
      if (!profileRes.ok) throw new Error('儲存生辰失敗');

      // POST calculate
      const calcBody = {
        year: birthYear, month: birthMonth, day: birthDay,
        hour: birthHour, minute: birthMinute,
        gender: birthGender, name: c.name, dateType: 'solar',
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

  const xchhResult = useMemo(() => {
    if (!chart || !scores) return null;
    return applyXingChongHeHai(chart, scores);
  }, [chart, scores]);

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
                      #{c.customerCode} · {c.birthDateTime?.substring(0, 10)} · {c.gender === 2 ? '女' : '男'}
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
        {chart && scores && xchhResult && apiData && (
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
                {xchhResult.entries.length > 0 && (
                  <span className="ml-2 text-orange-400">刑沖合害 {xchhResult.entries.length}組</span>
                )}
              </div>
            </div>

            {activeTab === 'engine'  && <EngineTab  chart={chart} apiData={apiData} xchhResult={xchhResult} />}
            {activeTab === 'fortune' && <FortuneTab chart={chart} scores={xchhResult.scores} apiData={apiData} />}
            {activeTab === 'dynamic' && <DynamicTab chart={chart} birthYear={apiData.birthYear} apiData={apiData} natalScores={xchhResult.scores} />}
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
