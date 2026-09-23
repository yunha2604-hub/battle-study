"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, School, Search, Zap, User, Sparkles, Calculator, BookOpen, ChevronRight, ChevronDown } from "lucide-react";

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
  "동탄고등학교",
  "반송고등학교",
  "세마고등학교"
];

export default function LandingPage({ onJoin, onGoToTeacherDashboard, onStudentDirectEntry }: LandingPageProps) {
  const [nickname, setNickname] = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [filteredSchools, setFilteredSchools] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showStudentMenu, setShowStudentMenu] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (schoolInput.trim() === "") {
      setFilteredSchools([]);
      return;
    }
    const filtered = MIDDLE_SCHOOLS.filter((school) =>
      school.toLowerCase().includes(schoolInput.toLowerCase())
    );
    setFilteredSchools(filtered);
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
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-slate-950 pt-16">
      
      {/* Top Global Navigation Bar (상단 메뉴 바) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between shadow-lg">
        {/* Left: Logo & Top-Left Student Mode Container with Sub-menus */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-wide">스쿨배틀</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  MVP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden lg:block">실시간 퀴즈 대전 & 수학 수행평가 관리</p>
            </div>
          </div>

          {/* Top Left: 학생 모드 칸 & 아래 서브 메뉴 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStudentMenu(!showStudentMenu)}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 hover:text-white shadow-lg shadow-cyan-950/50 flex items-center gap-2 cursor-pointer transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xs">
                🎒
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-extrabold text-white">학생 모드</span>
                  <span className="text-[10px] text-cyan-400 font-semibold">(슈크림먹은빵 · 청계중)</span>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform ${showStudentMenu ? "rotate-180" : ""}`} />
            </button>

            {/* Sub-menu Dropdown List (학생모드 아래 서브메뉴) */}
            <AnimatePresence>
              {showStudentMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-2xl border border-cyan-700/60 rounded-2xl shadow-2xl p-2 z-50 space-y-1.5"
                >
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-cyan-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> 클릭 시 해당 메뉴로 즉시 입장
                    </span>
                    <span className="text-slate-400 font-mono">청계중 슈크림먹은빵</span>
                  </div>

                  {/* Sub-menu 1: 메인 로비 (Lobby) */}
                  <button
                    type="button"
                    onClick={() => onStudentDirectEntry ? onStudentDirectEntry("LOBBY") : onJoin("슈크림먹은빵", "청계중학교")}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-cyan-500/30 transition-all flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shrink-0">
                      <School className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white group-hover:text-cyan-300">
                          🏛️ 메인 로비 (Lobby)
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        학교 랭킹, 개인 티어 진행도, 커스텀 룸
                      </p>
                    </div>
                  </button>

                  {/* Sub-menu 2: 1:1 실시간 퀴즈 배틀 (Battle Arena) */}
                  <button
                    type="button"
                    onClick={() => onStudentDirectEntry ? onStudentDirectEntry("BATTLE") : onJoin("슈크림먹은빵", "청계중학교")}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-red-500/30 transition-all flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform shrink-0">
                      <Swords className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white group-hover:text-red-300">
                          ⚔️ 1:1 실시간 퀴즈 배틀 (Battle Arena)
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        라이벌 대청중과 즉시 1:1 실시간 배틀 시작
                      </p>
                    </div>
                  </button>

                  {/* Sub-menu 3: 오답 던전 (Shadow Raid) */}
                  <button
                    type="button"
                    onClick={() => onStudentDirectEntry ? onStudentDirectEntry("SHADOW_RAID") : onJoin("슈크림먹은빵", "청계중학교")}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-emerald-500/30 transition-all flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
                      <Zap className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white group-hover:text-emerald-300">
                          👾 오답 던전 (Shadow Raid)
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        오답 몬스터 토벌 및 배틀 번개(+1 ⚡) 충전
                      </p>
                    </div>
                  </button>

                  {/* Sub-menu 4: 배틀 결과 & 분석 (Result & Analytics) */}
                  <button
                    type="button"
                    onClick={() => onStudentDirectEntry ? onStudentDirectEntry("ANALYTICS") : onJoin("슈크림먹은빵", "청계중학교")}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-purple-500/30 transition-all flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shrink-0">
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white group-hover:text-purple-300">
                          📊 배틀 결과 & 분석 (Result & Analytics)
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        내 전적 기록, 승률 60%, 5각 역량 분석표
                      </p>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center / Navigation Menu Items */}
        <nav className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>🎮 학생 아레나</span>
          </button>

          {onGoToTeacherDashboard && (
            <button
              type="button"
              onClick={onGoToTeacherDashboard}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-400" />
              <span>👩‍🏫 교사 대시보드</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            </button>
          )}
        </nav>

        {/* Right CTA */}
        {onGoToTeacherDashboard && (
          <button
            type="button"
            onClick={onGoToTeacherDashboard}
            className="hidden md:flex px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/25 transition-all cursor-pointer items-center gap-1.5 hover:scale-103"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>교사용 대시보드 열기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </header>

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

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-lg px-6 py-8 mx-auto bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl space-y-6"
        >
          {/* Mode Switcher Tabs inside the Card */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <button
              type="button"
              className="py-2.5 rounded-xl text-xs font-black bg-slate-800 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700/50"
            >
              <Swords className="w-3.5 h-3.5 text-cyan-400" />
              <span>🎮 학생 모드 로그인</span>
            </button>

            {onGoToTeacherDashboard && (
              <button
                type="button"
                onClick={onGoToTeacherDashboard}
                className="py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                <span>👩‍🏫 교사 모드 바로가기</span>
              </button>
            )}
          </div>

          {/* Logo / Header */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 drop-shadow-md font-sans">
              스쿨배틀
            </h1>
            <p className="text-xs font-semibold tracking-widest text-cyan-400 mt-1 uppercase">
              SchoolBattle Arena
            </p>
            <p className="text-slate-400 text-xs mt-2">
              학교의 명예를 걸고 맞붙는 1대1 실시간 퀴즈 대전
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
    </div>
    </div>
  );
}

