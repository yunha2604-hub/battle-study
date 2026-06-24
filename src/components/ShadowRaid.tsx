"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Swords, ShieldAlert, CheckCircle, XCircle, Clock, Trophy, 
  Flame, Skull, Award, Play, RotateCcw, AlertTriangle
} from "lucide-react";

interface Quest {
  id: number;
  name: string;
  subject: "국어" | "영어" | "수학";
  concept: string;
  difficulty: "EASY" | "NORMAL" | "HARD";
  rewardLp: number;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  status: "ACTIVE" | "CLEARED";
}

const INITIAL_QUESTS: Quest[] = [
  {
    id: 1,
    name: "관계대명사의 악령 (Wraith of Pronouns)",
    subject: "영어",
    concept: "관계대명사 (Relative Pronouns)",
    difficulty: "NORMAL",
    rewardLp: 5,
    question: "Q. 다음 빈칸에 들어갈 가장 적절한 관계대명사를 선택하시오.\n'This is the middle school (  ) we visited yesterday.'",
    options: [
      "which",
      "where",
      "what",
      "who"
    ],
    answerIndex: 0,
    explanation: "'visited'는 타동사로서 목적어가 필요하므로, 선행사 'the middle school'을 수식하는 목적격 관계대명사 'which'가 와야 합니다. 장소를 수식할 때도 뒤에 목적어가 빠진 불완전한 문장일 경우 관계부사 'where'가 아닌 관계대명사 'which'를 사용합니다.",
    status: "ACTIVE"
  },
  {
    id: 2,
    name: "삼각함수의 가고일 (Gargoyle of Trig)",
    subject: "수학",
    concept: "삼각함수 길이 계산 (Trigonometry)",
    difficulty: "HARD",
    rewardLp: 5,
    question: "Q. 직각삼각형에서 빗변의 길이가 10cm이고 한 예각이 30도일 때, 이 각의 대변(Opposite Side)의 길이는 얼마인가?",
    options: [
      "5cm",
      "5√3 cm",
      "10cm",
      "5√2 cm"
    ],
    answerIndex: 0,
    explanation: "직각삼각형에서 예각 θ의 대변의 길이는 (빗변의 길이) × sin θ 입니다. sin 30° = 1/2 이므로 대변의 길이는 10 × (1/2) = 5cm입니다.",
    status: "ACTIVE"
  },
  {
    id: 3,
    name: "맞춤법의 구미호 (Gumiho of Spelling)",
    subject: "국어",
    concept: "맞춤법 종결 표기 (되 vs 돼)",
    difficulty: "EASY",
    rewardLp: 5,
    question: "Q. 다음 중 맞춤법 표기법상 밑줄 친 부분의 표기가 '틀린' 문장을 선택하시오.",
    options: [
      "그렇게 행동하면 안 되.",
      "내일 마트에 가게 되었다.",
      "철수야, 그러면 안 돼.",
      "밥은 꼭 먹고 가야지."
    ],
    answerIndex: 0,
    explanation: "'안 되'는 종결 표기로서 올바르지 않습니다. 어간 '되-'에 어미 '-어'가 합쳐진 준말인 '안 돼'로 적어야 올바른 표기법입니다.",
    status: "ACTIVE"
  }
];

interface ShadowRaidProps {
  energy: number;
  setEnergy: React.Dispatch<React.SetStateAction<number>>;
}

