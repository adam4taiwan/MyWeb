import { NextRequest } from 'next/server';
import { Solar } from 'lunar-javascript';

const S2T: Record<string, string> = {
  '殓': '殮', '坟': '墳', '启': '啟', '钻': '鑽', '馀': '餘',
  '灶': '竈', '斋': '齋', '财': '財', '见': '見', '订': '訂',
  '盖': '蓋', '无': '無', '开': '開', '贵': '貴', '词': '詞',
  '讼': '訟', '庙': '廟', '动': '動', '东': '東',
  '龙': '龍', '马': '馬', '鸡': '雞', '猪': '豬',
  '陈': '陳', '诸': '諸', '长': '長', '来': '來',
};

function toTrad(str: string): string {
  return str.replace(/[殓坟启钻馀灶斋财见订盖无开贵词讼庙动东龙马鸡猪陈诸长来]/g, c => S2T[c] ?? c);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const yearParam = searchParams.get('year');
  const monthParam = searchParams.get('month');

  const now = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const year = yearParam ? parseInt(yearParam) : now.getUTCFullYear();
  const month = monthParam ? parseInt(monthParam) : now.getUTCMonth() + 1;

  if (isNaN(year) || isNaN(month) || year < 1900 || year > 2100 || month < 1 || month > 12) {
    return Response.json({ error: '無效的年月參數' }, { status: 400 });
  }

  try {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun

    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const solar = Solar.fromYmd(year, month, d);
      const lunar = solar.getLunar();

      const jieQi = lunar.getJieQi() || null;
      const lunarDay = lunar.getDayInChinese();
      const lunarMonth = lunar.getMonthInChinese();
      const isLeapMonth = lunar.getMonth() < 0;
      const dayGanZhi = lunar.getDayInGanZhi();
      const luck = lunar.getDayTianShenLuck();
      const tianShenType = lunar.getDayTianShenType();

      // Top 3 yi/ji only for calendar summary
      const yi = lunar.getDayYi().slice(0, 3).map(toTrad);
      const ji = lunar.getDayJi().slice(0, 2).map(toTrad);

      days.push({
        date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        day: d,
        lunarDay,
        lunarMonth,
        isLeapMonth,
        isFirstDayOfLunarMonth: lunarDay === '初一',
        jieQi,
        dayGanZhi,
        luck,       // '吉' | '凶'
        tianShenType, // '黄道' | '黑道'
        yi,
        ji,
      });
    }

    return Response.json(
      { year, month, firstDayOfWeek, daysInMonth, days },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  } catch (err) {
    console.error('[almanac/month] error:', err);
    return Response.json({ error: '計算失敗' }, { status: 500 });
  }
}
