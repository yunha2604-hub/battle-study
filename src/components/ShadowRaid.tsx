"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Swords, ShieldAlert, CheckCircle, XCircle, Clock, Trophy, 
  Flame, Skull, Award, Play, RotateCcw, AlertTriangle,
  BookOpen, Sparkles, FileText, ChevronRight, Eye, Check, PenTool
} from "lucide-react";

export interface Quest {
  id: number;
  name: string;
  subject: "국어" | "영어" | "수학";
  concept: string;
  difficulty: "EASY" | "NORMAL" | "HARD";
  rewardLp: number;
  // Step 1: 원본 오답 문항 정보 & AI 심층 해설
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  aiTutorTrapAnalysis: string; // AI가 짚어주는 핵심 오답 함정
  recommendedNote: string;     // AI 추천 1줄 풀이노트
  // Step 2: 유사·변형 쌍둥이 문항
  twinTitle: string;
  twinQuestion: string;
  twinOptions: string[];
  twinAnswerIndex: number;
  twinExplanation: string;
  status: "ACTIVE" | "CLEARED";
}

const INITIAL_QUESTS: Quest[] = [
  {
    id: 1,
    name: "관계대명사의 악령 (Wraith of Pronouns)",
    subject: "영어",
    concept: "관계대명사 vs 관계부사 (Relative Clauses)",
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
    explanation: "'visited'는 타동사로서 목적어가 필요하므로, 선행사 'the middle school'을 수식하는 목적격 관계대명사 'which'가 와야 합니다.",
    aiTutorTrapAnalysis: "장소 선행사(the middle school)만 보고 반사적으로 'where'를 찍는 함정에 빠졌습니다! 뒷문장에 목적어가 비어있는 불완전한 절(we visited [?])이므로 목적격 관계대명사 'which'가 정답입니다.",
    recommendedNote: "★ 핵심 원칙: 선행사가 장소라도 뒷문장이 불완전(주어/목적어 누락)하면 관계부사 where가 아니라 관계대명사 which/that 필수!",
    twinTitle: "쌍둥이 변형 몬스터: 관계부사의 미궁",
    twinQuestion: "Q. [유사·변형] 다음 빈칸에 들어갈 가장 올바른 어휘를 고르시오:\n'I still vividly remember the cozy cafe (  ) we had our first dinner last year.'",
    twinOptions: [
      "where",
      "which",
      "whom",
      "what"
    ],
    twinAnswerIndex: 0,
    twinExplanation: "뒷문장 'we had our first dinner'는 주어, 동사, 목적어가 모두 갖추어진 '완전한 3형식 절'입니다. 따라서 이번에는 장소를 수식하는 관계부사 'where'가 올바른 정답입니다! (원본 오답 문제와 정반대 대조 학습)",
    status: "ACTIVE"
  },
  {
    id: 2,
    name: "삼각함수의 가고일 (Gargoyle of Trig)",
    subject: "수학",
    concept: "삼각비 길이 계산 (Trigonometry)",
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
    aiTutorTrapAnalysis: "대변(높이)과 밑변의 삼각비 공식을 혼동하여 cos 30°(밑변)를 곱하는 실수를 범했습니다. 대변은 반드시 sin, 밑변은 cos를 곱해야 합니다.",
    recommendedNote: "★ 대변(높이) = 빗변 × sin θ (sin 30°=1/2, sin 60°=√3/2) / 밑변 = 빗변 × cos θ",
    twinTitle: "쌍둥이 변형 몬스터: 60도 삼각비의 골렘",
    twinQuestion: "Q. [유사·변형] 직각삼각형에서 빗변의 길이가 12cm이고 한 예각이 60도일 때, 이 각의 대변(Opposite Side)의 길이는 얼마인가?",
    twinOptions: [
      "6√3 cm",
      "6cm",
      "12√3 cm",
      "4√3 cm"
    ],
    twinAnswerIndex: 0,
    twinExplanation: "대변의 길이 = 빗변 × sin 60° = 12 × (√3/2) = 6√3 cm 입니다! (특수각 삼각비 sin 60° 완벽 적용)",
    status: "ACTIVE"
  },
  {
    id: 3,
    name: "맞춤법의 구미호 (Gumiho of Spelling)",
    subject: "국어",
    concept: "맞춤법 종결 및 활용 표기 (되 vs 돼)",
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
    aiTutorTrapAnalysis: "'되'와 '돼'의 구분을 헷갈렸습니다. 자리에 '하'를 넣었을 때 말이 되면 '되', '해'를 넣었을 때 말이 되면 '돼'로 판별하는 마법의 검증법을 기억하세요!",
    recommendedNote: "★ '하/해' 판별 공식: '안 하(X)' vs '안 해(O)' → '해'가 자연스러우므로 무조건 '안 돼'가 맞음!",
    twinTitle: "쌍둥이 변형 몬스터: 과거시제 도깨비",
    twinQuestion: "Q. [유사·변형] 다음 빈칸에 들어갈 올바른 맞춤법 표기를 고르시오:\n'시간이 촉박해서 오늘 안에 과제를 다 끝내지 못하게 (   ) 큰일이다.'",
    twinOptions: [
      "됐다",
      "됬다",
      "돼었다",
      "되였다"
    ],
    twinAnswerIndex: 0,
    twinExplanation: "'되었다'의 올바른 축약형은 '됐다'입니다. '됬다'는 우리말 맞춤법에 존재하지 않는 표기이며, '하/해' 공식 적용 시 '했다'에 대응되므로 '됐다'가 맞습니다!",
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
  
  // 2-Step Raid Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStage, setModalStage] = useState<"STEP1_REVIEW" | "STEP2_BATTLE" | "VICTORY" | "DEFEAT">("STEP1_REVIEW");
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [modalShake, setModalShake] = useState(false);

  // <나의 풀이노트> 상태 (퀘스트별 학생 메모 저장)
  const [myNotes, setMyNotes] = useState<Record<number, string>>({});
  const [currentNote, setCurrentNote] = useState<string>("");
  const [showNotePeek, setShowNotePeek] = useState(false);

  const handleTimeout = () => {
    setIsLocked(true);
    setModalShake(true);
    setTimeout(() => {
      setModalShake(false);
      setModalStage("DEFEAT");
    }, 500);
  };

  const handleTimeoutRef = React.useRef(handleTimeout);
  useEffect(() => {
    handleTimeoutRef.current = handleTimeout;
  });

  // Timer loop: Only runs during STEP2_BATTLE!
  useEffect(() => {
    if (!isModalOpen || isLocked || modalStage !== "STEP2_BATTLE") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeoutRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isModalOpen, isLocked, modalStage]);

  // Step 1 진입: 오답 분석 및 풀이노트 작성
  const handleStartRevenge = (quest: Quest) => {
    setActiveQuest(quest);
    setModalStage("STEP1_REVIEW");
    setCurrentNote(myNotes[quest.id] || "");
    setShowNotePeek(false);
    setIsLocked(false);
    setIsModalOpen(true);
  };

  // Step 2 진입: 풀이노트 저장 후 유사·변형 문항 실전 배틀 시작
  const handleProceedToStep2 = () => {
    if (!activeQuest) return;
    setMyNotes(prev => ({
      ...prev,
      [activeQuest.id]: currentNote.trim() || activeQuest.recommendedNote
    }));
    setModalStage("STEP2_BATTLE");
    setTimeLeft(10);
    setSelectedOption(null);
    setIsLocked(false);
    setShowNotePeek(false);
  };

  // Step 2 변형 문제 정답 체크
  const handleOptionSelect = (index: number) => {
    if (isLocked || !activeQuest) return;
    setIsLocked(true);
    setSelectedOption(index);

    // Step 2는 쌍둥이 변형 문제(twinAnswerIndex)를 채점!
    const isCorrect = index === activeQuest.twinAnswerIndex;

    if (isCorrect) {
      // 번개 에너지 +1 충전 (최대 5)
      setEnergy((prev) => Math.min(5, prev + 1));

      setTimeout(() => {
        setModalStage("VICTORY");
        // 해당 퀘스트 클리어 처리
        setQuests((prev) =>
          prev.map((q) => (q.id === activeQuest.id ? { ...q, status: "CLEARED" } : q))
        );
      }, 500);
    } else {
      setModalShake(true);
      setTimeout(() => {
        setModalShake(false);
        setModalStage("DEFEAT");
      }, 500);
    }
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
            틀렸던 문제를 단순 복기하는 것을 넘어, <strong>[맞춤형 해설 ➔ 나의 풀이노트 ➔ 유사·변형 문제 2-Step 격파]</strong>로 완벽 복습합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-bold text-yellow-400">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>변형 보스 격파 시 +5 LP & 번개⚡ 즉시 회복</span>
        </div>
      </div>

      {/* RPG Quest Log Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {quests.map((quest) => {
          const isCleared = quest.status === "CLEARED";
          const savedNote = myNotes[quest.id];
          
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
                  오답 분석: [{quest.concept}] 오개념으로 인해 틀렸던 문항입니다.
                </p>

                {/* Saved Note Badge if exists */}
                {savedNote && (
                  <div className="mt-3 p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300 flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
                    <span className="truncate"><strong>내 풀이노트:</strong> {savedNote}</span>
                  </div>
                )}
              </div>

              {/* Reward & Action */}
              <div className="mt-6 border-t border-slate-850/80 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">2-STEP RAID</span>
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
                    변형 격파 완료
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartRevenge(quest)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 hover:scale-105 cursor-pointer transition-all"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>2단계 복수전</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 2-Step Revenge Match Modal */}
      <AnimatePresence>
        {isModalOpen && activeQuest && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={modalShake ? { x: [0, -10, 10, -10, 10, 0] } : { scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-slate-900 border border-red-500/40 rounded-3xl p-6 md:p-8 shadow-2xl relative text-left text-white my-8 space-y-6"
            >
              {/* Step Flow Stepper Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                    <Skull className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{activeQuest.name}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">{activeQuest.concept}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-black">
                  <span className={`px-2.5 py-1 rounded-lg border ${
                    modalStage === "STEP1_REVIEW"
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-slate-950 text-slate-500 border-slate-800"
                  }`}>
                    Step 1. 오답 분석 & 노트
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className={`px-2.5 py-1 rounded-lg border ${
                    modalStage === "STEP2_BATTLE"
                      ? "bg-red-600 text-white border-red-500 animate-pulse"
                      : "bg-slate-950 text-slate-500 border-slate-800"
                  }`}>
                    Step 2. 유사·변형 배틀
                  </span>
                </div>
              </div>

              {/* ======================================================== */}
              {/* 📖 STEP 1: 오답 원인 분석 & 맞춤형 AI 해설 & 나의 풀이노트 */}
              {/* ======================================================== */}
              {modalStage === "STEP1_REVIEW" && (
                <div className="space-y-5">
                  {/* Original Mistake Question Review */}
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-[10px] text-rose-400 font-black tracking-wider uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      내가 틀렸던 원본 문항
                    </span>
                    <h4 className="text-xs md:text-sm font-bold text-slate-100 leading-relaxed whitespace-pre-line">
                      {activeQuest.question}
                    </h4>
                    <div className="pt-1 text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>정답: {activeQuest.options[activeQuest.answerIndex]}</span>
                    </div>
                  </div>

                  {/* AI Tutor Trap Analysis */}
                  <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-red-400 text-xs font-black">
                      <Sparkles className="w-3.5 h-3.5 text-red-400" />
                      <span>AI 맞춤형 오개념 처방 해설 (함정 포인트)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeQuest.aiTutorTrapAnalysis}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-red-500/20">
                      {activeQuest.explanation}
                    </p>
                  </div>

                  {/* 📝 <나의 풀이노트> 칸 (요구사항 필수 반영) */}
                  <div className="p-4 bg-slate-950 border border-indigo-500/40 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-indigo-400" />
                        <span>&lt;나의 풀이노트&gt; (오답 극복 전략 메모)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setCurrentNote(activeQuest.recommendedNote)}
                        className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/20 px-2 py-1 rounded-lg border border-indigo-500/30 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI 추천 핵심 요약 붙여넣기</span>
                      </button>
                    </div>

                    <textarea
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      placeholder="이 문제를 다시는 틀리지 않기 위해 기억할 핵심 공식, 문법 규칙, 주의할 점을 나만의 언어로 적어보세요..."
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed font-sans shadow-inner"
                    />
                    <p className="text-[10px] text-slate-400">
                      💡 작성한 풀이노트는 Step 2 유사·변형 문제를 풀 때 상단에서 펼쳐볼 수 있습니다.
                    </p>
                  </div>

                  {/* Step 1 Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                    >
                      던전 나가기
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToStep2}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
                    >
                      <span>Step 2: 유사·변형 문항 격파하러 가기</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* ⚔️ STEP 2: 유사·변형 지문 실전 배틀 (Twin Monster Battle) */}
              {/* ======================================================== */}
              {modalStage === "STEP2_BATTLE" && (
                <div className="space-y-5">
                  {/* Step 2 Header with Timer & Note Peek Toggle */}
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-black text-red-400">
                        {activeQuest.twinTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Note Peek Toggle */}
                      <button
                        type="button"
                        onClick={() => setShowNotePeek(!showNotePeek)}
                        className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 rounded-lg text-[10px] font-black text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{showNotePeek ? "내 노트 닫기" : "내 풀이노트 열기"}</span>
                      </button>

                      {/* Timer */}
                      <div className="flex items-center gap-1 font-mono text-xs font-black text-red-400 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-500/30">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        <span>{timeLeft}초</span>
                      </div>
                    </div>
                  </div>

                  {/* Note Peek Accordion */}
                  <AnimatePresence>
                    {showNotePeek && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-indigo-950/60 border border-indigo-500/50 rounded-xl text-xs text-indigo-200 space-y-1 shadow-lg"
                      >
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                          내가 작성한 풀이노트 컨닝페이퍼:
                        </span>
                        <p className="font-medium text-white text-[11px] leading-relaxed">
                          {currentNote || activeQuest.recommendedNote}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Twin Variant Question Box */}
                  <div className="p-5 bg-slate-950 border border-red-500/30 rounded-2xl space-y-2 shadow-inner">
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                      실전 변형 문제 (개념 동일 · 지문 변형)
                    </span>
                    <h3 className="text-sm md:text-base font-extrabold text-white leading-relaxed whitespace-pre-line">
                      {activeQuest.twinQuestion}
                    </h3>
                  </div>

                  {/* Twin Options List */}
                  <div className="space-y-2.5">
                    {activeQuest.twinOptions.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === activeQuest.twinAnswerIndex;

                      let optClass = "bg-slate-950/80 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-200";
                      let icon = null;

                      if (isLocked) {
                        if (isSelected) {
                          if (isCorrect) {
                            optClass = "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold";
                            icon = <CheckCircle className="w-4.5 h-4.5 text-emerald-400 absolute right-4 top-1/2 -translate-y-1/2" />;
                          } else {
                            optClass = "bg-red-950/80 border-red-500 text-red-300 font-bold";
                            icon = <XCircle className="w-4.5 h-4.5 text-red-400 absolute right-4 top-1/2 -translate-y-1/2" />;
                          }
                        } else if (isCorrect) {
                          optClass = "bg-emerald-950/40 border-emerald-500/50 text-emerald-400";
                        } else {
                          optClass = "bg-slate-950/30 border-slate-900 text-slate-600 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isLocked}
                          onClick={() => handleOptionSelect(idx)}
                          className={`w-full relative border rounded-xl p-3.5 text-left font-semibold text-xs md:text-sm cursor-pointer transition-all flex items-center pr-12 ${optClass}`}
                        >
                          <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] mr-2.5 shrink-0 ${
                            isLocked && isSelected
                              ? isCorrect ? "bg-emerald-500 text-black" : "bg-red-500 text-white"
                              : "bg-slate-900 text-red-400 border border-red-500/20"
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

              {/* ======================================================== */}
              {/* 🏆 VICTORY: 최종 격파 성공 화면 */}
              {/* ======================================================== */}
              {modalStage === "VICTORY" && (
                <div className="text-center py-4 space-y-5">
                  <div className="inline-flex p-4 rounded-full bg-yellow-500/15 border border-yellow-500/30 animate-bounce">
                    <Trophy className="w-12 h-12 text-yellow-400 fill-yellow-400/10" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-black text-yellow-400 tracking-wider">
                      2-STEP RAID CLEARED!
                    </h2>
                    <p className="text-slate-300 text-xs font-bold mt-1.5">
                      오답 분석과 실전 변형 문제까지 완벽하게 정복하셨습니다.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl inline-flex items-center gap-6">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">획득 보상</span>
                      <span className="text-sm font-mono font-black text-yellow-400 flex items-center gap-1 mt-0.5">
                        <Trophy className="w-4 h-4" />
                        +5 LP 복구
                      </span>
                      <span className="text-[10px] font-black text-yellow-500 block mt-1">
                        ⚡ 번개 에너지 +1개 회복!
                      </span>
                    </div>
                    <div className="h-10 w-px bg-slate-800" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">퀘스트 상태</span>
                      <span className="text-xs font-black text-emerald-400 mt-1.5 block">CLEARED ✓</span>
                    </div>
                  </div>

                  {/* Review Note & Twin Explanation Box */}
                  <div className="text-left bg-slate-950/80 p-4 border border-slate-800 rounded-2xl text-xs space-y-2 max-w-lg mx-auto">
                    <div>
                      <strong className="text-cyan-400 block mb-0.5">변형 문항 완벽 해설:</strong>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {activeQuest.twinExplanation}
                      </p>
                    </div>
                    {currentNote && (
                      <div className="pt-2 border-t border-slate-800">
                        <strong className="text-indigo-400 block mb-0.5">내가 기록한 풀이노트:</strong>
                        <p className="text-slate-400 text-[11px] italic font-mono">
                          "{currentNote}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-3 bg-slate-100 hover:bg-white text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all"
                    >
                      던전 나가기
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* 💀 DEFEAT: 변형 문제 공략 실패 화면 */}
              {/* ======================================================== */}
              {modalStage === "DEFEAT" && (
                <div className="text-center py-4 space-y-5">
                  <div className="inline-flex p-4 rounded-full bg-red-500/15 border border-red-500/30 animate-pulse">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-black text-red-500 tracking-wider">
                      2-STEP RAID FAILED!
                    </h2>
                    <p className="text-slate-300 text-xs font-bold mt-1.5">
                      유사·변형 몬스터 공략에 실패했습니다. 풀이노트를 점검하고 다시 도전하세요!
                    </p>
                  </div>

                  <div className="text-left bg-slate-950/80 p-4 border border-slate-800 rounded-2xl text-xs space-y-1.5 max-w-lg mx-auto">
                    <strong className="text-red-400 block">공략 힌트:</strong>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {activeQuest.twinExplanation}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setModalStage("STEP1_REVIEW")}
                      className="px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Step 1 오답노트 다시 점검하기
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all"
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
