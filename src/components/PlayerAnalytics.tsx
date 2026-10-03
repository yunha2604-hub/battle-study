"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Award, Flame, ShieldAlert, BarChart2, Zap, Brain, BookOpen, 
  RotateCw, ChevronRight, Activity, TrendingUp, Calendar, School, Globe,
  CheckCircle2, Sparkles, Target, Compass
} from "lucide-react";

interface MatchRecord {
  id: number;
  result: "WIN" | "LOSS";
  opponentName: string;
  opponentSchool: string;
  opponentTier: string;
  subject: string;
  lpChange: number;
  date: string;
}

const RECENT_MATCHES: MatchRecord[] = [
  { id: 1, result: "WIN", opponentName: "대청불주먹", opponentSchool: "대청중학교", opponentTier: "Gold [1인분 장인]", subject: "영어", lpChange: 20, date: "방금 전" },
  { id: 2, result: "LOSS", opponentName: "대치동미적분", opponentSchool: "역삼중학교", opponentTier: "Silver [현지인]", subject: "수학", lpChange: -15, date: "1시간 전" },
  { id: 3, result: "WIN", opponentName: "문학소녀", opponentSchool: "휘문중학교", opponentTier: "Gold [1인분 장인]", subject: "국어", lpChange: 20, date: "3시간 전" },
  { id: 4, result: "WIN", opponentName: "영어천재", opponentSchool: "도곡중학교", opponentTier: "Bronze [오답 자판기]", subject: "영어", lpChange: 18, date: "어제" },
  { id: 5, result: "LOSS", opponentName: "수학귀신", opponentSchool: "신반포중학교", opponentTier: "Diamond [하드캐리 머신]", subject: "수학", lpChange: -12, date: "2일 전" }
];

// 6 Core Competencies (0 to 100) - Applicable across Korean, English, and Math
interface StatCategory {
  key: string;
  name: string;
  engName: string;
  description: string;
  angle: number; // 0, 60, 120, 180, 240, 300
  myScore: number;
  schoolAvg: number;
  nationalAvg: number;
  color: string;
}

const STAT_CATEGORIES: StatCategory[] = [
  {
    key: "concept",
    name: "개념 이해도",
    engName: "Concept",
    description: "국·영·수 핵심 개념, 공식, 성취기준 원리 이해력 (구 문법 대체)",
    angle: 0,
    myScore: 88,
    schoolAvg: 72,
    nationalAvg: 64,
    color: "#06b6d4" // cyan
  },
  {
    key: "problemSolving",
    name: "문제 해결력",
    engName: "Problem Solving",
    description: "심화 응용 문항 및 복합 추론 문제 해결력 (구 멘탈 대체)",
    angle: 60,
    myScore: 82,
    schoolAvg: 65,
    nationalAvg: 58,
    color: "#8b5cf6" // purple
  },
  {
    key: "speed",
    name: "풀이 속도",
    engName: "Speed",
    description: "타임어택 크리티컬 히트 및 신속 정답 도출력",
    angle: 120,
    myScore: 92,
    schoolAvg: 70,
    nationalAvg: 62,
    color: "#eab308" // yellow
  },
  {
    key: "accuracy",
    name: "정답 정확도",
    engName: "Accuracy",
    description: "오답 회피율 및 실수 방지 정밀성",
    angle: 180,
    myScore: 85,
    schoolAvg: 68,
    nationalAvg: 60,
    color: "#10b981" // emerald
  },
  {
    key: "combo",
    name: "연속 집중력",
    engName: "Combo",
    description: "연속 정답 콤보 유지 및 후반 몰입도",
    angle: 240,
    myScore: 78,
    schoolAvg: 62,
    nationalAvg: 55,
    color: "#f97316" // orange
  },
  {
    key: "recovery",
    name: "오답 극복력",
    engName: "Recovery",
    description: "오답 던전(Shadow Raid)을 통한 복습 극복률",
    angle: 300,
    myScore: 80,
    schoolAvg: 64,
    nationalAvg: 56,
    color: "#ec4899" // pink
  }
];

type CompareFilter = "ALL" | "SCHOOL" | "NATIONAL" | "MY_ONLY";

