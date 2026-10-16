"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Zap, LogIn, User, ChevronDown, LogOut, BarChart2, ShieldCheck, Trophy } from "lucide-react";
import { ArenaLogo, EduLogo } from "./BrandLogo";
import { useBattleStudy } from "@/context/BattleStudyContext";

export type NavTabType = "LOBBY" | "BATTLE" | "DEATHMATCH" | "SHADOW_RAID" | "ANALYTICS" | "ASSESSMENT" | "TEACHER" | "LOGIN";

export interface GlobalHeaderProps {
  activeTab?: NavTabType;
  energy?: number;
  theme?: "dark" | "light";
  onGoToTeacher?: () => void;
  onOpenEduModal?: () => void;
}

const TIER_BORDER_STYLES: Record<string, { border: string; badge: string }> = {
  Iron: { border: "from-stone-500 to-stone-700", badge: "text-stone-300" },
  Bronze: { border: "from-amber-600 to-yellow-800", badge: "text-amber-300" },
  Silver: { border: "from-slate-400 via-cyan-400 to-slate-600", badge: "text-slate-200" },
  Gold: { border: "from-yellow-400 via-amber-500 to-yellow-600", badge: "text-yellow-300" },
  Diamond: { border: "from-cyan-400 via-blue-500 to-indigo-600", badge: "text-cyan-200" },
};

export default function GlobalHeader({
  activeTab: propActiveTab,
  energy = 3,
  theme = "dark",
  onGoToTeacher,
  onOpenEduModal,
}: GlobalHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { nickname, school, tier, lp, isSchoolVerified } = useBattleStudy();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Safe fallback profile data
  const userNickname = nickname || "대치동불주먹";
  const userSchool = school || "청계중학교";
  const userTier = tier || "Silver";
  const userLp = lp ?? 60;
  const tierStyle = TIER_BORDER_STYLES[userTier] || TIER_BORDER_STYLES.Silver;

  // Auto-detect active tab from route if not explicitly provided
  const activeTab: NavTabType = propActiveTab || (() => {
    if (pathname === "/battle") return "BATTLE";
    if (pathname === "/deathmatch") return "DEATHMATCH";
    if (pathname === "/shadow-raid") return "SHADOW_RAID";
    if (pathname === "/analytics") return "ANALYTICS";
    if (pathname === "/assessment-test") return "ASSESSMENT";
    if (pathname === "/teacher") return "TEACHER";
    if (pathname === "/") return "LOGIN";
    return "LOBBY";
  })();

  const isLight = theme === "light";
  const isEduMode = activeTab === "TEACHER" || activeTab === "ASSESSMENT";

  return (
    <header className={`border-b backdrop-blur-md sticky top-0 z-50 px-4 md:px-6 py-4 flex items-center justify-between gap-4 transition-colors ${
      isLight 
        ? "border-slate-200 bg-white/90 text-slate-900" 
        : "border-slate-900 bg-slate-900/60 text-slate-100"
    }`}>
      {/* Brand Logo: Context-aware Arena vs Edu */}
      {isEduMode ? (
        <EduLogo 
          size="sm" 
          theme={theme}
          onClick={() => router.push(activeTab === "TEACHER" ? "/teacher" : "/public-edu")}
        />
      ) : (
        <ArenaLogo 
          size="sm" 
          theme={theme}
          onClick={() => router.push("/")}
        />
      )}

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


        {/* Tab 5: 로그인 */}
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

        {/* Tab 6: 배틀스터디 에듀 (공교육 모드) */}
        <button
          type="button"
          onClick={onOpenEduModal ? onOpenEduModal : () => router.push("/public-edu")}
          className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border border-indigo-500/40 bg-indigo-950/40 text-indigo-300 hover:text-white hover:bg-indigo-900/60 shadow-sm hover:border-indigo-400`}
          title="공교육 수학 수행평가 관리 (배틀스터디 에듀)"
        >
          <span>🏛️</span>
          <span>배틀스터디 에듀</span>
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

        {/* Right Action: Login button on Home vs Logged-in Avatar & Dropdown on other pages */}
        {activeTab === "LOGIN" ? (
          <button 
            type="button"
            onClick={() => router.push("/")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isLight
                ? "bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100"
                : "bg-cyan-950/80 border-cyan-800 hover:border-cyan-600 text-cyan-300 hover:text-white"
            }`}
            title="로그인 / 계정 변경"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">로그인</span>
          </button>
        ) : (
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu(prev => !prev)}
              className={`flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-2xl border transition-all cursor-pointer shadow-sm group ${
                showProfileMenu
                  ? isLight ? "bg-slate-100 border-cyan-500 shadow-cyan-100" : "bg-slate-800 border-cyan-500 shadow-cyan-950/50"
                  : isLight ? "bg-slate-50 hover:bg-slate-100 border-slate-200" : "bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-slate-700"
              }`}
              title={`${userNickname} (${userSchool}) 프로필 메뉴`}
            >
              {/* Avatar Circle with Tier Border */}
              <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${tierStyle.border} p-[1.5px] shadow-sm shrink-0`}>
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                  <User className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-110 transition-transform" />
                </div>
              </div>

              {/* Nickname & Tier Text */}
              <div className="text-left hidden sm:flex flex-col">
                <span className={`text-xs font-black leading-tight max-w-[85px] truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                  {userNickname}
                </span>
                <span className={`text-[9px] font-bold leading-tight ${tierStyle.badge}`}>
                  {userTier}
                </span>
              </div>

              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${showProfileMenu ? "rotate-180 text-cyan-400" : ""}`} />
            </button>

            {/* Profile Popover Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3.5 text-left animate-in fade-in zoom-in-95 duration-150">
                {/* Profile Card Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${tierStyle.border} p-[2px] shadow-md shrink-0`}>
                    <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                      <User className="w-5 h-5 text-cyan-300" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-white truncate">{userNickname}</h4>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[11px] text-slate-400 truncate">{userSchool}</span>
                      {isSchoolVerified ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          인증
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          미인증
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tier & LP Progress Bar */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                      <span>{userTier}</span>
                    </span>
                    <span className="text-cyan-400 font-black">{userLp} LP</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(8, userLp))}%` }}
                    />
                  </div>
                </div>

                {/* Action Links */}
                <div className="space-y-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push("/analytics");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-left"
                  >
                    <BarChart2 className="w-4 h-4 text-purple-400" />
                    <span>나의 역량 분석 보기</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push("/");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left border-t border-slate-800/80 pt-2 mt-1"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>로그아웃</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
