"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Swords, Trophy, User, School, Zap, Award, Target, Flame, 
  ChevronRight, RefreshCw, BarChart2, ShieldAlert, Settings, Sparkles,
  AlertTriangle, LogIn
} from "lucide-react";
import PlayerAnalytics from "./PlayerAnalytics";
import ShadowRaid from "./ShadowRaid";
import BattleConfirmModal from "./BattleConfirmModal";
import GlobalHeader from "./GlobalHeader";

interface LobbyProps {
  initialTab?: "ARENA" | "ANALYTICS" | "SHADOW_RAID";
  nickname: string;
  school: string;
  tier: string;
  lp: number;
  energy: number;
  setTier: (tier: string) => void;
  setLp: (lp: number) => void;
  setEnergy: React.Dispatch<React.SetStateAction<number>>;
  onStartMatch: (opponent: OpponentData, subject: "국어" | "영어" | "수학") => void;
  onCreateRoom: () => void;
  onEnterPin: (pin: string) => void;
  onGoToTeacherDashboard?: () => void;
  onJoinEventRoom?: () => void;
  onOpenBattleConfirmModal?: (subject?: "국어" | "영어" | "수학") => void;
}

export interface OpponentData {
  nickname: string;
  school: string;
  tier: string;
  lp: number;
}

const TIER_DETAILS: Record<string, { label: string; color: string; bg: string; title: string; shadow: string }> = {
  Iron: { 
    label: "아이언", 
    color: "#a19d94", 
    bg: "from-stone-700 to-stone-900 border-stone-600",
    title: "[뇌정지]",
    shadow: "shadow-stone-500/10"
  },
  Bronze: { 
    label: "브론즈", 
    color: "#cd7f32", 
    bg: "from-amber-800 to-yellow-950 border-amber-800",
    title: "[오답 자판기]",
    shadow: "shadow-amber-900/10"
  },
  Silver: { 
    label: "실버", 
    color: "#c0c0c0", 
    bg: "from-slate-400 to-slate-700 border-slate-500",
    title: "[현지인]",
    shadow: "shadow-slate-400/10"
  },
  Gold: { 
    label: "골드", 
    color: "#ffd700", 
    bg: "from-yellow-500 via-amber-600 to-yellow-750 border-yellow-400",
    title: "[1인분 장인]",
    shadow: "shadow-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.2)]"
  },
  Diamond: { 
    label: "다이아몬드", 
    color: "#b9f2ff", 
    bg: "from-cyan-400 via-blue-600 to-indigo-950 border-cyan-300",
    title: "[하드캐리 머신]",
    shadow: "shadow-cyan-400/40 shadow-[0_0_25px_rgba(185,242,255,0.4)]"
  },
};

// 🏫 전국 중학교 랭킹 데이터 (청계중학교 1위 리그 챔피언)
const MIDDLE_SCHOOL_LEADERBOARD = [
  { rank: 1, name: "청계중학교", lp: 52400, count: 138 },
  { rank: 2, name: "대청중학교", lp: 48250, count: 124 },
  { rank: 3, name: "휘문중학교", lp: 41100, count: 112 },
  { rank: 4, name: "신반포중학교", lp: 37400, count: 85 },
  { rank: 5, name: "도곡중학교", lp: 32900, count: 77 },
  { rank: 6, name: "역삼중학교", lp: 28550, count: 64 },
];

// 🎓 전국 고등학교 랭킹 데이터 (한국디지털미디어고 포함)
const HIGH_SCHOOL_LEADERBOARD = [
  { rank: 1, name: "한국디지털미디어고등학교 (디미고)", lp: 58200, count: 168 },
  { rank: 2, name: "반송고등학교", lp: 54850, count: 142 },
  { rank: 3, name: "선린인터넷고등학교", lp: 49200, count: 115 },
  { rank: 4, name: "세마고등학교", lp: 45000, count: 95 },
  { rank: 5, name: "경기과학고등학교", lp: 41800, count: 88 },
];

