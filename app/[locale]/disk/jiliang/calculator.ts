// Eight Pillars Scientific Calculation Engine
// Ported from AI Studio baziCalculator.ts with yongShenElem override support

export type Element = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';

export const ELEMENT_NAMES: Record<Element, string> = {
  Wood: '\u6728', Fire: '\u706b', Earth: '\u571f', Metal: '\u91d1', Water: '\u6c34',
};

export const ELEM_FROM_CHINESE: Record<string, Element> = {
  '\u6728': 'Wood', '\u706b': 'Fire', '\u571f': 'Earth', '\u91d1': 'Metal', '\u6c34': 'Water',
};

export const ELEMENT_COLORS: Record<Element, { bg: string; text: string; border: string; badge: string; hex: string }> = {
  Wood:  { bg: 'bg-green-900/20', text: 'text-green-400', border: 'border-green-800', badge: 'bg-green-800 text-white', hex: '#4ade80' },
  Fire:  { bg: 'bg-red-900/20',   text: 'text-red-400',   border: 'border-red-800',   badge: 'bg-red-800 text-white',   hex: '#f87171' },
  Earth: { bg: 'bg-amber-900/20', text: 'text-amber-400', border: 'border-amber-800', badge: 'bg-amber-800 text-white', hex: '#fbbf24' },
  Metal: { bg: 'bg-gray-700/30',  text: 'text-gray-300',  border: 'border-gray-600',  badge: 'bg-gray-600 text-white',  hex: '#d1d5db' },
  Water: { bg: 'bg-blue-900/20',  text: 'text-blue-400',  border: 'border-blue-800',  badge: 'bg-blue-800 text-white',  hex: '#60a5fa' },
};

export interface EarthlyBranchInfo {
  name: string;
  mainElement: Element;
  hiddenElements: Element[];
  hiddenStems: string[];
  animal: string;
}

export interface BaziChart {
  heavenlyStems: string[];        // [Year, Month, Day, Hour]
  earthlyBranches: EarthlyBranchInfo[];
  name?: string;
  gender?: 'male' | 'female';
}

export interface DaYunPeriod {
  index: number;
  stem: string;
  branch: string;
  name: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
}

export interface DynamicYearScore {
  calYear: number;
  age: number;
  yearName: string;
  daYunName: string;
  daYunStem: string;
  daYunBranch: string;
  scores: Record<Element, number>;
  wealthScore: number;
  govScore: number;
  wealthLevel: ReturnType<typeof getFortuneAnalysis>;
  govLevel: ReturnType<typeof getFortuneAnalysis>;
  isBoomYearWealth: boolean;
  isBoomYearGov: boolean;
  isDebtStruggleYear: boolean;
  cycleNature: 'BOOM' | 'FAVORABLE' | 'NEUTRAL' | 'TEACHING_LEISURE' | 'DEBT_HARDSHIP' | 'PRESSURE';
  cycleNatureText: string;
  cycleNatureTag: string;
  cycleExplanation: string;
  dynamicGongHuiList: { pair: [string, string]; targetElement: Element; targetName: string; points: number; source: string }[];
}

export interface FortuneLevel {
  levelId: number;
  categoryType: 'GOV' | 'WEALTH';
  levelName: string;
  socialStatus: string;
  assetScale: string;
}

export interface ScoreStepBreakdown {
  tier1Stems: { stem: string; element: Element; pillar: string; points: number }[];
  tier2Branches: { branch: string; pillar: string; main: { element: Element; points: number }; hidden: { stem: string; element: Element; points: number }[] }[];
  tier3GongHui: { pair: [string, string]; position: string; targetElement: Element; targetName: string; type: 'gong' | 'hui'; points: number; explanation: string }[];
  tier4MonthWeight: { monthBranch: string; monthElement: Element; originalScore: number; multiplier: number; finalScore: number };
}

export const EARTHLY_BRANCH_DATA: Record<string, EarthlyBranchInfo> = {
  '\u5b50': { name: '\u5b50', mainElement: 'Water', hiddenElements: ['Water'], hiddenStems: ['\u7678'], animal: '\u9f20' },
  '\u4e11': { name: '\u4e11', mainElement: 'Earth', hiddenElements: ['Water', 'Metal'], hiddenStems: ['\u5df1', '\u7678', '\u8f9b'], animal: '\u725b' },
  '\u5bc5': { name: '\u5bc5', mainElement: 'Wood', hiddenElements: ['Fire', 'Earth'], hiddenStems: ['\u7532', '\u4e19', '\u620a'], animal: '\u864e' },
  '\u536f': { name: '\u536f', mainElement: 'Wood', hiddenElements: ['Wood'], hiddenStems: ['\u4e59'], animal: '\u5154' },
  '\u8fb0': { name: '\u8fb0', mainElement: 'Earth', hiddenElements: ['Wood', 'Water'], hiddenStems: ['\u620a', '\u4e59', '\u7678'], animal: '\u9f8d' },
  '\u5df3': { name: '\u5df3', mainElement: 'Fire', hiddenElements: ['Metal', 'Earth'], hiddenStems: ['\u4e19', '\u5e9a', '\u620a'], animal: '\u86c7' },
  '\u5348': { name: '\u5348', mainElement: 'Fire', hiddenElements: ['Earth'], hiddenStems: ['\u4e01', '\u5df1'], animal: '\u99ac' },
  '\u672a': { name: '\u672a', mainElement: 'Earth', hiddenElements: ['Fire', 'Wood'], hiddenStems: ['\u5df1', '\u4e01', '\u4e59'], animal: '\u7f8a' },
  '\u7533': { name: '\u7533', mainElement: 'Metal', hiddenElements: ['Water', 'Earth'], hiddenStems: ['\u5e9a', '\u58ec', '\u620a'], animal: '\u7334' },
  '\u9149': { name: '\u9149', mainElement: 'Metal', hiddenElements: ['Metal'], hiddenStems: ['\u8f9b'], animal: '\u96de' },
  '\u620c': { name: '\u620c', mainElement: 'Earth', hiddenElements: ['Metal', 'Fire'], hiddenStems: ['\u620a', '\u8f9b', '\u4e01'], animal: '\u72d7' },
  '\u4ea5': { name: '\u4ea5', mainElement: 'Water', hiddenElements: ['Wood'], hiddenStems: ['\u58ec', '\u7532'], animal: '\u8c6c' },
};

