import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import "./globals.css";
// 【關鍵修改】：引入 AuthProvider
import { AuthProvider } from '../components/AuthContext'; 


const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "玉洞子星相古學堂",
  description: "結合傳統命理學與現代科技，提供精準的排盤分析與系統化學習課程。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} antialiased`}
      >
        {/* 【關鍵修改】：用 AuthProvider 包裝 children */}
        <AuthProvider>
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}
