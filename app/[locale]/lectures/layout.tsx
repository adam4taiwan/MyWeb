import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '命理課程講座',
  description: '由資深命理師主講的八字、紫微斗數線上課程與講座。適合初學者到進階學員，系統化學習傳統命理學，掌握命盤解析精髓。',
  keywords: ['命理課程', '八字課程', '紫微斗數課程', '命理講座', '命理學習', '線上課程', '命理教學'],
  openGraph: {
    title: '命理課程講座 | 玉洞子星相古學堂',
    description: '資深命理師主講的八字、紫微斗數線上課程，系統化學習傳統命理學。',
  },
};

export default function LecturesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
