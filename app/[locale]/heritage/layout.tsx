import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Heritage' });
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    keywords: ['命學', '八字學', '紫微斗數', '易經', '傳統命理', '命理知識', '命理教學'],
    openGraph: {
      title: `${t('metaTitle')} | 玉洞子星相古學堂`,
      description: t('metaDesc'),
    },
  };
}

export default function HeritageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
