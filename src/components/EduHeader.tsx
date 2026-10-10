"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Building2, Calculator, Home, LogOut } from "lucide-react";

export type EduNavTabType = "STUDENT" | "EXAM" | "TEACHER";

export interface EduHeaderProps {
  activeTab?: EduNavTabType;
  schoolName?: string;
}

export default function EduHeader({
  activeTab = "STUDENT",
  schoolName = "청계중학교"
}: EduHeaderProps) {
  const router = useRouter();

  return (
    <header className="border-b border-indigo-950/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-3 shadow-md transition-colors font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & School Info */}
        <div 
          onClick={() => router.push("/public-edu")}
          className="flex items-center gap-3 shrink-0 cursor-pointer group"
          title="배틀스터디 에듀 홈으로 이동"
        >
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                공교육 모드
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">{schoolName} 3학년 수학과</span>
            </div>
            <h1 className="text-sm md:text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
              배틀스터디 에듀
            </h1>
          </div>
        </div>

        {/* Central Direct Navigation Tabs (MVP Fast Switching) */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 border border-indigo-900/40 p-1.5 rounded-2xl shadow-inner">
          
          {/* Tab 1: 학생 학사 포털 */}
          <button
            type="button"
            onClick={() => router.push("/public-edu")}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "STUDENT"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40 scale-[1.02]"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>🏛️ 학생 포털</span>
          </button>


          {/* Tab 3: 교사 통합 관리 대시보드 */}
          <button
            type="button"
            onClick={() => router.push("/teacher")}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "TEACHER"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/40 scale-[1.02]"
                : "text-slate-400 hover:text-purple-400 hover:bg-slate-850"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>👩‍🏫 교사 통합 관리</span>
          </button>

        </div>

        {/* Right Action Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* 배틀스터디 아레나 (게임) 복귀 버튼 */}
          <button
            type="button"
            onClick={() => router.push("/lobby")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer group"
            title="게임 모드(배틀스터디 아레나)로 전환"
          >
            <Home className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">⚔️ 배틀스터디 아레나로 이동</span>
          </button>

          {/* 로그아웃 (홈 복귀) */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            title="로그아웃 및 랜딩 홈으로 이동"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">로그아웃</span>
          </button>

        </div>

      </div>
    </header>
  );
}
