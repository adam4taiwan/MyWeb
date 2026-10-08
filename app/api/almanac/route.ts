import { NextRequest } from 'next/server';
import { Solar } from 'lunar-javascript';

// Simplified -> Traditional Chinese mapping for almanac terms
const S2T: Record<string, string> = {
  // 宜忌常用字
  '殓': '殮', '坟': '墳', '启': '啟', '钻': '鑽', '馀': '餘',
  '灶': '竈', '斋': '齋', '财': '財', '见': '見', '订': '訂',
  '盖': '蓋', '无': '無', '开': '開', '贵': '貴', '词': '詞',
  '讼': '訟', '庙': '廟', '动': '動', '东': '東',
  // 生肖 / 天神
  '龙': '龍', '马': '馬', '鸡': '雞', '猪': '豬',
  '陈': '陳', '诸': '諸',
  // 彭祖百忌
  '长': '長', '栽': '栽', '穿': '穿',
  // 方位
  '来': '來',
};

function toTrad(str: string): string {
  return str.replace(/[殓坟启钻馀灶斋财见订盖无开贵词讼庙动东龙马鸡猪陈诸长来]/g, c => S2T[c] ?? c);
}

const ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const TIME_RANGES = [
  '23:00-01:00', '01:00-03:00', '03:00-05:00', '05:00-07:00',
  '07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00',
  '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00',
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const dateStr = searchParams.get('date');

  // Default to today (Taiwan time UTC+8)
  let year: number, month: number, day: number;
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    [year, month, day] = dateStr.split('-').map(Number);
  } else {
    const now = new Date(Date.now() + 8 * 60 * 60 * 1000);
    year = now.getUTCFullYear();
    month = now.getUTCMonth() + 1;
    day = now.getUTCDate();
  }

  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return Response.json({ error: '日期範圍無效，請輸入 1900~2100 年的日期' }, { status: 400 });
  }

  try {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    // --- Daily info ---
    const jieQi = lunar.getJieQi() || null;
    const lunarMonthStr = lunar.getMonthInChinese() + '月';
    const lunarDayStr = lunar.getDayInChinese();

    // --- Yi / Ji (Trad) ---
    const dayYi = lunar.getDayYi().map(toTrad);
    const dayJi = lunar.getDayJi().map(toTrad);

    // --- Chong / Sha ---
    const chong = toTrad(lunar.getDayChongDesc());
    const sha = toTrad(lunar.getDaySha());

    // --- Directions ---
    const posXi = toTrad(lunar.getDayPositionXiDesc());
    const posCai = toTrad(lunar.getDayPositionCaiDesc());
    const posFu = toTrad(lunar.getDayPositionFuDesc());
    const posYangGui = toTrad(lunar.getDayPositionYangGuiDesc());
    const posYinGui = toTrad(lunar.getDayPositionYinGuiDesc());

    // --- PengZu ---
    const pengZuGan = toTrad(lunar.getPengZuGan());
    const pengZuZhi = toTrad(lunar.getPengZuZhi());

    // --- Ganzhi ---
    const yearGanZhi = lunar.getYearInGanZhi();
    const monthGanZhi = lunar.getMonthInGanZhi();
    const dayGanZhi = lunar.getDayInGanZhi();

    // --- 12 Shichen ---
    const times = lunar.getTimes();
    const shichen = times.slice(0, 12).map((t) => {
      const idx = t.getZhiIndex() % 12;
      return {
        zhi: ZHI_NAMES[idx],
        range: TIME_RANGES[idx],
        ganZhi: t.getGanZhi(),
        tianShen: toTrad(t.getTianShen()),
        tianShenType: t.getTianShenType(), // '黄道' | '黑道'
        luck: t.getTianShenLuck(),         // '吉' | '凶'
        yi: t.getYi().map(toTrad),
        ji: t.getJi().map(toTrad),
        chong: toTrad(t.getChongDesc()),
        sha: toTrad(t.getSha()),
      };
    });

    const result = {
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      lunar: {
        year: lunar.getYear(),
        month: lunarMonthStr,
        day: lunarDayStr,
        isLeap: lunar.getMonth() < 0, // negative month = leap month in lunar-javascript
        yearGanZhi,
        monthGanZhi,
        dayGanZhi,
      },
      jieQi,
      yi: dayYi,
      ji: dayJi,
      chong,
      sha,
      directions: {
        xi: posXi,
        cai: posCai,
        fu: posFu,
        yangGui: posYangGui,
        yinGui: posYinGui,
      },
      pengZu: {
        gan: pengZuGan,
        zhi: pengZuZhi,
      },
      shichen,
    };

    return Response.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('[almanac] error:', err);
    return Response.json({ error: '計算失敗，請確認日期格式' }, { status: 500 });
  }
}
