"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, CheckCircle2, Clock, Eye, EyeOff, ShieldCheck, 
  ChevronLeft, ChevronRight, Send, AlertTriangle, ArrowLeft,
  Sparkles, Award, HelpCircle, Check, X, RotateCcw
} from "lucide-react";
import { GeneratedMathQuestion, StudentAssessmentRow, DEFAULT_MATH_QUESTIONS } from "./TeacherDashboard";
import EduHeader from "./EduHeader";

export interface AssessmentExamViewProps {
  questions?: GeneratedMathQuestion[];
  assessmentCode: string;
  onFinishExam: (
    answersLog: { qNum: number; question: GeneratedMathQuestion; studentAnswer: string; isCorrect: boolean; pointsEarned: number }[],
    totalScore: number
  ) => void;
  onExit: () => void;
  mode?: "TEACHER_TEST" | "STUDENT_EXAM";
  isFromPublicEdu?: boolean;
}

export default function AssessmentExamView({
  questions = DEFAULT_MATH_QUESTIONS,
  assessmentCode,
  onFinishExam,
  onExit,
  mode = "TEACHER_TEST",
  isFromPublicEdu = false
}: AssessmentExamViewProps) {
  const router = useRouter();
  const examQuestions = questions && questions.length > 0 ? questions : DEFAULT_MATH_QUESTIONS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [narrativeSolutions, setNarrativeSolutions] = useState<Record<number, string>>({});
  const isStudentMode = mode === "STUDENT_EXAM";
  const [enteredPin, setEnteredPin] = useState<string>(assessmentCode || "MTH-7429");
  const [isPinGatePassed, setIsPinGatePassed] = useState<boolean>(!isStudentMode);
  const [showTeacherInspector, setShowTeacherInspector] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1500); // 25분 (1500초)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isExamCompleted, setIsExamCompleted] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (isExamCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isExamCompleted]);

  const currentQ = examQuestions[currentIndex];
  const isTeacherMode = mode === "TEACHER_TEST";

  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Option selection
  const handleSelectOption = (option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: option
    }));
  };

  // Quick auto-fill for testing/simulation
  const handleAutoFillAnswers = () => {
    const autoFilled: Record<number, string> = {};
    const autoFilledNarrative: Record<number, string> = {};

    examQuestions.forEach((q, idx) => {
      if (q.type === "서술형 풀이" || !q.options || q.options.length === 0) {
        autoFilled[q.id] = q.correctAnswer;
        autoFilledNarrative[q.id] = q.solution || "주어진 식을 완전제곱식으로 전개하여 해를 유도함.";
      } else {
        // 80% 정답 시뮬레이션
        if (idx === examQuestions.length - 1 && q.options && q.options.length > 1) {
          const wrongOption = q.options.find(opt => opt !== q.correctAnswer) || q.options[0];
          autoFilled[q.id] = wrongOption;
        } else {
          autoFilled[q.id] = q.correctAnswer;
        }
      }
    });
    setSelectedAnswers(autoFilled);
    setNarrativeSolutions(autoFilledNarrative);
  };

  // Request Submit (Opens confirmation modal first with warning)
  const handleRequestSubmit = () => {
    setShowConfirmModal(true);
  };

  // Final Submit execution after confirmation
  const handleExecuteFinalSubmit = () => {
    setShowConfirmModal(false);

    let earnedScore = 0;
    const details = examQuestions.map((q, idx) => {
      const studentAns = selectedAnswers[q.id] || "";
      const studentSol = narrativeSolutions[q.id] || "";
      const isNarrative = q.type === "서술형 풀이" || !q.options || q.options.length === 0;

      let isCorrect = false;
      let points = 0;

      if (isNarrative) {
        const hasCorrect = studentAns.trim() === q.correctAnswer.trim();
        const hasWork = studentSol.trim().length > 5;
        if (hasCorrect && hasWork) {
          isCorrect = true;
          points = q.points;
        } else if (hasCorrect || hasWork) {
          isCorrect = true;
          points = Math.round(q.points * 0.85); // 부분점수
        } else {
          isCorrect = false;
          points = 0;
        }
      } else {
        isCorrect = studentAns === q.correctAnswer;
        points = isCorrect ? q.points : 0;
      }

      earnedScore += points;

      const formattedAnswer = isNarrative && studentSol
        ? `${studentSol} [답: ${studentAns || "작성 안 함"}]`
        : (studentAns || "미제출");

      return {
        qNum: idx + 1,
        question: q,
        studentAnswer: formattedAnswer,
        isCorrect,
        pointsEarned: points
      };
    });

    if (onFinishExam) {
      onFinishExam(details, earnedScore);
    }

    setIsExamCompleted(true);
  };

  // Answered Count calculation (Multiple choice or Narrative)
  const isQuestionAnswered = (q: GeneratedMathQuestion) => {
    if (q.type === "서술형 풀이" || !q.options || q.options.length === 0) {
      return !!selectedAnswers[q.id]?.trim() || !!narrativeSolutions[q.id]?.trim();
    }
    return !!selectedAnswers[q.id];
  };

  const answeredCount = examQuestions.filter(isQuestionAnswered).length;
  const isAllAnswered = answeredCount === examQuestions.length;

  // 1번 요구사항: 학생 화면에서 처음 들어갈 때 선생님이 주신 PIN 코드 입력창이 먼저 뜸 (MVP 모드)
  if (!isPinGatePassed) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans relative overflow-hidden">
        {/* 상단 배틀스터디 에듀 다이렉트 헤더 */}
        <EduHeader activeTab="EXAM" schoolName="청계중학교" />

        <div className="flex-1 flex items-center justify-center p-4 relative">
          {/* Background glow effects */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative z-10 space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
              <FileText className="w-7 h-7" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              2026학년도 정기 수학 수행평가
            </span>
            <h2 className="text-xl font-black text-slate-950">
              청계중 3학년 수행평가 입장
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              선생님께서 교실 프로젝터나 칠판에 안내해주신 <strong>1회성 시험 PIN 코드</strong>를 입력해주세요.
            </p>
          </div>

          {/* PIN Input Field */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 block text-center">
              수행평가 시험 PIN 코드
            </label>
            <input
              type="text"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder="예: MTH-7429"
              className="w-full text-center font-mono font-black text-2xl tracking-widest bg-slate-50 border-2 border-indigo-300 rounded-2xl py-3 text-indigo-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all uppercase placeholder:text-slate-300"
              autoFocus
            />
            {/* MVP Simulation Badge */}
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>MVP 데모 모드:</strong> 코드를 직접 쓰거나 아무 말이나 입력해도 즉시 시험에 응시할 수 있습니다.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => setIsPinGatePassed(true)}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>수행평가 시험 응시 시작하기</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onExit}
              className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {isFromPublicEdu ? "← 공교육 학생 대시보드로 돌아가기" : "← 로비로 돌아가기"}
            </button>
          </div>
        </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 배틀스터디 에듀 전용 상단 헤더 (다이렉트 시연 내비게이션) */}
      <EduHeader activeTab="EXAM" schoolName="청계중학교" />

      {/* Top Examination Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-14 z-40 px-4 md:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: School and Exam Identity */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onExit}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isFromPublicEdu ? "공교육 학생 대시보드로 복귀" : "대시보드로 복귀"}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-md">
                  수행평가 코드: {enteredPin || assessmentCode}
                </span>
                {isTeacherMode && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    교사용 모의 응시 & 검수 모드
                  </span>
                )}
              </div>
              <h1 className="text-sm md:text-base font-bold text-slate-900 mt-0.5">
                청계중학교 3학년 수학과 정기 수행평가 (1차)
              </h1>
            </div>
          </div>

          {/* Center: Live Timer */}
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-xl shadow-xs">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">남은 시험 시간:</span>
            <span className="font-mono text-sm font-black tracking-wider text-amber-300">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Right: Inspection Tools & Submission Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {isTeacherMode && (
              <>
                {/* Teacher Inspector Toggle */}
                <button
                  type="button"
                  onClick={() => setShowTeacherInspector(!showTeacherInspector)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    showTeacherInspector
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                  }`}
                  title="출제 정답 및 AI 채점 기준 실시간 표시"
                >
                  {showTeacherInspector ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>출제 정답 인스펙터 [ON]</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span>출제 정답 인스펙터 [OFF]</span>
                    </>
                  )}
                </button>

                {/* Simulation Quick Auto-Fill */}
                <button
                  type="button"
                  onClick={handleAutoFillAnswers}
                  className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  title="시뮬레이션용 모의 답안 자동 채우기"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">모의 답안 자동완성</span>
                </button>
              </>
            )}

            {/* Final Submit Button (Opens warning confirmation modal) */}
            <button
              type="button"
              onClick={handleRequestSubmit}
              className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>최종 답안 제출</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Paper Question View (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col relative min-h-[520px]">
            
            {/* Question Header Meta */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-900 text-white text-xs font-black rounded-lg">
                  문항 {currentIndex + 1}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  배점: {currentQ.points}점
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  난이도: {currentQ.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
                  {currentQ.standardCode}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-8">
              <p className="text-base md:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                {currentQ.question}
              </p>
            </div>

            {/* 2번 요구사항: 객관식 vs 서술형 풀이과정 & 답안 입력 구분 렌더링 */}
            {currentQ.type === "서술형 풀이" || !currentQ.options || currentQ.options.length === 0 ? (
              <div className="space-y-4 mb-6">
                {/* 1. 단계별 풀이과정 작성란 */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span>📐</span>
                      <span>서술형 단계별 풀이과정 작성</span>
                    </label>
                    <span className="text-[10px] text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded font-black">
                      부분배점 평가 영역
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    주어진 조건에 맞춘 식의 유도 및 전개 과정을 논리적으로 단계별로 서술하세요.
                  </p>
                  <textarea
                    rows={4}
                    value={narrativeSolutions[currentQ.id] || ""}
                    onChange={(e) => {
                      setNarrativeSolutions(prev => ({ ...prev, [currentQ.id]: e.target.value }));
                    }}
                    placeholder="예시: x² - 6x + 9 = (x - 3)² = 0 으로 완전제곱식으로 인수분해되므로..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs md:text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* 2. 최종 정답 작성란 */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span>🎯</span>
                      <span>최종 정답</span>
                    </label>
                    <span className="text-[10px] text-indigo-600 font-bold">결과값 명시</span>
                  </div>
                  <input
                    type="text"
                    value={selectedAnswers[currentQ.id] || ""}
                    onChange={(e) => {
                      setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }));
                    }}
                    placeholder="최종 도출한 정답을 입력하세요. (예: x = 3 (중근))"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs md:text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            ) : (
              /* Multiple Choice Options */
              <div className="space-y-3 mb-6">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === option;
                  const isCorrectOption = option === currentQ.correctAnswer;
                  const showInspectorHighlight = isTeacherMode && showTeacherInspector && isCorrectOption;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(option)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                        isSelected
                          ? "bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200 text-indigo-950 font-bold"
                          : showInspectorHighlight
                          ? "bg-emerald-50/60 border-emerald-400 text-slate-900 font-semibold"
                          : "bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : showInspectorHighlight
                            ? "bg-emerald-600 text-white"
                            : "bg-white border border-slate-300 text-slate-500 group-hover:border-slate-400"
                        }`}>
                          {optIdx + 1}
                        </span>
                        <span className="text-sm md:text-base font-medium">
                          {option}
                        </span>
                      </div>

                      {/* Teacher Inspector Correct Answer Badge */}
                      {showInspectorHighlight && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3 text-emerald-700" />
                          출제 정답
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Teacher Inspector Solution & Rubric Card */}
            {isTeacherMode && showTeacherInspector && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-auto p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1.5"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>[교사용 출제 검수 인스펙터] 정답 해설 및 AI 채점 기준표</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-normal">
                  <strong className="text-emerald-900">정답:</strong> {currentQ.correctAnswer}
                </p>
                <p className="text-slate-600 leading-relaxed font-normal">
                  <strong className="text-emerald-900">풀이 및 성취기준 평가 포인트:</strong> {currentQ.solution}
                </p>
              </motion.div>
            )}

            {/* Navigation Bottom Controls */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentIndex === 0
                    ? "opacity-30 cursor-not-allowed text-slate-400"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>이전 문항</span>
              </button>

              <div className="text-xs font-bold text-slate-400">
                {currentIndex + 1} / {examQuestions.length} 문항
              </div>

              {currentIndex < examQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>다음 문항</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestSubmit}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>시험 제출하기</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: OMR Sheet & Progress Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* OMR Marking Sheet Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                OMR 답안 마킹표
              </h3>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                {answeredCount} / {examQuestions.length} 완료
              </span>
            </div>

            {/* Grid of Question Numbers */}
            <div className="grid grid-cols-4 gap-2.5 mb-6">
              {examQuestions.map((q, idx) => {
                const isAnswered = isQuestionAnswered(q);
                const isCurrent = currentIndex === idx;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 cursor-pointer ${
                      isCurrent
                        ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 ring-2 ring-indigo-200"
                        : isAnswered
                        ? "border-slate-300 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-[10px] font-semibold opacity-75">Q{idx + 1}</span>
                    <span className="font-black text-xs">
                      {isAnswered ? "작성됨" : "미작성"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Answered Progress Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>답안 작성 진행률</span>
                <span className="text-indigo-600">
                  {Math.round((answeredCount / examQuestions.length) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / examQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Integrity Warning */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong>공교육 수행평가 신뢰도 보장:</strong> 답안 제출 시 AI 1차 자동 채점이 즉시 수행되며, 최종 점수는 담당 교사의 2차 검토 후 확정됩니다.
              </p>
            </div>
          </div>

          {/* Teacher Summary Information Card */}
          {isTeacherMode && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>선생님 안내 가이드</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                출제하신 수학 수행평가 문항의 <strong>지문, 선택지, 배점, 성취기준 연계</strong>를 실제 학생 시험 뷰에서 직접 체험하고 검증하는 공간입니다.
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>총 배점: 100점 만점</span>
                <span>문항 수: {examQuestions.length}문항</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 2. 최종 답안 제출 전 경고 컨펌 모달 (고쳐야할점2 - 2번) */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 md:p-8 shadow-2xl relative text-center space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <AlertTriangle className="w-7 h-7" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-lg md:text-xl font-black text-slate-900">
                  수행평가 최종 답안 제출
                </h3>
                <p className="text-xs md:text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 leading-relaxed">
                  ⚠️ 수행평가를 완료하면 수행평가 답안을 수정할 수 없습니다.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 font-medium text-left space-y-1">
                <div className="flex justify-between items-center">
                  <span>작성 완료 문항:</span>
                  <span className="font-bold">
                    <strong className="text-indigo-600">{answeredCount}</strong> / {examQuestions.length}문항
                  </span>
                </div>
                {answeredCount < examQuestions.length && (
                  <p className="text-[11px] text-red-600 font-bold pt-1 border-t border-slate-200">
                    * 아직 작성하지 않은 문항이 있습니다. 정말로 제출하시겠습니까?
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  계속 풀기 (취소)
                </button>
                <button
                  type="button"
                  onClick={handleExecuteFinalSubmit}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>최종 제출하기</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. 수행평가 완료 화면 (고쳐야할점2 - 1번: AI 1차 채점 리포트 삭제 & 3번: 응시 완료 문구 및 대시보드로 돌아가기 버튼) */}
      <AnimatePresence>
        {isExamCompleted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 md:p-8 shadow-2xl relative text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  답안 정상 접수 완료
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  수행평가 시험 응시 완료
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  수행평가 답안이 교사용 관리 시스템으로 안전하게 제출되었습니다.<br />
                  담당 선생님의 2차 채점 및 검토 후 최종 평가가 확정됩니다.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 text-slate-600 font-medium">
                <div className="flex justify-between items-center">
                  <span>수행평가 시험 코드:</span>
                  <strong className="font-mono text-indigo-600">{enteredPin || assessmentCode}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>제출 문항 수:</span>
                  <strong className="text-slate-900">{examQuestions.length}문항 전체 제출</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>채점 상태:</span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    선생님 2차 채점 대기 중
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onExit}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs md:text-sm transition-all cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <span>{isFromPublicEdu ? "공교육 학생 대시보드로 돌아가기" : "학생용 대시보드로 돌아가기"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
