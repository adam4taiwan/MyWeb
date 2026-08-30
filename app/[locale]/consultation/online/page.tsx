'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// ─── Card data ───────────────────────────────────────────────────────────────

interface CardData {
  id: number;
  title: string;
  stem: string;
  nayin: string;
  luck: string;
  story: string;
  outcome: string;
}

const ALL_CARDS: CardData[] = [
  { id: 1,  title: "財子壽",         stem: "甲子", nayin: "海中金", luck: "大吉", story: "三星齊聚，福氣財運長壽兼得。",           outcome: "逢子午正沖，好運易受阻，需防歲破。" },
  { id: 2,  title: "招財進寶",       stem: "丙寅", nayin: "爐中火", luck: "大吉", story: "武財神賜財，正財運極佳，投資大進。",       outcome: "逢寅午半合火局，天時加持吉翻倍。" },
  { id: 3,  title: "鯉魚化成龍",     stem: "戊辰", nayin: "大林木", luck: "大吉", story: "逆流一躍化神龍，身份躍升大翻身。",         outcome: "太歲生辰土，利升遷突破，後勁極強。" },
  { id: 4,  title: "仙女送孩兒",     stem: "丁巳", nayin: "沙中土", luck: "大吉", story: "天仙送子，白胖孝子送回人間，主動送喜。",   outcome: "初夏迎來意外喜訊，貴人主動送機。" },
  { id: 5,  title: "呂蒙正得繡球",   stem: "庚午", nayin: "路旁土", luck: "上吉", story: "窮書生接到相府千金繡球，命運大逆襲。",     outcome: "逢午午自刑，過程驚心動魄需冷靜。" },
  { id: 6,  title: "金錢樹開花",     stem: "壬申", nayin: "劍鋒金", luck: "大吉", story: "枯樹開出金花，長期努力迎來橫財。",         outcome: "與月令相同屬伏吟，橫財伴隨壓力。" },
  { id: 7,  title: "姜太公釣魚",     stem: "甲戌", nayin: "山頭火", luck: "中吉", story: "直鉤釣魚，大器晚成必逢明主賞識。",         outcome: "逢午戌半合火局，後勁足大器晚成。" },
  { id: 8,  title: "曾二娘燒好香",   stem: "己丑", nayin: "霹靂火", luck: "中吉", story: "虔誠善女感天動地，積有陰德難關自解。",     outcome: "逢丑午相害，雖有神助防意外口舌。" },
  { id: 9,  title: "萬古流芳",       stem: "乙卯", nayin: "大溪水", luck: "大吉", story: "立德立言受賜牌坊，利考試升遷名聲大。",     outcome: "大溪水受太歲火耗，名大防內在空虛。" },
  { id: 10, title: "金姑牧羊",       stem: "辛未", nayin: "路旁土", luck: "中凶", story: "苦女在荒山牧羊，處境孤立無援吃力。",       outcome: "逢午未六合，凶牌逢合有伴分擔。" },
  { id: 11, title: "老鼠入牛角",     stem: "癸亥", nayin: "大海水", luck: "大凶", story: "老鼠鑽牛角越鑽越窄，計畫走入死胡同。",     outcome: "與太歲暗剋，冬天危機達頂點須轉彎。" },
  { id: 12, title: "活馬綁死樹頭",   stem: "乙亥", nayin: "山頭火", luck: "大凶", story: "駿馬綁在枯木上樹倒壓馬，找錯依附。",       outcome: "與流年相剋，冬春交替防合作方拖累。" },
  { id: 13, title: "厝鳥吃粗糠",     stem: "丁丑", nayin: "澗下水", luck: "平",   story: "麻雀吃粗糠不富但知足，平安溫飽。",         outcome: "丑午害，安穩但年底防親戚家庭口舌。" },
  { id: 14, title: "楊文廣困柳洲",   stem: "己巳", nayin: "大林木", luck: "大凶", story: "英雄誤中陷阱被圍，合約綁死彈盡糧絕。",     outcome: "巳午同邊火旺，官司合約問題逼迫緊。" },
  { id: 15, title: "蜻蜓入蜘蛛網",   stem: "辛酉", nayin: "石榴木", luck: "大凶", story: "蜻蜓誤撞蛛網越掙扎越緊，身陷圈套。",       outcome: "正值秋季爆發，需外力切勿盲動。" },
  { id: 16, title: "三藏取經",       stem: "癸丑", nayin: "桑拓木", luck: "中吉", story: "歷經八十一難取經，長線牌先苦後甘。",         outcome: "年底面臨丑午害，最後關頭考驗極大。" },
  { id: 17, title: "金雞報曉",       stem: "己酉", nayin: "大驛土", luck: "大吉", story: "公雞破曉啼鳴黑夜過去，糟糕時期結束。",     outcome: "太歲生酉土，下半年迎翻盤轉機。" },
  { id: 18, title: "三請孔明",       stem: "辛丑", nayin: "壁上土", luck: "中吉", story: "劉備三顧茅廬，展現誠意方得貴人。",         outcome: "丑午害，想請的高人脾氣怪考驗忍耐。" },
  { id: 19, title: "西牛望月",       stem: "癸卯", nayin: "金箔金", luck: "平",   story: "犀牛深夜望月觸碰不到，理想流於空談。",     outcome: "卯午相破，理想易在春季被現實打破。" },
  { id: 20, title: "雙腳踏雙船",     stem: "乙未", nayin: "沙中金", luck: "中凶", story: "同坐兩船分開時落水，劈腿兩頭空。",         outcome: "午未合，兼差暫被允許但遲早失衡。" },
  { id: 21, title: "李世民落湳田",   stem: "丁酉", nayin: "山下火", luck: "大凶", story: "戰馬落泥巴龍困淺灘，防意外失足拖累。",     outcome: "山下火助太歲，秋天防過度自信跌倒。" },
  { id: 22, title: "鷸蚌相爭",       stem: "己亥", nayin: "平地木", luck: "中凶", story: "鷸蚌相爭互不相讓漁翁得利，切忌爭訟。",     outcome: "亥午暗合，表面爭吵利益早被旁人分。" },
  { id: 23, title: "前進思後退",     stem: "辛巳", nayin: "白蠟金", luck: "平",   story: "十字路口猶豫不決，最佳策略原地不動。",     outcome: "巳午同邊火旺，大環境會逼著你決定。" },
  { id: 24, title: "虎落平陽",       stem: "癸巳", nayin: "長流水", luck: "中凶", story: "老虎離開山林失去地利，英雄無用武地。",     outcome: "長流水克太歲火，反抗制度極度吃力。" },
  { id: 25, title: "公雞拖木屐",     stem: "乙卯", nayin: "大溪水", luck: "大凶", story: "重物綁雞腳步履維艱，被債務責任壓垮。",     outcome: "卯午相破，春季重擔壓到臨界點。" },
  { id: 26, title: "鹿猴獻果",       stem: "丁卯", nayin: "爐中火", luck: "大吉", story: "鹿（祿）與猴（侯）雙吉兆，加官進爵。",     outcome: "卯午破中帶生，升官發財但防得罪人。" },
  { id: 27, title: "韓文公走雪",     stem: "己未", nayin: "霹靂火", luck: "中凶", story: "貶官藍關遇大雪，環境艱辛考驗意志。",       outcome: "午未合，環境艱難但年中遇同病相憐。" },
  { id: 28, title: "望洋興嘆",       stem: "辛未", nayin: "路旁土", luck: "平",   story: "見大海感自身渺小，目標宏大需踏實。",       outcome: "午未合土，年中認清現實得長輩提點。" },
  { id: 29, title: "昭君出塞",       stem: "癸酉", nayin: "劍鋒金", luck: "中凶", story: "被迫遠嫁匈奴，身不由己被迫犧牲分離。",     outcome: "秋風起時，非自願變動調職無法抗拒。" },
  { id: 30, title: "前手接錢後手空", stem: "乙亥", nayin: "山頭火", luck: "中凶", story: "左手接錢右手漏光，財來財去存不住。",       outcome: "冬天財庫大破，絕不可跟風高風險投資。" },
  { id: 31, title: "雙面刀鬼",       stem: "丁亥", nayin: "屋上土", luck: "大凶", story: "表面稱兄道弟背後藏刀，極防親近出賣。",     outcome: "亥午暗合，出賣你的人正是最信任夥伴。" },
  { id: 32, title: "白虎守灶君",     stem: "己丑", nayin: "霹靂火", luck: "大凶", story: "凶獸佔據廚灶，主內耗嚴重吵架血光。",       outcome: "丑午六害，年底人事鬥爭達極限宜低調。" },
];

