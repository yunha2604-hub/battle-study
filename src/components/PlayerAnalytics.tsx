"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Trophy, Award, Flame, ShieldAlert, BarChart2, Zap, Brain, BookOpen, 
  RotateCw, ChevronRight, Activity, TrendingUp, Calendar
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

// Stats values (0 to 100)
const STATS = {
  vocab: 85,
  grammar: 45,
  speed: 92,
  combo: 78,
  mental: 60
};

export default function PlayerAnalytics() {
  const winRate = 60; // 3 Wins out of 5

  // Radar chart calculations (Center is 100, 100; Radius is 80)
  // Vertex angles: Vocab(0°), Grammar(72°), Speed(144°), Combo(216°), Mental(288°)
  // For SVG coordinates: x = cx + r * cos(angle), y = cy - r * sin(angle)
  // Converting degrees to radians: rad = deg * (Math.PI / 180)
  const getCoordinates = (value: number, angleDegrees: number) => {
    const angleRadians = (angleDegrees - 90) * (Math.PI / 180); // shift by 90 to put the first vertex at the top
    const radius = (value / 100) * 80;
    const x = 100 + radius * Math.cos(angleRadians);
    const y = 100 + radius * Math.sin(angleRadians);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };

  const polyPoints = [
    getCoordinates(STATS.vocab, 0),
    getCoordinates(STATS.grammar, 72),
    getCoordinates(STATS.speed, 144),
    getCoordinates(STATS.combo, 216),
    getCoordinates(STATS.mental, 288)
  ].join(" ");

  const gridPoints100 = [
    getCoordinates(100, 0), getCoordinates(100, 72), getCoordinates(100, 144), getCoordinates(100, 216), getCoordinates(100, 288)
  ].join(" ");

  const gridPoints75 = [
    getCoordinates(75, 0), getCoordinates(75, 72), getCoordinates(75, 144), getCoordinates(75, 216), getCoordinates(75, 288)
  ].join(" ");

  const gridPoints50 = [
    getCoordinates(50, 0), getCoordinates(50, 72), getCoordinates(50, 144), getCoordinates(50, 216), getCoordinates(50, 288)
  ].join(" ");

  const gridPoints25 = [
    getCoordinates(25, 0), getCoordinates(25, 72), getCoordinates(25, 144), getCoordinates(25, 216), getCoordinates(25, 288)
  ].join(" ");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8 text-slate-100 font-sans relative z-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
            <BarChart2 className="w-7 h-7 text-cyan-400" />
            플레이어 전적 분석 (OP.GG Style)
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            내 플레이 스타일을 분석한 실시간 퀴즈 리포트 및 매치 히스토리입니다.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800/80 px-4 py-2 rounded-2xl text-xs font-semibold text-slate-400">
          <RotateCw className="w-3.5 h-3.5" />
          <span>최신 데이터 업데이트 완료</span>
        </div>
      </div>

      {/* Grid Layout: Left (Stats & Radar), Right (Matches & AI Advice) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Stats & Radar Chart (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Radar Chart Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest self-start mb-6 flex items-center gap-2">
              <Brain className="w-4.5 h-4.5 text-cyan-400" />
              능력치 헥사곤 (Radar Chart)
            </h3>
            
            {/* SVG Radar Chart */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-4">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                {/* Background Grid Lines */}
                <polygon points={gridPoints100} fill="none" stroke="#1e293b" strokeWidth="1" />
                <polygon points={gridPoints75} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />
                <polygon points={gridPoints50} fill="none" stroke="#1e293b" strokeWidth="1" />
                <polygon points={gridPoints25} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />

                {/* Straight axis lines */}
                <line x1="100" y1="100" x2="100" y2="20" stroke="#1e293b" strokeWidth="1" />
                <line x1="100" y1="100" x2="176" y2="76" stroke="#1e293b" strokeWidth="1" />
                <line x1="100" y1="100" x2="147" y2="165" stroke="#1e293b" strokeWidth="1" />
                <line x1="100" y1="100" x2="53" y2="165" stroke="#1e293b" strokeWidth="1" />
                <line x1="100" y1="100" x2="24" y2="76" stroke="#1e293b" strokeWidth="1" />

                {/* User Stats Shape */}
                <polygon 
                  points={polyPoints} 
                  fill="rgba(6, 182, 212, 0.2)" 
                  stroke="#06b6d4" 
                  strokeWidth="2.5" 
                  className="drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                />
                
                {/* Dots at vertices */}
                {polyPoints.split(" ").map((pt, i) => {
                  const [x, y] = pt.split(",");
                  return <circle key={i} cx={x} cy={y} r="3.5" fill="#22d3ee" stroke="#ffffff" strokeWidth="1" />;
                })}
              </svg>

              {/* Labels overlay placed manually based on layout angles */}
              <span className="absolute top-0 text-[10px] font-black text-slate-300">어휘력 (Vocab)</span>
              <span className="absolute right-0 top-1/4 translate-x-2 text-[10px] font-black text-slate-300">문법 (Grammar)</span>
              <span className="absolute right-8 bottom-4 text-[10px] font-black text-slate-300">반응속도 (Speed)</span>
              <span className="absolute left-8 bottom-4 text-[10px] font-black text-slate-300">콤보 (Combo)</span>
              <span className="absolute left-0 top-1/4 -translate-x-2 text-[10px] font-black text-slate-300">멘탈 (Mental)</span>
            </div>

            {/* List breakdown of stats values */}
            <div className="w-full space-y-2.5 mt-4">
              <div className="flex justify-between items-center text-xs border-b border-slate-850 pb-2">
                <span className="text-slate-400 font-semibold">어휘력 (Vocab)</span>
                <span className="font-mono font-black text-cyan-400">{STATS.vocab} / 100</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-850 pb-2">
                <span className="text-slate-400 font-semibold">문법 (Grammar)</span>
                <span className="font-mono font-black text-purple-400">{STATS.grammar} / 100</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-850 pb-2">
                <span className="text-slate-400 font-semibold">반응속도 (Speed)</span>
                <span className="font-mono font-black text-cyan-400">{STATS.speed} / 100</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-850 pb-2">
                <span className="text-slate-400 font-semibold">콤보 (Combo)</span>
                <span className="font-mono font-black text-yellow-400">{STATS.combo} / 100</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">멘탈 (Mental/Time pressure)</span>
                <span className="font-mono font-black text-orange-400">{STATS.mental} / 100</span>
              </div>
            </div>
          </div>
          
        </section>

        {/* Right: Circular Win Rate, Recent Matches & AI Feedback (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Win Rate & Overview Panel */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Circle Win Rate (Column 5) */}
            <div className="md:col-span-5 flex flex-col items-center border-r-0 md:border-r border-slate-850/80 pr-0 md:pr-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                승률 분석 (Win Rate)
              </h4>
              <div className="relative w-28 h-28 flex items-center justify-center">
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
                  <span className="text-2xl font-black text-white">{winRate}%</span>
                  <span className="block text-[9px] font-bold text-slate-500">최근 5경기</span>
                </div>
              </div>
            </div>

            {/* Quick Summary Cards (Column 7) */}
            <div className="md:col-span-7 flex flex-col gap-3.5 pl-0 md:pl-2">
              <div>
                <span className="text-xs text-slate-500 font-semibold block">총 경기 전적</span>
                <p className="text-lg font-black text-slate-100 mt-1">
                  3승 2패 <span className="text-xs text-slate-400 font-normal ml-1">최근 전적 양호!</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">평균 정답률</span>
                  <span className="text-base font-black text-cyan-400 mt-0.5 block">73.3%</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">평균 풀이 속도</span>
                  <span className="text-base font-black text-yellow-500 mt-0.5 block">3.4초</span>
                </div>
              </div>
            </div>

          </div>

          {/* AI Advisor Card */}
          <div className="bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/20 p-5 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-2.5 mb-2.5 relative z-10">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
              </div>
              <span className="text-xs font-black text-purple-400 tracking-wider uppercase">
                스쿨배틀 AI 분석 코치 통계 피드백
              </span>
            </div>

            <p className="text-slate-300 font-medium text-xs md:text-sm leading-relaxed break-keep relative z-10">
              ⚠️ <strong>오답 경고!</strong> 현재 <strong>관계대명사(Relative Pronouns)</strong> 관련 문법 문제에서 승률이 <strong>20%</strong>에 불과합니다. 오답 노트를 오답 던전(Shadow Raid)에서 격파하여 취약 개념을 반드시 보강하세요!
            </p>
          </div>

          {/* Recent Match History */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-cyan-400" />
              최근 5경기 매치 기록 (OP.GG)
            </h3>

            <div className="space-y-3">
              {RECENT_MATCHES.map((match) => (
                <div 
                  key={match.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    match.result === "WIN"
                      ? "bg-cyan-950/10 border-cyan-500/20 hover:border-cyan-500/30"
                      : "bg-purple-950/10 border-purple-500/20 hover:border-purple-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Result Badge */}
                    <div className={`px-2.5 py-1.5 rounded-xl text-xs font-black text-center w-14 shadow ${
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
                        <span className="text-[10px] text-slate-500 font-semibold">{match.subject} 배틀</span>
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
