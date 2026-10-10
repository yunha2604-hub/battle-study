"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, School, Search, Zap, User, Sparkles, Calculator, BookOpen, ChevronRight, ChevronDown, ArrowLeft, LogIn, Building2 } from "lucide-react";
import GlobalHeader from "./GlobalHeader";

interface LandingPageProps {
  onJoin: (nickname: string, school: string) => void;
  onGoToTeacherDashboard?: () => void;
  onStudentDirectEntry?: (targetMenu: "LOBBY" | "BATTLE" | "SHADOW_RAID" | "ANALYTICS") => void;
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

export default function LandingPage({ onJoin, onGoToTeacherDashboard, onStudentDirectEntry }: LandingPageProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");

  // 배틀스터디 에듀 (공교육 모드) 전용 로그인 모달 상태
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
      <GlobalHeader activeTab="LOGIN" onGoToTeacher={onGoToTeacherDashboard} />

      {/* Background Particles / Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      
      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 text-cyan-400"
        >
          <Sparkles className="w-5 h-5" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 right-1/4 text-purple-400"
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
      </div>

      {/* 🏛️ 좌측 상단: 배틀스터디 에듀 (공교육 모드) 독립 진입 버튼 */}
      <div className="absolute top-20 left-4 md:left-8 z-30">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => setShowEduModal(true)}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:text-white text-xs font-black shadow-xl shadow-indigo-950/40 backdrop-blur-md cursor-pointer transition-all group"
        >
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] text-indigo-400 font-bold tracking-wider uppercase">학교 학사 / 수행평가</span>
            <span className="block text-sm font-black text-white">🏛️ 배틀스터디 에듀</span>
          </div>
          <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform ml-1" />
        </motion.button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-lg px-6 py-8 mx-auto bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl space-y-6"
        >
          {/* Logo / Header (배틀스터디 아레나 게임 전용) */}
          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-3">
              <Swords className="w-3.5 h-3.5" />
              <span>실시간 1:1 퀴즈 배틀 게이미피케이션</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 drop-shadow-md font-sans">
              배틀스터디 아레나
            </h1>
            <p className="text-xs font-semibold tracking-widest text-cyan-400 mt-1 uppercase">
              Battle Study Arena
            </p>
            <p className="text-slate-400 text-xs mt-2">
              학교의 명예를 걸고 맞붙는 1대1 실시간 퀴즈 대전
            </p>
          </div>

          {/* Existing User Login */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => alert("현재 MVP 시연 버전입니다. 정식 서비스에서는 카카오 계정 연동을 통해 기존 전적 데이터를 불러옵니다.")}
              className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#FDD800] text-black font-bold rounded-xl py-3.5 transition-colors cursor-pointer shadow-md"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.2 4.4 6.5l-1.1 4c-.1.3.2.6.5.4l4.8-3.2c.4.1.9.1 1.4.1 5.5 0 10-3.5 10-7.8S17.5 3 12 3z"/></svg>
              <span>카카오 계정으로 로그인</span>
            </button>
            <button
              type="button"
              onClick={() => alert("현재 MVP 시연 버전입니다. 정식 서비스에서는 구글 계정 연동을 통해 기존 전적 데이터를 불러옵니다.")}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold rounded-xl py-3.5 transition-colors cursor-pointer shadow-md border border-gray-200"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span>구글 계정으로 로그인</span>
            </button>
          </div>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-700/50"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-500 uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-slate-700/50"></div>
          </div>

          {/* Form for Guest */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-1">
              <span className="inline-block px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-full text-[11px] font-bold text-slate-300">
                🚀 비회원 1초 체험하기 (가입 없이 바로 시작)
              </span>
            </div>
            
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Nickname Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              사용할 닉네임
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="예: 대치동불주먹"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={12}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium text-sm"
              />
            </div>
          </div>

          {/* School Input */}
          <div className="space-y-2 relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              중학교 검색
            </label>
            <div className="relative">
              <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="예: 청계중학교"
                value={schoolInput}
                onChange={(e) => {
                  setSchoolInput(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium text-sm"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            </div>

            {/* Dropdown Suggestions */}
            <AnimatePresence>
              {showDropdown && filteredSchools.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 w-full left-0 mt-1 max-h-48 overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl shadow-2xl divide-y divide-slate-800/50 scrollbar-thin scrollbar-thumb-slate-800"
                >
                  {filteredSchools.map((school) => (
                    <button
                      key={school}
                      type="button"
                      onClick={() => {
                        setSchoolInput(school);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/80 text-sm font-medium transition-colors"
                    >
                      {school}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full group overflow-hidden rounded-xl p-[1.5px] focus:outline-none"
            >
              {/* Glowing Outline */}
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 rounded-xl animate-[pulse_2s_infinite]" />
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
              
              {/* Inner Button Content */}
              <div className="relative flex items-center justify-center gap-2 bg-slate-950 text-white font-bold rounded-[10px] py-3.5 transition-colors group-hover:bg-slate-900 cursor-pointer">
                <span>아레나 입장하기</span>
                <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400 group-hover:animate-bounce" />
              </div>
            </motion.button>
          </div>
        </form>
      </motion.div>

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
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        공교육 전용
                      </span>
                      <h3 className="text-lg font-black text-white">
                        배틀스터디 에듀
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      학교 학사 연계 및 수학 수행평가 관리 시스템
                    </p>
                  </div>
                </div>
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
    </div>
    </div>
  );
}

