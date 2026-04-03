import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Card themes: 8 topics rotating by day of year
const THEMES = [
  {
    label: '命 理 ・ 智 慧',
    title: '為什麼同樣努力\n有人輕鬆成功？',
    lines: [
      '答案藏在你的先天格局裡',
      '八字定根基，紫微定事件',
      '兩套系統同時成立',
      '才是真正的論斷',
    ],
    cta: '追蹤了解更多命理知識'
  },
  {
    label: '八 字 ・ 基 礎',
    title: '八字不是算命\n是讀懂自己的密碼',
    lines: [
      '天干地支排出四柱',
      '年月日時各有玄機',
      '五行生剋，藏著一生走向',
      '用神忌神，決定運勢起伏',
    ],
    cta: '了解八字，了解自己'
  },
  {
    label: '紫 微 ・ 斗 數',
    title: '紫微斗數\n用星曜說你的故事',
    lines: [
      '命宮看個性與人生方向',
      '財帛宮看財富積累能力',
      '夫妻宮看感情與婚姻緣分',
      '四化飛星，事件有跡可循',
    ],
    cta: '完整命盤鑑定 yudongzi.tw'
  },
  {
    label: '財 運 ・ 開 運',
    title: '財運不是靠努力\n是靠格局',
    lines: [
      '正財：穩定薪資、本職收入',
      '偏財：投資、橫財、外快',
      '先看八字財星有無根',
      '再看大運流年是否配合',
    ],
    cta: '查您的財運格局'
  },
  {
    label: '感 情 ・ 緣 分',
    title: '桃花多不等於\n感情順利',
    lines: [
      '男命財星代表女緣',
      '女命官殺代表男緣',
      '緣分深淺看沖合刑害',
      '時機對了，自然水到渠成',
    ],
    cta: '分析您的感情格局'
  },
  {
    label: '事 業 ・ 格 局',
    title: '適合當老闆\n還是打工皇帝？',
    lines: [
      '食傷旺、印星弱 → 創業型',
      '官殺旺、印星有根 → 仕途型',
      '財星透干 → 商業敏感度高',
      '看準格局，走對方向',
    ],
    cta: '鑑定您的事業格局'
  },
  {
    label: '開 運 ・ 建 議',
    title: '順天而行\n才是真正的開運',
    lines: [
      '知道自己的用神方位',
      '選對顏色、方向、行業',
      '避開忌神的時間節點',
      '讓命運為你加分',
    ],
    cta: '個人開運建議 yudongzi.tw'
  },
  {
    label: '命 理 ・ 人 生',
    title: '命好不如運好\n運好不如心態好',
    lines: [
      '命是先天格局的底牌',
      '運是後天時機的助力',
      '心態決定如何用好這副牌',
      '命理是指引，不是枷鎖',
    ],
    cta: '歡迎追蹤每週命理分享'
  }
]

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  // 今日台灣時間
  const nowTw = new Date(Date.now() + 8 * 3600 * 1000)
  const dateStr = searchParams.get('date') || nowTw.toISOString().slice(0, 10)
  const dayOfYear = getDayOfYear(nowTw)

  // 星名（由 Ecanapi 傳入，或預設）
  const yearStar  = searchParams.get('yearStar')  || '一白水星'
  const monthStar = searchParams.get('monthStar') || ''
  const dayStar   = searchParams.get('dayStar')   || ''
  const fortuneText = searchParams.get('fortune') || ''

  // 決定主題：0-6 輪替，若 dayStar 有值則用「今日九星」版面（主題索引特殊）
  const useNineStarTheme = !!dayStar && !!fortuneText
  const themeIdx = useNineStarTheme ? -1 : (dayOfYear % 7) // 0-6 輪

  // 載入字型
  let fontData: ArrayBuffer
  try {
    const fontRes = await fetch(
      'https://fonts.gstatic.com/s/notoseriftc/v36/XLYzIZb5bJNDGYxLBibeHZ0BnHwmuanx8cUaGX9aMOpD.ttf',
      { signal: AbortSignal.timeout(8000) }
    )
    fontData = await fontRes.arrayBuffer()
  } catch {
    // 若字型載入失敗，仍嘗試產生（英文可正常顯示）
    fontData = new ArrayBuffer(0)
  }

  const opts = fontData.byteLength > 0
    ? { fonts: [{ name: 'NotoSerifTC', data: fontData, style: 'normal' as const }] }
    : {}

  const fontFamily = fontData.byteLength > 0 ? 'NotoSerifTC' : 'serif'

  // 決定卡片內容
  let label: string, title: string, lines: string[], cta: string

  if (useNineStarTheme) {
    label = '九 星 ・ 今 日 開 運'
    title = `${dayStar} 值日`
    // fortune text 拆行（最多 4 行）
    const ftLines = fortuneText.replace(/。/g, '。\n').split('\n').filter(Boolean).slice(0, 4)
    lines = ftLines.length > 0 ? ftLines : [`今日${dayStar}當令`, '宜靜心、思考、積累', '把握吉方位開運', '以正向心態面對挑戰']
    cta = `流年${yearStar}　流月${monthStar}`
  } else {
    const theme = THEMES[themeIdx] || THEMES[0]
    label = theme.label
    title = theme.title
    lines = theme.lines
    cta = theme.cta
  }

  const titleLines = title.split('\n')

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          background: 'linear-gradient(145deg, #1a1008 0%, #2d1e0a 45%, #1a1008 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: fontFamily,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 裝飾圓 */}
        <div style={{
          position: 'absolute', width: 580, height: 580, borderRadius: '50%',
          border: '1px solid rgba(212,165,116,0.07)', top: -120, right: -120, display: 'flex'
        }} />
        <div style={{
          position: 'absolute', width: 380, height: 380, borderRadius: '50%',
          border: '1px solid rgba(212,165,116,0.05)', bottom: -80, left: -80, display: 'flex'
        }} />

        {/* 頂部日期列 */}
        <div style={{
          position: 'absolute', top: 54, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          fontSize: 26, color: 'rgba(212,165,116,0.45)', letterSpacing: 4
        }}>
          {dateStr.replace(/-/g, ' / ')}
        </div>

        {/* 主卡片 */}
        <div style={{
          width: 880, display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1
        }}>
          {/* 頂線 */}
          <div style={{
            width: 60, height: 2,
            background: 'linear-gradient(90deg, transparent, #D4A574, transparent)',
            marginBottom: 36
          }} />

          {/* 主題標籤 */}
          <div style={{
            fontSize: 28, color: '#D4A574', letterSpacing: 8,
            marginBottom: 48, fontWeight: 300
          }}>
            {label}
          </div>

          {/* 主標題 */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            marginBottom: 44
          }}>
            {titleLines.map((line, i) => (
              <div key={i} style={{
                fontSize: 62, color: '#f5ead8', lineHeight: 1.55,
                fontWeight: 400
              }}>
                {line}
              </div>
            ))}
          </div>

          {/* 分隔線 */}
          <div style={{
            width: 100, height: 1,
            background: 'linear-gradient(90deg, transparent, #D4A574, transparent)',
            marginBottom: 44
          }} />

          {/* 內容列表 */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
            marginBottom: 56
          }}>
            {lines.map((line, i) => (
              <div key={i} style={{
                fontSize: 34, color: '#c4a882', lineHeight: 1.85, fontWeight: 300
              }}>
                {line}
              </div>
            ))}
          </div>

          {/* CTA 按鈕 */}
          <div style={{
            fontSize: 28, color: '#1a1008',
            background: 'linear-gradient(135deg, #D4A574, #b8874a)',
            padding: '16px 48px', borderRadius: 50,
            letterSpacing: 3, fontWeight: 500
          }}>
            {cta}
          </div>
        </div>

        {/* 底部 Logo */}
        <div style={{
          position: 'absolute', bottom: 50, right: 80,
          fontSize: 24, color: 'rgba(212,165,116,0.4)', letterSpacing: 2
        }}>
          玉洞子星相古學堂 ・ yudongzi.tw
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      ...opts
    }
  )
}
