"use client";

import React from "react";
import { Swords, BookOpen, Flame, Zap, GraduationCap, Award, Building2 } from "lucide-react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  theme?: "dark" | "light";
  className?: string;
  onClick?: () => void;
}

/**
 * ⚔️ 배틀스터디 아레나 전용 로고 (Battle Study Arena)
 * - 상징: 교차된 배틀 쌍검(Swords) + 지혜의 마법서(BookOpen) + 타오르는 승부욕 오라(Flame / Zap)
 * - 스타일: 이스포츠 게이밍 다크 테마 & 네온 시안/인디고 그라데이션
 */
export function ArenaLogo({
  size = "md",
  showText = true,
  theme = "dark",
  className = "",
  onClick,
}: BrandLogoProps) {
  const isLight = theme === "light";

  const sizeConfigs = {
    sm: {
      container: "w-8 h-8 rounded-lg",
      swordIcon: "w-4 h-4",
      bookIcon: "w-3 h-3",
      flameIcon: "w-2.5 h-2.5",
      title: "text-sm",
      subtitle: "text-[8px]",
    },
    md: {
      container: "w-11 h-11 rounded-xl",
      swordIcon: "w-5 h-5",
      bookIcon: "w-3.5 h-3.5",
      flameIcon: "w-3 h-3",
      title: "text-base md:text-lg",
      subtitle: "text-[9px] md:text-[10px]",
    },
    lg: {
      container: "w-16 h-16 rounded-2xl",
      swordIcon: "w-8 h-8",
      bookIcon: "w-5 h-5",
      flameIcon: "w-4 h-4",
      title: "text-2xl md:text-3xl",
      subtitle: "text-xs tracking-widest",
    },
  };

  const config = sizeConfigs[size];

  return (
    <div
      onClick={onClick}
      title={onClick ? "홈으로 이동" : undefined}
      className={`inline-flex items-center gap-3 select-none ${onClick ? "cursor-pointer group" : ""} ${className}`}
    >
      {/* ⚔️ 아레나 심볼 마크 (다층 레이어 엠블럼) */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* 네온 백라이트 오라 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 rounded-2xl blur-md opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />

        {/* 엠블럼 본체 */}
        <div
          className={`relative ${config.container} bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-cyan-400/40 shadow-xl shadow-cyan-950/50 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105`}
        >
          {/* 내부 래디얼 글래스 하이라이트 */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-500/10 to-indigo-400/20 pointer-events-none" />

          {/* 뒤쪽: 펼쳐진 지혜의 서(BookOpen) */}
          <div className="absolute -bottom-1 text-cyan-400/40">
            <BookOpen className={config.bookIcon} />
          </div>

          {/* 좌상단: 승부욕의 불꽃 (Flame) */}
          <div className="absolute top-1 left-1 text-amber-400 animate-pulse">
            <Flame className={config.flameIcon} />
          </div>

          {/* 우하단: 전격 번개 (Zap) */}
          <div className="absolute bottom-1 right-1 text-cyan-300">
            <Zap className={config.flameIcon} />
          </div>

          {/* 중앙: 빛나는 교차 배틀 쌍검 (Swords) */}
          <div className="relative z-10 text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
            <Swords className={config.swordIcon} />
          </div>
        </div>
      </div>

      {/* 텍스트 로고 */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <h1
              className={`font-black tracking-tight font-sans bg-clip-text text-transparent ${
                isLight
                  ? "bg-gradient-to-r from-slate-900 via-indigo-900 to-cyan-900"
                  : "bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300"
              } ${config.title}`}
            >
              배틀스터디 아레나
            </h1>
            {size !== "sm" && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm">
                ARENA
              </span>
            )}
          </div>
          <p
            className={`font-bold uppercase tracking-wider ${
              isLight ? "text-indigo-600" : "text-cyan-400"
            } ${config.subtitle}`}
          >
            BATTLE STUDY ARENA • 1:1 QUIZ LEAGUE
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * 🎓 배틀스터디 에듀 전용 로고 (Battle Study Edu)
 * - 상징: 학사모(GraduationCap) + 정갈한 교과서(BookOpen) + 배움의 성장 스파클(Sparkles / Building2)
 * - 스타일: 공교육 스마트 클래스 & 신뢰의 사파이어 블루/로열 에메랄드 테마
 */
export function EduLogo({
  size = "md",
  showText = true,
  theme = "dark",
  className = "",
  onClick,
}: BrandLogoProps) {
  const isLight = theme === "light";

  const sizeConfigs = {
    sm: {
      container: "w-8 h-8 rounded-lg",
      capIcon: "w-4 h-4",
      bookIcon: "w-3 h-3",
      sparkleIcon: "w-2.5 h-2.5",
      title: "text-sm",
      subtitle: "text-[8px]",
    },
    md: {
      container: "w-11 h-11 rounded-xl",
      capIcon: "w-5 h-5",
      bookIcon: "w-3.5 h-3.5",
      sparkleIcon: "w-3 h-3",
      title: "text-base md:text-lg",
      subtitle: "text-[9px] md:text-[10px]",
    },
    lg: {
      container: "w-16 h-16 rounded-2xl",
      capIcon: "w-8 h-8",
      bookIcon: "w-5 h-5",
      sparkleIcon: "w-4 h-4",
      title: "text-2xl md:text-3xl",
      subtitle: "text-xs tracking-widest",
    },
  };

  const config = sizeConfigs[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? "cursor-pointer group" : ""} ${className}`}
    >
      {/* 🎓 에듀 심볼 마크 (공교육 신뢰도 엠블럼) */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* 차분하고 지적인 사파이어 블루 백라이트 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 rounded-2xl blur-md opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300" />

        {/* 엠블럼 본체 */}
        <div
          className={`relative ${config.container} bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 border border-blue-400/40 shadow-xl shadow-blue-950/50 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105`}
        >
          {/* 지적이고 단정한 은은한 하이라이트 */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-500/10 to-indigo-300/15 pointer-events-none" />

          {/* 하단: 정갈하게 펼쳐진 교과서 (BookOpen) */}
          <div className="absolute -bottom-0.5 text-blue-300/50">
            <BookOpen className={config.bookIcon} />
          </div>

          {/* 우상단: 학업 성취 어워드 (Award) */}
          <div className="absolute top-1 right-1 text-emerald-400">
            <Award className={config.sparkleIcon} />
          </div>

          {/* 좌하단: 학교/학사 상징 (Building2 미니멀) */}
          <div className="absolute bottom-1 left-1 text-blue-400/40">
            <Building2 className={config.sparkleIcon} />
          </div>

          {/* 중앙: 학문과 성취의 상징 학사모 (GraduationCap) */}
          <div className="relative z-10 text-white drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">
            <GraduationCap className={config.capIcon} />
          </div>
        </div>
      </div>

      {/* 텍스트 로고 */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <h1
              className={`font-black tracking-tight font-sans bg-clip-text text-transparent ${
                isLight
                  ? "bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900"
                  : "bg-gradient-to-r from-blue-300 via-indigo-200 to-emerald-300"
              } ${config.title}`}
            >
              배틀스터디 에듀
            </h1>
            {size !== "sm" && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm">
                PUBLIC EDU
              </span>
            )}
          </div>
          <p
            className={`font-bold uppercase tracking-wider ${
              isLight ? "text-blue-700" : "text-blue-400"
            } ${config.subtitle}`}
          >
            BATTLE STUDY EDU • 공교육 수학 수행평가
          </p>
        </div>
      )}
    </div>
  );
}

export default ArenaLogo;