export const FORTUNE_LEVELS: FortuneLevel[] = [
  { levelId: 9, categoryType: 'GOV',    levelName: '\u4e5d\u7d1a(\u6975\u54c1)',       socialStatus: '\u570b\u5bb6\u5143\u9996\u3001\u570b\u969b\u9818\u8896',             assetScale: '\u8de8\u570b\u8d85\u7d1a\u5de8\u982d\u5275\u8fa6\u4eba\u3001\u5168\u7403\u6c7a\u7b56\u8005' },
  { levelId: 7, categoryType: 'GOV',    levelName: '\u4e03\u7d1a\u683c\u5c40',         socialStatus: '\u90e8\u6703\u9996\u9577\u3001\u5730\u65b9\u8af8\u4faf\u3001\u5927\u578b\u6a5f\u69cb\u6c7a\u7b56\u8005', assetScale: '\u5404\u90e8\u6703\u9996\u9577\u3001\u7e23\u5e02\u9577\u3001\u767e\u5104\u4f01\u696d\u8607\u4e8b\u6703\u6838\u5fc3' },
  { levelId: 5, categoryType: 'GOV',    levelName: '\u4e94\u7d1a\u683c\u5c40',         socialStatus: '\u4e2d\u9ad8\u968e\u4e3b\u7ba1\u3001\u516c\u5354\u7406\u4e8b\u9577\u3001\u8cc7\u6df1\u6b0a\u5a01\u9867\u554f', assetScale: '\u6a5f\u95dc\u79d1\u8655\u9577\u3001\u4f01\u696d\u9ad8\u7ba1\u3001\u5c08\u696d\u9818\u57df\u540d\u5e2b' },
  { levelId: 3, categoryType: 'GOV',    levelName: '\u4e09\u7d1a\u683c\u5c40',         socialStatus: '\u5c08\u696d\u8b1b\u5e2b\u3001\u57fa\u5c64\u5e79\u90e8\u3001\u793e\u5718\u63a8\u5ee3\u9aa8\u5e79', assetScale: '\u81ea\u7531\u57f9\u8a13\u5e2b\u3001\u57fa\u5c64\u4e3b\u7ba1\u3001\u53d7\u4eba\u5c0a\u656c\u4e4b\u6587\u5316\u6559\u80b2\u5de5\u4f5c\u8005' },
  { levelId: 1, categoryType: 'GOV',    levelName: '\u4e00\u7d1a\u683c\u5c40',         socialStatus: '\u5e73\u6c11\u767e\u59d3\u3001\u81ea\u7531\u767c\u5c55\u3001\u60a0\u9592\u81ea\u9069', assetScale: '\u81ea\u7531\u767c\u5c55\u3001\u81ea\u7acb\u5de5\u4f5c\u8005\u3001\u5b89\u4eab\u9000\u4f11\u6e05\u798f' },
  { levelId: 9, categoryType: 'WEALTH', levelName: '\u9802\u7d1a\u8ca1\u5bcc(\u4e5d\u7d1a)', socialStatus: '\u5bcc\u53ef\u654b\u570b\u3001\u5168\u7403\u5bcc\u8c6a\u699c', assetScale: '\u8cc7\u7522\u9054\u6578\u767e\u5104\u81f3\u5343\u5104\u65b0\u53f0\u5e63' },
  { levelId: 7, categoryType: 'WEALTH', levelName: '\u7279\u7d1a\u8ca1\u5bcc(\u4e03\u7d1a)', socialStatus: '\u5de8\u5bcc\u3001\u5730\u65b9\u5927\u5be6\u696d\u5bb6', assetScale: '\u8cc7\u7522\u9054\u6578\u5104\u81f3\u6578\u5341\u5104\u65b0\u53f0\u5e63' },
  { levelId: 5, categoryType: 'WEALTH', levelName: '\u9ad8\u7d1a\u8ca1\u5bcc(\u4e94\u7d1a)', socialStatus: '\u5927\u5bcc\u3001\u4f01\u696d\u4e3b\u3001\u8cc7\u6df1\u6295\u8cc7\u9867\u554f', assetScale: '\u8ca1\u52d9\u81ea\u7531\u3001\u8cc7\u7522\u5145\u88d5\u3001\u5177\u591a\u8655\u623f\u7522\u6216\u8c50\u539a\u88ab\u52d5\u6295\u8cc7\u6536\u76ca' },
  { levelId: 3, categoryType: 'WEALTH', levelName: '\u4e2d\u7d1a\u8ca1\u5bcc(\u4e09\u7d1a)', socialStatus: '\u7a69\u5b9a\u4e2d\u7522\u3001\u6a02\u6d3b\u9000\u4f11\u3001\u5c08\u696d\u81ea\u71df', assetScale: '\u8ca1\u52d9\u7a69\u5065\u7121\u8ca0\u50b5\u3001\u9000\u4f11\u91d1\u8207\u6388\u8ab2\u63a8\u5ee3\u6536\u5165\u517c\u5099' },
  { levelId: 1, categoryType: 'WEALTH', levelName: '\u521d\u7d1a\u8ca1\u5bcc(\u4e00\u7d1a)', socialStatus: '\u5c0f\u5eb7\u3001\u81ea\u7d66\u81ea\u8db3\u3001\u6e05\u9592\u7121\u50b5', assetScale: '\u6536\u5165\u5e73\u5be6\u4f46\u8ca1\u52d9\u5065\u5168\u7121\u8ca0\u64d4\uff0c\u886e\u98df\u81ea\u8db3' },
];

