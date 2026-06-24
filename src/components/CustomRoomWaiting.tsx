"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, User, ShieldAlert, Award, Copy, CheckCircle, ArrowRight } from "lucide-react";

interface CustomRoomWaitingProps {
  roomPin: string;
  hostName: string;
  hostSchool: string;
  isTeamBattle?: boolean;
  onStartBattle: () => void;
  onBackToLobby: () => void;
}

interface PlayerSlot {
  name: string;
  school: string;
  tier: string;
  isReady: boolean;
  isHost: boolean;
}

const MOCK_PLAYERS: PlayerSlot[] = [
  { name: "대치동불주먹", school: "동탄고등학교", tier: "Silver [현지인]", isReady: true, isHost: true },
  { name: "목동수학귀신", school: "반송고등학교", tier: "Gold [1인분 장인]", isReady: true, isHost: false },
  { name: "청계중마스터", school: "동탄고등학교", tier: "Silver [현지인]", isReady: true, isHost: false },
  { name: "분당오답폭격기", school: "반송고등학교", tier: "Bronze [오답 자판기]", isReady: false, isHost: false },
  { name: "평촌공부귀신", school: "동탄고등학교", tier: "Gold [1인분 장인]", isReady: true, isHost: false }
];

export default function CustomRoomWaiting({ 
  roomPin, hostName, hostSchool, isTeamBattle = false, onStartBattle, onBackToLobby 
}: CustomRoomWaitingProps) {
  
  // Interactive team states for team battle mode
  const [teamA, setTeamA] = useState<string[]>(["대치동불주먹", "청계중마스터", "평촌공부귀신"]);
  const [teamB, setTeamB] = useState<string[]>(["목동수학귀신", "분당오답폭격기"]);
  const [userTeam, setUserTeam] = useState<"A" | "B">("A");

  const handleCopyPin = () => {
    navigator.clipboard.writeText(roomPin);
    alert(`방 코드(${roomPin})가 복사되었습니다! 친구들에게 공유하세요.`);
  };

  const handleJoinTeam = (team: "A" | "B") => {
    setUserTeam(team);
    if (team === "A") {
      setTeamA(prev => [...prev.filter(n => n !== "대치동불주먹"), "대치동불주먹"]);
      setTeamB(prev => prev.filter(n => n !== "대치동불주먹"));
    } else {
      setTeamB(prev => [...prev.filter(n => n !== "대치동불주먹"), "대치동불주먹"]);
      setTeamA(prev => prev.filter(n => n !== "대치동불주먹"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 relative overflow-x-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
      >
        {/* Waiting Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-850 pb-5">
          <div>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">
              {isTeamBattle ? "Class vs Class Event Mode" : "Multiplayer Matchmaking"}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white mt-0.5 flex items-center gap-2 justify-center md:justify-start">
              {isTeamBattle ? "⚔️ 학교대항전 반 단체전 대기실" : "⚔️ 다대다 커스텀 매칭 대기실"}
            </h2>
          </div>

          {/* Room PIN Container */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl">
            <span className="text-xs text-slate-500 font-bold font-sans">ROOM CODE:</span>
            <span className="font-mono text-base font-black text-cyan-400 tracking-wider">{roomPin}</span>
            <button 
              onClick={handleCopyPin}
              className="p-1 rounded bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Copy PIN"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic content rendering based on mode */}
        {isTeamBattle ? (
          // --- TEAM BATTLE ROOM LAYOUT ---
          <div className="space-y-6">
            <div className="text-center bg-purple-950/20 border border-purple-550/20 p-3 rounded-2xl">
              <p className="text-xs text-purple-300 font-extrabold">
                📢 각 팀의 멤버가 푸는 퀴즈 결과에 따라 소속 학교의 합산 체력(Shared HP)이 연동됩니다!
              </p>
            </div>

            {/* Split Screen Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* TEAM A COLUMN */}
              <div className={`p-5 rounded-2xl border transition-all ${
                userTeam === "A" 
                  ? "bg-slate-950/80 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.05)]" 
                  : "bg-slate-950/30 border-slate-850"
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-cyan-400">Team A (레드윙즈)</h3>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">동탄고등학교 1학년 3반</span>
                  </div>
                  {userTeam === "A" ? (
                    <span className="text-[9px] font-black bg-cyan-950 text-cyan-400 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                      내 팀
                    </span>
                  ) : (
                    <button
                      onClick={() => handleJoinTeam("A")}
                      className="text-[9px] font-black bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                    >
                      팀 참가
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {teamA.map((player) => {
                    const original = MOCK_PLAYERS.find(p => p.name === player) || MOCK_PLAYERS[0];
                    return (
                      <div key={player} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">🙋</span>
                          <span className="text-xs font-bold text-slate-200">{player}</span>
                        </div>
                        <span className="text-[9px] font-bold bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded border border-slate-850">
                          {original.tier.split(" ")[0]}
                        </span>
                      </div>
                    );
                  })}
                  {teamA.length === 0 && (
                    <p className="text-[11px] text-slate-650 text-center py-4 italic">선택된 멤버 없음</p>
                  )}
                </div>
              </div>

              {/* TEAM B COLUMN */}
              <div className={`p-5 rounded-2xl border transition-all ${
                userTeam === "B" 
                  ? "bg-slate-950/80 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.05)]" 
                  : "bg-slate-950/30 border-slate-850"
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-purple-400">Team B (블루이글스)</h3>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">반송고등학교 1학년 4반</span>
                  </div>
                  {userTeam === "B" ? (
                    <span className="text-[9px] font-black bg-purple-950 text-purple-400 px-2.5 py-1 rounded-lg border border-purple-500/20">
                      내 팀
                    </span>
                  ) : (
                    <button
                      onClick={() => handleJoinTeam("B")}
                      className="text-[9px] font-black bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                    >
                      팀 참가
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {teamB.map((player) => {
                    const original = MOCK_PLAYERS.find(p => p.name === player) || MOCK_PLAYERS[1];
                    return (
                      <div key={player} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">😈</span>
                          <span className="text-xs font-bold text-slate-200">{player}</span>
                        </div>
                        <span className="text-[9px] font-bold bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded border border-slate-850">
                          {original.tier.split(" ")[0]}
                        </span>
                      </div>
                    );
                  })}
                  {teamB.length === 0 && (
                    <p className="text-[11px] text-slate-650 text-center py-4 italic">선택된 멤버 없음</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : (
          // --- STANDARD WAITING LOBBY LAYOUT ---
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-3">
              <span>참여 플레이어 ({MOCK_PLAYERS.length} / 6)</span>
              <span>준비 상태</span>
            </div>

            <div className="space-y-2.5">
              {MOCK_PLAYERS.map((player) => (
                <div 
                  key={player.name}
                  className={`flex items-center justify-between p-4 border rounded-2xl transition-all ${
                    player.isHost 
                      ? "bg-slate-950/80 border-cyan-500/20" 
                      : "bg-slate-950/40 border-slate-850"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      player.isHost ? "bg-cyan-500/10 text-cyan-400" : "bg-slate-900 text-slate-500"
                    }`}>
                      {player.isHost ? "👑" : "🙋"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-200">{player.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-black/40 text-slate-400 rounded">
                          {player.school}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">{player.tier}</span>
                    </div>
                  </div>

                  {/* Ready Check */}
                  <div>
                    {player.isHost ? (
                      <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/20 border border-cyan-500/20 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                        방장 (Host)
                      </span>
                    ) : player.isReady ? (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 fill-emerald-500/10" />
                        준비 완료
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-slate-500 bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-xl flex items-center gap-1 animate-pulse">
                        대기 중...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 border-t border-slate-850/80">
          <button
            onClick={onBackToLobby}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            대기실 나가기
          </button>
          
          <button
            onClick={onStartBattle}
            className="w-full sm:flex-1 relative group overflow-hidden rounded-xl p-[1.5px] focus:outline-none cursor-pointer"
          >
            {/* Pulsing Outline */}
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 rounded-xl" />
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            
            {/* Inner button */}
            <div className="relative flex items-center justify-center gap-2 bg-slate-950 text-white font-black rounded-[10px] py-3 transition-colors group-hover:bg-slate-900">
              <Swords className="w-4.5 h-4.5 text-cyan-400 fill-cyan-400/10" />
              <span>
                {isTeamBattle ? "단체 대항전 배틀 시작 (Start Team Battle)" : "방장 전용 배틀 시작 (Start Game)"}
              </span>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