// ─── Analysis engine ─────────────────────────────────────────────────────────

const STEMS    = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const NAYIN_60 = [
  '海中金','海中金','爐中火','爐中火','大林木','大林木','路旁土','路旁土','劍鋒金','劍鋒金',
  '山頭火','山頭火','澗下水','澗下水','城頭土','城頭土','白蠟金','白蠟金','楊柳木','楊柳木',
  '泉中水','泉中水','屋上土','屋上土','霹靂火','霹靂火','松柏木','松柏木','長流水','長流水',
  '沙中金','沙中金','山下火','山下火','平地木','平地木','壁上土','壁上土','金箔金','金箔金',
  '覆燈火','覆燈火','天河水','天河水','大驛土','大驛土','釵釧金','釵釧金','桑拓木','桑拓木',
  '大溪水','大溪水','沙中土','沙中土','天上火','天上火','石榴木','石榴木','大海水','大海水',
];

function getTaiSui(year: number) {
  const sIdx = (year - 4 + 400) % 10;
  const bIdx = (year - 4 + 480) % 12;
  const sixtyIdx = (year - 4 + 600) % 60;
  return { year, stem: STEMS[sIdx], branch: BRANCHES[bIdx], nayin: NAYIN_60[sixtyIdx] };
}

interface Interaction {
  type: '六合' | '六沖' | '六害' | '暗合' | '伏吟' | '無';
  luckEffect: 'boost' | 'break' | 'harm' | 'amplify' | 'neutral';
}

