import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '命理二手書店',
  description: '精選傳統命理古書、八字、紫微斗數、易經等相關書籍。提供命理學習資源，讓您在家自學傳統命學，深入研究千年智慧。',
  keywords: ['命理書籍', '八字書', '紫微斗數書', '易經書籍', '命理學習', '二手書', '命理古籍'],
  openGraph: {
    title: '命理二手書店 | 玉洞子星相古學堂',
    description: '精選傳統命理古書，提供八字、紫微斗數等命理學習資源。',
  },
};

export default function BookstoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
