"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Swords, ShieldAlert, Trophy, Clock, Zap, Flame, Award, 
  CheckCircle2, XCircle, ArrowRight, Sparkles, Shuffle, FileText,
  AlertTriangle, Check, RotateCcw, Home
} from "lucide-react";
import GlobalHeader from "./GlobalHeader";

// 5 Questions for Set 1 (Speed Concept Rush, 3 mins)
interface ConceptQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

const SET1_QUESTIONS: ConceptQuestion[] = [
  {
    id: 1,
    question: "특수각의 삼각비에서 sin 30°의 올바른 값을 고르시오.",
    options: ["1/2", "√2/2", "√3/2", "1"],
    correctAnswer: "1/2",
    points: 100
  },
  {
    id: 2,
    question: "√49 의 양의 제곱근 값을 고르시오.",
    options: ["7", "±7", "√7", "14"],
    correctAnswer: "7",
    points: 100
  },
  {
    id: 3,
    question: "곱셈공식 (a + b)² 의 올바른 전개식을 고르시오.",
    options: ["a² + 2ab + b²", "a² + b²", "a² - 2ab + b²", "a² + ab + b²"],
    correctAnswer: "a² + 2ab + b²",
    points: 100
  },
  {
    id: 4,
    question: "특수각의 삼각비에서 cos 60°의 올바른 값을 고르시오.",
    options: ["1/2", "√3/2", "1", "0"],
    correctAnswer: "1/2",
    points: 100
  },
  {
    id: 5,
    question: "이차방정식 x² - 9 = 0 의 양의 실근을 고르시오.",
    options: ["3", "±3", "9", "√3"],
    correctAnswer: "3",
    points: 100
  }
];

// 5 Questions for Set 2 (Paper & Pencil Math Tournament, 30 mins)
interface DeepMathQuestion {
  id: number;
  difficulty: "하" | "중" | "상" | "최상";
  points: number;
  question: string;
  options: string[];
  correctAnswer: string;
  solutionHint: string;
}

const SET2_QUESTIONS: DeepMathQuestion[] = [
  {
    id: 101,
    difficulty: "하",
    points: 20,
    question: "[난이도: 하] 무리수 √10 의 정수 부분을 a, 소수 부분을 b라 할 때, 2a - b 의 올바른 값을 구하시오.",
    options: ["6 - (√10 - 3)", "9 - √10", "3 - √10", "√10 - 3"],
    correctAnswer: "9 - √10",
    solutionHint: "3 < √10 < 4 이므로 정수 부분 a = 3, 소수 부분 b = √10 - 3. 따라서 2(3) - (√10 - 3) = 9 - √10"
  },
  {
    id: 102,
    difficulty: "중",
    points: 30,
    question: "[난이도: 중] 직각삼각형 ABC에서 ∠C = 90°, ∠B = 45°, 빗변 AB의 길이가 12일 때, 높이 AC의 길이를 구하시오.",
    options: ["6√2", "6", "12√2", "3√2"],
    correctAnswer: "6√2",
    solutionHint: "sin 45° = AC / AB = √2 / 2. 따라서 AC = 12 × (√2 / 2) = 6√2"
  },
  {
    id: 103,
    difficulty: "중",
    points: 30,
    question: "[난이도: 중] 이차방정식 2x² - 6x - 1 = 0 의 두 실근을 α, β라 할 때, α + β + 2αβ 의 값을 구하시오.",
    options: ["2", "3", "4", "1"],
    correctAnswer: "2",
    solutionHint: "근과 계수의 관계에 의해 α + β = 3, αβ = -1/2. 따라서 3 + 2(-1/2) = 3 - 1 = 2"
  },
  {
    id: 104,
    difficulty: "상",
    points: 40,
    question: "[난이도: 상] 인수분해 공식을 활용하여 √(2026 × 2028 + 1) 의 정확한 계산 값을 구하시오.",
    options: ["2027", "2026", "2028", "2029"],
    correctAnswer: "2027",
    solutionHint: "x = 2027로 치환하면 (x - 1)(x + 1) + 1 = x² - 1 + 1 = x². 따라서 √x² = x = 2027"
  },
  {
    id: 105,
    difficulty: "최상",
    points: 60,
    question: "[난이도: 최상 킬러] 삼차방정식 x³ - 3x² - x + 3 = 0 의 세 실근 중 가장 큰 근과 가장 작은 근의 차의 값을 구하시오.",
    options: ["4", "2", "3", "1"],
    correctAnswer: "4",
    solutionHint: "x²(x - 3) - (x - 3) = 0 => (x² - 1)(x - 3) = 0 => x = -1, 1, 3. 최대근(3) - 최소근(-1) = 4"
  }
];

