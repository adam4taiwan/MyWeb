import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yudongzi.tw';
const locales = ['zh-TW', 'en', 'ja'];

const routes = [
  { path: '', changeFrequency: 'weekly' as const, priority: 1.0 },
  { path: '/consultation', changeFrequency: 'monthly' as const, priority: 0.9 },
  { path: '/heritage', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/blog', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/blessing', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/appointment', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/lectures', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/subscribe', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/login', changeFrequency: 'yearly' as const, priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      const url = `${siteUrl}/${locale}${route.path}`;
      entries.push({
        url,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            'zh-TW': `${siteUrl}/zh-TW${route.path}`,
            'en': `${siteUrl}/en${route.path}`,
            'ja': `${siteUrl}/ja${route.path}`,
            'x-default': `${siteUrl}/zh-TW${route.path}`,
          },
        },
      });
    }
  }

  return entries;
}
