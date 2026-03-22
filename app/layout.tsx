import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../components/AuthContext';
import ContactFloat from '../components/ContactFloat';

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yudongzi.tw';
const siteName = '玉洞子星相古學堂';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | 專業命理諮詢・八字・紫微斗數`,
    template: `%s | ${siteName}`,
  },
  description: '結合30年傳統命理學與現代科技，提供精準的八字排盤、紫微斗數分析、一對一命理諮詢服務。專業命理師，24/7線上服務，5000+滿意客戶。',
  keywords: ['命理', '八字', '紫微斗數', '排盤', '命理諮詢', '風水', '婚配', '事業運', '玉洞子', '星相', '命理師', '算命'],
  authors: [{ name: '玉洞子' }],
  creator: '玉洞子星相古學堂',
  publisher: '玉洞子星相古學堂',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: siteUrl,
    siteName,
    title: `${siteName} | 專業命理諮詢・八字・紫微斗數`,
    description: '結合30年傳統命理學與現代科技，提供精準的八字排盤、紫微斗數分析、一對一命理諮詢服務。',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '玉洞子星相古學堂 - 專業命理諮詢',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} | 專業命理諮詢`,
    description: '結合30年傳統命理學與現代科技，提供精準的八字排盤、紫微斗數分析服務。',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: siteUrl,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  url: siteUrl,
  description: '結合30年傳統命理學與現代科技，提供專業命理諮詢服務',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '0910-032-057',
    contactType: 'customer service',
    availableLanguage: ['zh-TW'],
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  url: siteUrl,
};

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: '命理諮詢服務',
  provider: { '@type': 'Organization', name: siteName },
  serviceType: '命理諮詢',
  description: '八字排盤、紫微斗數、婚配合盤、事業運勢分析等專業命理諮詢',
  areaServed: { '@type': 'Country', name: 'Taiwan' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning={true}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} antialiased`}>
        <AuthProvider>
          {children}
          <ContactFloat />
        </AuthProvider>
      </body>
    </html>
  );
}