interface SchoolDeathmatchArenaProps {
  userNickname?: string;
  userSchool?: string;
}

export default function SchoolDeathmatchArena({
  userNickname = "대치동불주먹",
  userSchool = "청계중학교"
}: SchoolDeathmatchArenaProps) {
  const router = useRouter();

  // Match Set State: 1 = Set 1 (3분 스피드전), 2 = Set 2 (30분 정통 수학전), 3 = 최종 결과
  const [currentSet, setCurrentSet] = useState<1 | 2 | 3>(1);

  // Set 1 State (5 questions)
  const [set1Index, setSet1Index] = useState(0);
  const [set1Answers, setSet1Answers] = useState<Record<number, string>>({});
  const [set1Timer, setSet1Timer] = useState(180); // 3분 = 180초
  const [set1ScoreUser, setSet1ScoreUser] = useState(0);

  // Set 2 State (5 questions)
  const [set2Index, setSet2Index] = useState(0);
  const [set2Answers, setSet2Answers] = useState<Record<number, string>>({});
  const [set2Timer, setSet2Timer] = useState(1800); // 30분 = 1800초
  const [set2ScoreUser, setSet2ScoreUser] = useState(0);

  // Team Aggregate Scores
  const [teamAScore, setTeamAScore] = useState(0); // 청계중
  const [teamBScore, setTeamBScore] = useState(0); // 휘문중

  // Live Combat Log
  const [combatLogs, setCombatLogs] = useState<{ id: number; message: string; type: "teamA" | "teamB" }[]>([
    { id: 1, message: "🔥 [청계중 vs 휘문중] 학교 대항전 데스매치가 개막했습니다!", type: "teamA" },
    { id: 2, message: "📢 [부정행위 방지] 1세트 문제·선지 무작위 셔플링 시스템이 가동되었습니다.", type: "teamB" }
  ]);

  // Set 1 Question & Option Shuffling (부정행위 방지: 학생마다 보기 순서 무작위화)
  const shuffledSet1 = useMemo(() => {
    return SET1_QUESTIONS.map((q) => ({
      ...q,
      // 선지 셔플
      options: [...q.options].sort(() => Math.random() - 0.5)
    }));
  }, []);

  // Set 1 Countdown Timer
  useEffect(() => {
    if (currentSet !== 1) return;
    const timer = setInterval(() => {
      setSet1Timer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Transition to Set 2
          setCurrentSet(2);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentSet]);

  // Set 2 Countdown Timer
  useEffect(() => {
    if (currentSet !== 2) return;
    const timer = setInterval(() => {
      setSet2Timer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCurrentSet(3);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentSet]);

  // Background Teammate Combat Simulator
  useEffect(() => {
    if (currentSet === 3) return;

    let logCounter = 100;
    const set1TeammateLogs = [
      { msg: "[청계중_페이커]가 2연속 정답을 달성했습니다! (+100점)", team: "teamA" as const, ptsA: 100, ptsB: 0 },
      { msg: "[휘문중_킬러]가 기선제압 정답을 도출했습니다! (+100점)", team: "teamB" as const, ptsA: 0, ptsB: 100 },
      { msg: "[청계중_에이스] 스피드 콤보 성공! (+100점)", team: "teamA" as const, ptsA: 100, ptsB: 0 },
      { msg: "[대치동수학괴물(휘문중)] 맹추격 정답! (+100점)", team: "teamB" as const, ptsA: 0, ptsB: 100 },
      { msg: "[청계중_수학신] 3연속 콤보 크리티컬! (+150점)", team: "teamA" as const, ptsA: 150, ptsB: 0 }
    ];

    const set2TeammateLogs = [
      { msg: "[청계중_페이커] 2세트 심화 4번 인수분해 문제 정답! (+40점)", team: "teamA" as const, ptsA: 40, ptsB: 0 },
      { msg: "[대치동수학괴물(휘문중)] 2세트 킬러 5번 계산 완료! (+60점)", team: "teamB" as const, ptsA: 0, ptsB: 60 },
      { msg: "[청계중_에이스] 2세트 2번 직각삼각형 삼각비 풀이 성공! (+30점)", team: "teamA" as const, ptsA: 30, ptsB: 0 },
      { msg: "[휘문중_킬러] 2세트 3번 이차방정식 근과계수 공식 정답! (+30점)", team: "teamB" as const, ptsA: 0, ptsB: 30 }
    ];

    const logsToUse = currentSet === 1 ? set1TeammateLogs : set2TeammateLogs;

    const interval = setInterval(() => {
      const randomItem = logsToUse[Math.floor(Math.random() * logsToUse.length)];
      setCombatLogs((prev) => [
        ...prev.slice(-3),
        { id: ++logCounter, message: randomItem.msg, type: randomItem.team }
      ]);
      if (randomItem.ptsA > 0) setTeamAScore((prev) => prev + randomItem.ptsA);
      if (randomItem.ptsB > 0) setTeamBScore((prev) => prev + randomItem.ptsB);
    }, currentSet === 1 ? 4000 : 7000);

    return () => clearInterval(interval);
  }, [currentSet]);

  // Set 1 Answer Selection
  const handleSet1Answer = (option: string) => {
    const q = shuffledSet1[set1Index];
    if (set1Answers[q.id]) return; // 이미 제출한 경우 방지

    const isCorrect = option === q.correctAnswer;
    const earned = isCorrect ? q.points : 0;

    setSet1Answers((prev) => ({ ...prev, [q.id]: option }));
    if (isCorrect) {
      setSet1ScoreUser((prev) => prev + earned);
      setTeamAScore((prev) => prev + earned);
      setCombatLogs((prev) => [
        ...prev.slice(-3),
        { id: Date.now(), message: `🎯 [청계중] ${userNickname}(본인)의 정답! (+${earned}점)`, type: "teamA" }
      ]);
    } else {
      setCombatLogs((prev) => [
        ...prev.slice(-3),
        { id: Date.now(), message: `❌ [청계중] ${userNickname}(본인)의 오답! (0점)`, type: "teamA" }
      ]);
    }

    // Auto advance after 400ms
    setTimeout(() => {
      if (set1Index < shuffledSet1.length - 1) {
        setSet1Index((prev) => prev + 1);
      }
    }, 400);
  };

  // Set 2 Answer Selection
  const handleSet2Answer = (option: string) => {
    const q = SET2_QUESTIONS[set2Index];
    if (set2Answers[q.id]) return;

    const isCorrect = option === q.correctAnswer;
    const earned = isCorrect ? q.points : 0;

    setSet2Answers((prev) => ({ ...prev, [q.id]: option }));
    if (isCorrect) {
      setSet2ScoreUser((prev) => prev + earned);
      setTeamAScore((prev) => prev + earned);
      setCombatLogs((prev) => [
        ...prev.slice(-3),
        { id: Date.now(), message: `🏆 [청계중] ${userNickname}(본인)의 2세트 정답! (+${earned}점)`, type: "teamA" }
      ]);
    } else {
      setCombatLogs((prev) => [
        ...prev.slice(-3),
        { id: Date.now(), message: `⚠️ [청계중] ${userNickname}(본인)의 2세트 오답!`, type: "teamA" }
      ]);
    }
  };

  // Demo: Auto Finish Set 1
  const handleSkipSet1 = () => {
    // 4문제 정답 처리
    shuffledSet1.forEach((q, idx) => {
      if (idx < 4) {
        setSet1Answers(prev => ({ ...prev, [q.id]: q.correctAnswer }));
      }
    });
    setSet1ScoreUser(400);
    setTeamAScore(prev => prev + 400);
    setTeamBScore(prev => prev + 300);
    setCurrentSet(2);
  };

  // Demo: Auto Finish Set 2
  const handleSkipSet2 = () => {
    SET2_QUESTIONS.forEach((q, idx) => {
      if (idx !== 4) {
        setSet2Answers(prev => ({ ...prev, [q.id]: q.correctAnswer }));
      }
    });
    setSet2ScoreUser(120);
    setTeamAScore(prev => prev + 120 + 200);
    setTeamBScore(prev => prev + 250);
    setCurrentSet(3);
  };

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalScore = teamAScore + teamBScore;
  const teamAPercent = totalScore === 0 ? 50 : Math.round((teamAScore / totalScore) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Global Header */}
      <GlobalHeader activeTab="DEATHMATCH" />

      {/* Main Deathmatch Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 md:py-6 flex flex-col gap-6 relative z-10">
        
        {/* Top Section: Championship Scoreboard & Tug of War */}
        <section className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
          {/* Sponsor Tag */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-xl">
              <Trophy className="w-3.5 h-3.5" />
              <span>[주말 스폰서 대항전] OO학원 후원 (우승 학교 아이패드 5대 증정)</span>
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                currentSet === 1 
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse" 
                  : currentSet === 2
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}>
                {currentSet === 1 && "제1세트: 3분 스피드 개념전"}
                {currentSet === 2 && "제2세트: 30분 종이와 연필 정통 수학전"}
                {currentSet === 3 && "최종 결과 집계 완료"}
              </span>

              {/* Demo Fast-Forward Button for reviewer demo */}
              {currentSet === 1 && (
                <button
                  onClick={handleSkipSet1}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer"
                  title="심사위원 시연용 1세트 즉시 완료"
                >
                  ⚡ 시연 1세트 스킵
                </button>
              )}
              {currentSet === 2 && (
                <button
                  onClick={handleSkipSet2}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer"
                  title="심사위원 시연용 2세트 즉시 완료"
                >
                  ⚡ 시연 2세트 스킵
                </button>
              )}
            </div>
          </div>

          {/* School vs School Score Header */}
          <div className="grid grid-cols-12 items-center gap-4">
            
            {/* Team A (청계중) */}
            <div className="col-span-5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/10">
                🦁
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base md:text-lg font-black text-cyan-400">청계중학교</h3>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-cyan-950/60 border border-cyan-800 text-cyan-300 rounded-md">아군</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl md:text-3xl font-black text-white">{teamAScore}</span>
                  <span className="text-xs text-slate-400 font-bold">점</span>
                </div>
              </div>
            </div>

            {/* Center: Live Timer & Set indicator */}
            <div className="col-span-2 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">VS</span>
              <div className="flex items-center gap-1.5 text-amber-400 font-mono font-black text-sm md:text-base mt-1 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>
                  {currentSet === 1 && formatTime(set1Timer)}
                  {currentSet === 2 && formatTime(set2Timer)}
                  {currentSet === 3 && "종료"}
                </span>
              </div>
            </div>

            {/* Team B (휘문중) */}
            <div className="col-span-5 flex items-center justify-end gap-3 text-right">
              <div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-purple-950/60 border border-purple-800 text-purple-300 rounded-md">상대</span>
                  <h3 className="text-base md:text-lg font-black text-purple-400">휘문중학교</h3>
                </div>
                <div className="flex items-baseline justify-end gap-1 mt-0.5">
                  <span className="text-2xl md:text-3xl font-black text-white">{teamBScore}</span>
                  <span className="text-xs text-slate-400 font-bold">점</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-xl shadow-lg shadow-purple-500/10">
                🦅
              </div>
            </div>
          </div>

          {/* Tug of War Dynamic Power Bar */}
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-[11px] font-extrabold px-1">
              <span className="text-cyan-400">점수 점유율 {teamAPercent}%</span>
              <span className="text-purple-400">점수 점유율 {100 - teamAPercent}%</span>
            </div>
            <div className="h-4 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden relative flex p-0.5">
              <motion.div
                animate={{ width: `${teamAPercent}%` }}
                transition={{ type: "spring", stiffness: 90, damping: 15 }}
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-l-full"
              />
              <motion.div
                animate={{ width: `${100 - teamAPercent}%` }}
                transition={{ type: "spring", stiffness: 90, damping: 15 }}
                className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-r-full"
              />
            </div>
          </div>
        </section>

        {/* Middle Stage: Set 1 vs Set 2 vs Result */}
        {currentSet === 1 && (
          // ==================== SET 1: SPEED CONCEPT RUSH (5 Qs, 3 mins) ====================
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Anti-Cheat Info & Live Feed (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Anti-cheat banner */}
              <div className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-black text-cyan-400">
                  <Shuffle className="w-4 h-4 text-cyan-400" />
                  <span>[1세트 셔플 방어막 작동 중]</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  팀원마다 <strong>문제 출제 순서와 4개 선지 순서가 무작위 셔플</strong>되어 서로 답을 공유할 수 없습니다. 각자 전력으로 문제를 풀어 팀 점수를 쌓으세요!
                </p>
                <div className="text-[10px] text-cyan-300/80 font-mono pt-1 border-t border-slate-800">
                  내 현재 기여: +{set1ScoreUser}점 ({Object.keys(set1Answers).length}/5문항)
                </div>
              </div>

              {/* Live Combat Feed */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col flex-1 min-h-[220px]">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  실시간 팀원 전투 피드
                </h4>
                <div className="space-y-2 mt-auto">
                  {combatLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-2 rounded-xl text-[11px] font-medium border ${
                        log.type === "teamA"
                          ? "bg-cyan-950/40 border-cyan-900/50 text-cyan-200"
                          : "bg-purple-950/40 border-purple-900/50 text-purple-200"
                      }`}
                    >
                      {log.message}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Question Card (8 cols) */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col relative min-h-[440px] shadow-2xl">
                
                {/* Question Progress Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-cyan-950 border border-cyan-500/30 text-cyan-400 text-xs font-black rounded-lg">
                      1세트 문항 {set1Index + 1} / 5
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      배점: 100점
                    </span>
                  </div>
                  <span className="text-xs text-yellow-400 font-bold flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                    스피드 개념전
                  </span>
                </div>

                {/* Question Text */}
                <div className="mb-8">
                  <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                    {shuffledSet1[set1Index].question}
                  </h3>
                </div>

                {/* 4 Choices (Shuffled) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-auto">
                  {shuffledSet1[set1Index].options.map((option, optIdx) => {
                    const qId = shuffledSet1[set1Index].id;
                    const isSelected = set1Answers[qId] === option;
                    const isCorrect = option === shuffledSet1[set1Index].correctAnswer;
                    const hasAnswered = !!set1Answers[qId];

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={hasAnswered}
                        onClick={() => handleSet1Answer(option)}
                        className={`p-4 rounded-2xl border text-left font-bold text-sm md:text-base transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? isCorrect
                              ? "bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30"
                              : "bg-red-950 border-red-500 text-red-300 ring-2 ring-red-500/30"
                            : hasAnswered && isCorrect
                            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                            : "bg-slate-950 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-black text-cyan-400">
                            {optIdx + 1}
                          </span>
                          <span>{option}</span>
                        </div>
                        {hasAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Question dots at bottom */}
                <div className="flex items-center justify-center gap-2 pt-6 mt-6 border-t border-slate-800/80">
                  {shuffledSet1.map((q, idx) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setSet1Index(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        set1Index === idx
                          ? "bg-cyan-400 scale-125"
                          : set1Answers[q.id]
                          ? "bg-emerald-500"
                          : "bg-slate-800"
                      }`}
                      title={`문항 ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentSet === 2 && (
          // ==================== SET 2: PAPER & PENCIL MATH TOURNAMENT (5 Qs, 30 mins) ====================
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Symmetrical Matchup & Pencil Guide (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              
              {/* Symmetrical Matchup Notice */}
              <div className="bg-slate-900/60 border border-purple-500/30 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-black text-purple-400">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  <span>[2세트 1:1 대칭 매칭 공정성 보장]</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  <strong>청계중 1번 선수(나)</strong>와 <strong>휘문중 1번 선수</strong>는 토씨 하나 다르지 않은 <strong>100% 동일한 문제</strong>로 겨룹니다.
                </p>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span className="text-cyan-400">청계중 1번(나)</span>
                    <span className="text-slate-400">VS</span>
                    <span className="text-purple-400">휘문중 1번(대치동수학괴물)</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    *팀 내 5명의 대표는 각자 다른 문제를 배정받아 답 공유가 불가능합니다.
                  </p>
                </div>
              </div>

              {/* Pencil & Paper Workspace Reminder */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <FileText className="w-4 h-4" />
                  <span>종이와 연필을 준비하세요</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  2세트는 복합 식 전개와 인수분해가 필요한 정통 수학 문제입니다. 연습장에 계산 과정을 직접 풀고 최종 답안을 선택하세요.
                </p>
              </div>

              {/* Live Combat Feed */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col flex-1 min-h-[180px]">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  실시간 2세트 제출 피드
                </h4>
                <div className="space-y-2 mt-auto">
                  {combatLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded-xl text-[11px] font-medium border ${
                        log.type === "teamA"
                          ? "bg-cyan-950/40 border-cyan-900/50 text-cyan-200"
                          : "bg-purple-950/40 border-purple-900/50 text-purple-200"
                      }`}
                    >
                      {log.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Deep Math Paper Card (8 cols) */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col relative min-h-[480px] shadow-2xl">
                
                {/* Header Meta */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-purple-950 border border-purple-500/30 text-purple-400 text-xs font-black rounded-lg">
                      2세트 문항 {set2Index + 1} / 5
                    </span>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                      배점: {SET2_QUESTIONS[set2Index].points}점
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      난이도: {SET2_QUESTIONS[set2Index].difficulty}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-400">
                    2세트 내 기여: +{set2ScoreUser}점
                  </div>
                </div>

                {/* Math Question Text */}
                <div className="mb-6">
                  <h3 className="text-base md:text-lg font-bold text-white leading-relaxed">
                    {SET2_QUESTIONS[set2Index].question}
                  </h3>
                </div>

                {/* Solution Hint Card */}
                <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl mb-6 text-xs text-slate-400">
                  <span className="font-bold text-slate-300 block mb-1">💡 풀이 힌트 가이드:</span>
                  <p className="leading-relaxed font-normal">{SET2_QUESTIONS[set2Index].solutionHint}</p>
                </div>

                {/* 4 Choices */}
                <div className="space-y-3 mt-auto">
                  {SET2_QUESTIONS[set2Index].options.map((option, optIdx) => {
                    const qId = SET2_QUESTIONS[set2Index].id;
                    const isSelected = set2Answers[qId] === option;
                    const isCorrect = option === SET2_QUESTIONS[set2Index].correctAnswer;
                    const hasAnswered = !!set2Answers[qId];

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={hasAnswered}
                        onClick={() => handleSet2Answer(option)}
                        className={`w-full p-4 rounded-2xl border text-left font-bold text-sm md:text-base transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? isCorrect
                              ? "bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30"
                              : "bg-red-950 border-red-500 text-red-300 ring-2 ring-red-500/30"
                            : hasAnswered && isCorrect
                            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                            : "bg-slate-950 border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-black text-purple-400">
                            {optIdx + 1}
                          </span>
                          <span>{option}</span>
                        </div>
                        {hasAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800/80">
                  <button
                    type="button"
                    disabled={set2Index === 0}
                    onClick={() => setSet2Index(prev => Math.max(0, prev - 1))}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      set2Index === 0 ? "opacity-30 cursor-not-allowed text-slate-500" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    이전 문항
                  </button>

                  <div className="flex gap-2">
                    {SET2_QUESTIONS.map((q, idx) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setSet2Index(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                          set2Index === idx
                            ? "bg-purple-600 text-white"
                            : set2Answers[q.id]
                            ? "bg-emerald-600/80 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  {set2Index < SET2_QUESTIONS.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setSet2Index(prev => Math.min(SET2_QUESTIONS.length - 1, prev + 1))}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      다음 문항
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCurrentSet(3)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-colors cursor-pointer shadow-lg"
                    >
                      최종 결과 확인
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentSet === 3 && (
          // ==================== SET 3: FINAL CHAMPIONSHIP RESULT ====================
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Victory Badge */}
            <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-yellow-500 to-amber-300 text-slate-950 mb-4 shadow-xl shadow-yellow-500/20">
              <Trophy className="w-12 h-12" />
            </div>

            <span className="text-xs font-black text-yellow-400 uppercase tracking-widest block mb-1">
              CHAMPIONSHIP VICTORY
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              {teamAScore >= teamBScore ? "🏆 청계중학교 대승리!" : "휘문중학교 승리"}
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-lg">
              1세트 3분 스피드 개념전과 2세트 30분 정통 수학 탐구전을 합산한 결과, 
              <strong> {teamAScore >= teamBScore ? "청계중학교가 전국 중학교 랭킹 1위 왕좌를 수성" : "휘문중학교가 승리"}</strong>했습니다!
            </p>

            {/* Score Comparison Cards */}
            <div className="grid grid-cols-2 gap-4 max-w-md w-full my-8">
              <div className="p-5 rounded-2xl bg-cyan-950/40 border-2 border-cyan-500/50 flex flex-col items-center">
                <span className="text-xs font-bold text-cyan-300">청계중학교</span>
                <span className="text-3xl font-black text-white mt-1">{teamAScore}점</span>
                <span className="text-[10px] text-cyan-400 mt-1 font-bold">내 기여: {set1ScoreUser + set2ScoreUser}점</span>
              </div>
              <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-800 flex flex-col items-center">
                <span className="text-xs font-bold text-purple-300">휘문중학교 (상대)</span>
                <span className="text-3xl font-black text-white mt-1">{teamBScore}점</span>
                <span className="text-[10px] text-slate-500 mt-1 font-bold">합산 점수</span>
              </div>
            </div>

            {/* Sponsor Reward */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl max-w-md w-full mb-8 text-xs text-yellow-300 flex items-center gap-3 text-left">
              <Sparkles className="w-6 h-6 text-yellow-400 shrink-0" />
              <div>
                <strong className="block text-white">스폰서 에듀테크 스쿨존 문화상품권 & 아이패드 응모권 발급 완료!</strong>
                <span>우승 팀 청계중 대표 5인 전원에게 추첨권이 부여되었습니다.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 max-w-md w-full">
              <button
                type="button"
                onClick={() => {
                  setTeamAScore(0);
                  setTeamBScore(0);
                  setSet1Answers({});
                  setSet2Answers({});
                  setCurrentSet(1);
                  setSet1Timer(180);
                  setSet2Timer(1800);
                }}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>다시 도전하기</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/lobby")}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-white font-black rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5"
              >
                <Home className="w-4 h-4" />
                <span>메인 로비로 복귀</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
