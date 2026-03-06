import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '會員中心',
  description: '管理您的帳號資料、點數餘額、購買記錄與帳號安全設定。',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
