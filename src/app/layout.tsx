import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BattleStudyProvider } from "@/context/BattleStudyContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "스쿨배틀 (SchoolBattle Arena) - 실시간 퀴즈 배틀 & 수학 수행평가 관리",
  description: "학교의 명예를 걸고 맞붙는 1대1 실시간 퀴즈 배틀 및 2022 개정 교육과정 연계 수학 수행평가 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <BattleStudyProvider>
          {children}
        </BattleStudyProvider>
      </body>
    </html>
  );
}
