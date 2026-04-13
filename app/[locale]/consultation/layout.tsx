import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Consultation' });
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    keywords: ['命理諮詢', '八字諮詢', '紫微斗數諮詢', '婚配', '事業運', '線上命理', '算命諮詢'],
    openGraph: {
      title: `${t('metaTitle')} | 玉洞子星相古學堂`,
      description: t('metaDesc'),
    },
  };
}

export default function ConsultationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
