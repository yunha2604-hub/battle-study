"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Building2, Calculator, Home, LogOut } from "lucide-react";
import { EduLogo } from "./BrandLogo";

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
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 px-4 md:px-8 py-3.5 shadow-sm transition-colors font-sans text-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & School Info */}
        <div 
          onClick={() => router.push("/public-edu")}
          className="flex items-center gap-3 shrink-0 cursor-pointer group"
          title="배틀스터디 에듀 홈으로 이동"
        >
          <EduLogo size="sm" showText={false} theme="light" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                공교육 모드
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">{schoolName} 3학년 수학과</span>
            </div>
            <h1 className="text-sm md:text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors">
              배틀스터디 에듀
            </h1>
          </div>
        </div>

        {/* Central Direct Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
          
          {/* Tab 1: 학생 학사 포털 */}
          <button
            type="button"
            onClick={() => router.push("/public-edu")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "STUDENT"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>학생 학사 포털</span>
          </button>

          {/* Tab 2: 교사 통합 관리 대시보드 */}
          <button
            type="button"
            onClick={() => router.push("/teacher")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "TEACHER"
                ? "bg-white text-purple-700 shadow-sm border border-slate-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>교사 평가 관리</span>
          </button>

        </div>

        {/* Right Action Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* 배틀스터디 아레나 (게임) 복귀 버튼 */}
          <button
            type="button"
            onClick={() => router.push("/lobby")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="게임 모드(배틀스터디 아레나)로 전환"
          >
            <Home className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">아레나 게임으로 이동</span>
          </button>

          {/* 로그아웃 (홈 복귀) */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
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
