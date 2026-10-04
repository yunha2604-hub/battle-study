"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Swords, Zap, LogIn } from "lucide-react";

export type NavTabType = "LOBBY" | "BATTLE" | "DEATHMATCH" | "SHADOW_RAID" | "ANALYTICS" | "TEACHER" | "LOGIN";

export interface GlobalHeaderProps {
  activeTab?: NavTabType;
  energy?: number;
  theme?: "dark" | "light";
  onGoToTeacher?: () => void;
}

export default function GlobalHeader({
  activeTab: propActiveTab,
  energy = 3,
  theme = "dark",
  onGoToTeacher
}: GlobalHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Auto-detect active tab from route if not explicitly provided
  const activeTab: NavTabType = propActiveTab || (() => {
    if (pathname === "/battle") return "BATTLE";
    if (pathname === "/deathmatch") return "DEATHMATCH";
    if (pathname === "/shadow-raid") return "SHADOW_RAID";
    if (pathname === "/analytics") return "ANALYTICS";
    if (pathname === "/teacher") return "TEACHER";
    if (pathname === "/") return "LOGIN";
    return "LOBBY";
  })();

  const isLight = theme === "light";

  return (
    <header className={`border-b backdrop-blur-md sticky top-0 z-50 px-4 md:px-6 py-4 flex items-center justify-between gap-4 transition-colors ${
      isLight 
        ? "border-slate-200 bg-white/90 text-slate-900" 
        : "border-slate-900 bg-slate-900/60 text-slate-100"
    }`}>
      {/* Brand Logo */}
      <div 
        onClick={() => router.push("/lobby")}
        className="flex items-center gap-3 shrink-0 cursor-pointer group"
        title="배틀스터디 홈(메인 로비)으로 이동"
      >
        <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
          <Swords className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
          <h2 className={`text-sm md:text-xl font-bold bg-clip-text text-transparent ${
            isLight
              ? "bg-gradient-to-r from-slate-900 to-slate-600"
              : "bg-gradient-to-r from-white to-slate-400"
          } font-sans group-hover:text-cyan-400 transition-colors`}>
            배틀스터디 아레나
          </h2>
          <p className="text-[9px] md:text-[10px] text-cyan-400 tracking-wider font-semibold uppercase">
            Season 1: First Honor
          </p>
        </div>
      </div>

      {/* Game Navigation Tabs */}
      <div className={`hidden md:flex items-center gap-1 border p-1 rounded-xl ${
        isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950/80 border-slate-850"
      }`}>
        {/* Tab 1: 메인 로비 */}
        <button
          type="button"
          onClick={() => router.push("/lobby")}
          className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "LOBBY"
              ? isLight ? "bg-white text-slate-900 shadow-sm" : "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <span>🏛️</span>
          <span>메인 로비</span>
        </button>

        {/* Tab 2: 1:1 퀴즈 배틀 */}
        <button
          type="button"
          onClick={() => router.push("/battle")}
          className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "BATTLE"
              ? isLight ? "bg-white text-red-600 shadow-sm border border-red-200" : "bg-slate-900 text-red-400 shadow-sm border border-red-500/40"
              : "text-slate-500 hover:text-red-400"
          }`}
        >
          <span>⚔️</span>
          <span>1:1 퀴즈 배틀</span>
        </button>

        {/* Tab 3: 학교 대항 데스매치 */}
        <button
          type="button"
          onClick={() => router.push("/deathmatch")}
          className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "DEATHMATCH"
              ? isLight ? "bg-white text-orange-600 shadow-sm border border-orange-200" : "bg-slate-900 text-orange-400 shadow-sm border border-orange-500/40"
              : "text-slate-500 hover:text-orange-400"
          }`}
        >
          <span>🔥</span>
          <span>학교 대항</span>
        </button>

        {/* Tab 3: 오답 던전 */}
        <button
          type="button"
          onClick={() => router.push("/shadow-raid")}
          className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "SHADOW_RAID"
              ? isLight ? "bg-white text-emerald-600 shadow-sm" : "bg-slate-900 text-emerald-400 shadow-sm"
              : "text-slate-500 hover:text-emerald-400"
          }`}
        >
          <span>👾</span>
          <span>오답 던전</span>
        </button>

        {/* Tab 5: 나의 역량 분석 */}
        <button
          type="button"
          onClick={() => router.push("/analytics")}
          className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "ANALYTICS"
              ? isLight ? "bg-white text-purple-600 shadow-sm" : "bg-slate-900 text-purple-400 shadow-sm"
              : "text-slate-500 hover:text-purple-400"
          }`}
        >
          <span>📊</span>
          <span>나의 역량 분석</span>
        </button>

        {/* Tab 5: 교사 대시보드 */}
        <button
          type="button"
          onClick={() => {
            if (onGoToTeacher) onGoToTeacher();
            else router.push("/teacher");
          }}
          className={`px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "TEACHER"
              ? isLight ? "bg-white text-purple-700 shadow-sm border border-purple-300" : "bg-slate-900 text-purple-400 shadow-sm border border-purple-500/40"
              : "text-purple-400 hover:text-purple-300 hover:bg-purple-950/20 border border-purple-900/30"
          }`}
        >
          <span>👩‍🏫</span>
          <span>교사</span>
        </button>

        {/* Tab 6: 로그인 */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "LOGIN"
              ? isLight ? "bg-white text-cyan-600 shadow-sm border border-cyan-300" : "bg-slate-900 text-cyan-300 shadow-sm border border-cyan-500/40"
              : "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/20 border border-cyan-900/30"
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>로그인</span>
        </button>
      </div>

      {/* User Status Bar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Lightning Energy Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${
          isLight ? "bg-yellow-50 border-yellow-200 text-yellow-600" : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
        }`}>
          <Zap className={`w-4 h-4 animate-pulse ${isLight ? "fill-yellow-500" : "fill-yellow-400"}`} />
          <span>⚡ {energy} / 5</span>
        </div>

        {/* Live Connected Students Count */}
        <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold text-emerald-400 ${
          isLight ? "bg-slate-100 border-slate-200" : "bg-slate-900/80 border-slate-800"
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>4,821명 접속 중</span>
        </div>

        {/* Direct Login Button (Visible on mobile & desktop) */}
        <button 
          type="button"
          onClick={() => router.push("/")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
            activeTab === "LOGIN"
              ? "bg-cyan-900 border-cyan-500 text-white"
              : "bg-cyan-950/80 border-cyan-800 hover:border-cyan-600 text-cyan-300 hover:text-white"
          }`}
          title="로그인 / 계정 변경"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">로그인</span>
        </button>
      </div>
    </header>
  );
}
