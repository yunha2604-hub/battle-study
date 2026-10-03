"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Zap, X, ShieldAlert, School, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";

interface BattleConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (subject: "국어" | "영어" | "수학") => void;
  nickname: string;
  school: string;
  tier: string;
  energy: number;
  initialSubject?: "국어" | "영어" | "수학";
}

export default function BattleConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  nickname,
  school,
  tier,
  energy,
  initialSubject = "수학"
}: BattleConfirmModalProps) {
  const [selectedSubject, setSelectedSubject] = useState<"국어" | "영어" | "수학">(initialSubject);

  if (!isOpen) return null;

  const rivalSchool = school === "청계중학교" ? "대청중학교" : "청계중학교";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-925 to-slate-950 border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] p-6 md:p-8 overflow-hidden z-10 font-sans"
        >
          {/* Top Decorative Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-gradient-to-b from-cyan-500/30 to-transparent blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 border border-cyan-300/40 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-3">
              <Swords className="w-7 h-7 text-white" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>실시간 1:1 라이벌 아레나</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              1:1 퀴즈 배틀에 참여하시겠습니까?
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm">
              실수로 버튼을 누르셨다면 [취소]를, 준비가 되셨다면 과목을 확인하고 [배틀 참여하기]를 눌러주세요.
            </p>
          </div>

          {/* Matchup Preview Box */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-5">
            <div className="grid grid-cols-5 items-center gap-2 text-center">
              
              {/* Player 1 (Me) */}
              <div className="col-span-2 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-sm font-black text-cyan-300 mb-1">
                  나
                </div>
                <span className="text-xs font-black text-slate-200 truncate w-full">
                  {nickname || "슈크림먹은빵"}
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold truncate w-full">
                  {school || "청계중학교"}
                </span>
              </div>

              {/* VS Icon */}
              <div className="col-span-1 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-red-400 font-mono tracking-wider">
                  VS
                </span>
              </div>

              {/* Player 2 (Opponent) */}
              <div className="col-span-2 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-sm font-black text-red-300 mb-1">
                  상대
                </div>
                <span className="text-xs font-black text-slate-200 truncate w-full">
                  목동수학귀신
                </span>
                <span className="text-[10px] text-red-400 font-semibold truncate w-full">
                  {rivalSchool}
                </span>
              </div>

            </div>
          </div>

          {/* Subject Selection */}
          <div className="mb-5">
            <label className="text-xs font-bold text-slate-400 block mb-2 flex items-center justify-between">
              <span>배틀 출제 과목 선택</span>
              <span className="text-[11px] text-cyan-400 font-semibold">선택한 과목으로 문제 출제</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["수학", "영어", "국어"] as const).map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setSelectedSubject(subj)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                    selectedSubject === subj
                      ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30 scale-[1.02]"
                      : "bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border-slate-800"
                  }`}
                >
                  <span>{subj === "수학" ? "📐" : subj === "영어" ? "🔤" : "📖"}</span>
                  <span>{subj}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notice & Energy Cost */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-between text-xs mb-6">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400/30 shrink-0" />
              <span className="text-yellow-200/90 font-medium">
                배틀 참가 시 번개 에너지 <strong className="font-bold text-yellow-400">1개</strong> 소모
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-yellow-400">
              (현재 잔여: {energy}개)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white font-bold text-xs md:text-sm transition-all cursor-pointer shadow-sm"
            >
              아니오 (취소하기)
            </button>

            {/* Confirm & Start Battle Button */}
            <button
              type="button"
              onClick={() => onConfirm(selectedSubject)}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>⚔️ 배틀 참여하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
