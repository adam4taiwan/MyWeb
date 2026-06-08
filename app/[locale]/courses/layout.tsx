import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Courses');
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  };
}

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