const SCORE_MAPPINGS = [
  { minScore: 80, targetLevel: 9 },
  { minScore: 60, targetLevel: 7 },
  { minScore: 40, targetLevel: 5 },
  { minScore: 20, targetLevel: 3 },
  { minScore: 0,  targetLevel: 1 },
];

const SIXTY_JIAZI = [
  '\u7532\u5b50','\u4e59\u4e11','\u4e19\u5bc5','\u4e01\u536f','\u620a\u8fb0','\u5df1\u5df3','\u5e9a\u5348','\u8f9b\u672a','\u58ec\u7533','\u7678\u9149',
  '\u7532\u620c','\u4e59\u4ea5','\u4e19\u5b50','\u4e01\u4e11','\u620a\u5bc5','\u5df1\u536f','\u5e9a\u8fb0','\u8f9b\u5df3','\u58ec\u5348','\u7678\u672a',
  '\u7532\u7533','\u4e59\u9149','\u4e19\u620c','\u4e01\u4ea5','\u620a\u5b50','\u5df1\u4e11','\u5e9a\u5bc5','\u8f9b\u536f','\u58ec\u8fb0','\u7678\u5df3',
  '\u7532\u5348','\u4e59\u672a','\u4e19\u7533','\u4e01\u9149','\u620a\u620c','\u5df1\u4ea5','\u5e9a\u5b50','\u8f9b\u4e11','\u58ec\u5bc5','\u7678\u536f',
  '\u7532\u8fb0','\u4e59\u5df3','\u4e19\u5348','\u4e01\u672a','\u620a\u7533','\u5df1\u9149','\u5e9a\u620c','\u8f9b\u4ea5','\u58ec\u5b50','\u7678\u4e11',
  '\u7532\u5bc5','\u4e59\u536f','\u4e19\u8fb0','\u4e01\u5df3','\u620a\u5348','\u5df1\u672a','\u5e9a\u7533','\u8f9b\u9149','\u58ec\u620c','\u7678\u4ea5',
];

export function mapStemToElement(stem: string): Element {
  if (stem === '\u7532' || stem === '\u4e59') return 'Wood';
  if (stem === '\u4e19' || stem === '\u4e01') return 'Fire';
  if (stem === '\u620a' || stem === '\u5df1') return 'Earth';
  if (stem === '\u5e9a' || stem === '\u8f9b') return 'Metal';
  return 'Water'; // ren, gui
}

function isMatch(b1: string, b2: string, t1: string, t2: string): boolean {
  return (b1 === t1 && b2 === t2) || (b1 === t2 && b2 === t1);
}