export default function ShadowRaid({ energy, setEnergy }: ShadowRaidProps) {
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  
  // Revenge Match States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [battleResult, setBattleResult] = useState<"BATTLE" | "VICTORY" | "DEFEAT">("BATTLE");
  const [modalShake, setModalShake] = useState(false);

  // Timer loop for revenge match modal
  useEffect(() => {
    if (!isModalOpen || isLocked || battleResult !== "BATTLE") return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isModalOpen, isLocked, battleResult]);

  const handleStartRevenge = (quest: Quest) => {
    setActiveQuest(quest);
    setTimeLeft(10);
    setSelectedOption(null);
    setIsLocked(false);
    setBattleResult("BATTLE");
    setIsModalOpen(true);
  };

  const handleOptionSelect = (index: number) => {
    if (isLocked || !activeQuest) return;
    setIsLocked(true);
    setSelectedOption(index);

    const isCorrect = index === activeQuest.answerIndex;

    if (isCorrect) {
      // Recharge +1 energy (max 5)
      setEnergy((prev) => Math.min(5, prev + 1));

      setTimeout(() => {
        setBattleResult("VICTORY");
        // Mark quest as cleared
        setQuests((prev) =>
          prev.map((q) => (q.id === activeQuest.id ? { ...q, status: "CLEARED" } : q))
        );
      }, 500);
    } else {
      setModalShake(true);
      setTimeout(() => {
        setModalShake(false);
        setBattleResult("DEFEAT");
      }, 500);
    }
  };

  const handleTimeout = () => {
    setIsLocked(true);
    setModalShake(true);
    setTimeout(() => {
      setModalShake(false);
      setBattleResult("DEFEAT");
    }, 500);
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === "EASY") return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (diff === "NORMAL") return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
    return "text-red-400 border-red-500/30 bg-red-500/10 animate-pulse";
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8 text-slate-100 font-sans relative z-10">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2 text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Skull className="w-7 h-7 text-red-500 animate-pulse" />
            오답 던전 (Shadow Raid)
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            내가 틀렸던 오답 보스 몬스터들을 격파하고 잃어버린 랭크 점수를 복구하는 복수전 퀘스트입니다.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-bold text-yellow-400">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>보스 처치 시 +5 LP 즉시 획득</span>
        </div>
      </div>

      {/* RPG Quest Log Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {quests.map((quest) => {
          const isCleared = quest.status === "CLEARED";
          
          return (
            <motion.div
              key={quest.id}
              whileHover={!isCleared ? { y: -4, borderColor: "rgba(239, 68, 68, 0.4)" } : {}}
              className={`bg-slate-900/60 backdrop-blur-xl border rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                isCleared 
                  ? "border-slate-900/80 opacity-60 bg-slate-950/20" 
                  : "border-slate-850 shadow-lg shadow-black/10"
              }`}
            >
              {/* Card visual accents */}
              {!isCleared && (
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-red-600 to-transparent opacity-60" />
              )}

              <div>
                {/* Meta details */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getDifficultyColor(quest.difficulty)}`}>
                    {quest.difficulty}
                  </span>
                  
                  <span className="text-[11px] font-mono font-black text-cyan-400 flex items-center gap-1">
                    {quest.subject === "국어" && "📖"}
                    {quest.subject === "영어" && "🔤"}
                    {quest.subject === "수학" && "📐"}
                    {quest.subject} • {quest.concept.split(" ")[0]}
                  </span>
                </div>

                {/* Monster Name */}
                <h3 className={`text-base font-extrabold flex items-center gap-2 mt-2 ${
                  isCleared ? "text-slate-500 line-through" : "text-white"
                }`}>
                  <Skull className={`w-4.5 h-4.5 shrink-0 ${isCleared ? "text-slate-600" : "text-red-500"}`} />
                  {quest.name}
                </h3>
                
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  오답 분석 요약: [{quest.concept}] 관련 문법/공식을 잘못 이해해 매치에서 패배를 야기한 원인 보스입니다.
                </p>
              </div>

              {/* Reward & Action */}
              <div className="mt-8 border-t border-slate-850/80 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">RAID REWARD</span>
                  <span className={`font-mono text-sm font-black flex items-center gap-0.5 ${
                    isCleared ? "text-slate-600" : "text-yellow-400"
                  }`}>
                    <Trophy className="w-3.5 h-3.5" />
                    +{quest.rewardLp} LP
                  </span>
                </div>

                {isCleared ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                    <CheckCircle className="w-4 h-4" />
                    격파 완료
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartRevenge(quest)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 hover:scale-105 cursor-pointer transition-all"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>복수전 시작</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenge Match Arena Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && activeQuest && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={modalShake ? { x: [0, -10, 10, -10, 10, 0] } : { scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xl bg-slate-900 border border-red-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Modal Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-950/20 rounded-full blur-2xl pointer-events-none" />

              {/* BATTLE SCREEN */}
              {battleResult === "BATTLE" && (
                <div className="space-y-6">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                    <div className="flex items-center gap-2">
                      <Skull className="w-5 h-5 text-red-500 animate-pulse" />
                      <span className="text-xs font-black tracking-wider uppercase text-red-400">
                        REVENGE MATCH IN PROGRESS
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-full font-mono text-xs">
                      <Clock className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      <span className="font-black text-red-400">{timeLeft}초</span>
                    </div>
                  </div>

                  {/* Question body */}
                  <div className="p-5 bg-slate-950/60 border border-slate-850 rounded-2xl">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                      {activeQuest.concept}
                    </span>
                    <h3 className="text-sm md:text-base font-extrabold text-white leading-relaxed whitespace-pre-line">
                      {activeQuest.question}
                    </h3>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5">
                    {activeQuest.options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrectAnswer = activeQuest.answerIndex === idx;

                      let optClass = "bg-slate-950/60 border-slate-850 hover:bg-slate-850/80 hover:border-slate-700 text-slate-200";
                      let icon = null;

                      if (isLocked) {
                        if (isSelected) {
                          if (isCorrectAnswer) {
                            optClass = "bg-emerald-950/60 border-emerald-500 text-emerald-300";
                            icon = <CheckCircle className="w-4.5 h-4.5 text-emerald-400 absolute right-4 top-1/2 -translate-y-1/2" />;
                          } else {
                            optClass = "bg-red-950/60 border-red-500 text-red-300";
                            icon = <XCircle className="w-4.5 h-4.5 text-red-400 absolute right-4 top-1/2 -translate-y-1/2" />;
                          }
                        } else if (isCorrectAnswer) {
                          optClass = "bg-emerald-950/30 border-emerald-500/50 text-emerald-400/90";
                        } else {
                          optClass = "bg-slate-950/20 border-slate-950 text-slate-600 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isLocked}
                          onClick={() => handleOptionSelect(idx)}
                          className={`w-full relative border rounded-xl p-4 text-left font-semibold text-xs md:text-sm cursor-pointer transition-all flex items-center pr-12 ${optClass}`}
                        >
                          <span className={`w-5.5 h-5.5 rounded flex items-center justify-center font-bold text-[10px] mr-2.5 shrink-0 ${
                            isLocked 
                              ? isSelected 
                                ? isCorrectAnswer 
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-red-500/20 text-red-300"
                                : "bg-slate-900 text-slate-700"
                              : "bg-slate-900 text-red-400 border border-red-500/10"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="flex-1 font-medium">{option}</span>
                          {icon}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VICTORY SCREEN */}
              {battleResult === "VICTORY" && (
                <div className="text-center py-6 space-y-6">
                  <div className="inline-flex p-4 rounded-full bg-yellow-500/15 border border-yellow-500/30 animate-bounce">
                    <Trophy className="w-12 h-12 text-yellow-400 fill-yellow-400/10" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-black text-yellow-400 tracking-wider">
                      QUEST COMPLETED!
                    </h2>
                    <p className="text-slate-300 text-xs font-bold mt-2">
                      오답 보스 격파 성공! 취약 개념을 완벽하게 극복하셨습니다.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl inline-flex items-center gap-6">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">획득 보상</span>
                      <span className="text-sm font-mono font-black text-yellow-400 flex items-center gap-1 mt-0.5">
                        <Trophy className="w-4 h-4" />
                        +5 LP 복구
                      </span>
                      <span className="text-[10px] font-black text-yellow-500 block mt-1">
                        ⚡ 번개 +1개 충전!
                      </span>
                    </div>
                    <div className="h-10 w-px bg-slate-850" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">퀘스트 상태</span>
                      <span className="text-xs font-black text-emerald-400 mt-1.5 block">CLEARED</span>
                    </div>
                  </div>

                  <div className="pt-2 text-left bg-slate-950/60 p-4 border border-slate-850 rounded-2xl text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                    <strong className="text-cyan-400 block mb-1">AI 튜터 해설:</strong>
                    {activeQuest.explanation}
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2.5 bg-slate-100 hover:bg-white text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all"
                    >
                      던전 나가기
                    </button>
                  </div>
                </div>
              )}

              {/* DEFEAT SCREEN */}
              {battleResult === "DEFEAT" && (
                <div className="text-center py-6 space-y-6">
                  <div className="inline-flex p-4 rounded-full bg-red-500/15 border border-red-500/30 animate-pulse">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-black text-red-500 tracking-wider">
                      QUEST FAILED!
                    </h2>
                    <p className="text-slate-300 text-xs font-bold mt-2">
                      오답 보스 공략에 실패했습니다. 다음 기회에 도전하세요.
                    </p>
                  </div>

                  <div className="pt-2 text-left bg-slate-950/60 p-4 border border-slate-850 rounded-2xl text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                    <strong className="text-red-400 block mb-1">공략 힌트:</strong>
                    {activeQuest.explanation}
                  </div>

                  <div className="pt-4 flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleStartRevenge(activeQuest)}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      다시 도전하기
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all"
                    >
                      던전 나가기
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