function getInteraction(cardBranch: string, taiyuBranch: string): Interaction {
  const liuHe:    Record<string,string> = {子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
  const liuChong: Record<string,string> = {子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
  const liuHai:   Record<string,string> = {子:'未',未:'子',丑:'午',午:'丑',寅:'巳',巳:'寅',卯:'辰',辰:'卯',申:'亥',亥:'申',酉:'戌',戌:'酉'};
  const anHe:     Record<string,string> = {午:'亥',亥:'午',子:'巳',巳:'子',丑:'辰',辰:'丑',寅:'酉',酉:'寅',卯:'申',申:'卯',未:'戌',戌:'未'};
  if (cardBranch === taiyuBranch)              return { type: '伏吟', luckEffect: 'amplify' };
  if (liuHe[cardBranch]    === taiyuBranch)   return { type: '六合', luckEffect: 'boost' };
  if (liuChong[cardBranch] === taiyuBranch)   return { type: '六沖', luckEffect: 'break' };
  if (liuHai[cardBranch]   === taiyuBranch)   return { type: '六害', luckEffect: 'harm' };
  if (anHe[cardBranch]     === taiyuBranch)   return { type: '暗合', luckEffect: 'boost' };
  return { type: '無', luckEffect: 'neutral' };
}

function isGoodLuck(luck: string) { return luck.includes('吉'); }
function isBadLuck(luck: string)  { return luck.includes('凶'); }

function getInteractionDesc(card: CardData, interaction: Interaction, taiyuBranch: string, position: number): string {
  const { type } = interaction;
  const good = isGoodLuck(card.luck);
  const bad  = isBadLuck(card.luck);

  if (type === '六合') {
    if (good) return `與今年太歲（${taiyuBranch}）六合，歲君主動配合，此牌的吉氣在今年被倍增加持。${['過去的順遂奠定了今日基礎','現在的吉象十分明朗，貴人機運主動靠近','未來的結局因天時配合，吉勢穩定可期'][position]}。`;
    if (bad)  return `雖屬凶牌，但與今年太歲（${taiyuBranch}）六合——凶牌逢合，凶氣大幅減輕。原本嚴重的困境因大環境接手，出現意想不到的緩解，甚至轉機出現。`;
    return `（平）牌與今年太歲（${taiyuBranch}）六合，平靜的局面因天時加持出現正向轉折，可把握這個窗口期主動出擊。`;
  }
  if (type === '六沖') {
    if (good) return `與今年太歲（${taiyuBranch}）六沖，吉運遭外力衝擊，過程多有波折與阻礙。但沖不等於無效，只要頂住壓力，吉運仍在底層流動，最終仍可成事，只是需要付出更多。`;
    if (bad)  return `凶牌遇今年太歲（${taiyuBranch}）六沖——物極必反，沖開死局。若此前一直卡死在困境中，今年的衝擊反而成為逃生的契機。被迫改變往往就是翻盤的開始。`;
    return `（平）牌遇太歲六沖，打破一成不變的狀態，動盪中反而有轉圜空間，主動出擊比守舊更有機會。`;
  }
  if (type === '六害') {
    if (good) return `吉牌遇今年太歲（${taiyuBranch}）六害，吉中藏礙，好事的背後暗藏消耗——小人暗箭、體制阻力、或最親近之人無意的拖累。謹慎中求進，提防吉運被悄悄削減。`;
    if (bad)  return `大凶再遇太歲（${taiyuBranch}）六害，雙重壓制，是牌局中最沉重的組合。此位置宜守不宜攻，全力低調保守，靜待時機化解。`;
    return `（平）牌逢太歲六害，表面平靜下藏著暗流，防身邊消極影響慢慢侵蝕，不可掉以輕心。`;
  }
  if (type === '暗合') {
    if (good) return `與今年太歲（${taiyuBranch}）暗合，貴人緣在看不見的地方運作，吉勢在水面下積累，往往在不經意間有好消息或貴人出現。`;
    if (bad)  return `與今年太歲（${taiyuBranch}）暗合，凶中有隱藏的緩解力量，不要放棄尋找那個暗中相助的人，貴人雖不顯眼卻真實存在。`;
    return `與今年太歲（${taiyuBranch}）暗合，機緣在暗處流動，留心不起眼的訊息，可能蘊藏重要轉機。`;
  }
  if (type === '伏吟') {
    if (good) return `與今年太歲（${taiyuBranch}）伏吟同支，吉氣被大幅放大，但伏吟同時代表容易得意忘形，或事情原地反覆打轉。吉運雖強，仍需腳踏實地，避免過度自滿。`;
    if (bad)  return `凶牌遇伏吟（與太歲${taiyuBranch}同支），凶氣反覆加強，最容易陷入重複犯同樣錯誤的循環。此位置需要下定決心徹底改變慣性，方能破局。`;
    return `與太歲伏吟同支，平中有悶，容易原地踏步，需主動打破慣例才有新進展。`;
  }
  if (good) return `與今年太歲無特殊感應，牌意照原本的吉象發展，靠自身積累與努力，穩扎穩打即可。`;
  if (bad)  return `與今年太歲無特殊感應，凶象照原本走勢發展，需靠自身謹慎應對，無特別外力幫助也不會加重。`;
  return `與今年太歲無特殊感應，平穩發展，安分守己是最好的策略。`;
}

function adjustedLuckLabel(luck: string, effect: Interaction['luckEffect']): { label: string; color: string } {
  const map: Record<string,string> = { '大吉':'text-red-400','上吉':'text-red-400','中吉':'text-amber-400','平':'text-gray-400','中凶':'text-orange-400','大凶':'text-purple-400' };
  if (effect === 'boost') {
    if (luck.includes('吉')) return { label: luck + '（天時加持）',  color: 'text-red-400' };
    if (luck === '平')       return { label: '轉吉（合逢轉機）',     color: 'text-amber-400' };
    return { label: luck + '（大幅減凶）', color: 'text-amber-500' };
  }
  if (effect === 'break') {
    if (luck.includes('吉')) return { label: luck + '（波折中求成）', color: 'text-amber-400' };
    return { label: luck + '（沖開有機）', color: 'text-amber-500' };
  }
  if (effect === 'harm') {
    if (luck.includes('吉')) return { label: luck + '（防暗損）',     color: 'text-amber-400' };
    return { label: luck + '（雙重壓制）', color: 'text-purple-400' };
  }
  if (effect === 'amplify') {
    if (luck.includes('吉')) return { label: luck + '（氣勢加強）',   color: 'text-red-400' };
    return { label: luck + '（反覆難解）', color: 'text-purple-400' };
  }
  return { label: luck, color: map[luck] ?? 'text-gray-400' };
}

function getOverallSummary(cards: CardData[], interactions: Interaction[], taiyuBranch: string, questionType: string): string {
  const goodCount  = cards.filter(c => isGoodLuck(c.luck)).length;
  const badCount   = cards.filter(c => isBadLuck(c.luck)).length;
  const boostCount = interactions.filter(i => i.luckEffect === 'boost').length;
  const harmCount  = interactions.filter(i => i.luckEffect === 'harm').length;

  const card3 = cards[2];
  const futBranch = card3.stem[1];
  const branchMonths: Record<string,string> = {
    子:'農曆11月（冬至前後）', 丑:'農曆12月（大寒）',  寅:'農曆1月（春節前後）', 卯:'農曆2月（春分）',
    辰:'農曆3月（清明）',     巳:'農曆4月（立夏）',    午:'農曆5月（端午）',     未:'農曆6月（年中）',
    申:'農曆7月（立秋）',     酉:'農曆8月（中秋）',    戌:'農曆9月（霜降）',     亥:'農曆10月（立冬）',
  };
  const qMap: Record<string,string> = { 事業:'在事業上', 感情:'在感情上', 財運:'在財運上', 健康:'在健康上', 其他:'在所問之事上' };
  const qLabel = qMap[questionType] ?? '在所問之事上';

  let s = '';
  if (goodCount === 3) s = `三籤皆吉，大局順遂。${qLabel}整體走勢積極向上，穩步推進即可收穫理想成果。`;
  else if (badCount === 3) s = `三籤皆凶，${qLabel}宜靜守不宜輕舉妄動。困境雖重，凡事都有週期，靜待時機化解，不可在最低潮時做大決策。`;
  else if (isGoodLuck(cards[0].luck) && isGoodLuck(cards[1].luck) && isBadLuck(cards[2].luck)) s = `前兩籤吉、結局轉凶。${qLabel}前段進展順利，但臨近結局需謹慎——不可因前段成功而大意，收手時機的判斷至關重要。`;
  else if (isBadLuck(cards[0].luck) && isBadLuck(cards[1].luck) && isGoodLuck(cards[2].luck)) s = `前兩籤凶、結局逢吉。${qLabel}雖然過去與現在充滿阻礙，但結局籤顯示苦盡甘來之象，堅持熬過現在的困境，終有轉圜。`;
  else if (isBadLuck(cards[0].luck) && isGoodLuck(cards[2].luck)) s = `起點艱難、結局向吉。${qLabel}過去的阻礙只是考驗，整體先苦後甘，方向是對的，繼續前行。`;
  else if (isGoodLuck(cards[0].luck) && isBadLuck(cards[2].luck)) s = `起點順利、結局有阻。${qLabel}不宜過度樂觀，需為未來波折預留緩衝，見好就收反而是上策。`;
  else s = `三籤吉凶互見，${qLabel}局面複雜，需靈活應對。`;

  const timing = branchMonths[futBranch];
  if (timing) s += `\n\n【關鍵應期】結局籤（${card3.title}）地支「${futBranch}」對應${timing}前後，此時段是整件事的關鍵轉捩點，請在此之前做好準備。`;

  if (boostCount >= 2) s += `\n\n【今年天時】三籤中有${boostCount}張與今年太歲（${taiyuBranch}）合住，天時大力配合，今年是推進此事的好時機。`;
  else if (harmCount >= 2) s += `\n\n【今年天時】三籤中有${harmCount}張與今年太歲（${taiyuBranch}）形成六害，今年環境壓力較大，宜謹慎保守，不宜輕易冒進。`;

  s += '\n\n【神明建議】';
  if (goodCount >= 2) s += '整體吉象較強，可積極行動，主動創造機遇，貴人近在眼前，勇敢開口求助即可。';
  else if (badCount >= 2) s += '整體凶象較重，以守代攻，低調行事，避免重大決策，等待時機翻轉再出手。';
  else s += '吉凶各半，此時需要判斷力。可小步嘗試，見機行事，不要一次押注太大，保留彈性空間。';

  return s;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LUCK_BADGE: Record<string, string> = {
  '大吉': 'bg-red-100 text-red-700 border border-red-300',
  '上吉': 'bg-rose-100 text-rose-700 border border-rose-300',
  '中吉': 'bg-amber-100 text-amber-700 border border-amber-300',
  '平':   'bg-gray-100 text-gray-600 border border-gray-300',
  '中凶': 'bg-purple-100 text-purple-700 border border-purple-300',
  '大凶': 'bg-purple-200 text-purple-900 border border-purple-500',
};

const POSITION_LABELS = ['過去（起因）', '現在（現狀）', '未來（結局）'];

// ─── Bird image ───────────────────────────────────────────────────────────────

function BirdSVG({ flying, onClick, disabled }: { flying: boolean; onClick: () => void; disabled: boolean }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        cursor: disabled ? 'default' : 'pointer',
        display: 'inline-block',
        transform: flying
          ? 'translateY(-70px) rotate(-20deg) scale(1.2)'
          : 'translateY(0px) rotate(0deg) scale(1)',
        transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        filter: flying
          ? 'drop-shadow(0 20px 30px rgba(0,0,0,0.7)) brightness(1.1)'
          : 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
        opacity: disabled ? 0.35 : 1,
      }}
    >
      {/* Ground shadow */}
      <div style={{ position: 'relative', width: '180px' }}>
        <img
          src="/images/niao-gua-bird.png"
          alt="靈鳥"
          style={{ width: '180px', height: 'auto', display: 'block' }}
        />
        {!flying && (
          <div style={{
            position: 'absolute', bottom: '-6px', left: '50%',
            transform: 'translateX(-50%)',
            width: '80px', height: '10px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '50%',
            filter: 'blur(4px)',
          }} />
        )}
      </div>
    </div>
  );
}