export function createEmptyScores(): Record<Element, number> {
  return { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
}

function applyStaticGongHui(branchNames: string[], scores: Record<Element, number>): void {
  for (let i = 0; i < branchNames.length - 1; i++) {
    const b1 = branchNames[i]; const b2 = branchNames[i + 1];
    if (!b1 || !b2) continue;
    if (isMatch(b1, b2, '\u5b50', '\u5bc5')) scores['Earth'] += 12;
    if (isMatch(b1, b2, '\u5bc5', '\u8fb0') || isMatch(b1, b2, '\u4ea5', '\u672a')) scores['Wood'] += 12;
    if (isMatch(b1, b2, '\u5df3', '\u672a') || isMatch(b1, b2, '\u5bc5', '\u620c')) scores['Fire'] += 12;
    if (isMatch(b1, b2, '\u7533', '\u620c') || isMatch(b1, b2, '\u5df3', '\u4e11')) scores['Metal'] += 12;
    if (isMatch(b1, b2, '\u7533', '\u8fb0')) scores['Water'] += 12;
    if (isMatch(b1, b2, '\u4ea5', '\u4e11')) scores['Water'] += 12;
  }
}

export function calculateScores(chart: BaziChart): Record<Element, number> {
  const scores = createEmptyScores();
  for (const stem of chart.heavenlyStems) scores[mapStemToElement(stem)] += 10;
  for (const br of chart.earthlyBranches) {
    scores[br.mainElement] += 15;
    for (const h of br.hiddenElements) scores[h] += 5;
  }
  applyStaticGongHui(chart.earthlyBranches.map(b => b.name), scores);
  if (chart.earthlyBranches.length > 1) {
    const mEl = chart.earthlyBranches[1].mainElement;
    scores[mEl] = Math.round(scores[mEl] * 1.3 * 10) / 10;
  }
  return scores;
}

export function getCalculationBreakdown(chart: BaziChart): { scores: Record<Element, number>; breakdown: ScoreStepBreakdown } {
  const pillarNames = ['\u5e74\u67f1', '\u6708\u67f1', '\u65e5\u67f1', '\u6642\u67f1'];
  const scores = createEmptyScores();

  const tier1Stems: ScoreStepBreakdown['tier1Stems'] = [];
  chart.heavenlyStems.forEach((stem, idx) => {
    const el = mapStemToElement(stem);
    scores[el] += 10;
    tier1Stems.push({ stem, element: el, pillar: pillarNames[idx], points: 10 });
  });

  const tier2Branches: ScoreStepBreakdown['tier2Branches'] = [];
  chart.earthlyBranches.forEach((br, idx) => {
    scores[br.mainElement] += 15;
    const hiddenList: { stem: string; element: Element; points: number }[] = [];
    br.hiddenElements.forEach((hEl, hIdx) => {
      scores[hEl] += 5;
      hiddenList.push({ stem: br.hiddenStems[hIdx] || '', element: hEl, points: 5 });
    });
    tier2Branches.push({ branch: br.name, pillar: pillarNames[idx], main: { element: br.mainElement, points: 15 }, hidden: hiddenList });
  });

  const tier3GongHui: ScoreStepBreakdown['tier3GongHui'] = [];
  const branchNames = chart.earthlyBranches.map(b => b.name);
  for (let i = 0; i < 3; i++) {
    const b1 = branchNames[i]; const b2 = branchNames[i + 1];
    if (!b1 || !b2) continue;
    const pos = `${pillarNames[i]}\u8207${pillarNames[i + 1]}`;
    const add = (el: Element, name: string, type: 'gong' | 'hui', exp: string) => {
      scores[el] += 12;
      tier3GongHui.push({ pair: [b1, b2], position: pos, targetElement: el, targetName: name, type, points: 12, explanation: exp });
    };
    if (isMatch(b1, b2, '\u5b50', '\u5bc5')) add('Earth', '\u4e11\u571f', 'gong', '\u5b50\u5bc5\u9694\u89d2\u6697\u62f1\u3010\u4e11\u3011\u571f\uff0c\u7121\u4e2d\u751f\u6709\u704c\u5165\u571f\u80fd\u91cf 12 \u5206');
    if (isMatch(b1, b2, '\u5bc5', '\u8fb0')) add('Wood', '\u536f\u6728', 'gong', '\u5bc5\u8fb0\u4e09\u6703\u7f3a\u4e2d\u5b57\uff0c\u6697\u62f1\u3010\u536f\u3011\u6728\uff0c\u6ce8\u5165\u6728\u80fd\u91cf 12 \u5206');
    if (isMatch(b1, b2, '\u4ea5', '\u672a')) add('Wood', '\u536f\u6728', 'gong', '\u4ea5\u672a\u534a\u4e09\u5408\u7f3a\u4e2d\u5b57\uff0c\u6697\u62f1\u3010\u536f\u3011\u6728\u5e1d\u65fa\uff0c\u6ce8\u5165\u6728\u80fd\u91cf 12 \u5206');
    if (isMatch(b1, b2, '\u5df3', '\u672a')) add('Fire', '\u5348\u706b', 'gong', '\u5df3\u672a\u6697\u62f1\u3010\u5348\u3011\u706b\uff0c\u6ce8\u5165\u706b\u80fd\u91cf 12 \u5206');
    if (isMatch(b1, b2, '\u5bc5', '\u620c')) add('Fire', '\u5348\u706b', 'gong', '\u5bc5\u620c\u534a\u5408\u6697\u62f1\u3010\u5348\u3011\u706b\u5e1d\u65fa\uff0c\u6ce8\u5165\u706b\u80fd\u91cf 12 \u5206');
    if (isMatch(b1, b2, '\u7533', '\u620c')) add('Metal', '\u9149\u91d1', 'gong', '\u7533\u620c\u6697\u62f1\u3010\u9149\u3011\u91d1\uff0c\u6ce8\u5165\u91d1\u80fd\u91cf 12 \u5206');
    if (isMatch(b1, b2, '\u5df3', '\u4e11')) add('Metal', '\u9149\u91d1', 'gong', '\u5df3\u4e11\u534a\u5408\u6697\u62f1\u3010\u9149\u3011\u91d1\u5e1d\u65fa\uff0c\u6ce8\u5165\u91d1\u80fd\u91cf 12 \u5206');
    if (isMatch(b1, b2, '\u7533', '\u8fb0')) add('Water', '\u5b50\u6c34', 'gong', '\u7533\u8fb0\u534a\u5408\u6697\u62f1\u3010\u5b50\u3011\u6c34\u4e2d\u795e\uff0c\u6ce8\u5165\u6c34\u80fd\u91cf 12 \u5206');
    if (isMatch(b1, b2, '\u4ea5', '\u4e11')) add('Water', '\u5b50\u6c34', 'hui', '\u4ea5\u4e11\u4e09\u6703\u65b9\u7f3a\u4e2d\u5b57\uff0c\u6697\u6703\u3010\u5b50\u3011\u6c34\uff0c\u6ce8\u5165\u6c34\u80fd\u91cf 12 \u5206');
  }

  const monthBr = chart.earthlyBranches[1];
  const mEl = monthBr.mainElement;
  const orig = scores[mEl];
  const final = Math.round(orig * 1.3 * 10) / 10;
  scores[mEl] = final;
  const tier4MonthWeight: ScoreStepBreakdown['tier4MonthWeight'] = {
    monthBranch: monthBr.name, monthElement: mEl,
    originalScore: orig, multiplier: 1.3, finalScore: final,
  };
  return { scores, breakdown: { tier1Stems, tier2Branches, tier3GongHui, tier4MonthWeight } };
}

export function getTenGodsElements(dayMaster: string): {
  self: Element; output: Element; wealth: Element; officer: Element; resource: Element;
} {
  const self = mapStemToElement(dayMaster);
  const cycle: Element[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  const idx = cycle.indexOf(self);
  return {
    self:     cycle[idx],
    output:   cycle[(idx + 1) % 5],
    wealth:   cycle[(idx + 2) % 5],
    officer:  cycle[(idx + 3) % 5],
    resource: cycle[(idx + 4) % 5],
  };
}

export function getFortuneAnalysis(score: number, category: 'GOV' | 'WEALTH', targetElement: Element) {
  const rounded = Math.round(score);
  let targetLevel = 1;
  for (const m of SCORE_MAPPINGS) {
    if (rounded >= m.minScore) { targetLevel = m.targetLevel; break; }
  }
  const info = FORTUNE_LEVELS.find(l => l.levelId === targetLevel && l.categoryType === category)
    || { levelId: targetLevel, categoryType: category, levelName: `${targetLevel}\u7d1a`, socialStatus: '\u6a19\u6e96\u968e\u5c64', assetScale: '\u6a19\u6e96\u898f\u6a21' };
  return { ...info, calculatedScore: rounded, targetElement };
}

function getYearGanzhi(year: number): { stem: string; branch: string; name: string } {
  const offset = ((year - 1984) % 60 + 60) % 60;
  const gz = SIXTY_JIAZI[offset];
  return { stem: gz[0], branch: gz[1], name: gz };
}

export interface JiLiangApiData {
  pillars: {
    year:  { stem: string; branch: string };
    month: { stem: string; branch: string };
    day:   { stem: string; branch: string };
    hour:  { stem: string; branch: string };
  };
  yongShenElem: string;  // Chinese element name
  fuYiElem: string;
  jiShenElem: string;
  pattern: string;
  bodyPct: number;
  gender: number;
  birthYear: number;
  name: string;
  luckCycles: { stem: string; branch: string; startAge: number; endAge: number }[];
}

export function buildChartFromApi(data: JiLiangApiData): BaziChart {
  const { pillars } = data;
  return {
    heavenlyStems: [pillars.year.stem, pillars.month.stem, pillars.day.stem, pillars.hour.stem],
    earthlyBranches: [
      EARTHLY_BRANCH_DATA[pillars.year.branch]  || EARTHLY_BRANCH_DATA['\u5b50'],
      EARTHLY_BRANCH_DATA[pillars.month.branch] || EARTHLY_BRANCH_DATA['\u5b50'],
      EARTHLY_BRANCH_DATA[pillars.day.branch]   || EARTHLY_BRANCH_DATA['\u5b50'],
      EARTHLY_BRANCH_DATA[pillars.hour.branch]  || EARTHLY_BRANCH_DATA['\u5b50'],
    ],
    name: data.name,
    gender: data.gender === 2 ? 'female' : 'male',
  };
}

export function generateDynamicTimeline(
  chart: BaziChart,
  birthYear: number,
  luckCycles: { stem: string; branch: string; startAge: number; endAge: number }[],
  yongShenElem: string,
  fuYiElem: string,
  jiShenElem: string,
  spanYears: number = 80
): {
  timeline: DynamicYearScore[];
  boomYearsWealth: DynamicYearScore[];
  boomYearsGov: DynamicYearScore[];
  debtYears: DynamicYearScore[];
  daYunList: DaYunPeriod[];
} {
  const dayMaster = chart.heavenlyStems[2] || '\u7532';
  const tenGods = getTenGodsElements(dayMaster);

  const daYunList: DaYunPeriod[] = luckCycles.map((lc, i) => ({
    index: i + 1, stem: lc.stem, branch: lc.branch, name: lc.stem + lc.branch,
    startAge: lc.startAge, endAge: lc.endAge,
    startYear: birthYear + lc.startAge, endYear: birthYear + lc.endAge,
  }));

  // Override favorable/unfavorable using our system's yongShenElem
  const favorableList: Element[] = [];
  const unfavorableList: Element[] = [];
  const yongEl = ELEM_FROM_CHINESE[yongShenElem];
  const fuYiEl = ELEM_FROM_CHINESE[fuYiElem];
  const jiEl   = ELEM_FROM_CHINESE[jiShenElem];
  if (yongEl) favorableList.push(yongEl);
  if (fuYiEl && !favorableList.includes(fuYiEl)) favorableList.push(fuYiEl);
  if (jiEl) unfavorableList.push(jiEl);

  const baseScores = calculateScores(chart);
  const selfScore = baseScores[tenGods.self] || 0;
  const resourceScore = baseScores[tenGods.resource] || 0;
  const supportScore = selfScore + resourceScore;
  const totalScore = Object.values(baseScores).reduce((a, b) => a + b, 0);
  const supportRatio = totalScore > 0 ? supportScore / totalScore : 0.5;
  const isWeak = supportRatio < 0.42;
  const isStrong = supportRatio >= 0.5;

  const timeline: DynamicYearScore[] = [];

  for (let offset = 0; offset < spanYears; offset++) {
    const calYear = birthYear + offset;
    const age = offset;

    let activeDaYun = daYunList.find(d => age >= d.startAge && age <= d.endAge);
    if (!activeDaYun) {
      if (age < (daYunList[0]?.startAge || 4)) {
        activeDaYun = daYunList[0] ? {
          index: 0, stem: chart.heavenlyStems[1], branch: chart.earthlyBranches[1].name,
          name: chart.heavenlyStems[1] + chart.earthlyBranches[1].name,
          startAge: 0, endAge: daYunList[0].startAge - 1,
          startYear: birthYear, endYear: birthYear + daYunList[0].startAge - 1,
        } : daYunList[0];
      } else {
        activeDaYun = daYunList[daYunList.length - 1];
      }
    }
    if (!activeDaYun) continue;

    const daYunBranchInfo = EARTHLY_BRANCH_DATA[activeDaYun.branch] || EARTHLY_BRANCH_DATA['\u5b50'];
    const liuNianInfo = getYearGanzhi(calYear);
    const liuNianBranchInfo = EARTHLY_BRANCH_DATA[liuNianInfo.branch] || EARTHLY_BRANCH_DATA['\u5b50'];

    // Build dynamic scores
    const dynScores: Record<Element, number> = { ...baseScores };
    dynScores[mapStemToElement(activeDaYun.stem)] += 10;
    dynScores[daYunBranchInfo.mainElement] += 15;
    for (const h of daYunBranchInfo.hiddenElements) dynScores[h] += 5;
    dynScores[mapStemToElement(liuNianInfo.stem)] += 10;
    dynScores[liuNianBranchInfo.mainElement] += 15;
    for (const h of liuNianBranchInfo.hiddenElements) dynScores[h] += 5;

    // Dynamic gong/hui (+20 pts each)
    const labeledBranches = [
      ...chart.earthlyBranches.map((b, i) => ({ name: b.name, isDynamic: false })),
      { name: daYunBranchInfo.name, isDynamic: true },
      { name: liuNianBranchInfo.name, isDynamic: true },
    ];
    const dynGongHuiList: DynamicYearScore['dynamicGongHuiList'] = [];
    for (let i = 0; i < labeledBranches.length; i++) {
      for (let j = i + 1; j < labeledBranches.length; j++) {
        if (!labeledBranches[i].isDynamic && !labeledBranches[j].isDynamic) continue;
        const b1 = labeledBranches[i].name; const b2 = labeledBranches[j].name;
        const addDyn = (el: Element, name: string) => {
          dynScores[el] += 20;
          dynGongHuiList.push({ pair: [b1, b2], targetElement: el, targetName: name, points: 20, source: `${b1} x ${b2}` });
        };
        if (isMatch(b1, b2, '\u5b50', '\u5bc5')) addDyn('Earth', '\u4e11\u571f');
        if (isMatch(b1, b2, '\u5df3', '\u672a') || isMatch(b1, b2, '\u5bc5', '\u620c')) addDyn('Fire', '\u5348\u706b');
        if (isMatch(b1, b2, '\u5bc5', '\u8fb0') || isMatch(b1, b2, '\u4ea5', '\u672a')) addDyn('Wood', '\u536f\u6728');
        if (isMatch(b1, b2, '\u7533', '\u620c') || isMatch(b1, b2, '\u5df3', '\u4e11')) addDyn('Metal', '\u9149\u91d1');
        if (isMatch(b1, b2, '\u7533', '\u8fb0') || isMatch(b1, b2, '\u4ea5', '\u4e11')) addDyn('Water', '\u5b50\u6c34');
      }
    }

    // Stem trigger multiplier: liunian stem triggers original chart branch (x1.5)
    const liuNianStemEl = mapStemToElement(liuNianInfo.stem);
    for (const b of chart.earthlyBranches) {
      if (b.mainElement === liuNianStemEl) {
        dynScores[liuNianStemEl] = Math.round(dynScores[liuNianStemEl] * 1.5 * 10) / 10;
        break;
      }
    }
    for (const key of Object.keys(dynScores) as Element[]) {
      dynScores[key] = Math.round(dynScores[key] * 10) / 10;
    }

    const daYunStemEl    = mapStemToElement(activeDaYun.stem);
    const daYunBranchEl  = daYunBranchInfo.mainElement;
    const liuNianStemEl2 = mapStemToElement(liuNianInfo.stem);
    const liuNianBranchEl = liuNianBranchInfo.mainElement;

    const isDaYunFavorable      = favorableList.includes(daYunBranchEl) || (favorableList.includes(daYunStemEl) && !unfavorableList.includes(daYunBranchEl));
    const isDaYunHeavyUnfav     = unfavorableList.includes(daYunBranchEl) && unfavorableList.includes(daYunStemEl);
    const isLiuNianFavorable    = favorableList.includes(liuNianBranchEl) || favorableList.includes(liuNianStemEl2);

    let favorableScore = 0; let unfavorableScore = 0;
    favorableList.forEach(el => { favorableScore += dynScores[el] || 0; });
    unfavorableList.forEach(el => { unfavorableScore += dynScores[el] || 0; });

    let isDebtStruggleYear = false;
    let isBoomYearWealth = false;
    let isBoomYearGov = false;
    let cycleNature: DynamicYearScore['cycleNature'] = 'NEUTRAL';
    let cycleNatureText = '\u5e73\u7a69\u904e\u6e21\u671f';
    let cycleNatureTag  = '\u5e73\u7a69\u904b\u8f49';
    let cycleExplanation = '';
    let wealthBaseScore = 0;
    let govBaseScore = 0;

    if (age >= 55) {
      if (daYunBranchEl === tenGods.output || daYunStemEl === tenGods.output || liuNianBranchEl === tenGods.output) {
        cycleNature = 'TEACHING_LEISURE';
        cycleNatureTag = '\u8b1b\u5b78\u63a8\u5ee3 \u00b7 \u9000\u800c\u4e0d\u4f11';
        cycleNatureText = '\u98df\u50b7\u5410\u79c0 \u00b7 \u50b3\u9053\u6388\u696d (\u6e05\u798f\u7121\u50b5)';
        cycleExplanation = `\u5927\u904b\u3010${activeDaYun.name}\u3011\u9003\u98df\u50b7\u661f\u5410\u79c0\u3002\u6b65\u5165\u719f\u9f61\u9000\u4f11\u671f\uff0c\u98df\u50b7\u5316\u70ba\u624d\u8853\u8f38\u51fa\u3001\u8b1b\u5e2b\u6388\u8ab2\u4e4b\u5409\u8c61\u3002`;
        wealthBaseScore = Math.max(22, Math.min(38, Math.round(25 + (dynScores[tenGods.wealth] || 0) * 0.15)));
        govBaseScore = Math.max(22, Math.min(39, Math.round(26 + (dynScores[tenGods.officer] || 0) * 0.18)));
      } else if (isDaYunFavorable) {
        cycleNature = 'BOOM';
        cycleNatureTag = '\u559c\u7528\u5f97\u529b \u00b7 \u798f\u58fd\u5eb7\u5be7';
        cycleNatureText = '\u7528\u795e\u751f\u65fa \u00b7 \u665a\u666f\u8c50\u76c8 (\u798f\u6fa4\u7dbf\u9577)';
        cycleExplanation = `\u5927\u904b\u3010${activeDaYun.name}\u3011\u6b63\u9022\u559c\u7528\u751f\u65fa\u4e4b\u9109\uff01\u7cbe\u795e\u77cd\u7730\uff0c\u5fb7\u671b\u65e5\u96c6\uff0c\u4eab\u53d7\u9ad8\u96c5\u60a0\u9592\u4e4b\u665a\u5e74\u6e05\u798f\u3002`;
        const rawWealth = (dynScores[tenGods.wealth] || 0) + (dynScores[tenGods.output] || 0) * 0.3;
        wealthBaseScore = Math.min(92, Math.max(55, Math.round(rawWealth * 0.8 + favorableScore * 0.3)));
        govBaseScore    = Math.min(90, Math.max(50, Math.round((dynScores[tenGods.officer] || 0) * 0.75 + favorableScore * 0.3)));
        if (wealthBaseScore >= 60) isBoomYearWealth = true;
        if (govBaseScore >= 60)    isBoomYearGov = true;
      } else {
        cycleNature = 'NEUTRAL';
        cycleNatureTag = '\u60a0\u9592\u5b89\u6cf0';
        cycleNatureText = '\u9000\u4f11\u81ea\u5f97 \u00b7 \u6b65\u8abf\u5f9e\u5bb9 (\u77e5\u8db3\u9577\u6a02)';
        cycleExplanation = `\u5927\u904b\u3010${activeDaYun.name}\u3011\u6c23\u904b\u5e73\u9806\uff0c\u751f\u6d3b\u4f5c\u606f\u60a0\u9592\u81ea\u5f97\u3002`;
        wealthBaseScore = Math.max(20, Math.min(35, Math.round(22 + (dynScores[tenGods.resource] || 0) * 0.15)));
        govBaseScore    = Math.max(18, Math.min(32, Math.round(20 + (dynScores[tenGods.officer] || 0) * 0.12)));
      }
    } else if (age < 23) {
      cycleNature = isLiuNianFavorable ? 'FAVORABLE' : 'NEUTRAL';
      cycleNatureTag = isLiuNianFavorable ? '\u5b78\u696d\u901a\u9054' : '\u6210\u9577\u5950\u57fa';
      cycleNatureText = '\u6c42\u5b78\u6210\u9577 \u00b7 \u5fb7\u667a\u57f9\u690d';
      cycleExplanation = `\u5927\u904b\u3010${activeDaYun.name}\u3011\u6b72\u904b\u8655\u65bc\u6c42\u5b78\u5950\u57fa\u968e\u6bb5\uff0c\u5c08\u6ce8\u65bc\u5b78\u696d\u7cbe\u9032\u3001\u5fc3\u667a\u6210\u9577\u3002`;
      wealthBaseScore = Math.max(15, Math.min(30, Math.round(18 + favorableScore * 0.1)));
      govBaseScore    = Math.max(15, Math.min(30, Math.round(18 + (dynScores[tenGods.resource] || 0) * 0.15)));
    } else {
      if (isWeak) {
        if (isDaYunHeavyUnfav || (!isDaYunFavorable && (daYunBranchEl === tenGods.output || daYunBranchEl === tenGods.wealth))) {
          isDebtStruggleYear = true;
          cycleNature = 'DEBT_HARDSHIP';
          cycleNatureTag = '\u8aa1\u696d\u78e8\u7a3c\u6309\u8036\u671f';
          cycleNatureText = '\u5fd8\u795e\u91cd\u6d29 \u00b7 \u878d\u8cc7\u8ca0\u50b5\u6c89\u6f5b (\u78e8\u7a3c\u84c4\u529b)';
          cycleExplanation = `\u5927\u904b\u3010${activeDaYun.name}\u3011\u70ba\u5fd8\u795e\u91cd\u6d29\u4e4b\u5730\u3002\u8eab\u5f31\u4e0d\u64d4\u8ca1\uff0c\u82e5\u5728\u6b64\u968e\u6bb5\u958b\u62d3\u4e8b\u696d\uff0c\u6613\u8655\u65bc\u878d\u8cc7\u501f\u8cb8\u3001\u8ca0\u50b5\u627f\u58d3\u4e4b\u8271\u96e3\u6c88\u6f5b\u935b\u9020\u671f\u3002`;
          wealthBaseScore = Math.min(28, Math.max(12, Math.round(15 + (dynScores[tenGods.resource] || 0) * 0.2)));
          govBaseScore    = Math.min(25, Math.max(10, Math.round(12 + (dynScores[tenGods.self] || 0) * 0.15)));
        } else if (isDaYunFavorable) {
          cycleNature = 'BOOM';
          cycleNatureTag = '\u559c\u7528\u751f\u65fa\u9ec3\u91d1\u5927\u7206\u767c';
          cycleNatureText = '\u7528\u795e\u751f\u8eab \u00b7 \u8eab\u65fa\u4efb\u91cd\u8ca1 (\u9ec3\u91d1\u671f)';
          cycleExplanation = `\u5927\u904b\u3010${activeDaYun.name}\u3011\u6b63\u9022\u559c\u7528\u7528\u795e\u751f\u65fa\u4e4b\u9109\uff01\u65e5\u4e3b\u5f97\u5730\u901a\u6839\u8eab\u65fa\u80fd\u4efb\u91cd\u8ca1\uff0c\u683c\u5c40\u5168\u9762\u514c\u73fe\uff01`;
          const rawWealth = (dynScores[tenGods.wealth] || 0) + (dynScores[tenGods.output] || 0) * 0.4;
          wealthBaseScore = Math.min(96, Math.max(62, Math.round(rawWealth * 0.95 + favorableScore * 0.3)));
          govBaseScore    = Math.min(95, Math.max(60, Math.round((dynScores[tenGods.officer] || 0) * 0.8 + favorableScore * 0.35)));
          if (wealthBaseScore >= 60) isBoomYearWealth = true;
          if (govBaseScore >= 60)    isBoomYearGov = true;
        } else {
          cycleNature = 'NEUTRAL';
          cycleNatureTag = '\u84c4\u529b\u904e\u6e21';
          cycleNatureText = '\u8d77\u4f0f\u8abf\u548c \u00b7 \u9010\u6b65\u84c4\u529b';
          cycleExplanation = `\u5927\u904b\u3010${activeDaYun.name}\u3011\u4e94\u884c\u529b\u91cf\u4ea4\u932f\uff0c\u8655\u65bc\u84c4\u7a4d\u80fd\u91cf\u4e4b\u904e\u6e21\u671f\u3002`;
          wealthBaseScore = Math.max(18, Math.min(55, Math.round(35 + (favorableScore - unfavorableScore) * 0.2)));
          govBaseScore    = Math.max(18, Math.min(55, Math.round(32 + (favorableScore - unfavorableScore) * 0.15)));
        }
      } else if (isStrong) {
        if (isDaYunHeavyUnfav || (!isDaYunFavorable && (daYunBranchEl === tenGods.self || daYunBranchEl === tenGods.resource))) {
          isDebtStruggleYear = true;
          cycleNature = 'PRESSURE';
          cycleNatureTag = '\u5370\u6bd4\u91cd\u758a\u7af6\u8ca1\u58d3\u529b\u671f';
          cycleNatureText = '\u6bd4\u52ab\u91cd\u758a \u00b7 \u7af6\u8ca1\u8017\u640d (\u9632\u7bc4\u98a8\u96aa)';
          cycleExplanation = `\u5927\u904b\u3010${activeDaYun.name}\u3011\u8eab\u65fa\u9022\u5370\u6bd4\u91cd\u758a\uff0c\u7af6\u8ca1\u8017\u640d\uff0c\u9700\u9632\u5408\u5925\u7cf3\u7d1b\u8207\u76f2\u76ee\u6295\u8cc7\u3002`;
          wealthBaseScore = Math.min(35, Math.max(12, Math.round(18 + (dynScores[tenGods.wealth] || 0) * 0.2)));
          govBaseScore    = Math.min(35, Math.max(10, Math.round(15 + (dynScores[tenGods.officer] || 0) * 0.2)));
        } else if (isDaYunFavorable) {
          cycleNature = 'BOOM';
          cycleNatureTag = '\u559c\u7528\u5f97\u529b \u00b7 \u8ca1\u5b98\u96d9\u65fa';
          cycleNatureText = '\u8ca1\u5b98\u751f\u65fa \u00b7 \u5927\u5c55\u5b8f\u5716';
          cycleExplanation = `\u5927\u904b\u3010${activeDaYun.name}\u3011\u6b63\u9022\u559c\u7528\u8ca1\u5b98\u751f\u65fa\u4e4b\u9109\uff01\u8eab\u5f37\u80fd\u4efb\u91cd\u8ca1\u5b98\uff0c\u5927\u5c55\u5b8f\u5716\uff01`;
          const rawWealth = (dynScores[tenGods.wealth] || 0) + (dynScores[tenGods.output] || 0) * 0.35;
          wealthBaseScore = Math.min(96, Math.max(60, Math.round(rawWealth * 0.9 + favorableScore * 0.3)));
          govBaseScore    = Math.min(95, Math.max(58, Math.round((dynScores[tenGods.officer] || 0) * 0.85 + favorableScore * 0.3)));
          if (wealthBaseScore >= 60) isBoomYearWealth = true;
          if (govBaseScore >= 60)    isBoomYearGov = true;
        } else {
          cycleNature = 'NEUTRAL';
          cycleNatureTag = '\u5e73\u7a69\u904e\u6e21';
          cycleNatureText = '\u7a69\u6b65\u767c\u5c55 \u00b7 \u7a4d\u7d2f\u8cc7\u6e90';
          cycleExplanation = `\u5927\u904b\u3010${activeDaYun.name}\u3011\u904b\u52e2\u5e73\u7a69\uff0c\u7a69\u6b65\u7a4d\u7d2f\u3002`;
          wealthBaseScore = Math.max(22, Math.min(55, Math.round(38 + (favorableScore - unfavorableScore) * 0.2)));
          govBaseScore    = Math.max(20, Math.min(52, Math.round(35 + (favorableScore - unfavorableScore) * 0.15)));
        }
      } else {
        if (isDaYunFavorable && isLiuNianFavorable) {
          cycleNature = 'BOOM';
          cycleNatureTag = '\u96d9\u559c\u81e8\u9580 \u00b7 \u9806\u9042\u5927\u767c';
          cycleNatureText = '\u8ca1\u5b98\u9806\u9042 \u00b7 \u5e73\u7a69\u6210\u9577';
          cycleExplanation = `\u5927\u904b\u3010${activeDaYun.name}\u3011\u6d41\u5e74\u96d9\u559c\uff0c\u904b\u52e2\u9806\u9042\uff01`;
          const rawWealth = (dynScores[tenGods.wealth] || 0) + (dynScores[tenGods.output] || 0) * 0.3;
          wealthBaseScore = Math.min(90, Math.max(50, Math.round(rawWealth * 0.8 + favorableScore * 0.25)));
          govBaseScore    = Math.min(88, Math.max(48, Math.round((dynScores[tenGods.officer] || 0) * 0.75 + favorableScore * 0.25)));
          if (wealthBaseScore >= 60) isBoomYearWealth = true;
          if (govBaseScore >= 60)    isBoomYearGov = true;
        } else {
          cycleNature = 'NEUTRAL';
          cycleNatureTag = '\u4e2d\u548c\u5e73\u7a69';
          cycleNatureText = '\u9670\u967d\u8abf\u548c \u00b7 \u7a69\u5065\u524d\u884c';
          cycleExplanation = `\u5927\u904b\u3010${activeDaYun.name}\u3011\u4e94\u884c\u4e2d\u548c\u5e73\u7a69\uff0c\u7a69\u6b65\u524d\u884c\u3002`;
          wealthBaseScore = Math.max(25, Math.min(55, Math.round(38 + (favorableScore - unfavorableScore) * 0.15)));
          govBaseScore    = Math.max(22, Math.min(52, Math.round(35 + (favorableScore - unfavorableScore) * 0.12)));
        }
      }
    }

    const wealthLevelInfo = getFortuneAnalysis(wealthBaseScore, 'WEALTH', tenGods.wealth);
    const govLevelInfo    = getFortuneAnalysis(govBaseScore,    'GOV',    tenGods.officer);

    timeline.push({
      calYear, age, yearName: liuNianInfo.name,
      daYunName: activeDaYun.name, daYunStem: activeDaYun.stem, daYunBranch: activeDaYun.branch,
      scores: { ...dynScores }, wealthScore: wealthBaseScore, govScore: govBaseScore,
      wealthLevel: wealthLevelInfo, govLevel: govLevelInfo,
      isBoomYearWealth, isBoomYearGov, isDebtStruggleYear,
      cycleNature, cycleNatureText, cycleNatureTag, cycleExplanation,
      dynamicGongHuiList: dynGongHuiList,
    });
  }

  return {
    timeline,
    boomYearsWealth: timeline.filter(y => y.isBoomYearWealth && !y.isDebtStruggleYear),
    boomYearsGov:    timeline.filter(y => y.isBoomYearGov    && !y.isDebtStruggleYear),
    debtYears:       timeline.filter(y => y.isDebtStruggleYear),
    daYunList,
  };
}
