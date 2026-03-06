import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '命學傳承',
  description: '深入了解中華傳統命理學的精髓。八字學、紫微斗數、易經等傳統命學知識的系統性介紹與傳承。探索千年智慧，洞悉命運奧秘。',
  keywords: ['命學', '八字學', '紫微斗數', '易經', '傳統命理', '命理知識', '命理教學'],
  openGraph: {
    title: '命學傳承 | 玉洞子星相古學堂',
    description: '深入了解中華傳統命理學的精髓，探索千年智慧，洞悉命運奧秘。',
  },
};

export default function HeritageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