// ─── Steps & Prayer section ───────────────────────────────────────────────────

const STEPS = [
  { num: '一', title: '潔淨身心', desc: '占卜前先洗手、漱口，靜心片刻，排除雜念。' },
  { num: '二', title: '準備誠心', desc: '點清香一柱，心存虔敬，方能感通神明。' },
  { num: '三', title: '面向神明', desc: '站立或正坐，面向神位或天空，姓名、生辰、現居地址必須唸得清晰。' },
  { num: '四', title: '問題明確', desc: '一動一卜，一個問題只求一卦，不可反覆試探，神明不庇佑貪心之人。' },
];

interface PrepFormProps {
  onReady: (name: string, birth: string, address: string, question: string, qType: string) => void;
}

function PrepPhase({ onReady }: PrepFormProps) {
  const [name, setName]       = useState('');
  const [birth, setBirth]     = useState('');
  const [address, setAddress] = useState('');
  const [question, setQuestion] = useState('');
  const [qType, setQType]     = useState('其他');
  const [ready, setReady]     = useState(false);

  const prayerText =
`拜請八卦祖師爺、周文王降靈、本門神明、祖師、當方土地公，值日受事功曹。
信士（信女）${name || '【姓名】'}，生於農曆${birth || '【出生年、月、日、時】'}，
現居${address || '【目前住址】'}，
誠心前來求占文王鳥卦，因心中有事未決，特求開示。
想問：${question || '【具體說明您想問的事，例如：今年換工作到某公司是否順利】'}。
懇請神明賜予靈感，帶領靈鳥，叼出真籤，指點迷津，明斷吉凶。
神到，鳥現，神兵火急如律令。`;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Steps */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-center" style={{ color: '#d4af37' }}>
          問事卜卦關鍵步驟
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STEPS.map(s => (
            <div key={s.num} className="flex gap-3 p-3 rounded-lg" style={{ background: '#2b1111', border: '1px solid #5a3a1a' }}>
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: '#d4af37', color: '#1a0000' }}>
                {s.num}
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: '#d4af37' }}>{s.title}</div>
                <div className="text-xs mt-0.5 leading-relaxed" style={{ color: '#c8c0a0' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prayer form */}
      <div className="mb-6 p-5 rounded-xl" style={{ background: '#2b1111', border: '2px solid #d4af37' }}>
        <h3 className="font-bold text-base mb-4 text-center" style={{ color: '#d4af37' }}>
          誠心拜唸 — 填入您的資料
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {[
            { label: '您的姓名', value: name,    setter: setName,    ph: '請輸入真實姓名' },
            { label: '農曆生辰', value: birth,   setter: setBirth,   ph: '例：丙午年三月十五日午時' },
            { label: '現居地址', value: address, setter: setAddress, ph: '例：台北市大安區XX路XX號' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs mb-1 block" style={{ color: '#9a8060' }}>{f.label}</label>
              <input
                value={f.value}
                onChange={e => f.setter(e.target.value)}
                placeholder={f.ph}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: '#1a0a0a', border: '1px solid #5a3a1a', color: '#fffcf2' }}
              />
            </div>
          ))}
          <div>
            <label className="text-xs mb-1 block" style={{ color: '#9a8060' }}>問事類型</label>
            <div className="flex flex-wrap gap-1 pt-1">
              {['事業','感情','財運','健康','其他'].map(t => (
                <button key={t} onClick={() => setQType(t)}
                  className="px-3 py-1 rounded-full text-xs cursor-pointer transition-colors"
                  style={qType === t ? { background: '#d4af37', color: '#1a0000', fontWeight: 700 }
                                     : { background: '#3a1a1a', border: '1px solid #7a5a3a', color: '#c8a96e' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: '#9a8060' }}>您想問的事（請具體說明）</label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="例：今年換工作到某某公司是否順利"
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm resize-none"
            style={{ background: '#1a0a0a', border: '1px solid #5a3a1a', color: '#fffcf2' }}
          />
        </div>

        {/* Prayer text */}
        <div className="mt-5 p-4 rounded-lg" style={{ background: '#f5e6c8', color: '#3a1a00' }}>
          <div className="text-xs font-bold mb-2 text-center" style={{ color: '#8a4a00' }}>請對著神明清晰唸出以下祈禱詞</div>
          <pre className="text-sm whitespace-pre-wrap leading-relaxed font-sans"
            style={{ color: '#3a1a00', fontFamily: 'serif' }}>
            {prayerText}
          </pre>
        </div>
      </div>

      {/* Step 5 instructions */}
      <div className="mb-6 p-4 rounded-lg text-sm" style={{ background: '#2b1111', border: '1px solid #d4af37' }}>
        <div className="font-bold mb-1" style={{ color: '#d4af37' }}>步驟五：請靈鳥叼籤</div>
        <div style={{ color: '#c8c0a0' }}>
          誠心念完祈禱詞後，點擊下方金色鳥兒，靈鳥飛起，依神明指引亂數叼出一張籤牌，共叼出 3 張（代表過去・現在・未來）。
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 justify-center">
        <input
          id="ready-check"
          type="checkbox"
          checked={ready}
          onChange={e => setReady(e.target.checked)}
          className="w-4 h-4 cursor-pointer"
          style={{ accentColor: '#d4af37' }}
        />
        <label htmlFor="ready-check" className="text-sm cursor-pointer" style={{ color: '#c8c0a0' }}>
          我已洗手靜心、誠心念完祈禱詞，準備開始占卜
        </label>
      </div>

      <div className="text-center">
        <button
          onClick={() => ready && onReady(name, birth, address, question, qType)}
          disabled={!ready}
          className="font-bold text-base px-10 py-3 rounded-full transition-all cursor-pointer"
          style={ready
            ? { background: 'linear-gradient(135deg,#d4af37,#a67c00)', color: '#1a0000', boxShadow: '0 4px 20px rgba(212,175,55,0.4)' }
            : { background: '#3a2010', color: '#5a4030', cursor: 'not-allowed' }}>
          開始請靈鳥叼籤
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Phase = 'prep' | 'divining' | 'analyzed';

export default function OnlineConsultationPage() {
  const [phase, setPhase]       = useState<Phase>('prep');
  const [deck, setDeck]         = useState<CardData[]>(() => shuffle(ALL_CARDS));
  const [openIds, setOpenIds]   = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<CardData[]>([]);
  const [questionType, setQuestionType] = useState('其他');
  const [isBirdFlying, setIsBirdFlying] = useState(false);
  const [result, setResult]     = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pickedCard, setPickedCard] = useState<CardData | null>(null);

  const taiSui = getTaiSui(new Date().getFullYear());

  const handleReady = useCallback((name: string, birth: string, address: string, question: string, qType: string) => {
    setQuestionType(qType);
    setPhase('divining');
  }, []);

  const handleBirdClick = useCallback(() => {
    if (isBirdFlying || selected.length >= 3) return;

    setIsBirdFlying(true);
    setPickedCard(null);

    setTimeout(() => {
      const available = deck.filter(c => !openIds.has(c.id));
      if (available.length === 0) { setIsBirdFlying(false); return; }

      const picked = available[Math.floor(Math.random() * available.length)];
      const newOpen = new Set(openIds);
      newOpen.add(picked.id);
      setOpenIds(newOpen);
      setSelected(prev => [...prev, picked]);
      setPickedCard(picked);
      setIsBirdFlying(false);

      // Scroll picked card into view
      setTimeout(() => document.getElementById(`card-${picked.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }, 700);
  }, [isBirdFlying, selected, deck, openIds]);

  const handleAnalyze = useCallback(() => {
    if (selected.length < 3) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const interactions = selected.map(c => getInteraction(c.stem[1], taiSui.branch));
      setResult(getOverallSummary(selected, interactions, taiSui.branch, questionType));
      setIsAnalyzing(false);
      setPhase('analyzed');
      setTimeout(() => document.getElementById('niao-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, 900);
  }, [selected, questionType, taiSui.branch]);

  const handleReset = useCallback(() => {
    setDeck(shuffle(ALL_CARDS));
    setOpenIds(new Set());
    setSelected([]);
    setResult('');
    setPickedCard(null);
    setPhase('prep');
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#140b0b', color: '#fffcf2' }}>
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Title */}
          <div className="text-center mb-8" style={{ borderBottom: '2px solid #d4af37', paddingBottom: '16px' }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-1" style={{ color: '#d4af37' }}>
              文王神數三十二府鳥卦
            </h1>
            <p className="text-sm" style={{ color: '#c8a96e' }}>線上問事・神明降靈指引</p>
            <div className="mt-2 text-xs" style={{ color: '#7a5a3a' }}>
              流年太歲：
              <strong style={{ color: '#ff6b6b' }}>{taiSui.stem}{taiSui.branch}年（{taiSui.nayin}）</strong>
            </div>
          </div>

          {/* ── 準備階段 ── */}
          {phase === 'prep' && <PrepPhase onReady={handleReady} />}

          {/* ── 占卜階段 ── */}
          {(phase === 'divining' || phase === 'analyzed') && (
            <>
              {/* Bird section */}
              {phase === 'divining' && (
                <div className="text-center mb-8">
                  <div className="mb-2 text-sm font-bold" style={{ color: '#d4af37' }}>
                    {selected.length < 3
                      ? `請點擊靈鳥，請神明帶領靈鳥叼出第 ${selected.length + 1} 張籤`
                      : '三張籤已叼出，請點擊「解籤分析」'}
                  </div>

                  {/* Progress dots */}
                  <div className="flex justify-center gap-3 mb-4">
                    {[0,1,2].map(i => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={selected[i]
                            ? { background: '#d4af37', color: '#1a0000' }
                            : { background: '#3a1a1a', border: '1px solid #5a3a1a', color: '#5a4030' }}>
                          {selected[i] ? (i + 1) : (i + 1)}
                        </div>
                        <div className="text-xs" style={{ color: selected[i] ? '#c8a96e' : '#5a4030' }}>
                          {['過去','現在','未來'][i]}
                        </div>
                        {selected[i] && (
                          <div className="text-xs font-bold" style={{ color: '#d4af37' }}>{selected[i].title}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <BirdSVG
                    flying={isBirdFlying}
                    onClick={handleBirdClick}
                    disabled={selected.length >= 3}
                  />

                  {pickedCard && (
                    <div className="mt-3 text-sm animate-pulse" style={{ color: '#d4af37' }}>
                      靈鳥叼出：【{pickedCard.title}】({pickedCard.luck})
                    </div>
                  )}

                  {selected.length === 3 && (
                    <div className="mt-6">
                      <button
                        onClick={handleAnalyze}
                        className="font-bold text-lg px-12 py-3 rounded-full cursor-pointer transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg,#d4af37,#a67c00)', color: '#1a0000', boxShadow: '0 4px 20px rgba(212,175,55,0.4)' }}>
                        解籤分析
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Card grid (face down by default, flip when bird picks) */}
              {phase === 'divining' && (
                <div className="grid gap-2 mb-6"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
                  {deck.map(card => {
                    const isOpen = openIds.has(card.id);
                    const selIdx = selected.findIndex(s => s.id === card.id);
                    const isSelected = selIdx >= 0;
                    return (
                      <div
                        id={`card-${card.id}`}
                        key={card.id}
                        style={{ width: '110px', height: '165px', perspective: '1000px' }}
                      >
                        <div style={{
                          width: '100%', height: '100%',
                          position: 'relative', transformStyle: 'preserve-3d',
                          transition: 'transform 0.6s',
                          transform: isOpen ? 'rotateY(180deg)' : 'rotateY(0deg)',
                          borderRadius: '8px',
                          boxShadow: isSelected ? '0 0 14px #d4af37' : '0 2px 6px rgba(0,0,0,0.5)',
                        }}>
                          {/* Back */}
                          <div style={{
                            position: 'absolute', width: '100%', height: '100%',
                            backfaceVisibility: 'hidden', borderRadius: '8px',
                            background: '#a62626', border: '4px double #d4af37',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            color: '#d4af37', fontSize: '1.3rem', fontWeight: 'bold', writingMode: 'vertical-rl',
                          }}>鳥卦</div>
                          {/* Front */}
                          <div style={{
                            position: 'absolute', width: '100%', height: '100%',
                            backfaceVisibility: 'hidden', borderRadius: '8px',
                            transform: 'rotateY(180deg)',
                            background: card.luck.includes('凶') ? '#fcf5fc' : '#fff9f9',
                            border: card.luck.includes('凶') ? '3px solid #732673' : '3px solid #ff3333',
                            padding: '6px', display: 'flex', flexDirection: 'column',
                            justifyContent: 'space-between', color: '#2b2b2b',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', fontWeight: 700, borderBottom: '1px solid #ccc', paddingBottom: '2px' }}>
                              <span>{card.stem}</span>
                              <span style={{ color: card.luck.includes('凶') ? '#732673' : '#cc0000' }}>[{card.luck}]</span>
                            </div>
                            <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#8a1f1f' }}>{card.title}</div>
                            <div style={{ fontSize: '0.58rem', lineHeight: 1.3 }}>{card.story.substring(0, 26)}{card.story.length > 26 ? '...' : ''}</div>
                            {isSelected && (
                              <div style={{
                                position: 'absolute', top: 2, right: 2,
                                background: '#d4af37', color: '#1a0000', borderRadius: '50%',
                                width: '18px', height: '18px', fontSize: '0.6rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>{selIdx + 1}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── 解籤結果 ── */}
              {phase === 'analyzed' && result && (
                <div id="niao-result" className="rounded-xl p-6" style={{ background: '#1e0e0e', border: '2px solid #d4af37' }}>
                  <h2 className="text-xl font-bold mb-6 text-center" style={{ color: '#d4af37' }}>
                    解籤報告　問事類型：{questionType}
                  </h2>

                  {/* Per-card */}
                  {selected.map((card, i) => {
                    const interaction = getInteraction(card.stem[1], taiSui.branch);
                    const adjusted    = adjustedLuckLabel(card.luck, interaction.luckEffect);
                    const desc        = getInteractionDesc(card, interaction, taiSui.branch, i);
                    return (
                      <div key={i} className="mb-5 p-4 rounded-lg" style={{ background: '#2b1111', border: '1px solid #5a3a1a' }}>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="font-bold text-base" style={{ color: '#fbbf24' }}>
                            {['①','②','③'][i]}　{POSITION_LABELS[i]}
                          </span>
                          <span className="font-bold text-lg" style={{ color: '#d4af37' }}>【{card.title}】</span>
                          <span className="text-sm" style={{ color: '#9a8060' }}>{card.stem}・{card.nayin}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${LUCK_BADGE[card.luck] ?? 'bg-gray-200 text-gray-700'}`}>{card.luck}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#3a2010', color: '#d4af37' }}>
                            太歲{interaction.type}
                          </span>
                        </div>
                        <p className="text-sm mb-2" style={{ color: '#c8c0a0' }}>
                          <strong style={{ color: '#d4af37' }}>籤意：</strong>{card.story}
                        </p>
                        <p className="text-sm mb-2" style={{ color: '#c8c0a0' }}>
                          <strong style={{ color: '#d4af37' }}>本籤應期：</strong>{card.outcome}
                        </p>
                        <p className="text-sm mb-3 leading-relaxed" style={{ color: '#e0d8c0' }}>
                          <strong style={{ color: '#d4af37' }}>太歲動態解析：</strong>{desc}
                        </p>
                        <div className="text-sm font-bold">
                          <span style={{ color: '#9a8060' }}>綜合判定：</span>
                          <span className={adjusted.color}>{adjusted.label}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Summary */}
                  <div className="p-4 rounded-lg mt-4" style={{ background: '#2a1a08', border: '1px solid #d4af37' }}>
                    <h3 className="font-bold text-base mb-3" style={{ color: '#d4af37' }}>神明總斷</h3>
                    {result.split('\n\n').map((para, i) => (
                      <p key={i} className="text-sm mb-3 leading-relaxed" style={{ color: '#e0d8c0' }}>
                        {para.startsWith('【') ? (
                          <>
                            <strong style={{ color: '#fbbf24' }}>{para.slice(0, para.indexOf('】') + 1)}</strong>
                            {para.slice(para.indexOf('】') + 1)}
                          </>
                        ) : para}
                      </p>
                    ))}
                  </div>

                  <div className="text-center mt-6">
                    <button
                      onClick={handleReset}
                      className="px-8 py-2 rounded-full text-sm font-bold cursor-pointer hover:scale-105 transition-all"
                      style={{ background: '#3a1a1a', border: '1px solid #d4af37', color: '#d4af37' }}>
                      重新問事
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Loading */}
          {isAnalyzing && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-amber-200 text-sm">觀星布局，神明解析中...</p>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
