"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Compass, CheckCircle2, AlertTriangle, ShieldAlert, 
  Copy, Check, ChevronRight, Lock, X, MapPin, Users, Sparkles
} from "lucide-react";

interface SchoolVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: string;
  nickname: string;
  onVerified: () => void;
}

export default function SchoolVerificationModal({
  isOpen,
  onClose,
  school,
  nickname,
  onVerified
}: SchoolVerificationModalProps) {
  const [verifyRoute, setVerifyRoute] = useState<"A" | "B">("A");
  const [gpsSimState, setGpsSimState] = useState<"IDLE" | "SCANNING" | "SUCCESS" | "MOCK_DETECTED" | "OUT_OF_RANGE">("IDLE");
  const [gpsDistance, setGpsDistance] = useState(35);
  const [friend1Accepted, setFriend1Accepted] = useState(false);
  const [friend2Accepted, setFriend2Accepted] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [step, setStep] = useState<"SELECT" | "LOCK_CONFIRM">("SELECT");

  if (!isOpen) return null;

  // GPS 스캔 시뮬레이션 핸들러
  const handleStartGpsScan = (scenario: "NORMAL" | "MOCK" | "OUT_OF_RANGE" = "NORMAL") => {
    setGpsSimState("SCANNING");
    setTimeout(() => {
      if (scenario === "MOCK") {
        setGpsSimState("MOCK_DETECTED");
      } else if (scenario === "OUT_OF_RANGE") {
        setGpsDistance(420);
        setGpsSimState("OUT_OF_RANGE");
      } else {
        setGpsDistance(35);
        setGpsSimState("SUCCESS");
      }
    }, 1000);
  };

  const isRouteReady = verifyRoute === "A" 
    ? gpsSimState === "SUCCESS"
    : (friend1Accepted && friend2Accepted);

  const handleComplete = () => {
    onVerified();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl space-y-6 my-8 text-left"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>공식 학교 소속 인증 시스템</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            [{school}] 소속 공식 인증
          </h3>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed break-keep">
            어뷰징 및 허위 학교 점수 조작을 방지하기 위해 현장 GPS 또는 재학생 상호 보증을 통해 본인 소속을 검증합니다.
          </p>
        </div>

        {step === "SELECT" && (
          <div className="space-y-4">
            {/* 인증 방식 분기 선택 탭 */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setVerifyRoute("A")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  verifyRoute === "A"
                    ? "bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-500/10 text-cyan-300"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                    Route A (권장)
                  </span>
                  <MapPin className="w-4 h-4" />
                </div>
                <p className="text-xs font-black text-white">GPS 현장 위치 인증</p>
                <p className="text-[10px] text-slate-400 mt-0.5">정문 150m 반경 · 즉시 완료</p>
              </button>

              <button
                type="button"
                onClick={() => setVerifyRoute("B")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  verifyRoute === "B"
                    ? "bg-purple-950/40 border-purple-500/80 shadow-md shadow-purple-500/10 text-purple-300"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                    Route B
                  </span>
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-xs font-black text-white">친구 2명 보증</p>
                <p className="text-[10px] text-slate-400 mt-0.5">재학생 상호 보증 링크</p>
              </button>
            </div>

            {/* ROUTE A: GPS 현장 인증 화면 */}
            {verifyRoute === "A" && (
              <div className="p-4 bg-slate-950/80 border border-cyan-500/20 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>[{school}] 정문 반경 150m 측정</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                    GPS Geofence
                  </span>
                </div>

                {/* 시연 인터랙션 버튼 세트 */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    🎮 심사용 GPS 시나리오 테스트:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartGpsScan("NORMAL")}
                      className="py-1.5 px-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 rounded-lg text-[10px] font-bold text-emerald-300 transition-colors cursor-pointer text-center"
                    >
                      1. 정상 통과 (35m)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartGpsScan("MOCK")}
                      className="py-1.5 px-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 rounded-lg text-[10px] font-bold text-rose-300 transition-colors cursor-pointer text-center"
                    >
                      2. Mock 감지
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartGpsScan("OUT_OF_RANGE")}
                      className="py-1.5 px-2 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 rounded-lg text-[10px] font-bold text-amber-300 transition-colors cursor-pointer text-center"
                    >
                      3. 반경 초과 (420m)
                    </button>
                  </div>
                </div>

                {/* GPS 상태 피드백 */}
                {gpsSimState === "SCANNING" && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-cyan-300 font-bold">위성 삼각측량 및 모의 위치(Mock) 무결성 검사 중...</p>
                  </div>
                )}

                {gpsSimState === "SUCCESS" && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl space-y-1"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>교내 위치 35m 이내 감지 (검증 완료)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      • Mock GPS 미감지 (정상 단말기 확인)<br />
                      • 승인 즉시 <strong>우리 학교 랭킹에 승점(+LP)이 공식 합산</strong>됩니다.
                    </p>
                  </motion.div>
                )}

                {gpsSimState === "MOCK_DETECTED" && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-rose-500/15 border border-rose-500/50 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-black">
                      <ShieldAlert className="w-4 h-4" />
                      <span>경고: Mock GPS(가짜 위치 앱) 감지됨</span>
                    </div>
                    <p className="text-[11px] text-rose-200 leading-relaxed">
                      비정상 위치 조작 앱이 감지되어 차단되었습니다. 허위 인증 시도는 영구 제재 대상입니다.
                    </p>
                  </motion.div>
                )}

                {gpsSimState === "OUT_OF_RANGE" && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-amber-500/15 border border-amber-500/50 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-black">
                      <AlertTriangle className="w-4 h-4" />
                      <span>인증 실패: 학교 반경 150m 외부 (현재 {gpsDistance}m)</span>
                    </div>
                    <p className="text-[11px] text-amber-200 leading-relaxed">
                      현재 학교 현장이 아닙니다. 원격 인증은 <strong>[Route B: 친구 2명 보증]</strong>을 이용하세요.
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* ROUTE B: 친구 2명 보증 화면 */}
            {verifyRoute === "B" && (
              <div className="p-4 bg-slate-950/80 border border-purple-500/20 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>재학생 2명 보증 네트워크</span>
                  </span>
                  <span className="text-[10px] text-purple-400 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                    2인 서명 필수
                  </span>
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-400 truncate">
                    https://battle.study/verify?ref=chk_7429
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCopiedLink(true);
                      setTimeout(() => setIsCopiedLink(false), 2000);
                    }}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    {isCopiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 text-white" />}
                    <span>{isCopiedLink ? "복사됨!" : "링크 복사"}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    friend1Accepted ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}>
                    <div className="text-xs font-bold">
                      <span>친구 1: 김민수 (청계중 3학년 기인증자)</span>
                    </div>
                    {friend1Accepted ? (
                      <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 수락 완료
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setFriend1Accepted(true)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black rounded-lg cursor-pointer transition-colors"
                      >
                        수락
                      </button>
                    )}
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    friend2Accepted ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}>
                    <div className="text-xs font-bold">
                      <span>친구 2: 이서연 (청계중 3학년 기인증자)</span>
                    </div>
                    {friend2Accepted ? (
                      <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 수락 완료
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setFriend2Accepted(true)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black rounded-lg cursor-pointer transition-colors"
                      >
                        수락
                      </button>
                    )}
                  </div>
                </div>

                {friend1Accepted && friend2Accepted && (
                  <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-[11px] text-purple-300">
                    ✨ <strong>재학생 2명 보증 완료</strong>: 소속 학교 인증 자격이 확인되었습니다.
                  </div>
                )}
              </div>
            )}

            {/* Next Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!isRouteReady}
                onClick={() => setStep("LOCK_CONFIRM")}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-black rounded-2xl text-sm md:text-base transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>검증 완료: 소속 학교 확정하기</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP: 소속 학교 Lock 안내 및 최종 확인 */}
        {step === "LOCK_CONFIRM" && (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-3xl text-center space-y-3.5 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/50 text-indigo-300 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
                  90일 소속 락(Lock) 체계
                </span>
                <h4 className="text-lg md:text-xl font-black text-white mt-2">
                  {school} 공식 대표 학생 확정
                </h4>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  닉네임: <strong className="text-cyan-400 font-bold">{nickname}</strong><br />
                  인증 완료 즉시 학교 랭킹에 개인 승점이 100% 반영됩니다.
                </p>
              </div>

              <div className="p-3.5 bg-black/40 rounded-2xl text-xs text-slate-400 border border-indigo-500/20 text-left space-y-1.5">
                <p className="text-indigo-300 font-bold">🛡️ 공정 리그 보안 서약:</p>
                <p>• 인증 완료 시 향후 90일간 타 학교로 소속 변경이 엄격히 차단됩니다.</p>
                <p>• 학교 간 점수 담합이나 허위 인증 시 모든 전적 및 랭킹이 몰수됩니다.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("SELECT")}
                className="w-1/3 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-sm transition-colors cursor-pointer text-center"
              >
                이전
              </button>
              <button
                type="button"
                onClick={handleComplete}
                className="w-2/3 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-2xl text-sm md:text-base shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 fill-current text-yellow-300" />
                <span>공식 인증 완료 & 점수 반영</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
