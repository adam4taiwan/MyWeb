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
  { id: 1,  title: "財子壽",        stem: "甲子", nayin: "海中金", luck: "大吉", story: "三星齊聚，福氣財運長壽兼得。", outcome: "逢子午正沖，好運易受阻，需防歲破。" },
  { id: 2,  title: "招財進寶",      stem: "丙寅", nayin: "爐中火", luck: "大吉", story: "武財神賜財，正財運極佳，投資大進。", outcome: "逢寅午半合火局，天時加持吉翻倍。" },
  { id: 3,  title: "鯉魚化成龍",    stem: "戊辰", nayin: "大林木", luck: "大吉", story: "逆流一躍化神龍，身份躍升大翻身。", outcome: "太歲生辰土，利升遷突破，後勁極強。" },
  { id: 4,  title: "仙女送孩兒",    stem: "丁巳", nayin: "沙中土", luck: "大吉", story: "天仙送子，白胖孝子送回人間，主動送喜。", outcome: "初夏迎來意外喜訊，貴人主動送機。" },
  { id: 5,  title: "呂蒙正得繡球",  stem: "庚午", nayin: "路旁土", luck: "上吉", story: "窮書生接到相府千金繡球，命運大逆襲。", outcome: "逢午午自刑，過程驚心動魄需冷靜。" },
  { id: 6,  title: "金錢樹開花",    stem: "壬申", nayin: "劍鋒金", luck: "大吉", story: "枯樹開出金花，長期努力迎來橫財。", outcome: "與月令相同屬伏吟，橫財伴隨壓力。" },
  { id: 7,  title: "姜太公釣魚",    stem: "甲戌", nayin: "山頭火", luck: "中吉", story: "直鉤釣魚，大器晚成必逢明主賞識。", outcome: "逢午戌半合火局，後勁足大器晚成。" },
  { id: 8,  title: "曾二娘燒好香",  stem: "己丑", nayin: "霹靂火", luck: "中吉", story: "虔誠善女感天動地，積有陰德難關自解。", outcome: "逢丑午相害，雖有神助防意外口舌。" },
  { id: 9,  title: "萬古流芳",      stem: "乙卯", nayin: "大溪水", luck: "大吉", story: "立德立言受賜牌坊，利考試升遷名聲大。", outcome: "大溪水受太歲火耗，名大防內在空虛。" },
  { id: 10, title: "金姑牧羊",      stem: "辛未", nayin: "路旁土", luck: "中凶", story: "苦女在荒山牧羊，處境孤立無援吃力。", outcome: "逢午未六合，凶牌逢合有伴分擔。" },
  { id: 11, title: "老鼠入牛角",    stem: "癸亥", nayin: "大海水", luck: "大凶", story: "老鼠鑽牛角越鑽越窄，計畫走入死胡同。", outcome: "與太歲暗剋，冬天危機達頂點須轉彎。" },
  { id: 12, title: "活馬綁死樹頭",  stem: "乙亥", nayin: "山頭火", luck: "大凶", story: "駿馬綁在枯木上樹倒壓馬，找錯依附。", outcome: "與流年相剋，冬春交替防合作方拖累。" },
  { id: 13, title: "厝鳥吃粗糠",    stem: "丁丑", nayin: "澗下水", luck: "平",   story: "麻雀吃粗糠不富但知足，平安溫飽。", outcome: "丑午害，安穩但年底防親戚家庭口舌。" },
  { id: 14, title: "楊文廣困柳洲",  stem: "己巳", nayin: "大林木", luck: "大凶", story: "英雄誤中陷阱被圍，合約綁死彈盡糧絕。", outcome: "巳午同邊火旺，官司合約問題逼迫緊。" },
  { id: 15, title: "蜻蜓入蜘蛛網",  stem: "辛酉", nayin: "石榴木", luck: "大凶", story: "蜻蜓誤撞蛛網越掙扎越緊，身陷圈套。", outcome: "正值秋季爆發，需外力切勿盲動。" },
  { id: 16, title: "三藏取經",      stem: "癸丑", nayin: "桑拓木", luck: "中吉", story: "歷經八十一難取經，長線牌先苦後甘。", outcome: "年底面臨丑午害，最後關頭考驗極大。" },
  { id: 17, title: "金雞報曉",      stem: "己酉", nayin: "大驛土", luck: "大吉", story: "公雞破曉啼鳴黑夜過去，糟糕時期結束。", outcome: "太歲生酉土，下半年迎翻盤轉機。" },
  { id: 18, title: "三請孔明",      stem: "辛丑", nayin: "壁上土", luck: "中吉", story: "劉備三顧茅廬，展現誠意方得貴人。", outcome: "丑午害，想請的高人脾氣怪考驗忍耐。" },
  { id: 19, title: "西牛望月",      stem: "癸卯", nayin: "金箔金", luck: "平",   story: "犀牛深夜望月觸碰不到，理想流於空談。", outcome: "卯午相破，理想易在春季被現實打破。" },
  { id: 20, title: "雙腳踏雙船",    stem: "乙未", nayin: "沙中金", luck: "中凶", story: "同坐兩船分開時落水，劈腿兩頭空。", outcome: "午未合，兼差暫被允許但遲早失衡。" },
  { id: 21, title: "李世民落湳田",  stem: "丁酉", nayin: "山下火", luck: "大凶", story: "戰馬落泥巴龍困淺灘，防意外失足拖累。", outcome: "山下火助太歲，秋天防過度自信跌倒。" },
  { id: 22, title: "鷸蚌相爭",      stem: "己亥", nayin: "平地木", luck: "中凶", story: "鷸蚌相爭互不相讓漁翁得利，切忌爭訟。", outcome: "亥午暗合，表面爭吵利益早被旁人分。" },
  { id: 23, title: "前進思後退",    stem: "辛巳", nayin: "白蠟金", luck: "平",   story: "十字路口猶豫不決，最佳策略原地不動。", outcome: "巳午同邊火旺，大環境會逼著你決定。" },
  { id: 24, title: "虎落平陽",      stem: "癸巳", nayin: "長流水", luck: "中凶", story: "老虎離開山林失去地利，英雄無用武地。", outcome: "長流水克太歲火，反抗制度極度吃力。" },
  { id: 25, title: "公雞拖木屐",    stem: "乙卯", nayin: "大溪水", luck: "大凶", story: "重物綁雞腳步履維艱，被債務責任壓垮。", outcome: "卯午相破，春季重擔壓到臨界點。" },
  { id: 26, title: "鹿猴獻果",      stem: "丁卯", nayin: "爐中火", luck: "大吉", story: "鹿（祿）與猴（侯）雙吉兆，加官進爵。", outcome: "卯午破中帶生，升官發財但防得罪人。" },
  { id: 27, title: "韓文公走雪",    stem: "己未", nayin: "霹靂火", luck: "中凶", story: "貶官藍關遇大雪，環境艱辛考驗意志。", outcome: "午未合，環境艱難但年中遇同病相憐。" },
  { id: 28, title: "望洋興嘆",      stem: "辛未", nayin: "路旁土", luck: "平",   story: "見大海感自身渺小，目標宏大需踏實。", outcome: "午未合土，年中認清現實得長輩提點。" },
  { id: 29, title: "昭君出塞",      stem: "癸酉", nayin: "劍鋒金", luck: "中凶", story: "被迫遠嫁匈奴，身不由己被迫犧牲分離。", outcome: "秋風起時，非自願變動調職無法抗拒。" },
  { id: 30, title: "前手接錢後手空", stem: "乙亥", nayin: "山頭火", luck: "中凶", story: "左手接錢右手漏光，財來財去存不住。", outcome: "冬天財庫大破，絕不可跟風高風險投資。" },
  { id: 31, title: "雙面刀鬼",      stem: "丁亥", nayin: "屋上土", luck: "大凶", story: "表面稱兄道弟背後藏刀，極防親近出賣。", outcome: "亥午暗合，出賣你的人正是最信任夥伴。" },
  { id: 32, title: "白虎守灶君",    stem: "己丑", nayin: "霹靂火", luck: "大凶", story: "凶獸佔據廚灶，主內耗嚴重吵架血光。", outcome: "丑午六害，年底人事鬥爭達極限宜低調。" },
];

