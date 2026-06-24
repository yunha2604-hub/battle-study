"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Award, RefreshCw, ChevronDown, ChevronUp, Check, X, 
  Sparkles, Flame, ShieldAlert, BookOpen, MessageSquare, Zap, Crown
} from "lucide-react";
import { OpponentData } from "./Lobby";

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface AnswersLogItem {
  question: Question;
  isCorrect: boolean;
  selectedIndex: number;
  timeTaken: number;
}

interface ResultPageProps {
  userProfile: { nickname: string; school: string; tier: string; lp: number };
  opponent: OpponentData;
  userFinalHp: number;
  opponentFinalHp: number;
  answersLog: AnswersLogItem[];
  isFirstMatch?: boolean;
  onReturnToLobby: (newTier: string, newLp: number) => void;
}

const TIER_ORDER = ["Iron", "Bronze", "Silver", "Gold", "Diamond"];
const TIER_DETAILS: Record<string, { label: string; color: string; title: string; bg: string }> = {
  Iron: { label: "아이언", color: "#a19d94", title: "[뇌정지]", bg: "from-stone-850 to-stone-950 border-stone-800" },
  Bronze: { label: "브론즈", color: "#cd7f32", title: "[오답 자판기]", bg: "from-amber-900 to-yellow-950 border-amber-900" },
  Silver: { label: "실버", color: "#c0c0c0", title: "[현지인]", bg: "from-slate-700 to-slate-900 border-slate-700" },
  Gold: { label: "골드", color: "#ffd700", title: "[1인분 장인]", bg: "from-yellow-600 via-amber-800 to-yellow-900 border-yellow-500" },
  Diamond: { label: "다이아몬드", color: "#b9f2ff", title: "[하드캐리 머신]", bg: "from-cyan-500 via-blue-800 to-indigo-950 border-cyan-400" },
};

