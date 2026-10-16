"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Swords, School, Search, Zap, User, Sparkles, Calculator, BookOpen, 
  ChevronRight, ChevronDown, ArrowLeft, LogIn, Building2,
  ShieldCheck, MapPin, Compass, AlertTriangle, Users, CheckCircle2, 
  Lock, Copy, Check, Radio, Clock, ShieldAlert, Sparkle, MessageSquare
} from "lucide-react";
import GlobalHeader from "./GlobalHeader";
import { ArenaLogo, EduLogo } from "./BrandLogo";
import SchoolVerificationModal from "./SchoolVerificationModal";

interface LandingPageProps {
  onJoin: (nickname: string, school: string, verified?: boolean) => void;
  onGoToTeacherDashboard?: () => void;
  onStudentDirectEntry?: (targetMenu: "LOBBY" | "BATTLE" | "SHADOW_RAID" | "ANALYTICS") => void;
  isSchoolVerified?: boolean;
  onVerifySchool?: () => void;
}

const MIDDLE_SCHOOLS = [
  "청계중학교",
  "대청중학교",
  "휘문중학교",
  "신반포중학교",
  "도곡중학교",
  "역삼중학교",
  "개원중학교",
  "잠실중학교",
  "서운중학교",
  "목동중학교",
  "양정중학교",
  "신목중학교",
  "압구정중학교",
  "신구중학교",
  "한국디지털미디어고등학교 (디미고)",
  "반송고등학교",
  "세마고등학교"
];

interface MockStudent {
  school: string;
  grade: number;
  classNum: number;
  studentNum: number;
  name: string;
}

const MOCK_EDU_STUDENTS: MockStudent[] = [
  { school: "청계중학교", grade: 3, classNum: 1, studentNum: 1, name: "강민재" },
  { school: "청계중학교", grade: 3, classNum: 1, studentNum: 2, name: "김도윤" },
  { school: "청계중학교", grade: 3, classNum: 1, studentNum: 5, name: "이서연" },
  { school: "청계중학교", grade: 3, classNum: 1, studentNum: 7, name: "박윤하" },
  { school: "청계중학교", grade: 3, classNum: 1, studentNum: 12, name: "정예은" },
  { school: "청계중학교", grade: 3, classNum: 2, studentNum: 1, name: "최서준" },
  { school: "청계중학교", grade: 3, classNum: 2, studentNum: 3, name: "조우진" },
  { school: "청계중학교", grade: 3, classNum: 2, studentNum: 4, name: "윤아인" },
  { school: "청계중학교", grade: 3, classNum: 3, studentNum: 1, name: "한수아" },
  { school: "청계중학교", grade: 3, classNum: 3, studentNum: 2, name: "배현우" },
  { school: "청계중학교", grade: 3, classNum: 3, studentNum: 3, name: "송지우" },
];

