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

export interface AssessmentExamViewProps {
  questions?: GeneratedMathQuestion[];
  assessmentCode: string;
  onFinishExam: (
    answersLog: { qNum: number; question: GeneratedMathQuestion; studentAnswer: string; isCorrect: boolean; pointsEarned: number }[],
    totalScore: number
  ) => void;
  onExit: () => void;
  mode?: "TEACHER_TEST" | "STUDENT_EXAM";
}

export default function AssessmentExamView({
  questions = DEFAULT_MATH_QUESTIONS,
  assessmentCode,
  onFinishExam,
  onExit,
  mode = "TEACHER_TEST"
}: AssessmentExamViewProps) {
  const router = useRouter();
  const examQuestions = questions && questions.length > 0 ? questions : DEFAULT_MATH_QUESTIONS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showTeacherInspector, setShowTeacherInspector] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1500); // 25분 (1500초)
  const [showResultModal, setShowResultModal] = useState(false);
  const [examResultSummary, setExamResultSummary] = useState<{
    totalScore: number;
    correctCount: number;
    details: { qNum: number; question: GeneratedMathQuestion; studentAnswer: string; isCorrect: boolean; pointsEarned: number }[];
  } | null>(null);

  // Timer countdown
  useEffect(() => {
    if (showResultModal) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showResultModal]);

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
    examQuestions.forEach((q, idx) => {
      // 80% 정답 시뮬레이션
      if (idx === examQuestions.length - 1 && q.options && q.options.length > 1) {
        // 마지막 문항은 오답 선택
        const wrongOption = q.options.find(opt => opt !== q.correctAnswer) || q.options[0];
        autoFilled[q.id] = wrongOption;
      } else {
        autoFilled[q.id] = q.correctAnswer;
      }
    });
    setSelectedAnswers(autoFilled);
  };

  // Submit and run AI Auto-grading
  const handleSubmitExam = () => {
    let earnedScore = 0;
    const details = examQuestions.map((q, idx) => {
      const studentAns = selectedAnswers[q.id] || "미제출";
      const isCorrect = studentAns === q.correctAnswer;
      const points = isCorrect ? q.points : 0;
      earnedScore += points;
      return {
        qNum: idx + 1,
        question: q,
        studentAnswer: studentAns,
        isCorrect,
        pointsEarned: points
      };
    });

    const summary = {
      totalScore: earnedScore,
      correctCount: details.filter(d => d.isCorrect).length,
      details
    };

    setExamResultSummary(summary);
    setShowResultModal(true);

    if (onFinishExam) {
      onFinishExam(details, earnedScore);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === examQuestions.length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Examination Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: School and Exam Identity */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onExit}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="대시보드로 복귀"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-md">
                  수행평가 코드: {assessmentCode}
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

            {/* Final Submit Button */}
            <button
              type="button"
              onClick={handleSubmitExam}
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

            {/* Multiple Choice Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options && currentQ.options.map((option, optIdx) => {
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
                  onClick={handleSubmitExam}
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
                const isSelected = !!selectedAnswers[q.id];
                const isCurrent = currentIndex === idx;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 cursor-pointer ${
                      isCurrent
                        ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 ring-2 ring-indigo-200"
                        : isSelected
                        ? "border-slate-300 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-[10px] font-semibold opacity-75">Q{idx + 1}</span>
                    <span className="font-black text-xs">
                      {isSelected ? "마킹됨" : "미작성"}
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

      {/* AI Auto-grading Result Modal */}
      <AnimatePresence>
        {showResultModal && examResultSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="text-center pb-6 border-b border-slate-100">
                <div className="inline-flex p-3 bg-emerald-100 text-emerald-700 rounded-2xl mb-3 shadow-xs">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  수행평가 시험 응시 완료 & AI 1차 채점 리포트
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  제출된 답안을 바탕으로 AI 1차 자동 채점이 완료되었습니다.
                </p>
              </div>

              {/* Score Highlight */}
              <div className="py-6 grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-bold block">AI 1차 점수</span>
                  <span className="text-2xl md:text-3xl font-black text-emerald-600 mt-1 block">
                    {examResultSummary.totalScore}
                    <span className="text-xs text-slate-400 font-medium ml-1">/ 100점</span>
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-bold block">정답률</span>
                  <span className="text-2xl md:text-3xl font-black text-indigo-600 mt-1 block">
                    {Math.round((examResultSummary.correctCount / examQuestions.length) * 100)}%
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-bold block">평가 상태</span>
                  <span className="text-xs md:text-sm font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg mt-2 inline-block">
                    선생님 2차 확정 대기
                  </span>
                </div>
              </div>

              {/* Question By Question Summary */}
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1 mb-6">
                {examResultSummary.details.map((item) => (
                  <div 
                    key={item.qNum}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      item.isCorrect 
                        ? "bg-emerald-50/40 border-emerald-200 text-slate-800"
                        : "bg-red-50/40 border-red-200 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        item.isCorrect ? "bg-emerald-600 text-white" : "bg-red-500 text-white"
                      }`}>
                        {item.qNum}
                      </span>
                      <span className="font-bold">{item.question.standardCode}</span>
                      <span className="text-slate-500 truncate max-w-[200px]">
                        내 답안: {item.studentAnswer}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-medium text-slate-500">
                        정답: {item.question.correctAnswer}
                      </span>
                      <span className={`font-black ${item.isCorrect ? "text-emerald-700" : "text-red-600"}`}>
                        +{item.pointsEarned}점
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>시험지 다시 검토하기</span>
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>교사용 대시보드로 돌아가기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