// ─── Analysis engine ─────────────────────────────────────────────────────────

const STEMS  = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const NAYIN_60: string[] = [
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
  return {
    year,
    stem: STEMS[sIdx],
    branch: BRANCHES[bIdx],
    nayin: NAYIN_60[sixtyIdx],
  };
}

function getMonthBranch(): string {
  // Approximate solar month → 地支
  const month = new Date().getMonth() + 1; // 1-12
  // Solar months: 1=寅月,2=卯,3=辰,4=巳,5=午,6=未,7=申,8=酉,9=戌,10=亥,11=子,12=丑
  const monthBranches = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
  return monthBranches[month - 1];
}

interface Interaction {
  type: '六合' | '六沖' | '六害' | '三刑' | '伏吟' | '暗合' | '無';
  luckEffect: 'boost' | 'break' | 'harm' | 'amplify' | 'neutral';
}

function getInteraction(cardBranch: string, taiyuBranch: string): Interaction {
  const liuHe: Record<string, string>   = {子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
  const liuChong: Record<string, string> = {子:'午',午:'子',丑:'未',未:'丑',寅:'申',申:'寅',卯:'酉',酉:'卯',辰:'戌',戌:'辰',巳:'亥',亥:'巳'};
  const liuHai: Record<string, string>   = {子:'未',未:'子',丑:'午',午:'丑',寅:'巳',巳:'寅',卯:'辰',辰:'卯',申:'亥',亥:'申',酉:'戌',戌:'酉'};
  const anHe: Record<string, string>     = {午:'亥',亥:'午',子:'巳',巳:'子',丑:'辰',辰:'丑',寅:'酉',酉:'寅',卯:'申',申:'卯',未:'戌',戌:'未'};

  if (cardBranch === taiyuBranch) return { type: '伏吟', luckEffect: 'amplify' };
  if (liuHe[cardBranch] === taiyuBranch) return { type: '六合', luckEffect: 'boost' };
  if (liuChong[cardBranch] === taiyuBranch) return { type: '六沖', luckEffect: 'break' };
  if (liuHai[cardBranch] === taiyuBranch) return { type: '六害', luckEffect: 'harm' };
  if (anHe[cardBranch] === taiyuBranch) return { type: '暗合', luckEffect: 'boost' };
  return { type: '無', luckEffect: 'neutral' };
}

function isGoodLuck(luck: string) { return luck.includes('吉'); }
function isBadLuck(luck: string)  { return luck.includes('凶'); }

function getInteractionDesc(card: CardData, interaction: Interaction, taiyuBranch: string, position: number): string {
  const { type, luckEffect } = interaction;
  const pos = ['過去的起因', '現在的狀況', '未來的結局'][position];
  const good = isGoodLuck(card.luck);
  const bad  = isBadLuck(card.luck);

  if (type === '六合') {
    if (good) return `與今年太歲（${taiyuBranch}）六合，歲君主動配合，此牌的吉氣在今年被倍增加持。${pos}的順遂感非常明顯，貴人與機運主動靠近，事半功倍。`;
    if (bad)  return `雖屬凶牌，但與今年太歲（${taiyuBranch}）六合——凶牌逢合，凶氣大幅減輕。原本嚴重的困境因為大環境接手，竟出現意想不到的緩解，甚至轉機。`;
    return `本牌（平）與今年太歲（${taiyuBranch}）六合，平靜的局面因天時加持，出現意外的正向轉折，可把握這個窗口期主動出擊。`;
  }

  if (type === '六沖') {
    if (good) return `與今年太歲（${taiyuBranch}）六沖，吉運遭外力衝擊，${pos}多生波折與阻礙。但沖不等於無效，只要頂住壓力，吉運仍在底層流動，最終仍可成事，只是需要付出更多。`;
    if (bad)  return `凶牌遇今年太歲（${taiyuBranch}）六沖——物極必反，沖開死局。若此前一直卡死在困境中，今年的衝擊反而成為逃生的契機。被迫改變，往往就是翻盤的開始。`;
    return `平牌遇太歲六沖，打破原本一成不變的狀態，動盪中反而有轉圜空間，主動出擊比守舊更有機會。`;
  }

  if (type === '六害') {
    if (good) return `吉牌遇今年太歲（${taiyuBranch}）六害，吉中藏礙，好事的背後暗藏消耗——小人暗箭、體制阻力、或最親近之人無意間的拖累。謹慎中求進，提防吉運被悄悄削減。`;
    if (bad)  return `大凶再遇太歲（${taiyuBranch}）六害，雙重壓制，是牌局中最沉重的組合。此位置宜守不宜攻，全力低調保守，靜待時機自然化解。`;
    return `平牌逢太歲六害，表面平靜下藏著暗流，防身邊消極影響慢慢侵蝕，不可掉以輕心。`;
  }

  if (type === '暗合') {
    if (good) return `與今年太歲（${taiyuBranch}）暗合，貴人緣在看不見的地方運作，吉勢在水面下積累，往往在不經意間有好消息或貴人出現。`;
    if (bad)  return `與今年太歲（${taiyuBranch}）暗合，凶中有隱藏的緩解力量，不要放棄尋找那個暗中幫你的人，貴人雖不顯眼卻真實存在。`;
    return `與今年太歲（${taiyuBranch}）暗合，機緣在暗處流動，留心身邊不起眼的訊息，可能蘊藏重要轉機。`;
  }

  if (type === '伏吟') {
    if (good) return `與今年太歲（${taiyuBranch}）伏吟同支，吉氣被大幅放大，但伏吟同時代表容易得意忘形，或事情原地反覆打轉。吉運雖強，仍需腳踏實地，避免過度自滿。`;
    if (bad)  return `凶牌遇伏吟（與太歲${taiyuBranch}同支），凶氣反覆加強，最容易陷入重複犯同樣錯誤的循環。此位置需要下定決心徹底改變慣性，方能破局。`;
    return `與太歲伏吟同支，平中有悶，容易原地踏步，需主動打破慣例才能有新的進展。`;
  }

  // 無特殊
  if (good) return `與今年太歲無特殊感應，牌意照原本的吉象發展，吉運靠自身積累與努力，不特別借力於天時，也不被天時阻礙。穩扎穩打即可。`;
  if (bad)  return `與今年太歲無特殊感應，凶象照原本走勢發展，需靠自身謹慎應對，無特別外力幫助，也不會因天時加重。`;
  return `與今年太歲無特殊感應，平穩發展，維持現狀，安分守己是最好的策略。`;
}

function adjustedLuckLabel(luck: string, effect: Interaction['luckEffect']): { label: string; color: string } {
  if (effect === 'boost') {
    if (luck === '大吉') return { label: '大吉（天時加持）', color: 'text-red-400' };
    if (luck === '上吉' || luck === '中吉') return { label: '吉（貴人扶助）', color: 'text-amber-400' };
    if (luck === '平') return { label: '轉吉（合逢轉機）', color: 'text-amber-400' };
    if (luck === '中凶') return { label: '減凶（逢合化解）', color: 'text-amber-500' };
    return { label: '減凶（凶牌逢合）', color: 'text-amber-500' };
  }
  if (effect === 'break') {
    if (luck.includes('吉')) return { label: luck + '（有波折）', color: 'text-amber-400' };
    if (luck === '平') return { label: '動盪（可主動開局）', color: 'text-amber-500' };
    return { label: luck + '（沖開有機）', color: 'text-amber-500' };
  }
  if (effect === 'harm') {
    if (luck.includes('吉')) return { label: luck + '（防暗損）', color: 'text-amber-400' };
    if (luck === '平') return { label: '暗耗（需謹慎）', color: 'text-orange-400' };
    return { label: luck + '（雙重壓制）', color: 'text-red-500' };
  }
  if (effect === 'amplify') {
    if (luck.includes('吉')) return { label: luck + '（氣勢加強）', color: 'text-red-400' };
    return { label: luck + '（反覆難解）', color: 'text-purple-400' };
  }
  // neutral
  const colorMap: Record<string, string> = {
    '大吉': 'text-red-400', '上吉': 'text-red-400', '中吉': 'text-amber-400',
    '平': 'text-gray-400', '中凶': 'text-orange-400', '大凶': 'text-purple-400',
  };
  return { label: luck, color: colorMap[luck] ?? 'text-gray-400' };
}

function getOverallSummary(cards: CardData[], interactions: Interaction[], taiyuBranch: string, questionType: string): string {
  const goodCount = cards.filter(c => isGoodLuck(c.luck)).length;
  const badCount  = cards.filter(c => isBadLuck(c.luck)).length;
  const boostCount = interactions.filter(i => i.luckEffect === 'boost').length;
  const harmCount  = interactions.filter(i => i.luckEffect === 'harm').length;

  const card3 = cards[2];
  const futBranch = card3.stem[1];
  const branchMonths: Record<string, string> = {
    子:'農曆11月（冬至前後）', 丑:'農曆12月（大寒）', 寅:'農曆1月（春節前後）', 卯:'農曆2月（春分）',
    辰:'農曆3月（清明）',     巳:'農曆4月（立夏）', 午:'農曆5月（端午）',   未:'農曆6月（年中）',
    申:'農曆7月（立秋）',     酉:'農曆8月（中秋）', 戌:'農曆9月（霜降）',   亥:'農曆10月（立冬）',
  };

  const qMap: Record<string, string> = {
    事業: '在事業上', 感情: '在感情上', 財運: '在財運上', 健康: '在健康上', 其他: '在所問之事上',
  };
  const qLabel = qMap[questionType] ?? '在所問之事上';

  let summary = '';

  // Overall verdict
  if (goodCount === 3) {
    summary += `三牌皆吉，大局順遂。${qLabel}，整體走勢積極向上，只要不躁進，穩步推進即可收穫理想成果。`;
  } else if (badCount === 3) {
    summary += `三牌皆凶，此時${qLabel}宜靜守不宜輕舉妄動。困境雖重，但凡事都有週期，待時機自然化解，切勿在最低潮時做大決策。`;
  } else if (isGoodLuck(cards[0].luck) && isGoodLuck(cards[1].luck) && isBadLuck(cards[2].luck)) {
    summary += `前兩牌吉、結局轉凶。${qLabel}，前段進展順利，但臨近結局時需謹慎——不可因前段的成功而大意，收手時機的判斷至關重要。`;
  } else if (isBadLuck(cards[0].luck) && isBadLuck(cards[1].luck) && isGoodLuck(cards[2].luck)) {
    summary += `前兩牌凶、結局逢吉。${qLabel}，雖然過去與現在充滿阻礙，但結局牌顯示苦盡甘來之象，堅持熬過現在的困境，終有轉圜。`;
  } else if (isBadLuck(cards[0].luck) && isGoodLuck(cards[2].luck)) {
    summary += `起點艱難、結局向吉。${qLabel}，過去的阻礙只是考驗，整體走向是先苦後甘的格局，方向是對的，繼續前行。`;
  } else if (isGoodLuck(cards[0].luck) && isBadLuck(cards[2].luck)) {
    summary += `起點順利、結局有阻。${qLabel}，不宜過度樂觀或過早行動，需為未來的波折預留緩衝，見好就收反而是上策。`;
  } else {
    summary += `三牌吉凶互見，${qLabel}局面複雜，需靈活應對，不拘一格。`;
  }

  // Timing from card 3
  const timing = branchMonths[futBranch];
  if (timing) {
    summary += `\n\n【關鍵應期】結局牌（${card3.title}）的地支「${futBranch}」對應${timing}前後，此時段是整件事發展的關鍵轉捩點，建議在此之前做好準備。`;
  }

  // TaiSui effect summary
  if (boostCount >= 2) {
    summary += `\n\n【今年天時】三牌中有${boostCount}張與今年太歲（${taiyuBranch}）合住，天時大力配合，今年是推進此事的好時機。`;
  } else if (harmCount >= 2) {
    summary += `\n\n【今年天時】三牌中有${harmCount}張與今年太歲（${taiyuBranch}）形成六害，今年環境壓力較大，凡事宜謹慎保守，不宜輕易冒進。`;
  }

  // Advice
  summary += '\n\n【建議】';
  if (goodCount >= 2) {
    summary += '整體吉象較強，可積極行動，主動創造機遇，貴人近在眼前，勇敢開口求助即可。';
  } else if (badCount >= 2) {
    summary += '整體凶象較重，此時以守代攻，低調行事，避免做重大決策，等待時機翻轉再出手。';
  } else {
    summary += '吉凶各半，此時需要判斷力。可小步嘗試，見機行事，不要一次性押注太大，保留彈性空間。';
  }

  return summary;
}

// ─── UI component ────────────────────────────────────────────────────────────

const LUCK_BADGE: Record<string, string> = {
  '大吉': 'bg-red-100 text-red-700 border border-red-300',
  '上吉': 'bg-rose-100 text-rose-700 border border-rose-300',
  '中吉': 'bg-amber-100 text-amber-700 border border-amber-300',
  '平':   'bg-gray-100 text-gray-600 border border-gray-300',
  '中凶': 'bg-purple-100 text-purple-700 border border-purple-300',
  '大凶': 'bg-purple-200 text-purple-900 border border-purple-500',
};

const POSITION_LABELS = ['過去（起因）', '現在（現狀）', '未來（結局）'];
const POSITION_COLORS = ['text-amber-400', 'text-amber-300', 'text-yellow-300'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function OnlineConsultationPage() {
  const [deck, setDeck] = useState<CardData[]>(() => shuffle(ALL_CARDS));
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<CardData[]>([]);
  const [questionType, setQuestionType] = useState('其他');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const taiSui = getTaiSui(new Date().getFullYear());

  const handleShuffle = useCallback(() => {
    setDeck(shuffle(ALL_CARDS));
    setOpenIds(new Set());
    setSelected([]);
    setResult('');
  }, []);

  const handleCardClick = useCallback((card: CardData) => {
    if (result) return; // locked after analysis
    if (openIds.has(card.id)) return; // already open

    const newOpen = new Set(openIds);
    newOpen.add(card.id);
    setOpenIds(newOpen);

    if (selected.length < 3) {
      const newSelected = [...selected, card];
      setSelected(newSelected);
    }
  }, [openIds, selected, result]);

  const handleAnalyze = useCallback(() => {
    if (selected.length < 3) return;
    setIsAnalyzing(true);

    // Small artificial delay for UX feel
    setTimeout(() => {
      const interactions = selected.map(c => getInteraction(c.stem[1], taiSui.branch));
      setResult(getOverallSummary(selected, interactions, taiSui.branch, questionType));
      setIsAnalyzing(false);
      // Scroll to result
      setTimeout(() => document.getElementById('niao-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, 800);
  }, [selected, questionType, taiSui.branch]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#140b0b', color: '#fffcf2' }}>
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Title */}
          <div className="text-center mb-6" style={{ borderBottom: '2px solid #d4af37', paddingBottom: '16px' }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#d4af37' }}>
              文王神數三十二府鳥卦
            </h1>
            <p className="text-sm" style={{ color: '#c8a96e' }}>線上問事・自動解盤</p>
          </div>

          {/* TaiSui banner */}
          <div className="rounded-lg mb-6 px-4 py-3 text-center text-sm" style={{ background: '#2b1111', border: '1px solid #d4af37' }}>
            <span style={{ color: '#d4af37' }}>流年太歲：</span>
            <strong style={{ color: '#ff6b6b' }}>{taiSui.stem}{taiSui.branch}年（{taiSui.nayin}）</strong>
            <span style={{ color: '#d4af37' }} className="ml-4">太歲地支：</span>
            <strong style={{ color: '#ff6b6b' }}>{taiSui.branch}</strong>
            <span className="ml-4 text-xs" style={{ color: '#9a8060' }}>
              操作：點「洗牌」後，依序點開 3 張牌（過去→現在→未來），選擇問事類型，再點「解牌分析」
            </span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 items-center mb-6">
            <button
              onClick={handleShuffle}
              className="font-bold px-6 py-2 rounded-full transition-all hover:scale-105 cursor-pointer"
              style={{ background: '#a62626', border: '2px solid #d4af37', color: '#fff' }}
            >
              混沌隨機洗牌
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: '#c8a96e' }}>問事類型：</span>
              {['事業', '感情', '財運', '健康', '其他'].map(t => (
                <button
                  key={t}
                  onClick={() => setQuestionType(t)}
                  className="px-3 py-1 rounded-full text-sm transition-colors cursor-pointer"
                  style={questionType === t
                    ? { background: '#d4af37', color: '#1a0000', fontWeight: 700 }
                    : { background: '#3a1a1a', border: '1px solid #7a5a3a', color: '#c8a96e' }
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Selected cards status */}
          <div className="flex gap-4 mb-4 text-sm" style={{ color: '#9a8060' }}>
            {POSITION_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className={`font-bold ${POSITION_COLORS[i]}`}>{label}：</span>
                <span style={{ color: selected[i] ? '#d4af37' : '#5a4030' }}>
                  {selected[i] ? selected[i].title : '尚未選牌'}
                </span>
              </div>
            ))}
          </div>

          {/* Card grid */}
          <div className="grid gap-3 mb-6"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            {deck.map((card) => {
              const isOpen = openIds.has(card.id);
              const selIdx = selected.findIndex(s => s.id === card.id);
              const isSelected = selIdx >= 0;
              const isDisabled = !isOpen && selected.length >= 3 && !isSelected;

              return (
                <div
                  key={card.id}
                  onClick={() => !isDisabled && handleCardClick(card)}
                  className="relative transition-all duration-300"
                  style={{
                    width: '120px',
                    height: '180px',
                    perspective: '1000px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.4 : 1,
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.5s',
                    transform: isOpen ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    borderRadius: '8px',
                    boxShadow: isSelected ? '0 0 12px #d4af37' : '0 2px 6px rgba(0,0,0,0.5)',
                  }}>
                    {/* Back */}
                    <div style={{
                      position: 'absolute', width: '100%', height: '100%',
                      backfaceVisibility: 'hidden', borderRadius: '8px',
                      background: '#a62626', border: '4px double #d4af37',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      color: '#d4af37', fontSize: '1.4rem', fontWeight: 'bold',
                      writingMode: 'vertical-rl',
                    }}>
                      鳥卦
                    </div>
                    {/* Front */}
                    <div style={{
                      position: 'absolute', width: '100%', height: '100%',
                      backfaceVisibility: 'hidden', borderRadius: '8px',
                      transform: 'rotateY(180deg)',
                      background: card.luck.includes('凶') ? '#fcf5fc' : '#fff9f9',
                      border: card.luck.includes('凶') ? '3px solid #732673' : '3px solid #ff3333',
                      padding: '6px',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      color: '#2b2b2b',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 700, borderBottom: '1px solid #ccc', paddingBottom: '2px' }}>
                        <span>{card.stem}</span>
                        <span style={{ color: card.luck.includes('凶') ? '#732673' : '#cc0000' }}>[{card.luck}]</span>
                      </div>
                      <div style={{ textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#8a1f1f', margin: '2px 0' }}>
                        {card.title}
                      </div>
                      <div style={{ fontSize: '0.6rem', lineHeight: 1.3 }}>
                        {card.story.substring(0, 28)}{card.story.length > 28 ? '...' : ''}
                      </div>
                      {isSelected && (
                        <div style={{
                          position: 'absolute', top: 2, right: 2,
                          background: '#d4af37', color: '#1a0000',
                          borderRadius: '50%', width: '18px', height: '18px',
                          fontSize: '0.6rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {selIdx + 1}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Analyze button */}
          {selected.length === 3 && !result && (
            <div className="text-center mb-6">
              <div className="mb-3">
                <input
                  type="text"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="（選填）請簡述您的問題..."
                  className="w-full max-w-md px-4 py-2 rounded-lg text-sm"
                  style={{ background: '#2b1111', border: '1px solid #d4af37', color: '#fffcf2' }}
                />
              </div>
              <button
                onClick={handleAnalyze}
                className="font-bold text-lg px-10 py-3 rounded-full transition-all hover:scale-105 cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#d4af37,#a67c00)', color: '#1a0000' }}
              >
                解牌分析
              </button>
            </div>
          )}

          {/* Loading */}
          {isAnalyzing && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-amber-200 text-sm">觀星布局，解析中...</p>
            </div>
          )}

          {/* Analysis result */}
          {result && selected.length === 3 && (
            <div id="niao-result" className="rounded-xl p-6 mt-2"
              style={{ background: '#1e0e0e', border: '2px solid #d4af37' }}>
              <h2 className="text-xl font-bold mb-6 text-center" style={{ color: '#d4af37' }}>
                解牌報告　問事類型：{questionType}{question ? `　「${question}」` : ''}
              </h2>

              {/* Per-card analysis */}
              {selected.map((card, i) => {
                const interaction = getInteraction(card.stem[1], taiSui.branch);
                const adjusted = adjustedLuckLabel(card.luck, interaction.luckEffect);
                const desc = getInteractionDesc(card, interaction, taiSui.branch, i);
                return (
                  <div key={i} className="mb-6 p-4 rounded-lg" style={{ background: '#2b1111', border: '1px solid #5a3a1a' }}>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="font-bold text-base" style={{ color: POSITION_COLORS[i].replace('text-', '') === 'amber-400' ? '#fbbf24' : POSITION_COLORS[i].replace('text-', '') === 'amber-300' ? '#fcd34d' : '#fde68a' }}>
                        {['①','②','③'][i]}　{POSITION_LABELS[i]}
                      </span>
                      <span className="font-bold text-lg" style={{ color: '#d4af37' }}>【{card.title}】</span>
                      <span className="text-sm" style={{ color: '#9a8060' }}>{card.stem}・{card.nayin}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${LUCK_BADGE[card.luck] ?? 'bg-gray-200 text-gray-700'}`}>
                        {card.luck}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#3a2010', color: '#d4af37' }}>
                        太歲{interaction.type}
                      </span>
                    </div>

                    <p className="text-sm mb-2" style={{ color: '#c8c0a0' }}>
                      <strong style={{ color: '#d4af37' }}>象意：</strong>{card.story}
                    </p>
                    <p className="text-sm mb-2" style={{ color: '#c8c0a0' }}>
                      <strong style={{ color: '#d4af37' }}>本牌應期：</strong>{card.outcome}
                    </p>
                    <p className="text-sm mb-3" style={{ color: '#e0d8c0', lineHeight: 1.7 }}>
                      <strong style={{ color: '#d4af37' }}>太歲動態解析：</strong>{desc}
                    </p>
                    <div className="text-sm font-bold">
                      <span style={{ color: '#9a8060' }}>綜合運勢判定：</span>
                      <span className={adjusted.color}>{adjusted.label}</span>
                    </div>
                  </div>
                );
              })}

              {/* Overall summary */}
              <div className="p-4 rounded-lg mt-4" style={{ background: '#2a1a08', border: '1px solid #d4af37' }}>
                <h3 className="font-bold text-base mb-3" style={{ color: '#d4af37' }}>綜合解盤總結</h3>
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
                  onClick={handleShuffle}
                  className="px-6 py-2 rounded-full text-sm font-bold cursor-pointer hover:scale-105 transition-all"
                  style={{ background: '#3a1a1a', border: '1px solid #d4af37', color: '#d4af37' }}
                >
                  重新洗牌再問
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