export default function ResultPage({ 
  userProfile, opponent, userFinalHp, opponentFinalHp, answersLog, isFirstMatch, onReturnToLobby 
}: ResultPageProps) {
  const isVictory = userFinalHp > opponentFinalHp;
  
  // Rank calculations
  const originalTier = userProfile.tier;
  const originalLp = userProfile.lp;
  const lpChange = isVictory ? 20 : -15;
  
  const [displayedLp, setDisplayedLp] = useState(originalLp);
  const [displayedTier, setDisplayedTier] = useState(originalTier);
  const [isPromoted, setIsPromoted] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [animatingLp, setAnimatingLp] = useState(true);
  const [showKakaoModal, setShowKakaoModal] = useState(isFirstMatch || false);
  const [kakaoLinked, setKakaoLinked] = useState(false);

  // LP counting animation
  useEffect(() => {
    const timer = setTimeout(() => {
      let currentLp = originalLp;
      const targetLp = originalLp + lpChange;

      const interval = setInterval(() => {
        if (isVictory) {
          if (currentLp < targetLp) {
            currentLp += 1;
            if (currentLp >= 100) {
              // Promotion Trigger!
              clearInterval(interval);
              setIsPromoted(true);
              setDisplayedLp(100);
              
              // Transition to next tier
              setTimeout(() => {
                const nextTierIndex = Math.min(TIER_ORDER.indexOf(originalTier) + 1, TIER_ORDER.length - 1);
                setDisplayedTier(TIER_ORDER[nextTierIndex]);
                setDisplayedLp(0);
                
                // Add remaining LP to the new tier
                let newLpStart = 0;
                const remainingLp = targetLp - 100;
                const innerInterval = setInterval(() => {
                  if (newLpStart < remainingLp) {
                    newLpStart += 1;
                    setDisplayedLp(newLpStart);
                  } else {
                    clearInterval(innerInterval);
                    setAnimatingLp(false);
                  }
                }, 30);
              }, 1000);
            } else {
              setDisplayedLp(currentLp);
            }
          } else {
            clearInterval(interval);
            setAnimatingLp(false);
          }
        } else {
          // Defeat: LP drops
          if (currentLp > targetLp) {
            currentLp -= 1;
            if (currentLp < 0) {
              // Demotion trigger (prevent demotion below Iron 0 LP for MVP safety)
              clearInterval(interval);
              setDisplayedLp(0);
              setAnimatingLp(false);
            } else {
              setDisplayedLp(currentLp);
            }
          } else {
            clearInterval(interval);
            setAnimatingLp(false);
          }
        }
      }, 30);

      return () => clearInterval(interval);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleReturn = () => {
    let finalLp = originalLp + lpChange;
    let finalTier = originalTier;
    
    if (isVictory && finalLp >= 100) {
      const nextTierIndex = Math.min(TIER_ORDER.indexOf(originalTier) + 1, TIER_ORDER.length - 1);
      finalTier = TIER_ORDER[nextTierIndex];
      finalLp = finalLp - 100;
    } else if (!isVictory && finalLp < 0) {
      // Keep at 0 LP, no demotion in MVP
      finalLp = 0;
    }
    
    onReturnToLobby(finalTier, finalLp);
  };

  const correctAnswersCount = answersLog.filter(a => a.isCorrect).length;
  const currentTierInfo = TIER_DETAILS[displayedTier] || TIER_DETAILS.Silver;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 relative overflow-x-hidden font-sans">
      {/* Background Radial Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full blur-3xl pointer-events-none opacity-20 ${
        isVictory ? "bg-cyan-500" : "bg-red-500"
      }`} />

      {/* Promotion Animation Screen Overlay */}
      <AnimatePresence>
        {isPromoted && animatingLp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="text-center px-6"
            >
              <div className="inline-flex p-5 rounded-full bg-yellow-500/20 border-2 border-yellow-400 mb-4 animate-bounce">
                <Crown className="w-16 h-16 text-yellow-400 fill-yellow-400/20" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-100 tracking-wider">
                TIER PROMOTED!
              </h2>
              <p className="text-lg font-bold text-white mt-2">
                축하합니다! 티어가 승격되었습니다!
              </p>
              
              <div className="mt-8 flex items-center justify-center gap-6 text-2xl font-black">
                <span className="text-slate-400 line-through">
                  {TIER_DETAILS[originalTier].label}
                </span>
                <span className="text-cyan-400">→</span>
                <span style={{ color: TIER_DETAILS[displayedTier].color }} className="animate-pulse">
                  {TIER_DETAILS[displayedTier].label}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8 relative z-10">
        
        {/* Victory/Defeat Plate Banner */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="text-center relative"
        >
          {isVictory ? (
            <div className="relative">
              {/* Confetti Glow Background */}
              <div className="absolute inset-0 bg-cyan-400/10 blur-xl rounded-full scale-125" />
              <h1 className="text-6xl md:text-8xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-200 to-teal-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                VICTORY
              </h1>
              <p className="text-sm font-extrabold text-cyan-400 tracking-[0.25em] uppercase mt-2">
                배틀에서 승리하여 명예를 쟁취했습니다!
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full scale-125" />
              <h1 className="text-6xl md:text-8xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-purple-400 to-rose-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                DEFEAT
              </h1>
              <p className="text-sm font-extrabold text-red-400 tracking-[0.25em] uppercase mt-2">
                배틀에서 패배했습니다. 다시 기회를 노리세요.
              </p>
            </div>
          )}

          {/* Stats Bar */}
          <div className="mt-8 inline-flex items-center gap-6 bg-slate-900/60 border border-slate-800 px-6 py-2.5 rounded-full text-xs font-semibold text-slate-400">
            <span>정답 수: <strong className="text-white">{correctAnswersCount} / 3</strong></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <span>최종 HP: <strong className="text-white">{Math.max(0, userFinalHp)}%</strong></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <span>상대 최종 HP: <strong className="text-white">{Math.max(0, opponentFinalHp)}%</strong></span>
          </div>
        </motion.div>

        {/* Tier & LP Update Progress Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`w-full max-w-lg bg-gradient-to-b ${currentTierInfo.bg} backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden`}
        >
          {/* Card Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">리그 포인트 업데이트</span>
            <span className={`text-sm font-black flex items-center gap-1 ${
              isVictory ? "text-cyan-400" : "text-red-400"
            }`}>
              {isVictory ? `+${lpChange} LP` : `${lpChange} LP`}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
              <div 
                className="w-8 h-8 rotate-45 border-2 rounded flex items-center justify-center text-xs font-black"
                style={{ 
                  borderColor: currentTierInfo.color,
                  background: `linear-gradient(135deg, ${currentTierInfo.color}22, #000)`
                }}
              >
                <span className="-rotate-45" style={{ color: currentTierInfo.color }}>
                  {displayedTier[0]}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-white" style={{ color: currentTierInfo.color }}>
                {currentTierInfo.label}
              </h3>
              <p className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-0.5">
                {currentTierInfo.title}
              </p>
            </div>
          </div>

          {/* LP Slider Progress Bar */}
          <div className="space-y-2 relative z-10">
            <div className="flex justify-between items-end text-xs font-semibold">
              <span className="text-slate-400">Progression</span>
              <span className="font-mono text-white">
                {displayedLp} <span className="text-slate-500 font-normal">/ 100 LP</span>
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-950 rounded-full p-0.5 border border-slate-900 overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                animate={{ width: `${displayedLp}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ 
                  background: `linear-gradient(90deg, ${currentTierInfo.color}, ${currentTierInfo.color}88)`
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* AI Tutor Section: SchoolBattle AI Analysis Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-3xl p-6 md:p-8 flex flex-col gap-6"
        >
          <div>
            <h3 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
              <BookOpen className="text-cyan-400 w-5 h-5" />
              스쿨배틀 AI 오답 분석 피드백
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              각 문제에 대한 AI 튜터의 맞춤형 분석 보고서입니다. 카드를 클릭해 상세 해설을 확인하세요.
            </p>
          </div>

          {/* Questions Grid/List */}
          <div className="space-y-4">
            {answersLog.map((log, index) => {
              const isOpen = expandedQuestion === index;
              const isWrong = !log.isCorrect;

              return (
                <div 
                  key={index}
                  className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all ${
                    isOpen 
                      ? "border-slate-700/80 shadow-lg shadow-black/30" 
                      : isWrong
                        ? "border-red-500/20 hover:border-red-500/40"
                        : "border-slate-900 hover:border-slate-800"
                  }`}
                >
                  {/* Collapsed Header Bar */}
                  <button
                    onClick={() => setExpandedQuestion(isOpen ? null : index)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Check/X status emblem */}
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-extrabold text-xs ${
                        log.isCorrect 
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" 
                          : "bg-red-500/10 border border-red-500/30 text-red-400"
                      }`}>
                        {log.isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </div>
                      
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          ROUND {index + 1} • {log.question.category}
                        </span>
                        <h4 className="text-sm md:text-base font-extrabold text-slate-200 mt-0.5 line-clamp-1">
                          {log.question.question}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-mono hidden sm:block">
                        풀이 시간: {log.timeTaken}초
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content Area (Explanation & Review) */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-800 bg-slate-950/50"
                      >
                        <div className="p-5 space-y-4 text-sm">
                          
                          {/* Selected Choice Summary */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl">
                              <span className="text-xs text-slate-500 font-bold block mb-1">나의 선택</span>
                              <p className={`font-semibold text-xs md:text-sm ${isWrong ? "text-red-400" : "text-emerald-400"}`}>
                                {log.selectedIndex === -1 
                                  ? "시간 초과 (선택 안 함)" 
                                  : `${log.selectedIndex + 1}. ${log.question.options[log.selectedIndex]}`}
                              </p>
                            </div>
                            <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl">
                              <span className="text-xs text-slate-500 font-bold block mb-1">정답</span>
                              <p className="font-semibold text-xs md:text-sm text-emerald-400">
                                {log.question.answerIndex + 1}. {log.question.options[log.question.answerIndex]}
                              </p>
                            </div>
                          </div>

                          {/* AI Tutor breakdown feedback */}
                          <div className="p-4 bg-slate-900 border border-cyan-500/10 rounded-2xl relative">
                            {/* AI Coach Banner */}
                            <div className="flex items-center gap-2 mb-3.5">
                              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center shadow">
                                <Zap className="w-3.5 h-3.5 text-white fill-white" />
                              </div>
                              <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">
                                SchoolBattle AI 튜터 피드백
                              </span>
                            </div>
                            
                            <p className="text-slate-300 font-medium text-xs md:text-sm leading-relaxed break-keep">
                              {log.isCorrect 
                                ? `멋진 실력입니다! 이 문제를 정확히 푸셨습니다. ${log.question.explanation}` 
                                : `아이고! 여기서 오답이 발생하는군요. ${log.question.explanation}`}
                            </p>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Return Lobby Button */}
        <motion.button
          onClick={handleReturn}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl p-[1.5px] focus:outline-none cursor-pointer mt-4"
        >
          {/* Neon Border */}
          <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 rounded-2xl" />
          <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 rounded-2xl opacity-0 hover:opacity-100 transition-opacity blur-sm" />

          {/* Inner Content */}
          <div className="relative flex items-center justify-center gap-2 bg-slate-950 text-white font-bold rounded-[14px] py-4 hover:bg-slate-900 transition-colors">
            <span>로비로 돌아가기</span>
          </div>
        </motion.button>
        
      </div>

      {/* Kakao Record Saving Modal (Growth Hacking Retention Popup) */}
      <AnimatePresence>
        {showKakaoModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative text-center space-y-6"
            >
              <div className="inline-flex p-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
                <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400/20 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">
                  🎉 첫 퀴즈 배틀 완료!
                </h3>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed break-keep font-sans">
                  당신의 첫 번째 놀라운 기록을 영구 저장하시겠습니까? <br />
                  <span className="text-slate-400 mt-1 block">
                    (닉네임: <strong className="text-cyan-400">{userProfile.nickname}</strong>, 
                    학교: <strong className="text-cyan-400">{userProfile.school}</strong>, 
                    획득 LP: <strong className="text-yellow-400">+{lpChange} LP</strong>)
                  </span>
                </p>
              </div>

              {kakaoLinked ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-emerald-400 text-xs font-bold"
                >
                  ✅ 카카오 계정 연동 완료! <br />
                  <span className="text-slate-400 text-[10px] block mt-1">
                    다음 판부터 전적 및 랭크 점수가 영구 보존됩니다.
                  </span>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setKakaoLinked(true);
                      setTimeout(() => {
                        setShowKakaoModal(false);
                      }, 2000);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#191919] font-black text-sm rounded-2xl shadow-lg cursor-pointer transition-all hover:scale-102"
                  >
                    <MessageSquare className="w-4 h-4 fill-current shrink-0" />
                    <span>1초 만에 카카오로 시작하기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowKakaoModal(false)}
                    className="text-xs text-slate-500 hover:text-slate-300 font-bold transition-colors cursor-pointer"
                  >
                    나중에 연동하기
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
