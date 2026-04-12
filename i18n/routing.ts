import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['zh-TW', 'en', 'ja'],
  defaultLocale: 'zh-TW',
  localePrefix: 'always'
});
