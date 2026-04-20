import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "週末東京族 | 地方に住む。東京を使う。",
  description:
    "平日は地方で暮らし、週末は東京で過ごす。「完全移住」でも「東京在住」でもない、第三の選択肢。逆参勤交代という新しい生き方を提案するメディアです。",
  keywords: [
    "二拠点生活",
    "デュアルライフ",
    "逆参勤交代",
    "移住",
    "週末東京",
    "地方移住",
    "二拠点生活 費用",
  ],
  openGraph: {
    title: "週末東京族 | 地方に住む。東京を使う。",
    description:
      "平日は地方で暮らし、週末は東京で過ごす。逆参勤交代という新しい生き方を提案するメディアです。",
    siteName: "週末東京族",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3471434470251085"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAF8] text-[#1A1A1A]">
        {children}
        <GoogleAnalytics gaId="G-SFLFOGKZFN" />
      </body>
    </html>
  );
}
