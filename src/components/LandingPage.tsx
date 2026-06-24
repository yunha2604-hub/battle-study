"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, School, Search, Zap, User, Sparkles } from "lucide-react";

interface LandingPageProps {
  onJoin: (nickname: string, school: string) => void;
  onGoToTeacherDashboard?: () => void;
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

export default function LandingPage({ onJoin, onGoToTeacherDashboard }: LandingPageProps) {
  const [nickname, setNickname] = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [filteredSchools, setFilteredSchools] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {onGoToTeacherDashboard && (
        <button
          type="button"
          onClick={onGoToTeacherDashboard}
          className="absolute top-6 right-6 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl transition-all cursor-pointer z-50 flex items-center gap-1.5"
        >
          <span>👩‍🏫 교사 대시보드 (Teacher Portal)</span>
        </button>
      )}
      {/* Background Particles / Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />
      
      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />

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
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-lg px-6 py-12 mx-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl"
      >
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.5, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-4"
          >
            <Swords className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 drop-shadow-md font-sans">
            스쿨배틀
          </h1>
          <p className="text-sm font-semibold tracking-widest text-cyan-400 mt-1 uppercase">
            SchoolBattle Arena
          </p>
          <p className="text-slate-400 text-sm mt-3">
            학교의 명예를 걸고 맞붙는 1대1 실시간 퀴즈 대전
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
  );
}