export default function PlayerAnalytics() {
  const winRate = 60; // 3 Wins out of 5
  const [filterMode, setFilterMode] = useState<CompareFilter>("ALL");
  const [selectedStatKey, setSelectedStatKey] = useState<string>("concept");

  // Overall average scores
  const myOverall = (STAT_CATEGORIES.reduce((acc, c) => acc + c.myScore, 0) / 6).toFixed(1);
  const schoolOverall = (STAT_CATEGORIES.reduce((acc, c) => acc + c.schoolAvg, 0) / 6).toFixed(1);
  const nationalOverall = (STAT_CATEGORIES.reduce((acc, c) => acc + c.nationalAvg, 0) / 6).toFixed(1);

  // SVG Coordinates for Regular Hexagon (Center 100, 100; Radius 78)
  const getCoordinates = (value: number, angleDegrees: number) => {
    // 0° points up (12 o'clock), 60° (2 o'clock), 120° (4 o'clock), 180° (6 o'clock), 240° (8 o'clock), 300° (10 o'clock)
    const angleRadians = (angleDegrees - 90) * (Math.PI / 180);
    const radius = (Math.max(10, Math.min(value, 100)) / 100) * 76;
    const x = 100 + radius * Math.cos(angleRadians);
    const y = 100 + radius * Math.sin(angleRadians);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };

  // Generate polygon points string
  const myPoints = STAT_CATEGORIES.map(c => getCoordinates(c.myScore, c.angle)).join(" ");
  const schoolPoints = STAT_CATEGORIES.map(c => getCoordinates(c.schoolAvg, c.angle)).join(" ");
  const nationalPoints = STAT_CATEGORIES.map(c => getCoordinates(c.nationalAvg, c.angle)).join(" ");

  // Background grid hexagons (100%, 75%, 50%, 25%)
  const grid100 = STAT_CATEGORIES.map(c => getCoordinates(100, c.angle)).join(" ");
  const grid75 = STAT_CATEGORIES.map(c => getCoordinates(75, c.angle)).join(" ");
  const grid50 = STAT_CATEGORIES.map(c => getCoordinates(50, c.angle)).join(" ");
  const grid25 = STAT_CATEGORIES.map(c => getCoordinates(25, c.angle)).join(" ");

  const selectedCategory = STAT_CATEGORIES.find(c => c.key === selectedStatKey) || STAT_CATEGORIES[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8 text-slate-100 font-sans relative z-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2.5">
            <BarChart2 className="w-7 h-7 text-cyan-400" />
            <span>나의 역량 분석</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              6대 핵심 지표
            </span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            내 플레이 역량 6대 지표를 학교 및 전국 평균과 실시간 비교 분석한 정밀 리포트입니다.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800/80 px-4 py-2 rounded-2xl text-xs font-semibold text-slate-400">
          <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>실시간 전국 랭킹 데이터 동기화됨</span>
        </div>
      </div>

      {/* Top Highlight Banner: School & National Percentiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* School Percentile Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-purple-950/40 border border-purple-500/30 rounded-3xl p-5 shadow-lg backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shadow-inner">
                <School className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <span className="text-[11px] font-black text-purple-400 tracking-wider uppercase flex items-center gap-1">
                  교내 종합 랭킹
                </span>
                <h4 className="text-lg font-black text-slate-100 flex items-center gap-1.5 mt-0.5">
                  청계중학교 3학년
                  <span className="text-xs font-bold text-slate-400 font-normal">(수학·국어·영어 통합)</span>
                </h4>
              </div>
            </div>

            {/* School Percentile Badge */}
            <div className="text-right">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 font-black text-xs">
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span>교내 최상위 1등급</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-end justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">청계중 재학생 기준 상위</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-white font-mono">
                  상위 4.2%
                </span>
                <span className="text-xs text-purple-400 font-bold font-mono">(전교 12위권 수준)</span>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">
              학교 LP 기여: <span className="font-bold text-purple-300">4,280 LP</span>
            </div>
          </div>
        </div>

        {/* National Percentile Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/40 border border-cyan-500/30 rounded-3xl p-5 shadow-lg backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-inner">
                <Globe className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <span className="text-[11px] font-black text-cyan-400 tracking-wider uppercase flex items-center gap-1">
                  전국 통합 랭킹
                </span>
                <h4 className="text-lg font-black text-slate-100 flex items-center gap-1.5 mt-0.5">
                  대한민국 중학생 전체
                  <span className="text-xs font-bold text-slate-400 font-normal">(전국 3,200개교)</span>
                </h4>
              </div>
            </div>

            {/* National Percentile Badge */}
            <div className="text-right">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-black text-xs">
                <Trophy className="w-3 h-3 text-cyan-300" />
                <span>전국 1등급 권역</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-end justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">전국 중학교 전체 기준 상위</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-white font-mono">
                  상위 7.5%
                </span>
                <span className="text-xs text-cyan-400 font-bold font-mono">(다이아몬드 승격 도전권)</span>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">
              전국 예상 순위: <span className="font-bold text-cyan-300">상위 500위 내</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Left (Radar & Stats), Right (Matches & AI Advice) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: 6-Axis Hexagon & Relative Comparisons (7 cols for rich display) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Radar Chart Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 flex flex-col">
            
            {/* Header & Filter Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-black text-slate-200 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  <span>능력치 헥사곤 상대 비교 차트</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                    정육각 6대 지표
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  내 역량과 청계중학교 및 전국 평균을 직접 중첩 비교합니다.
                </p>
              </div>

              {/* Comparison Filter Chips */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setFilterMode("ALL")}
                  className={`px-2.5 py-1.5 rounded-xl transition-all ${
                    filterMode === "ALL" 
                      ? "bg-cyan-500 text-slate-950 shadow-md font-black" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  전체 비교
                </button>
                <button
                  onClick={() => setFilterMode("SCHOOL")}
                  className={`px-2.5 py-1.5 rounded-xl transition-all ${
                    filterMode === "SCHOOL" 
                      ? "bg-purple-600 text-white shadow-md font-black" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  학교 평균
                </button>
                <button
                  onClick={() => setFilterMode("NATIONAL")}
                  className={`px-2.5 py-1.5 rounded-xl transition-all ${
                    filterMode === "NATIONAL" 
                      ? "bg-slate-700 text-white shadow-md font-black" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  전국 평균
                </button>
                <button
                  onClick={() => setFilterMode("MY_ONLY")}
                  className={`px-2.5 py-1.5 rounded-xl transition-all ${
                    filterMode === "MY_ONLY" 
                      ? "bg-cyan-600 text-white shadow-md font-black" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  내 역량만
                </button>
              </div>
            </div>

            {/* Interactive Legend Bar */}
            <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold py-2.5 px-4 mb-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] border border-cyan-200" />
                <span className="text-slate-200 font-bold">내 역량 (슈크림먹은빵):</span>
                <span className="text-cyan-400 font-mono font-black">{myOverall}점</span>
              </div>

              {(filterMode === "ALL" || filterMode === "SCHOOL") && (
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1.5 rounded bg-purple-500 border border-purple-400" />
                  <span className="text-slate-300">청계중 평균:</span>
                  <span className="text-purple-400 font-mono font-black">{schoolOverall}점</span>
                </div>
              )}

              {(filterMode === "ALL" || filterMode === "NATIONAL") && (
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1.5 rounded bg-slate-400 border border-slate-400" />
                  <span className="text-slate-400">전국 평균:</span>
                  <span className="text-slate-300 font-mono font-black">{nationalOverall}점</span>
                </div>
              )}
            </div>
            
            {/* SVG 6-Axis Hexagon Radar Chart */}
            <div className="relative w-full max-w-sm mx-auto aspect-square flex items-center justify-center my-3">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 200">
                <defs>
                  {/* Cyan Glow Filter */}
                  <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="myScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
                  </linearGradient>
                  <linearGradient id="schoolGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.08" />
                  </linearGradient>
                </defs>

                {/* Concentric Hexagon Grid Lines */}
                <polygon points={grid100} fill="none" stroke="#334155" strokeWidth="1.2" />
                <polygon points={grid75} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                <polygon points={grid50} fill="none" stroke="#334155" strokeWidth="1" />
                <polygon points={grid25} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />

                {/* 6 Axis lines from Center to Outer Vertex */}
                {STAT_CATEGORIES.map(c => {
                  const pt = getCoordinates(100, c.angle);
                  const [x, y] = pt.split(",");
                  return (
                    <line 
                      key={c.key} 
                      x1="100" 
                      y1="100" 
                      x2={x} 
                      y2={y} 
                      stroke="#334155" 
                      strokeWidth="1" 
                      strokeDasharray="2,2" 
                    />
                  );
                })}

                {/* Layer 1: National Average (Grey / Slate Dotted) */}
                {(filterMode === "ALL" || filterMode === "NATIONAL") && (
                  <g className="transition-all duration-500">
                    <polygon 
                      points={nationalPoints} 
                      fill="rgba(148, 163, 184, 0.08)" 
                      stroke="#94a3b8" 
                      strokeWidth="1.8" 
                      strokeDasharray="4,4"
                    />
                    {nationalPoints.split(" ").map((pt, i) => {
                      const [x, y] = pt.split(",");
                      return <circle key={`nat-${i}`} cx={x} cy={y} r="2.5" fill="#94a3b8" />;
                    })}
                  </g>
                )}

                {/* Layer 2: School Average (Purple Dashed) */}
                {(filterMode === "ALL" || filterMode === "SCHOOL") && (
                  <g className="transition-all duration-500">
                    <polygon 
                      points={schoolPoints} 
                      fill="url(#schoolGradient)" 
                      stroke="#a855f7" 
                      strokeWidth="2" 
                      strokeDasharray="5,3"
                    />
                    {schoolPoints.split(" ").map((pt, i) => {
                      const [x, y] = pt.split(",");
                      return <circle key={`sch-${i}`} cx={x} cy={y} r="3" fill="#c084fc" stroke="#581c87" strokeWidth="1" />;
                    })}
                  </g>
                )}

                {/* Layer 3: My Player Stats (Cyan Solid with Glow) */}
                <g className="transition-all duration-500">
                  <polygon 
                    points={myPoints} 
                    fill="url(#myScoreGradient)" 
                    stroke="#06b6d4" 
                    strokeWidth="2.8" 
                    filter="url(#cyanGlow)"
                  />
                  {myPoints.split(" ").map((pt, i) => {
                    const [x, y] = pt.split(",");
                    return (
                      <circle 
                        key={`my-${i}`} 
                        cx={x} 
                        cy={y} 
                        r="4.2" 
                        fill="#22d3ee" 
                        stroke="#ffffff" 
                        strokeWidth="1.5" 
                      />
                    );
                  })}
                </g>

                {/* Center point */}
                <circle cx="100" cy="100" r="2" fill="#64748b" />
              </svg>

              {/* Labels placed around the hexagon at 60° increments */}
              {/* 12 o'clock (0°): Concept */}
              <div 
                onClick={() => setSelectedStatKey("concept")}
                className="absolute top-[-10px] left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group"
              >
                <span className="text-[11px] font-black text-cyan-300 group-hover:text-cyan-200 transition-colors bg-slate-950/80 px-2 py-0.5 rounded-md border border-cyan-500/30">
                  개념 이해도 (88)
                </span>
                <span className="text-[9px] text-slate-400 group-hover:text-slate-300 font-medium">Concept</span>
              </div>

              {/* 2 o'clock (60°): Problem Solving */}
              <div 
                onClick={() => setSelectedStatKey("problemSolving")}
                className="absolute top-[22%] right-[-15px] translate-x-2 flex flex-col items-start cursor-pointer group"
              >
                <span className="text-[11px] font-black text-purple-300 group-hover:text-purple-200 transition-colors bg-slate-950/80 px-2 py-0.5 rounded-md border border-purple-500/30">
                  문제 해결력 (82)
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Problem Solving</span>
              </div>

              {/* 4 o'clock (120°): Speed */}
              <div 
                onClick={() => setSelectedStatKey("speed")}
                className="absolute bottom-[22%] right-[-15px] translate-x-2 flex flex-col items-start cursor-pointer group"
              >
                <span className="text-[11px] font-black text-yellow-300 group-hover:text-yellow-200 transition-colors bg-slate-950/80 px-2 py-0.5 rounded-md border border-yellow-500/30">
                  풀이 속도 (92)
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Speed</span>
              </div>

              {/* 6 o'clock (180°): Accuracy */}
              <div 
                onClick={() => setSelectedStatKey("accuracy")}
                className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group"
              >
                <span className="text-[11px] font-black text-emerald-300 group-hover:text-emerald-200 transition-colors bg-slate-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  정답 정확도 (85)
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Accuracy</span>
              </div>

              {/* 8 o'clock (240°): Combo */}
              <div 
                onClick={() => setSelectedStatKey("combo")}
                className="absolute bottom-[22%] left-[-15px] -translate-x-2 flex flex-col items-end cursor-pointer group"
              >
                <span className="text-[11px] font-black text-orange-300 group-hover:text-orange-200 transition-colors bg-slate-950/80 px-2 py-0.5 rounded-md border border-orange-500/30">
                  연속 집중력 (78)
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Combo</span>
              </div>

              {/* 10 o'clock (300°): Recovery */}
              <div 
                onClick={() => setSelectedStatKey("recovery")}
                className="absolute top-[22%] left-[-15px] -translate-x-2 flex flex-col items-end cursor-pointer group"
              >
                <span className="text-[11px] font-black text-pink-300 group-hover:text-pink-200 transition-colors bg-slate-950/80 px-2 py-0.5 rounded-md border border-pink-500/30">
                  오답 극복력 (80)
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Recovery</span>
              </div>
            </div>

            {/* Selected Metric Explanation Box */}
            <div className="mt-4 p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <span className="font-extrabold text-slate-200 mr-2">
                    {selectedCategory.name} ({selectedCategory.engName}):
                  </span>
                  <span className="text-slate-400 font-normal">
                    {selectedCategory.description}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 font-mono font-black text-cyan-400 ml-2">
                {selectedCategory.myScore}점
              </div>
            </div>

            {/* Detailed 6-Axis Comparison Progress Bars */}
            <div className="w-full space-y-3 mt-6 pt-4 border-t border-slate-850">
              <div className="flex justify-between text-xs font-bold text-slate-400 pb-1">
                <span>지표 항목 (클릭 시 상세)</span>
                <span className="font-mono">내 역량 vs 학교(+격차) vs 전국(+격차)</span>
              </div>

              {STAT_CATEGORIES.map((stat) => {
                const schoolDiff = stat.myScore - stat.schoolAvg;
                const natDiff = stat.myScore - stat.nationalAvg;
                const isSelected = stat.key === selectedStatKey;

                return (
                  <div 
                    key={stat.key}
                    onClick={() => setSelectedStatKey(stat.key)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-slate-800/80 border-cyan-500/50 shadow-md" 
                        : "bg-slate-950/40 border-slate-850 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{stat.name}</span>
                        <span className="text-[10px] text-slate-500 font-sans">({stat.engName})</span>
                      </div>
                      
                      <div className="flex items-center gap-2.5 font-mono text-xs">
                        <span className="font-black text-cyan-400">{stat.myScore}점</span>
                        <span className="text-purple-400 text-[11px]">
                          학교 {stat.schoolAvg} <span className="font-bold text-purple-300">({schoolDiff > 0 ? `+${schoolDiff}` : schoolDiff})</span>
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          전국 {stat.nationalAvg} <span className="font-bold text-slate-300">({natDiff > 0 ? `+${natDiff}` : natDiff})</span>
                        </span>
                      </div>
                    </div>

                    {/* Comparative Multi-Layer Bar */}
                    <div className="relative w-full h-2 bg-slate-850 rounded-full overflow-hidden">
                      {/* National Avg Marker */}
                      <div 
                        className="absolute top-0 bottom-0 bg-slate-600 rounded-full z-10" 
                        style={{ width: `${stat.nationalAvg}%` }}
                      />
                      {/* School Avg Marker */}
                      <div 
                        className="absolute top-0 bottom-0 bg-purple-500/80 rounded-full z-20" 
                        style={{ width: `${stat.schoolAvg}%` }}
                      />
                      {/* My Score Bar */}
                      <div 
                        className="absolute top-0 bottom-0 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full z-30" 
                        style={{ width: `${stat.myScore}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
          
        </section>

        {/* Right: Circular Win Rate, Recent Matches & AI Feedback (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Win Rate & Overview Panel */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 flex flex-col gap-6">
            
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>승률 및 실전 배틀 요약</span>
              </h4>
              <span className="text-xs font-bold text-slate-500">최근 5경기 기준</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Circle Win Rate */}
              <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="url(#winRateGradient)" 
                    strokeWidth="8" 
                    strokeDasharray={251.2} 
                    strokeDashoffset={251.2 - (251.2 * winRate) / 100}
                    strokeLinecap="round" 
                  />
                  <defs>
                    <linearGradient id="winRateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-white font-mono">{winRate}%</span>
                  <span className="block text-[9px] font-bold text-slate-500">승률 (3승 2패)</span>
                </div>
              </div>

              {/* Quick Summary Cards */}
              <div className="flex-1 w-full flex flex-col gap-2.5">
                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-semibold">평균 정답률</span>
                  <span className="text-base font-black text-cyan-400 font-mono">73.3%</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-semibold">평균 풀이 속도</span>
                  <span className="text-base font-black text-yellow-400 font-mono">3.4초</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-semibold">타임어택 크리티컬</span>
                  <span className="text-base font-black text-pink-400 font-mono">42%</span>
                </div>
              </div>
            </div>

          </div>

          {/* AI Advisor Card: Updated for 6 Competencies */}
          <div className="bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 p-5 rounded-3xl relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2.5 mb-2.5 relative z-10">
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-400 fill-purple-400/20" />
              </div>
              <span className="text-xs font-black text-purple-300 tracking-wider uppercase">
                스쿨배틀 AI 분석 코치 지능형 피드백
              </span>
            </div>

            <div className="space-y-2 relative z-10 text-xs md:text-sm text-slate-300 leading-relaxed break-keep">
              <p>
                💡 <strong>우수 강점</strong>: 청계중학교 3학년 평균 대비 <strong>개념 이해도(+16)</strong>와 <strong>풀이 속도(+22)</strong>가 압도적이며, 전국 상위 <strong>7.5%</strong>에 성공적으로 안착했습니다!
              </p>
              <p className="text-purple-200/90 text-xs pt-1 border-t border-purple-500/20">
                ⚠️ <strong>취약 보완점</strong>: 4연속 정답 이후 <strong>연속 집중력(Combo, 78점)</strong>이 일시적으로 저하되는 패턴이 관찰됩니다. 오답 던전(Shadow Raid)에서 고난도 몬스터를 격파하여 집중력을 보강하면 <strong>전국 상위 3% 다이아몬드 승급</strong>이 유력합니다.
              </p>
            </div>
          </div>

          {/* Recent Match History */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-cyan-400" />
              최근 5경기 매치 기록 (OP.GG)
            </h3>

            <div className="space-y-3">
              {RECENT_MATCHES.map((match) => (
                <div 
                  key={match.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    match.result === "WIN"
                      ? "bg-cyan-950/20 border-cyan-500/25 hover:border-cyan-500/40"
                      : "bg-purple-950/20 border-purple-500/25 hover:border-purple-500/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Result Badge */}
                    <div className={`px-2.5 py-1.5 rounded-xl text-xs font-black text-center w-12 shadow ${
                      match.result === "WIN" 
                        ? "bg-cyan-500 text-slate-950" 
                        : "bg-purple-500 text-white"
                    }`}>
                      {match.result === "WIN" ? "승리" : "패배"}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-bold">VS</span>
                        <span className="font-extrabold text-sm text-slate-200">{match.opponentName}</span>
                        <span className="text-[10px] text-slate-400">({match.opponentSchool})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-black/40 text-slate-400 rounded">
                          {match.opponentTier}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{match.subject} 배틀</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono flex flex-col gap-1 items-end">
                    <span className={`text-sm font-black flex items-center gap-0.5 ${
                      match.result === "WIN" ? "text-cyan-400" : "text-purple-400"
                    }`}>
                      {match.result === "WIN" ? `+${match.lpChange} LP` : `${match.lpChange} LP`}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold font-sans flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {match.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

      </div>

    </div>
  );
}