export default function Lobby({ 
  initialTab = "ARENA",
  nickname, school, tier, lp, energy, setTier, setLp, setEnergy, onStartMatch,
  onCreateRoom, onEnterPin, onGoToTeacherDashboard, onJoinEventRoom, onOpenBattleConfirmModal
}: LobbyProps) {
  const router = useRouter();
  const [isMatching, setIsMatching] = useState(false);
  const [matchingStep, setMatchingStep] = useState(0);
  const [matchTimer, setMatchTimer] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<"국어" | "영어" | "수학" | null>(null);
  const [lobbyTab, setLobbyTab] = useState<"ARENA" | "ANALYTICS" | "SHADOW_RAID">(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (prevInitialTab !== initialTab) {
    setPrevInitialTab(initialTab);
    setLobbyTab(initialTab);
  }
  const [showBattleConfirm, setShowBattleConfirm] = useState(false);

  // 실시간 전국 학교 랭킹 카테고리 (중학교 / 고등학교)
  const isUserHighSchool = school ? school.includes("고등") : false;
  const [rankingType, setRankingType] = useState<"MIDDLE" | "HIGH">(isUserHighSchool ? "HIGH" : "MIDDLE");

  // Quick navigation handlers for 4 student mode cards
  const handleGoToBattle = () => {
    if (onOpenBattleConfirmModal) {
      onOpenBattleConfirmModal(selectedSubject || "수학");
    } else {
      setShowBattleConfirm(true);
    }
  };

  const handleGoToLobby = () => {
    setLobbyTab("ARENA");
    router.push("/lobby");
    setTimeout(() => {
      const el = document.getElementById("school-ranking-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
  };

  // Custom Room PIN modal states
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");

  // Event Banner states
  const [showEventModal, setShowEventModal] = useState(false);

  // Dynamic Opponent Generation based on User's school
  const getOpponent = (): OpponentData => {
    const rivalSchool = school === "청계중학교" ? "대청중학교" : "청계중학교";
    const rivalNicknames = ["목동수학귀신", "강남수능파이터", "학동암기마스터", "대치동일등급", "과외살인마"];
    const randomNick = rivalNicknames[Math.floor(Math.random() * rivalNicknames.length)];
    
    // Choose opponent tier (close to user's tier or Gold/Diamond)
    const opponentTiers = ["Silver", "Gold", "Diamond"];
    const rivalTier = opponentTiers[Math.floor(Math.random() * opponentTiers.length)];

    return {
      nickname: randomNick,
      school: rivalSchool,
      tier: rivalTier,
      lp: Math.floor(Math.random() * 80) + 10,
    };
  };

  const handleStartFindMatch = () => {
    if (selectedSubject && energy > 0) {
      setMatchTimer(0);
      setMatchingStep(0);
      setIsMatching(true);
    }
  };

  // Matchmaking simulation
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    let statusInterval: NodeJS.Timeout;

    if (isMatching) {
      // Increment seconds
      timerInterval = setInterval(() => {
        setMatchTimer((prev) => prev + 1);
      }, 1000);

      // Stage states
      // 0s -> 1s -> 2s -> 3s (Start)
      statusInterval = setInterval(() => {
        setMatchingStep((prev) => {
          if (prev >= 3) {
            clearInterval(statusInterval);
            clearInterval(timerInterval);
            // Trigger match search finished
            setTimeout(() => {
              setIsMatching(false);
              if (selectedSubject) {
                onStartMatch(getOpponent(), selectedSubject);
              }
            }, 1000);
            return 4;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(statusInterval);
    };
  }, [isMatching]);

  const currentTierData = TIER_DETAILS[tier] || TIER_DETAILS.Silver;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative font-sans overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Global Header */}
      <GlobalHeader 
        activeTab={
          lobbyTab === "ARENA" ? "LOBBY" :
          lobbyTab === "SHADOW_RAID" ? "SHADOW_RAID" : "ANALYTICS"
        }
        energy={energy}
        onGoToTeacher={onGoToTeacherDashboard}
      />


      {lobbyTab === "ARENA" && (
        <>
          {/* Event Banner */}
          <div className="max-w-7xl mx-auto px-4 mt-6 w-full">
            <motion.div
              whileHover={{ scale: 1.008 }}
              whileTap={{ scale: 0.992 }}
              onClick={() => setShowEventModal(true)}
              className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-3xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-center gap-4 border border-red-500/20 cursor-pointer shadow-lg shadow-purple-500/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <span className="text-xl shrink-0">🔥</span>
                <div>
                  <h4 className="text-sm md:text-base font-black text-white">
                    [주말 한정] 청계중 vs 휘문중 수학 1짱 데스매치!
                  </h4>
                  <p className="text-[11px] text-white/80 font-medium mt-0.5">
                    우승 학교 문화상품권 & 아이패드 증정! (스폰서: 에듀테크 스쿨존)
                  </p>
                </div>
              </div>
              
              <span className="px-4 py-2 bg-white text-purple-700 text-xs font-black rounded-xl hover:bg-slate-50 transition-colors shadow shrink-0">
                참가하기 (Join Match)
              </span>
            </motion.div>
          </div>

          {/* Main Body Layout */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Side: Profile Card & Quick Stats (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Profile & League Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className={`bg-gradient-to-b ${currentTierData.bg} backdrop-blur-xl border-2 rounded-3xl p-6 flex flex-col relative overflow-hidden shadow-2xl ${currentTierData.shadow}`}
          >
            {/* Glossy overlay */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />

            {/* Profile Info */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-400 overflow-hidden shadow-inner">
                  <User className="w-8 h-8 text-slate-300" />
                </div>
                {tier === "Gold" && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                  </span>
                )}
                {tier === "Diamond" && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-black/40 text-cyan-300 rounded-md border border-cyan-500/20">
                  {school}
                </span>
                <h3 className="text-xl font-extrabold tracking-tight mt-1 text-white">
                  {nickname}
                </h3>
              </div>
            </div>

            {/* Tier Presentation */}
            <div className="mt-8 mb-6 text-center relative z-10 flex flex-col items-center">
              {/* Emblem Mock */}
              <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
                <div 
                  className="w-16 h-16 rotate-45 border-4 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ 
                    borderColor: currentTierData.color,
                    background: `linear-gradient(135deg, ${currentTierData.color}22, #000000)`
                  }}
                >
                  <div className="-rotate-45 font-black text-2xl" style={{ color: currentTierData.color }}>
                    {tier[0]}
                  </div>
                </div>
                {/* Visual decorations for high tiers */}
                {(tier === "Gold" || tier === "Diamond") && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-dashed rounded-full pointer-events-none opacity-30"
                    style={{ borderColor: currentTierData.color }}
                  />
                )}
              </div>
              <h4 
                className="text-2xl font-black tracking-wider transition-all"
                style={{ 
                  color: currentTierData.color,
                  textShadow: (tier === "Gold" || tier === "Diamond") ? `0 0 10px ${currentTierData.color}88` : "none"
                }}
              >
                {currentTierData.label}
              </h4>
              <span className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full border border-white/5">
                {currentTierData.title}
              </span>
            </div>

            {/* LP Progress Bar */}
            <div className="space-y-2 mt-auto relative z-10">
              <div className="flex justify-between items-end text-xs">
                <span className="text-slate-300 font-bold">League Points</span>
                <span className="font-mono font-black" style={{ color: currentTierData.color }}>
                  {lp} <span className="text-slate-400 font-normal">/ 100 LP</span>
                </span>
              </div>
              <div className="h-2.5 w-full bg-black/40 rounded-full p-0.5 border border-white/5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${lp}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ 
                    background: `linear-gradient(90deg, ${currentTierData.color}, ${currentTierData.color}88)`,
                    boxShadow: (tier === "Gold" || tier === "Diamond") ? `0 0 8px ${currentTierData.color}` : "none"
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Panel */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              아레나 개인 전적
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950/80 p-3.5 border border-slate-900 rounded-2xl">
                <span className="text-xs text-slate-500 font-medium">승리</span>
                <p className="text-lg font-black text-cyan-400 mt-1">24승</p>
              </div>
              <div className="bg-slate-950/80 p-3.5 border border-slate-900 rounded-2xl">
                <span className="text-xs text-slate-500 font-medium">패배</span>
                <p className="text-lg font-black text-purple-400 mt-1">16패</p>
              </div>
              <div className="bg-slate-950/80 p-3.5 border border-slate-900 rounded-2xl">
                <span className="text-xs text-slate-500 font-medium">승률</span>
                <p className="text-lg font-black text-yellow-400 mt-1">60%</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-slate-950/40 rounded-2xl border border-slate-900/80 text-xs">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
              <span className="text-slate-300">
                현재 <strong className="text-orange-400">3연승</strong> 달리는 중! 다음 승리 시 보너스 LP
              </span>
            </div>
            {/* Analytics Entry Button */}
            <button
              onClick={() => {
                router.push("/analytics");
              }}
              className="w-full mt-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-cyan-400 transition-all group shadow-lg cursor-pointer"
            >
              <BarChart2 className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
              <span>나의 6대 학업 역량 상세 분석 보기</span>
              <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Daily Bounty UI Widget */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col relative overflow-hidden mt-6 shadow-xl">
            <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-950/10 rounded-full blur-xl pointer-events-none" />
            
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Trophy className="w-4.5 h-4.5 text-yellow-500 animate-pulse" />
              오늘의 현상금 수배 (Daily Bounty)
            </h4>
            
            <div className="space-y-3">
              {/* Quest 1 (Completed) */}
              <div className="p-3 bg-slate-950/80 border border-yellow-500/30 rounded-2xl relative shadow-[0_0_15px_rgba(234,179,8,0.08)]">
                <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 font-extrabold text-[8px] rounded uppercase border border-yellow-500/20 tracking-wider">
                  CLEAR
                </div>
                <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-wider block">
                  수학 • 삼각함수
                </span>
                <p className="text-xs font-bold text-slate-200 mt-1">
                  삼각함수 몬스터 3회 처치
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-semibold font-mono">
                  <span>진행도: 3 / 3</span>
                  <span className="text-yellow-400">+50 XP</span>
                </div>
              </div>

              {/* Quest 2 (Incomplete) */}
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl">
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block">
                  영어 • 타임어택
                </span>
                <p className="text-xs font-bold text-slate-300 mt-1">
                  5초 컷 배틀 2승 달성
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-semibold font-mono">
                  <span>진행도: 0 / 2</span>
                  <span className="text-slate-400">+30 XP</span>
                </div>
              </div>

              {/* Quest 3 (Incomplete) */}
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl">
                <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider block">
                  국어 • 복수전
                </span>
                <p className="text-xs font-bold text-slate-300 mt-1">
                  맞춤법 오답 복수전 1회 성공
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-semibold font-mono">
                  <span>진행도: 0 / 1</span>
                  <span className="text-slate-400">+30 XP</span>
                </div>
              </div>
            </div>

            {/* Shadow Raid Entry Button */}
            <button
              onClick={() => {
                router.push("/shadow-raid");
              }}
              className="w-full mt-5 py-3.5 bg-gradient-to-r from-emerald-900/60 to-teal-900/60 hover:from-emerald-800/80 hover:to-teal-800/80 border border-emerald-500/30 hover:border-emerald-400/60 rounded-2xl flex items-center justify-center gap-2 text-sm font-black text-emerald-300 hover:text-emerald-200 transition-all group shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] relative overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-emerald-400/10 blur-xl group-hover:opacity-100 opacity-0 transition-opacity" />
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="relative z-10">오답 던전 입장 (번개 충전)</span>
              <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all relative z-10" />
            </button>
          </div>
        </section>

        {/* Right Side: School Ranking Leaderboard & Big Play Button (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main School Leaderboard */}
          <div id="school-ranking-section" className="bg-slate-900/40 backdrop-blur-xl border border-slate-900 rounded-3xl p-6 flex-1 flex flex-col scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  🏆 실시간 전국 학교 랭킹
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  학교별 참여 인원의 LP 누적 합산 순위입니다. (중등 / 고등 분리 집계)
                </p>
              </div>

              {/* 중학교 / 고등학교 세그먼트 탭 & 실시간 뱃지 */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-inner">
                  <button
                    type="button"
                    onClick={() => setRankingType("MIDDLE")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      rankingType === "MIDDLE"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>🏫</span>
                    중학교
                  </button>
                  <button
                    type="button"
                    onClick={() => setRankingType("HIGH")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      rankingType === "HIGH"
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>🎓</span>
                    고등학교
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-400">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin-reverse" />
                  실시간
                </div>
              </div>
            </div>

            {/* Leaderboard Cards / List */}
            <div className="space-y-3 flex-1">
              {(rankingType === "MIDDLE" ? MIDDLE_SCHOOL_LEADERBOARD : HIGH_SCHOOL_LEADERBOARD).map((ranking, index) => {
                const isUserSchool = school === ranking.name;
                const isPodium = index < 3;
                
                return (
                  <motion.div
                    key={ranking.name}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                    whileHover={{ x: 4, backgroundColor: "rgba(30, 41, 59, 0.4)" }}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all ${
                      isUserSchool 
                        ? rankingType === "MIDDLE"
                          ? "bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                          : "bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.08)]" 
                        : isPodium
                          ? "bg-slate-950/40 border-slate-900"
                          : "bg-transparent border-transparent"
                    }`}
                  >
                    {/* Rank & Name */}
                    <div className="flex items-center gap-4">
                      {/* Rank Emblem */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        index === 0 
                          ? "bg-yellow-500/20 border border-yellow-500 text-yellow-400" 
                          : index === 1
                            ? "bg-slate-300/20 border border-slate-300 text-slate-300"
                            : index === 2
                              ? "bg-amber-600/20 border border-amber-600/30 text-amber-500"
                              : "bg-slate-900 border border-slate-800 text-slate-500"
                      }`}>
                        {ranking.rank}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm md:text-base text-slate-200">
                            {ranking.name}
                          </span>
                          {isUserSchool && (
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              rankingType === "MIDDLE"
                                ? "bg-emerald-500 text-slate-950"
                                : "bg-cyan-500 text-slate-950"
                            }`}>
                              My School
                            </span>
                          )}
                        </div>
                        {index === 0 && (
                          <span className="text-[10px] text-yellow-400 font-bold block mt-0.5">
                            👑 전국 1위 리그 챔피언 {isUserSchool ? "• 우리 학교가 압도적 1위 왕좌 수성 중! 🔥" : ""}
                          </span>
                        )}
                        {isUserSchool && index === 1 && (
                          <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                            🔥 1위와 단 {(rankingType === "MIDDLE" ? MIDDLE_SCHOOL_LEADERBOARD[0].lp - ranking.lp : HIGH_SCHOOL_LEADERBOARD[0].lp - ranking.lp).toLocaleString()} LP 차이! 역전 사정권
                          </span>
                        )}
                      </div>
                    </div>

                    {/* School Stats */}
                    <div className="flex items-center gap-6 text-right font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans">참여 인원</span>
                        <span className="text-xs text-slate-300 font-semibold">{ranking.count}명</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans">누적 LP</span>
                        <span className={`text-sm font-black ${rankingType === "MIDDLE" ? "text-emerald-400" : "text-cyan-400"}`}>
                          {ranking.lp.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">LP</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Show user's school if not in the current tab list */}
              {!(rankingType === "MIDDLE" ? MIDDLE_SCHOOL_LEADERBOARD : HIGH_SCHOOL_LEADERBOARD).some(r => r.name === school) && (
                <div className="pt-2 border-t border-dashed border-slate-800/80">
                  <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-950/40 border border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs font-mono">
                        {rankingType === "MIDDLE" ? "45" : "38"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-200">우리 학교: {school || "청계중학교"}</span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded uppercase tracking-wider">
                            {rankingType === "MIDDLE" ? "45위" : "38위"}
                          </span>
                        </div>
                        {((rankingType === "HIGH" && !isUserHighSchool) || (rankingType === "MIDDLE" && isUserHighSchool)) && (
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            💡 {isUserHighSchool ? "고등학교" : "중학교"} 탭에서 소속 학교 공식 순위를 확인하실 수 있습니다.
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans">참여 인원</span>
                        <span className="text-xs text-slate-300 font-semibold">12명</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans">총 LP</span>
                        <span className="text-sm font-black text-cyan-400">
                          3,250 <span className="text-[10px] font-bold text-slate-400">LP</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Big Matchmaking Button */}
          <div id="battle-arena-section" className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 scroll-mt-24">
            <div className="text-center md:text-left flex-1">
              <h3 className="text-lg font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                아레나 매칭 준비 완료
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                퀴즈 과목을 선택하고 매칭 시작을 누르면, 실력이 비슷한 라이벌 중학교 학생과 실시간 배틀이 진행됩니다.
              </p>
              
              {/* Subject Selection Buttons */}
              <div className="flex gap-2 mt-4 justify-center md:justify-start">
                {(["국어", "영어", "수학"] as const).map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      selectedSubject === subject
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    {subject === "국어" && "📖 국어 (Korean)"}
                    {subject === "영어" && "🔤 영어 (English)"}
                    {subject === "수학" && "📐 수학 (Math)"}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full md:w-auto">
              <motion.button
                disabled={!selectedSubject || energy === 0}
                onClick={handleStartFindMatch}
                whileHover={(selectedSubject && energy > 0) ? { scale: 1.02 } : {}}
                whileTap={(selectedSubject && energy > 0) ? { scale: 0.98 } : {}}
                className={`flex-1 lg:flex-initial relative px-8 py-5 rounded-2xl font-black text-base tracking-wider text-white shadow-xl overflow-hidden transition-all duration-300 min-w-[200px] ${
                  selectedSubject && energy > 0
                    ? "shadow-cyan-500/20 cursor-pointer"
                    : "opacity-40 cursor-not-allowed border border-slate-800 bg-slate-950"
                }`}
              >
                {!selectedSubject ? (
                  <div className="relative flex items-center justify-center gap-3 text-slate-500 py-0.5">
                    <Swords className="w-5 h-5" />
                    <span>과목을 선택하세요</span>
                  </div>
                ) : energy === 0 ? (
                  <div className="relative flex flex-col items-center justify-center text-red-400 py-0.5">
                    <span className="flex items-center gap-2 font-black text-sm">
                      <AlertTriangle className="w-4 h-4 text-red-500" /> 번개가 부족합니다
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 mt-1">
                      오답 던전에서 충전하세요!
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600" />
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 opacity-50 blur-lg animate-pulse" />
                    <div className="relative flex items-center justify-center gap-3">
                      <Swords className="w-5 h-5 animate-pulse" />
                      <span>매칭 시작 (Find Match)</span>
                    </div>
                  </>
                )}
              </motion.button>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onCreateRoom}
                  className="flex-1 px-5 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-xs font-black text-slate-200 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg"
                >
                  <span>방 만들기 (Create Room)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPinModal(true)}
                  className="flex-1 px-5 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-xs font-black text-slate-200 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg"
                >
                  <span>코드로 입장 (Enter PIN)</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      </>
      )}

      {lobbyTab === "ANALYTICS" && (
        <div className="max-w-7xl mx-auto px-4 mt-4 w-full">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleGoToLobby}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>← 메인 로비로 돌아가기</span>
            </button>
            <span className="text-xs font-bold text-purple-400 bg-purple-950/40 border border-purple-800/60 px-3 py-1.5 rounded-xl">
              📊 나의 역량 분석 (Competency Analytics)
            </span>
          </div>
          <PlayerAnalytics />
        </div>
      )}

      {lobbyTab === "SHADOW_RAID" && (
        <div className="max-w-7xl mx-auto px-4 mt-4 w-full">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleGoToLobby}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>← 메인 로비로 돌아가기</span>
            </button>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
              👾 오답 던전 (Shadow Raid)
            </span>
          </div>
          <ShadowRaid energy={energy} setEnergy={setEnergy} />
        </div>
      )}

      {/* Matching Screen Overlay */}
      <AnimatePresence>
        {isMatching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center"
          >
            {/* Pulsing ring waves */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
              <motion.div
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="w-80 h-80 rounded-full border-2 border-cyan-500/20 absolute"
              />
              <motion.div
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                className="w-80 h-80 rounded-full border-2 border-purple-500/20 absolute"
              />
              <motion.div
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1.2 }}
                className="w-80 h-80 rounded-full border-2 border-indigo-500/10 absolute"
              />
            </div>

            {/* Radar / Central Spinner */}
            <div className="relative z-10 flex flex-col items-center text-center px-6">
              
              {/* Matching Status Animations */}
              <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full rounded-full border-t-2 border-b-2 border-r-2 border-cyan-500 border-l-2 border-l-transparent absolute"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 rounded-full border-t-2 border-b-2 border-l-2 border-purple-500 border-r-2 border-r-transparent absolute"
                />
                
                {/* Center Icon */}
                <Swords className="w-10 h-10 text-white animate-pulse" />
              </div>

              {/* Status Header */}
              <h2 className="text-3xl font-black tracking-tight text-white mb-2">
                배틀 상대 탐색 중
              </h2>

              {/* Matching Timer */}
              <div className="font-mono text-cyan-400 font-extrabold text-xl mb-6 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full">
                00:0{matchTimer}
              </div>

              {/* Dynamic Status Text */}
              <div className="h-6 overflow-hidden max-w-md">
                <AnimatePresence mode="wait">
                  {matchingStep === 0 && (
                    <motion.p
                      key="step0"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="text-slate-400 text-sm font-semibold"
                    >
                      아레나 매칭 대기열에 진입하는 중...
                    </motion.p>
                  )}
                  {matchingStep === 1 && (
                    <motion.p
                      key="step1"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="text-slate-300 text-sm font-semibold"
                    >
                      비슷한 티어의 라이벌 학교 학생 탐색 중...
                    </motion.p>
                  )}
                  {matchingStep === 2 && (
                    <motion.p
                      key="step2"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="text-cyan-400 text-sm font-semibold"
                    >
                      매칭 대상 탐색 완료! 상대방 수락 대기 중...
                    </motion.p>
                  )}
                  {matchingStep >= 3 && (
                    <motion.p
                      key="step3"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="text-emerald-400 text-base font-extrabold flex items-center justify-center gap-2 animate-bounce"
                    >
                      <Zap className="w-5 h-5 fill-emerald-400" />
                      매칭 수락 완료! 배틀 아레나로 진입합니다!
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Opponent Card Reveal (Mock details before entry) */}
              {matchingStep >= 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="mt-8 bg-slate-900 border border-cyan-500/30 p-6 rounded-3xl shadow-2xl max-w-xs w-80 text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-950/20 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-1">
                    VS OPPONENT FOUND
                  </span>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-red-500 font-bold">
                      ⚔️
                    </div>
                    <div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-black/40 text-red-400 rounded border border-red-500/20">
                        {school === "청계중학교" ? "대청중학교" : "청계중학교"}
                      </span>
                      <h4 className="text-base font-extrabold text-white mt-0.5">
                        목동수학귀신
                      </h4>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs border-t border-slate-800 pt-3">
                    <span className="text-slate-500">Tier</span>
                    <span className="font-bold text-yellow-400">Gold [1인분 장인]</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-1">
                게릴라 스폰서 대항전
              </span>
              <h3 className="text-lg font-extrabold text-white mb-2 flex items-center gap-2">
                🏆 청계중 vs 휘문중 수학 1짱 데스매치
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                본 대전은 <strong>청계중학교</strong>와 <strong>휘문중학교</strong>의 학교 명예를 걸고 맞붙는 <strong>2세트 5+5 수학 토너먼트</strong>입니다.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">스폰서</span>
                  <span className="text-slate-300">OO학원 (아이패드 5대 후원)</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">진행 방식</span>
                  <span className="text-cyan-400 font-extrabold">2세트 토너먼트 (총 10문항)</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400 pt-1 border-t border-slate-900">
                  <span>제1세트</span>
                  <span className="text-slate-200">3분 스피드 개념전 (5문항 / 셔플 방어막)</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>제2세트</span>
                  <span className="text-slate-200">30분 종이와 연필 정통 수학전 (5문항 / 1:1 대칭 매칭)</span>
                </div>
                <div className="flex justify-between text-[10px] text-emerald-400 font-bold pt-1">
                  <span>🛡️ 공정성 보장</span>
                  <span>팀간 100% 동일 문제 • 팀내 문제/보기 상이</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventModal(false);
                    router.push("/deathmatch");
                  }}
                  className="w-full py-3 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:opacity-90 rounded-xl text-xs font-black text-white transition-all cursor-pointer shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  <Swords className="w-4 h-4" />
                  <span>데스매치 아레나 즉시 출전 (5+5 매치)</span>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="flex-1 py-2 bg-slate-850 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    닫기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventModal(false);
                      onJoinEventRoom?.();
                    }}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-cyan-300 transition-colors cursor-pointer"
                  >
                    대기실로 이동
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PIN Entry Modal */}
      <AnimatePresence>
        {showPinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <h3 className="text-base font-extrabold text-white mb-2 flex items-center gap-2">
                🔑 대기실 코드로 입장
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                친구에게 받은 6자리 방 코드(예: 1A2B3C)를 입력해 주세요.
              </p>

              <input
                type="text"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value.toUpperCase())}
                placeholder="코드 입력"
                className="w-full text-center font-mono text-xl font-bold tracking-widest bg-slate-950 border border-slate-800 rounded-xl py-3 text-cyan-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 mb-4 uppercase placeholder:text-slate-700"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setEnteredPin("");
                  }}
                  className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (enteredPin.trim().length < 4) {
                      alert("올바른 코드를 입력해 주세요 (최소 4자 이상).");
                      return;
                    }
                    onEnterPin(enteredPin.trim());
                    setShowPinModal(false);
                    setEnteredPin("");
                  }}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs font-black text-slate-950 transition-colors cursor-pointer"
                >
                  입장하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1:1 Battle Confirmation Modal */}
      <BattleConfirmModal
        isOpen={showBattleConfirm}
        onClose={() => setShowBattleConfirm(false)}
        onConfirm={(subj) => {
          setShowBattleConfirm(false);
          onStartMatch(getOpponent(), subj);
        }}
        nickname={nickname}
        school={school}
        tier={tier}
        energy={energy}
        initialSubject={selectedSubject || "수학"}
      />
    </div>
  );
}