export default function LandingPage({ 
  onJoin, 
  onGoToTeacherDashboard, 
  onStudentDirectEntry,
  isSchoolVerified = false,
  onVerifySchool
}: LandingPageProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // 🏛️ 배틀스터디 에듀 (공교육 모드) 전용 모달 상태
  // ==========================================
  const [showEduModal, setShowEduModal] = useState(false);
  const [eduTab, setEduTab] = useState<"STUDENT" | "TEACHER">("STUDENT");
  
  // 학생 모드 입력 상태
  const [eduSchool, setEduSchool] = useState("청계중학교");
  const [eduGrade, setEduGrade] = useState("3");
  const [eduClass, setEduClass] = useState("1");
  const [eduStudentNum, setEduStudentNum] = useState("7");
  const [eduName, setEduName] = useState("박윤하");
  const [eduSchoolCode, setEduSchoolCode] = useState("CHK-2026");
  const [isAutoFilled, setIsAutoFilled] = useState(true);

  // 교사 모드 입력 상태
  const [teacherSchool, setTeacherSchool] = useState("청계중학교");
  const [teacherId, setTeacherId] = useState("teacher_math");
  const [teacherPw, setTeacherPw] = useState("123456");

  // 반/번호 변경 시 Mock DB 자동완성 핸들러
  const handleStudentClassNumChange = (newClass: string, newNum: string) => {
    setEduClass(newClass);
    setEduStudentNum(newNum);
    const matched = MOCK_EDU_STUDENTS.find(
      (s) => s.school === eduSchool && s.grade === Number(eduGrade) && s.classNum === Number(newClass) && s.studentNum === Number(newNum)
    );
    if (matched) {
      setEduName(matched.name);
      setIsAutoFilled(true);
    } else {
      setIsAutoFilled(false);
    }
  };

  // 🛡️ 학교 공식 인증 모달 (카카오 로그인 시 미인증자 대상 호출)
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // 카카오 로그인 핸들러: 인증 완료 여부에 따라 로비 직행 vs 인증 모달 분기
  const handleKakaoLogin = () => {
    if (isSchoolVerified) {
      router.push("/lobby");
    } else {
      setShowVerificationModal(true);
    }
  };

  // (시연용) 기인증 계정으로 로비 직행
  const handleKakaoDirectVerifiedLogin = () => {
    if (onVerifySchool) onVerifySchool();
    router.push("/lobby");
  };

  const filteredSchools = useMemo(() => {
    if (schoolInput.trim() === "") return [];
    return MIDDLE_SCHOOLS.filter((school) =>
      school.toLowerCase().includes(schoolInput.toLowerCase())
    );
  }, [schoolInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요!");
      return;
    }
    if (!schoolInput.trim()) {
      setError("학교를 선택해주세요!");
      return;
    }
    if (!MIDDLE_SCHOOLS.includes(schoolInput)) {
      setError("올바른 학교명을 리스트에서 선택해주세요!");
      return;
    }
    setError("");
    onJoin(nickname.trim(), schoolInput.trim());
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-slate-950 font-sans">
      
      {/* Global Header */}
      <GlobalHeader 
        activeTab="LOGIN" 
        onGoToTeacher={onGoToTeacherDashboard} 
        onOpenEduModal={() => setShowEduModal(true)} 
      />

      {/* Background Particles / Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      
      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />



      {/* Main Container: 배틀스터디 아레나 공식 학교 인증 & 진입 온보딩 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-xl px-6 py-8 mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl space-y-6"
        >
          {/* Logo / Header (배틀스터디 아레나 게임 전용) */}
          <div className="text-center pt-1 flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-3">
              <Swords className="w-3.5 h-3.5" />
              <span>실시간 1:1 퀴즈 배틀 아레나</span>
            </div>
            <ArenaLogo size="lg" showText={true} />
            <p className="text-slate-400 text-xs mt-3">
              학교의 명예를 걸고 맞붙는 1대1 실시간 퀴즈 대전
            </p>
          </div>

                    {/* 1초 무마찰 빠른 체험 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* 닉네임 입력 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                아레나에서 사용할 닉네임
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임 입력 (예: 대치동불주먹)"
                  maxLength={10}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* 소속 학교 검색 및 선택 */}
            <div className="space-y-1.5 relative">
              <label className="block text-xs font-bold text-slate-300">
                소속 중학교 선택
              </label>
              <div className="relative">
                <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={schoolInput}
                  onChange={(e) => {
                    setSchoolInput(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="학교 이름 검색 (예: 청계중학교)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* 학교 자동완성 드롭다운 */}
              {showDropdown && filteredSchools.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {filteredSchools.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSchoolInput(s);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>{s}</span>
                      {s === "청계중학교" && (
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                          기본 학교
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 빠른 학교 선택 칩 */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500 font-bold">인기 학교:</span>
              {["청계중학교", "휘문중학교", "대청중학교"].map((sch) => (
                <button
                  key={sch}
                  type="button"
                  onClick={() => {
                    setSchoolInput(sch);
                    setShowDropdown(false);
                  }}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                    schoolInput === sch
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {sch}
                </button>
              ))}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl py-2 px-3 text-center">
                {error}
              </p>
            )}

            {/* 1초 빠른 배틀 시작 메인 버튼 */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer group hover:scale-[1.01] active:scale-[0.99]"
            >
              <Swords className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
              <span>⚔️ 1초 만에 퀴즈 배틀 시작하기</span>
            </button>
          </form>

          {/* 구분선 */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider relative">
              또는
            </span>
          </div>

          {/* 카카오 계정 로그인 & 분기 영역 */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleKakaoLogin}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#191919] font-black text-sm rounded-2xl shadow-lg shadow-yellow-500/10 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageSquare className="w-4 h-4 fill-current shrink-0" />
              <span>카카오 계정으로 계속하기</span>
            </button>

            {/* 시연 편의 링크 */}
            <div className="flex items-center justify-center gap-3 pt-1 text-[11px]">
              <button
                type="button"
                onClick={handleKakaoDirectVerifiedLogin}
                className="text-slate-400 hover:text-cyan-400 font-bold transition-colors cursor-pointer flex items-center gap-1"
                title="인증 완료 상태로 로비로 바로 이동합니다"
              >
                <span>🛡️ (시연용) 기인증 계정으로 로비 직행</span>
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={() => onJoin("대치동불주먹", "청계중학교")}
                className="text-slate-500 hover:text-slate-300 font-bold transition-colors cursor-pointer"
              >
                ⏱️ 게스트 빠른 배틀
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 🏛️ 배틀스터디 에듀 (공교육 모드) 전용 로그인 모달 */}
      <AnimatePresence>
        {showEduModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative text-left space-y-5 text-white"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <EduLogo size="md" showText={true} />
                <button
                  type="button"
                  onClick={() => setShowEduModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Student vs Teacher Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEduTab("STUDENT")}
                  className={`py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    eduTab === "STUDENT"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>🎓 학생 모드 로그인</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEduTab("TEACHER")}
                  className={`py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    eduTab === "TEACHER"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>👩‍🏫 교사 모드 로그인</span>
                </button>
              </div>

              {/* TAB 1: 학생 모드 Form */}
              {eduTab === "STUDENT" && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">소속 학교</label>
                    <select
                      value={eduSchool}
                      onChange={(e) => setEduSchool(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
                    >
                      {MIDDLE_SCHOOLS.map((sch) => (
                        <option key={sch} value={sch} className="bg-slate-900 text-white">
                          {sch}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">학년</label>
                      <select
                        value={eduGrade}
                        onChange={(e) => setEduGrade(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
                      >
                        <option value="3">3학년</option>
                        <option value="2">2학년</option>
                        <option value="1">1학년</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">학급 (반)</label>
                      <select
                        value={eduClass}
                        onChange={(e) => handleStudentClassNumChange(e.target.value, eduStudentNum)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
                      >
                        <option value="1">1반</option>
                        <option value="2">2반</option>
                        <option value="3">3반</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">출석 번호</label>
                      <select
                        value={eduStudentNum}
                        onChange={(e) => handleStudentClassNumChange(eduClass, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium font-mono"
                      >
                        {[1, 2, 3, 4, 5, 7, 8, 12, 15, 20, 25, 30].map((num) => (
                          <option key={num} value={String(num)}>
                            {num}번
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-400 font-bold">학생 이름</label>
                      {isAutoFilled && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          ✨ 학적부 DB 자동 매칭 완료
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={eduName}
                      onChange={(e) => {
                        setEduName(e.target.value);
                        setIsAutoFilled(false);
                      }}
                      placeholder="예: 박윤하"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">학교 인증 코드</label>
                    <input
                      type="text"
                      value={eduSchoolCode}
                      onChange={(e) => setEduSchoolCode(e.target.value)}
                      placeholder="예: CHK-2026"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium font-mono uppercase"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEduModal(false)}
                      className="w-1/3 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEduModal(false);
                        router.push("/public-edu");
                      }}
                      className="w-2/3 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                    >
                      <span>배틀스터디 에듀 학생 포털 입장</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: 교사 모드 Form */}
              {eduTab === "TEACHER" && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">소속 학교</label>
                    <select
                      value={teacherSchool}
                      onChange={(e) => setTeacherSchool(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 font-medium cursor-pointer"
                    >
                      <option value="청계중학교">청계중학교 (수학과 전용)</option>
                      <option value="대청중학교">대청중학교</option>
                      <option value="휘문중학교">휘문중학교</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">교원 인증 ID</label>
                    <input
                      type="text"
                      value={teacherId}
                      onChange={(e) => setTeacherId(e.target.value)}
                      placeholder="교원 ID"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 font-medium font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">비밀번호</label>
                    <input
                      type="password"
                      value={teacherPw}
                      onChange={(e) => setTeacherPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 font-medium font-mono"
                    />
                  </div>

                  {/* Demo Information Notice */}
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-300 text-[11px] leading-relaxed">
                    💡 <strong>데모 시연 안내</strong>: 청계중학교 3학년 수학과 전용 교사용 계정으로 자동 세팅되어 있습니다. 바로 입장하시면 AI 수행평가 출제 및 2단계 채점 대시보드를 확인하실 수 있습니다.
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEduModal(false)}
                      className="w-1/3 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEduModal(false);
                        if (onGoToTeacherDashboard) {
                          onGoToTeacherDashboard();
                        } else {
                          router.push("/teacher");
                        }
                      }}
                      className="w-2/3 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5"
                    >
                      <span>배틀스터디 에듀 교사 대시보드 입장</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* 🛡️ 학교 공식 인증 모달 (카카오 로그인 시 미인증자 대상 호출) */}
      <SchoolVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        school={schoolInput || "청계중학교"}
        nickname={nickname || "대치동불주먹"}
        onVerified={() => {
          setShowVerificationModal(false);
          if (onVerifySchool) onVerifySchool();
          router.push("/lobby");
        }}
      />
    </div>
  );
}

