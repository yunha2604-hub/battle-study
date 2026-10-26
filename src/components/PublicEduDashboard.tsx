"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, User, Award, Calendar, CheckCircle2, 
  FileText, ArrowRight, ShieldCheck, Clock, BookOpen, 
  ChevronRight, LogOut, Sparkles, AlertCircle, Home
} from "lucide-react";
import EduHeader from "./EduHeader";

export interface StudentProfileData {
  school: string;
  grade: number;
  classNum: number;
  studentNum: number;
  name: string;
  schoolCode: string;
}

interface PublicEduDashboardProps {
  initialProfile?: StudentProfileData;
  onGoToExam?: () => void;
  onExit?: () => void;
}

export default function PublicEduDashboard({
  initialProfile = {
    school: "청계중학교",
    grade: 3,
    classNum: 1,
    studentNum: 7,
    name: "박윤하",
    schoolCode: "CHK-2026"
  },
  onGoToExam,
  onExit
}: PublicEduDashboardProps) {
  const router = useRouter();
  const [profile] = useState<StudentProfileData>(initialProfile);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);

  const handleStartExam = () => {
    if (onGoToExam) {
      onGoToExam();
    } else {
      router.push("/assessment-test?from=public-edu");
    }
  };

  const handleReturnHome = () => {
    if (onExit) {
      onExit();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* 배틀스터디 에듀 전용 상단 헤더 (다이렉트 시연 내비게이션 포함) */}
      <EduHeader activeTab="STUDENT" schoolName={profile.school} />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* 1. Student Profile Banner */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-2xl shrink-0">
              <User className="w-8 h-8 text-slate-700" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  교육부 인증 학생 계정
                </span>
                <span className="text-xs text-slate-400 font-mono">인증코드: {profile.schoolCode}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                {profile.name} <span className="text-sm md:text-base font-normal text-slate-500 font-sans">학생</span>
              </h2>
              <p className="text-xs md:text-sm font-semibold text-slate-600">
                {profile.school} • {profile.grade}학년 {profile.classNum}반 {profile.studentNum}번 (학번: {profile.grade}0{profile.classNum}0{profile.studentNum})
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center min-w-[130px]">
              <span className="text-[11px] text-slate-500 font-semibold block">1학기 수학 성취도</span>
              <strong className="text-lg font-black text-blue-700 font-mono mt-0.5 block">A (우수)</strong>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center min-w-[130px]">
              <span className="text-[11px] text-slate-500 font-semibold block">수행평가 제출 상태</span>
              <strong className="text-sm font-bold text-slate-800 mt-1 block">1차 확정 / 2차 예정</strong>
            </div>
          </div>
        </section>

        {/* 2. Main Two Action Cards (수행평가 실시 모드 vs 수행평가 현황) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: 수행평가 실시 모드 */}
          <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-sm transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-700 text-white rounded-xl shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  실시간 시험장 입장
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  수행평가 실시 모드
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  선생님께서 교실에서 발급해주신 <strong>1회성 시험 PIN 코드</strong>를 입력하고 수학 수행평가 시험에 즉시 응시합니다.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-slate-600">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>공교육 부정행위 방지 시스템 가동</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  화면 이탈 감지, 흰색 시험지 테마, 객관식 및 서술형 단계별 풀이 작성 지원
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartExam}
              className="mt-6 w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>수행평가 시험 입장하기</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: 수행평가 현황 및 일정 확인 */}
          <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-sm transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-slate-800 text-white rounded-xl shadow-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  학사 기록 조회
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 transition-colors">
                  수행평가 현황 및 일정
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  2026학년도 수행평가 학사 일정과 기존에 응시했던 <strong>수행평가 채점 결과 및 선생님 피드백</strong>을 확인합니다.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-slate-600">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>1차 수행평가 채점 확정</span>
                  </div>
                  <strong className="text-blue-700 font-mono text-sm">95점 / 100점</strong>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  선생님 2차 확정 완료 • 교사 피드백 및 문항별 부분점수 확인 가능
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowStatusModal(true)}
              className="mt-6 w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>수행평가 현황 및 일정 확인</span>
            </button>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>공교육 평가 솔루션 • 배틀스터디 에듀</p>
      </footer>

      {/* 5, 6, 7, 8번 요구사항: 수행평가 현황 팝업 (모달) */}
      <AnimatePresence>
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative text-left space-y-6 max-h-[90vh] overflow-y-auto text-slate-800"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      청계중 3학년 수학과 수행평가 현황 및 일정
                    </h3>
                    <p className="text-xs text-slate-500">
                      {profile.grade}학년 {profile.classNum}반 {profile.studentNum}번 {profile.name} 학생 전용 학사 리포트
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Section 1: 2026학년도 수행평가 학사 일정 */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-700" />
                  <span>2026학년도 수학과 정기 수행평가 일정표</span>
                </h4>

                <div className="space-y-2.5">
                  {/* 1차 수행평가 */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          1차 완료
                        </span>
                        <strong className="text-sm font-bold text-slate-900">제곱근과 실수 (단원 평가)</strong>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        일시: 2026년 10월 15일 (목) 3교시 • 배점: 100점 만점
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold shrink-0">
                      채점 확정 (95점)
                    </span>
                  </div>

                  {/* 2차 수행평가 */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          2차 예정
                        </span>
                        <strong className="text-sm font-bold text-slate-900">이차방정식과 삼각비의 활용</strong>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        일시: 2026년 10월 28일 (수) 4교시 • 배점: 100점 만점
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold shrink-0">
                      응시 예정
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: 기존 응시 수행평가 점수 현황 및 교사 총평 */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-700" />
                  <span>1차 수행평가 확정 점수 및 교사 종합 평가</span>
                </h4>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold">2026학년도 1학기 1차 수학 수행평가</span>
                      <h5 className="text-base font-bold text-slate-900 mt-0.5">제곱근과 실수 연산 평가</h5>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 block">AI 1차 자동 채점</span>
                        <span className="text-xs font-bold text-slate-600">95점</span>
                      </div>
                      <div className="text-right pl-3 border-l border-slate-200">
                        <span className="text-[11px] text-blue-700 font-bold block">선생님 2차 최종 확정</span>
                        <strong className="text-xl font-black text-blue-700 font-mono">95점</strong>
                        <span className="text-[11px] text-slate-500"> / 100점</span>
                      </div>
                    </div>
                  </div>

                  {/* Question breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">1번 (객관식)</span>
                      <strong className="text-slate-900 font-bold">30 / 30점</strong>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">2번 (객관식)</span>
                      <strong className="text-slate-900 font-bold">35 / 35점</strong>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">3번 (서술형)</span>
                      <strong className="text-slate-900 font-bold">30 / 35점</strong>
                    </div>
                  </div>

                  {/* Teacher Feedback Box */}
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
                    <span className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      담당 수학 선생님 종합 평가 의견
                    </span>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      "풀이 단계별 수식 유도 과정이 논리적으로 매우 우수하며, 개념의 이해도가 높습니다. AI 1차 채점 결과를 그대로 최종 확정하였습니다."
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusModal(false);
                    handleStartExam();
                  }}
                  className="flex-1 py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>수행평가 시험 응시하러 가기</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
