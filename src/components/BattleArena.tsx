"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Zap, Clock, ShieldAlert, CheckCircle, XCircle, Flame } from "lucide-react";
import { OpponentData } from "./Lobby";

export interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  timeLimit: number;
}

const SUBJECT_QUESTIONS: Record<"국어" | "영어" | "수학", Question[]> = {
  영어: [
    {
      id: 1,
      category: "영어 어휘 (Grammar)",
      question: "Q. 다음 빈칸에 들어갈 가장 알맞은 관계대명사를 선택하시오.\n'The information (  ) I found on the website was extremely helpful.'",
      options: [
        "which",
        "what",
        "whose",
        "who"
      ],
      answerIndex: 0,
      timeLimit: 5,
      explanation: "'The information'은 사물 선행사이고 뒤의 형용사절에 목적어가 생략되어 있으므로 목적격 관계대명사 'which'가 와야 합니다. 'what'은 선행사가 없을 때 쓰이므로 부적절합니다."
    },
    {
      id: 2,
      category: "영어 독해 (Syntax/Reading)",
      question: "Q. 다음 문장의 핵심 주어(Subject)에 해당하는 요소를 고르시오.\n'The book that you lent me, which was sitting on the dusty shelf in the old library, has disappeared.'",
      options: [
        "you (너)",
        "The shelf (선반)",
        "The book (책)",
        "The old library (오래된 도서관)"
      ],
      answerIndex: 2,
      timeLimit: 30,
      explanation: "긴 수식어구('that you lent me'와 'which was sitting...')가 주어와 동사 사이에 길게 삽입되어 있습니다. 문장의 실질적인 핵심 주어는 문장 맨 앞에 제시된 'The book'입니다."
    },
    {
      id: 3,
      category: "영어 단어 (Vocab)",
      question: "Q. 다음 중 밑줄 친 단어 'meticulous'의 유의어(Synonym)로 가장 알맞은 것을 고르시오.\n'She was meticulous about cleaning the laboratory equipment.'",
      options: [
        "careless (부주의한)",
        "extremely precise (매우 꼼꼼한)",
        "indifferent (무관심한)",
        "lazy (게으른)"
      ],
      answerIndex: 1,
      timeLimit: 10,
      explanation: "'meticulous'는 '세심한', '꼼꼼한'이라는 뜻입니다. 따라서 'extremely precise'(매우 꼼꼼하고 정확한)가 가장 가까운 의미의 유의어입니다."
    }
  ],
  수학: [
    {
      id: 1,
      category: "수학 기초 계산 (Basic Calc)",
      question: "Q. 특수각의 삼각비에서 sin 30°의 값은 얼마인가?",
      options: [
        "1",
        "1/2",
        "√2/2",
        "√3/2"
      ],
      answerIndex: 1,
      timeLimit: 10,
      explanation: "직각삼각형의 기본 삼각비 정의에 따라 특수각인 30도의 사인(sin 30°) 값은 1/2 (0.5)입니다."
    },
    {
      id: 2,
      category: "수학 보스 배틀 (Boss Battle)",
      question: "Q. 삼차방정식 x³ - 3x² - x + 3 = 0의 세 실근 중 가장 큰 근과 가장 작은 근의 차의 값은 얼마인가?",
      options: [
        "1",
        "2",
        "3",
        "4"
      ],
      answerIndex: 3,
      timeLimit: 90,
      explanation: "인수분해를 하면 x²(x - 3) - (x - 3) = 0 => (x² - 1)(x - 3) = 0 => (x - 1)(x + 1)(x - 3) = 0 이 됩니다. 세 실근은 -1, 1, 3이며, 가장 큰 근(3)과 가장 작은 근(-1)의 차이는 3 - (-1) = 4 입니다."
    }
  ],
  국어: [
    {
      id: 1,
      category: "국어 맞춤법 (Grammar)",
      question: "Q. 다음 중 한글 맞춤법 표기법상 밑줄 친 부분의 표기가 올바른 것은?",
      options: [
        "오늘 해야 할 일을 내일로 미루면 안 돼.",
        "그 일은 네 마음대로 하면 되게 되어 있어.",
        "그렇게 행동하면 안 되.",
        "오늘 밤에는 꼭 약속 장소에 가야 돼다."
      ],
      answerIndex: 0,
      timeLimit: 10,
      explanation: "'안 돼'는 '안 되어'의 준말이므로 '돼'로 표기하는 것이 올바릅니다. 어간 '되-'는 혼자 종결될 수 없습니다. 구분하기 어려울 때는 '돼' 자리에 '해', '되' 자리에 '하'를 대입해보면 '안 해'(안 돼)가 어색하지 않으므로 '돼'가 맞습니다."
    },
    {
      id: 2,
      category: "한국 문학 (Literature)",
      question: "Q. 한국 근대 문학에서 시인 '김소월'과 그의 작품이 올바르게 매칭된 것을 고르시오.",
      options: [
        "서시 - 김소월",
        "진달래꽃 - 김소월",
        "님의 침묵 - 김소월",
        "광야 - 김소월"
      ],
      answerIndex: 1,
      timeLimit: 15,
      explanation: "'진달래꽃'은 민요시인 김소월의 대표작입니다. '서시'는 윤동주, '님의 침묵'은 한용운, '광야'는 이육사의 작품입니다."
    }
  ]
};

