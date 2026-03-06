import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '排盤工具',
  description: '會員專屬命盤分析工具。輸入生辰資料，立即生成精準的八字命盤、紫微斗數排盤，並提供深度命理鑑定報告。',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DiskLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
