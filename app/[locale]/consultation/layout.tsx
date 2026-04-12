import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '線上命理諮詢',
  description: '提供八字分析、紫微斗數、婚配合盤、事業運勢等專業命理諮詢服務。文字諮詢24小時回覆，語音/視訊即時連線，由30年經驗命理師親自解析。',
  keywords: ['命理諮詢', '八字諮詢', '紫微斗數諮詢', '婚配', '事業運', '線上命理', '算命諮詢'],
  openGraph: {
    title: '線上命理諮詢 | 玉洞子星相古學堂',
    description: '提供八字分析、紫微斗數、婚配合盤等命理諮詢。30年命理經驗，專業解析您的命盤。',
  },
};

export default function ConsultationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