interface BattleArenaProps {
  userProfile: { nickname: string; school: string; tier: string; lp: number };
  opponent: OpponentData;
  subject: "국어" | "영어" | "수학";
  onFinishMatch: (
    userFinalHp: number,
    opponentFinalHp: number,
    answersLog: { question: Question; isCorrect: boolean; selectedIndex: number; timeTaken: number }[]
  ) => void;
  isStrictAssessment?: boolean;
  isTeamBattle?: boolean;
}

export default function BattleArena({ 
  userProfile, opponent, subject, onFinishMatch, 
  isStrictAssessment = false, isTeamBattle = false 
}: BattleArenaProps) {
  const subjectQuestions = SUBJECT_QUESTIONS[subject];
  const [currentRound, setCurrentRound] = useState(0);
  const [userHp, setUserHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  
  // Quiz tracking
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answersLog, setAnswersLog] = useState<{ question: Question; isCorrect: boolean; selectedIndex: number; timeTaken: number }[]>([]);
  
  // Game mechanics states
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [isCriticalHit, setIsCriticalHit] = useState(false);

  // Animation states
  const [opponentShake, setOpponentShake] = useState(false);
  const [userShake, setUserShake] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [showRedVignette, setShowRedVignette] = useState(false);
  const [matchEnding, setMatchEnding] = useState(false);

  // Team Battle Shared HP & Event log states
  const [teamAHp, setTeamAHp] = useState(100);
  const [teamBHp, setTeamBHp] = useState(100);
  const [teamEvents, setTeamEvents] = useState<{ id: number; message: string; type: "success" | "danger" }[]>([]);

  const currentQuestion = subjectQuestions[currentRound];
  
  // Mask nicknames under assessment mode
  const displayUserNickname = isStrictAssessment ? "Student A (본인)" : userProfile.nickname;
  const displayOpponentNickname = isStrictAssessment ? "Student B" : opponent.nickname;

  // Dynamic Timer Reset
  useEffect(() => {
    if (matchEnding || !currentQuestion) return;
    setTimeLeft(currentQuestion.timeLimit);
    setOpponentFinished(false);
    setIsCriticalHit(false);
  }, [currentRound, subject]);

  // Main countdown timer loop
  useEffect(() => {
    if (isLocked || matchEnding) return;

    if (timeLeft <= 0) {
      handleAnswerSelection(-1); // timeout is incorrect
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isLocked, matchEnding]);

  // Psychological Pressure Simulator (only active in regular matches)
  useEffect(() => {
    if (isLocked || matchEnding || !currentQuestion || isTeamBattle) return;
    const timeLimit = currentQuestion.timeLimit;
    if (timeLimit <= 15) return;

    const minDelay = timeLimit * 0.2 * 1000;
    const maxDelay = timeLimit * 0.5 * 1000;
    const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;

    const opponentPsychTimer = setTimeout(() => {
      setOpponentFinished(true);
      
      setTimeLeft((prevTime) => {
        if (prevTime > 10) {
          return 10;
        }
        return prevTime;
      });
    }, randomDelay);

    return () => clearTimeout(opponentPsychTimer);
  }, [currentRound, subject, isLocked, matchEnding, isTeamBattle]);

  // Team Battle Live Simulator Loop: updates other team members actions in background
  useEffect(() => {
    if (!isTeamBattle || matchEnding) return;

    const mockMessages = [
      { message: "[동탄고_페이커]님이 공격했습니다! (Team B HP -8)", type: "success" as const, dmgB: 8, dmgA: 0 },
      { message: "[반송고_킬러]님이 공격했습니다! (Team A HP -10)", type: "danger" as const, dmgB: 0, dmgA: 10 },
      { message: "[동탄고_수학수호자]님이 콤보 정답으로 치명타를 입혔습니다! (Team B HP -15)", type: "success" as const, dmgB: 15, dmgA: 0 },
      { message: "[반송고_수포자]님이 오답을 적어 Team A가 틈을 보였습니다! (Team B HP -6)", type: "success" as const, dmgB: 6, dmgA: 0 },
      { message: "[수학포기자]님이 오답을 선택하여 Team A HP가 손상되었습니다.. (Team A HP -12)", type: "danger" as const, dmgB: 0, dmgA: 12 }
    ];

    const eventInterval = setInterval(() => {
      if (isLocked) return;
      const idx = Math.floor(Math.random() * mockMessages.length);
      const chosen = mockMessages[idx];

      const newEvt = {
        id: Date.now(),
        message: chosen.message,
        type: chosen.type
      };

      setTeamEvents(prev => [...prev.slice(-2), newEvt]);

      if (chosen.dmgA > 0) {
        setTeamAHp(prev => Math.max(10, prev - chosen.dmgA));
      }
      if (chosen.dmgB > 0) {
        setTeamBHp(prev => Math.max(10, prev - chosen.dmgB));
      }
    }, 4500);

    return () => clearInterval(eventInterval);
  }, [isTeamBattle, isLocked, matchEnding]);

  // Answer Choice handler
  const handleAnswerSelection = (index: number) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedChoice(index);

    const isCorrect = index === currentQuestion.answerIndex;
    const timeLimit = currentQuestion.timeLimit;
    const timeTaken = timeLimit - timeLeft;

    // Speed Critical check
    const isCritical = isCorrect && (timeTaken <= timeLimit * 0.3);
    const damageDealt = isCorrect ? (isCritical ? 68 : 34) : 0;

    if (isCorrect && isCritical && !isStrictAssessment && !isTeamBattle) {
      setIsCriticalHit(true);
    }

    // Deduct HP based on mode
    if (isCorrect) {
      if (isTeamBattle) {
        setTeamBHp(prev => Math.max(0, prev - 25));
        const newEvt = {
          id: Date.now(),
          message: `[${userProfile.nickname || "대치동불주먹"}] (본인)의 정답! (Team B HP -25)`,
          type: "success" as const
        };
        setTeamEvents(prev => [...prev.slice(-2), newEvt]);
      }
    } else {
      if (isTeamBattle) {
        setTeamAHp(prev => Math.max(0, prev - 20));
        const newEvt = {
          id: Date.now(),
          message: `[수학포기자] (본인)의 오답! (Team A HP -20)`,
          type: "danger" as const
        };
        setTeamEvents(prev => [...prev.slice(-2), newEvt]);
      }
    }

    // Log this round
    const roundLog = {
      question: currentQuestion,
      isCorrect,
      selectedIndex: index,
      timeTaken
    };
    
    const newAnswersLog = [...answersLog, roundLog];
    setAnswersLog(newAnswersLog);

    if (isCorrect) {
      // Visual slash animation on Opponent
      setTimeout(() => {
        if (!isStrictAssessment && !isTeamBattle) {
          setShowSlash(true);
          setOpponentShake(true);
        }
        setOpponentHp((prev) => Math.max(0, prev - damageDealt));
      }, 300);

      // Clear hits
      setTimeout(() => {
        if (!isStrictAssessment && !isTeamBattle) {
          setShowSlash(false);
          setOpponentShake(false);
        }
      }, 900);
    } else {
      // Visual red shake animation on User
      setTimeout(() => {
        if (!isStrictAssessment && !isTeamBattle) {
          setShowRedVignette(true);
          setUserShake(true);
        }
        setUserHp((prev) => Math.max(0, prev - 34));
      }, 300);

      // Clear hits
      setTimeout(() => {
        if (!isStrictAssessment && !isTeamBattle) {
          setShowRedVignette(false);
          setUserShake(false);
        }
      }, 900);
    }

    // Multi-round progression
    setTimeout(() => {
      if (currentRound < subjectQuestions.length - 1) {
        setCurrentRound((prev) => prev + 1);
        setSelectedChoice(null);
        setIsLocked(false);
      } else {
        // Arena end transition
        setMatchEnding(true);
        setTimeout(() => {
          const finalUserHp = isTeamBattle ? teamAHp : Math.max(0, userHp - (isCorrect ? 0 : 34));
          const finalOppHp = isTeamBattle ? teamBHp : Math.max(0, opponentHp - (isCorrect ? damageDealt : 0));
          onFinishMatch(finalUserHp, finalOppHp, newAnswersLog);
        }, 1000);
      }
    }, 2000);
  };

  const getHpColor = (hp: number) => {
    if (hp > 50) return "bg-gradient-to-r from-emerald-500 to-green-400";
    if (hp > 25) return "bg-gradient-to-r from-yellow-500 to-amber-400";
    return "bg-gradient-to-r from-red-600 to-rose-500 animate-pulse";
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans select-none overflow-hidden relative ${
      isStrictAssessment ? "bg-slate-50 text-slate-800" : "bg-slate-950 text-slate-100"
    }`}>
      {/* Anti-cheat warning banner */}
      {isStrictAssessment && (
        <div className="w-full bg-red-600 text-white py-2.5 px-4 text-xs md:text-sm font-black text-center relative z-50 flex items-center justify-center gap-2 animate-pulse shadow-md border-b border-red-700 uppercase tracking-wide">
          <span>⚠️ 수행평가 진행 중: 화면 이탈 시 0점 처리됩니다 (Assessment in progress: Do not leave the screen)</span>
        </div>
      )}

      {/* Background radial atmosphere */}
      {!isStrictAssessment && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-90 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-10 pointer-events-none" />
        </>
      )}
      {isStrictAssessment && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35 pointer-events-none" />
      )}

      {/* Psychological Pressure Pulsing Red Screen Border */}
      <AnimatePresence>
        {opponentFinished && !isLocked && !isStrictAssessment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 z-30 border-[10px] border-red-500 pointer-events-none shadow-[inset_0_0_80px_rgba(239,68,68,0.4)]"
          />
        )}
      </AnimatePresence>

      {/* Red Damage Vignette overlay when user is hit */}
      <AnimatePresence>
        {showRedVignette && !isStrictAssessment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-red-950/30 border-[16px] border-red-600/40 pointer-events-none shadow-[inset_0_0_100px_rgba(220,38,38,0.5)]"
          />
        )}
      </AnimatePresence>

      {/* Critical Hit Pop-up Indicator */}
      <AnimatePresence>
        {isCriticalHit && !isStrictAssessment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: [1, 1.4, 1.2], y: -30 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 font-black text-2xl md:text-4xl px-6 py-2.5 rounded-full border border-yellow-400/50 shadow-[0_0_30px_rgba(234,179,8,0.3)] tracking-widest uppercase animate-bounce">
              <Flame className="w-6 h-6 fill-yellow-400" />
              CRITICAL HIT x2
            </div>
            <span className="text-yellow-400 font-bold text-xs mt-2 uppercase tracking-widest drop-shadow">
              30% 시간 내에 정답 맞춤! 데미지 2배!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Sword Slash Overlay when opponent is hit */}
      <AnimatePresence>
        {showSlash && !isStrictAssessment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="relative w-full max-w-lg h-1 bg-white rotate-[-35deg] shadow-[0_0_35px_rgba(255,255,255,1),_0_0_15px_rgba(6,182,212,0.8)]">
              <motion.div 
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{ duration: 0.4 }}
                className="absolute inset-y-0 w-32 bg-cyan-300"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Section: VS & HP Bars */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-4 md:py-6">
        {isTeamBattle ? (
          // --- CLASS VS CLASS HP BARS (Tug of war style) ---
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="w-full flex flex-col gap-3">
              <div className="flex justify-between items-center px-1 font-bold text-xs md:text-sm">
                <span className="text-cyan-400 flex items-center gap-1.5 font-sans">
                  🔥 Team A (동탄고 1학년 3반) HP: {teamAHp}%
                </span>
                <span className="text-purple-400 flex items-center gap-1.5 font-sans">
                  😈 Team B (반송고 1학년 4반) HP: {teamBHp}%
                </span>
              </div>
              
              {/* Tug of war bar */}
              <div className="h-7 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden relative flex p-0.5 shadow-inner">
                <motion.div
                  animate={{ width: `${(teamAHp / (teamAHp + teamBHp || 1)) * 100}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-l-full"
                />
                <motion.div
                  animate={{ width: `${(teamBHp / (teamAHp + teamBHp || 1)) * 100}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-r-full"
                />
                
                {/* Central Sliding Rope Divider */}
                <motion.div 
                  animate={{ left: `${(teamAHp / (teamAHp + teamBHp || 1)) * 100}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  className="absolute top-0 bottom-0 w-2.5 bg-yellow-400 border-l border-r border-white/50 shadow-[0_0_15px_rgba(234,179,8,1)] -translate-x-1/2 flex items-center justify-center"
                >
                  <div className="w-0.5 h-4 bg-white/70" />
                </motion.div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold font-mono px-1">
                <span>[참가자: {userProfile.nickname || "대치동불주먹"}, 청계중마스터, 평촌공부귀신 등 5명]</span>
                <span>[참가자: 목동수학귀신, 분당오답폭격기 등 5명]</span>
              </div>
            </div>
          </div>
        ) : (
          // --- STANDARD INDIVIDUAL HP BARS ---
          <div className={`grid grid-cols-11 items-center gap-2 md:gap-4 p-4 md:p-5 border rounded-2xl ${
            isStrictAssessment 
              ? "bg-white border-slate-200 shadow-sm" 
              : "bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl"
          }`}>
            
            {/* User Side */}
            <motion.div 
              animate={(!isStrictAssessment && userShake) ? { x: [0, -12, 12, -12, 12, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="col-span-5 flex flex-col gap-2 items-start text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center font-bold overflow-hidden shadow-inner ${
                  isStrictAssessment 
                    ? "bg-slate-100 border border-slate-200 text-slate-700" 
                    : "bg-slate-950 border border-slate-800/80 text-slate-400"
                }`}>
                  🙋
                </div>
                <div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border block w-max ${
                    isStrictAssessment 
                      ? "bg-slate-100 text-slate-600 border-slate-200" 
                      : "bg-cyan-950 text-cyan-300 border-cyan-500/20"
                  }`}>
                    {userProfile.school}
                  </span>
                  <span className={`text-sm md:text-base font-extrabold ${
                    isStrictAssessment ? "text-slate-850" : "text-white"
                  }`}>
                    {displayUserNickname}
                  </span>
                </div>
              </div>

              <div className="w-full space-y-1">
                <div className="flex justify-between items-center text-[10px] md:text-xs">
                  <span className={`font-extrabold ${isStrictAssessment ? "text-slate-500" : "text-cyan-400"}`}>HP</span>
                  <span className={`font-mono font-black ${isStrictAssessment ? "text-slate-700" : "text-slate-300"}`}>{Math.max(0, userHp)} / 100</span>
                </div>
                <div className={`h-3 w-full rounded-full border overflow-hidden relative ${
                  isStrictAssessment ? "bg-slate-200 border-slate-300" : "bg-slate-950 border-slate-800"
                }`}>
                  <motion.div
                    animate={{ width: `${Math.max(0, userHp)}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 15 }}
                    className={`h-full rounded-full ${
                      isStrictAssessment 
                        ? "bg-slate-800" 
                        : getHpColor(userHp)
                    }`}
                  />
                </div>
              </div>
            </motion.div>

            {/* VS Divider */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border font-bold text-[10px] ${
                isStrictAssessment 
                  ? "bg-slate-100 border-slate-250 text-slate-750 shadow-sm" 
                  : "bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 border-white/10 text-white shadow-lg shadow-indigo-500/20"
              }`}>
                VS
              </div>
            </div>

            {/* Opponent Side */}
            <motion.div 
              animate={(!isStrictAssessment && opponentShake) ? { x: [0, -12, 12, -12, 12, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="col-span-5 flex flex-col gap-2 items-end text-right"
            >
              <div className="flex items-center gap-2.5 flex-row-reverse">
                <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center font-bold overflow-hidden shadow-inner ${
                  isStrictAssessment 
                    ? "bg-slate-100 border border-slate-200 text-slate-700" 
                    : "bg-slate-950 border border-slate-800/80 text-slate-400"
                }`}>
                  😈
                </div>
                <div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border block w-max ml-auto ${
                    isStrictAssessment 
                      ? "bg-slate-100 text-slate-600 border-slate-200" 
                      : "bg-purple-950 text-purple-300 border-purple-500/20"
                  }`}>
                    {opponent.school}
                  </span>
                  <span className={`text-sm md:text-base font-extrabold ${
                    isStrictAssessment ? "text-slate-850" : "text-white"
                  }`}>
                    {displayOpponentNickname}
                  </span>
                </div>
              </div>

              <div className="w-full space-y-1">
                <div className="flex justify-between items-center text-[10px] md:text-xs flex-row-reverse">
                  <span className={`font-extrabold ${isStrictAssessment ? "text-slate-500" : "text-purple-400"}`}>HP</span>
                  <span className={`font-mono font-black ${isStrictAssessment ? "text-slate-700" : "text-slate-300"}`}>{Math.max(0, opponentHp)} / 100</span>
                </div>
                <div className={`h-3 w-full rounded-full border overflow-hidden relative ${
                  isStrictAssessment ? "bg-slate-200 border-slate-300" : "bg-slate-950 border-slate-800"
                }`}>
                  <motion.div
                    animate={{ width: `${Math.max(0, opponentHp)}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 15 }}
                    className={`h-full rounded-full ${
                      isStrictAssessment 
                        ? "bg-slate-450" 
                        : getHpColor(opponentHp)
                    }`}
                  />
                </div>
              </div>
            </motion.div>

          </div>
        )}
      </header>

      {/* Middle Section: Round Indicator & Question Display */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-6 flex-1 flex flex-col justify-center items-center gap-4">
        
        {/* Psychological Pressure Warnings */}
        <AnimatePresence>
          {opponentFinished && !isLocked && !isStrictAssessment && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full p-3.5 bg-red-950/60 border border-red-500/30 rounded-2xl text-red-400 text-xs md:text-sm font-extrabold text-center flex items-center justify-center gap-2 animate-pulse shadow-lg"
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>⚠️ 상대방 풀이 완료! 남은 시간: {timeLeft}초</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Round Counter & Timer bar */}
        <div className="w-full flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] md:text-xs font-black tracking-widest uppercase border px-3 py-1 rounded-full ${
              isStrictAssessment 
                ? "bg-slate-200 border-slate-300 text-slate-700" 
                : "bg-slate-900 border-cyan-500/20 text-cyan-400"
            }`}>
              ROUND {currentRound + 1} / {subjectQuestions.length}
            </span>
            <span className={`text-xs font-bold ${isStrictAssessment ? "text-slate-500" : "text-slate-400"}`}>
              {currentQuestion.category}
            </span>
          </div>

          <div className={`flex items-center gap-2 border px-3.5 py-1.5 rounded-full font-mono text-xs md:text-sm ${
            isStrictAssessment 
              ? "bg-white border-slate-200 text-slate-700 shadow-sm" 
              : "bg-slate-900 border-slate-800 text-slate-200"
          }`}>
            <Clock className={`w-4 h-4 ${
              isStrictAssessment 
                ? "text-slate-650" 
                : timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-cyan-400"
            }`} />
            <span className={`font-black ${
              !isStrictAssessment && timeLeft <= 5 ? "text-red-500 animate-pulse" : ""
            }`}>
              {timeLeft}초 / {currentQuestion.timeLimit}초
            </span>
          </div>
        </div>

        {/* Time Progress Bar */}
        <div className={`w-full h-1.5 rounded-full overflow-hidden border p-px ${
          isStrictAssessment ? "bg-slate-200 border-slate-300" : "bg-slate-950 border-slate-900"
        }`}>
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: `${(timeLeft / currentQuestion.timeLimit) * 100}%` }}
            transition={{ duration: 1, ease: "linear" }}
            className={`h-full rounded-full ${
              isStrictAssessment 
                ? "bg-slate-600" 
                : timeLeft <= 5 ? "bg-red-500" : "bg-gradient-to-r from-cyan-500 to-indigo-500"
            }`}
          />
        </div>

        {/* Question Card */}
        <div className={`w-full border rounded-3xl p-6 md:p-8 text-center shadow-md relative ${
          isStrictAssessment 
            ? "bg-white border-slate-250" 
            : "bg-slate-900/50 backdrop-blur-xl border-slate-800"
        }`}>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-7xl md:text-8xl pointer-events-none select-none ${
            isStrictAssessment ? "text-slate-100/70" : "text-white/5"
          }`}>
            Q{currentRound + 1}
          </div>
          
          <h2 className={`text-base md:text-xl font-black leading-relaxed relative z-10 break-keep whitespace-pre-line ${
            isStrictAssessment ? "text-slate-900" : "text-white"
          }`}>
            {currentQuestion.question}
          </h2>
        </div>
      </main>

      {/* Bottom Section: Choice Buttons */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-8 md:pb-12 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedChoice === index;
            const isCorrectAnswer = currentQuestion.answerIndex === index;
            
            let btnClass = isStrictAssessment
              ? "bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 shadow-sm"
              : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700 text-slate-200";
            let iconElement = null;

            if (isLocked) {
              if (isStrictAssessment) {
                if (isSelected) {
                  if (isCorrectAnswer) {
                    btnClass = "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm";
                    iconElement = <CheckCircle className="w-5 h-5 text-emerald-600 absolute right-4 top-1/2 -translate-y-1/2" />;
                  } else {
                    btnClass = "bg-red-50 border-red-500 text-red-800 shadow-sm";
                    iconElement = <XCircle className="w-5 h-5 text-red-600 absolute right-4 top-1/2 -translate-y-1/2" />;
                  }
                } else if (isCorrectAnswer) {
                  btnClass = "bg-emerald-50/40 border-emerald-400 text-emerald-700";
                  iconElement = <CheckCircle className="w-4 h-4 text-emerald-600 absolute right-4 top-1/2 -translate-y-1/2" />;
                } else {
                  btnClass = "bg-slate-100 border-slate-200 text-slate-400 opacity-60";
                }
              } else {
                if (isSelected) {
                  if (isCorrectAnswer) {
                    btnClass = "bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                    iconElement = <CheckCircle className="w-5 h-5 text-emerald-400 absolute right-4 top-1/2 -translate-y-1/2" />;
                  } else {
                    btnClass = "bg-red-950/60 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
                    iconElement = <XCircle className="w-5 h-5 text-red-400 absolute right-4 top-1/2 -translate-y-1/2" />;
                  }
                } else if (isCorrectAnswer) {
                  btnClass = "bg-emerald-950/30 border-emerald-500/50 text-emerald-400/90";
                  iconElement = <CheckCircle className="w-4 h-4 text-emerald-500/60 absolute right-4 top-1/2 -translate-y-1/2" />;
                } else {
                  btnClass = "bg-slate-950/30 border-slate-900 text-slate-600 opacity-60";
                }
              }
            }

            const badgeClass = isLocked
              ? isSelected
                ? isCorrectAnswer
                  ? isStrictAssessment ? "bg-emerald-500/20 text-emerald-700" : "bg-emerald-500/20 text-emerald-300"
                  : isStrictAssessment ? "bg-red-500/20 text-red-700" : "bg-red-500/20 text-red-300"
                : isStrictAssessment ? "bg-slate-200 text-slate-400" : "bg-slate-950 text-slate-750"
              : isStrictAssessment ? "bg-slate-100 text-slate-600 border border-slate-250" : "bg-slate-950 text-cyan-400";

            return (
              <motion.button
                key={index}
                disabled={isLocked}
                onClick={() => handleAnswerSelection(index)}
                whileHover={!isLocked ? { scale: 1.012, y: -0.5 } : {}}
                whileTap={!isLocked ? { scale: 0.988 } : {}}
                className={`relative w-full border-2 rounded-2xl p-5 text-left font-semibold text-sm md:text-base transition-all select-none cursor-pointer flex items-center pr-12 ${btnClass}`}
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs mr-3 shrink-0 ${badgeClass}`}>
                  {index + 1}
                </span>

                <span className="flex-1 break-keep leading-tight font-medium">{option}</span>
                {iconElement}
              </motion.button>
            );
          })}
        </div>
      </footer>

      {/* Team Battle Live Events Overlay Toast */}
      {isTeamBattle && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-xs pointer-events-none">
          <AnimatePresence>
            {teamEvents.map((evt) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 120, damping: 12 }}
                className={`p-3.5 rounded-2xl border text-xs font-black shadow-lg flex items-center gap-2.5 backdrop-blur-xl ${
                  evt.type === "success" 
                    ? "bg-cyan-950/90 border-cyan-500/35 text-cyan-300"
                    : "bg-red-950/90 border-red-500/35 text-red-300"
                }`}
              >
                <span className="text-sm">{evt.type === "success" ? "⚔️" : "💥"}</span>
                <span className="break-keep leading-tight">{evt.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
