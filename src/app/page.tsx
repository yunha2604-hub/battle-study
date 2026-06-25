"use client";

import React, { useState } from "react";
import LandingPage from "@/components/LandingPage";
import Lobby, { OpponentData } from "@/components/Lobby";
import BattleArena from "@/components/BattleArena";
import ResultPage from "@/components/ResultPage";
import CustomRoomWaiting from "@/components/CustomRoomWaiting";
import TeacherDashboard from "@/components/TeacherDashboard";

export default function Home() {
  const [view, setView] = useState<"LOGIN" | "LOBBY" | "BATTLE" | "RESULT" | "CUSTOM_ROOM_WAITING" | "TEACHER_DASHBOARD">("LOGIN");

  // User profile
  const [nickname, setNickname] = useState("");
  const [school, setSchool] = useState("");
  const [tier, setTier] = useState("Silver");
  const [lp, setLp] = useState(85);
  const [energy, setEnergy] = useState(3); // Default energy: 3, Max: 5

  // Match data
  const [opponent, setOpponent] = useState<OpponentData | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<"국어" | "영어" | "수학" | null>(null);
  const [userFinalHp, setUserFinalHp] = useState(100);
  const [opponentFinalHp, setOpponentFinalHp] = useState(100);
  const [answersLog, setAnswersLog] = useState<any[]>([]);
  const [isFirstMatch, setIsFirstMatch] = useState(false);

  // Custom Room & Assessment mode states
  const [roomPin, setRoomPin] = useState("1A2B3C");
  const [isStrictAssessment, setIsStrictAssessment] = useState(false);
  const [isTeamBattle, setIsTeamBattle] = useState(false);

  const handleJoin = (nick: string, sch: string) => {
    setNickname(nick);
    setSchool(sch);
    setIsFirstMatch(true); // Trigger frictionless first match
    
    // Generate immediate rival opponent details
    const rivalSchool = sch === "청계중학교" ? "대청중학교" : "청계중학교";
    const firstOpponent: OpponentData = {
      nickname: "목동수학귀신",
      school: rivalSchool,
      tier: "Gold",
      lp: 45
    };
    
    setOpponent(firstOpponent);
    setSelectedSubject("영어"); // First onboarding match is in English
    setIsStrictAssessment(false);
    setIsTeamBattle(false);
    setView("BATTLE");
  };

  const handleStartMatch = (opponentData: OpponentData, subject: "국어" | "영어" | "수학") => {
    setOpponent(opponentData);
    setSelectedSubject(subject);
    setEnergy((prev) => Math.max(0, prev - 1)); // Deduct 1 energy
    setIsStrictAssessment(false);
    setIsTeamBattle(false);
    setView("BATTLE");
  };

  const handleCreateRoom = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let pin = "";
    for (let i = 0; i < 6; i++) {
      pin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomPin(pin);
    setIsTeamBattle(false);
    setView("CUSTOM_ROOM_WAITING");
  };

  const handleEnterPin = (pin: string) => {
    setRoomPin(pin);
    setIsTeamBattle(false);
    setView("CUSTOM_ROOM_WAITING");
  };

  const handleStartCustomBattle = () => {
    const rivalSchool = school === "동탄고등학교" ? "반송고등학교" : "동탄고등학교";
    const customOpponent: OpponentData = {
      nickname: "목동수학귀신",
      school: rivalSchool,
      tier: "Gold",
      lp: 45
    };
    setOpponent(customOpponent);
    setSelectedSubject(isTeamBattle ? "수학" : "영어"); // Event team battle matches run in Math!
    setIsStrictAssessment(false);
    setView("BATTLE");
  };

  const handleJoinEventRoom = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let pin = "";
    for (let i = 0; i < 6; i++) {
      pin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomPin(pin);
    setIsTeamBattle(true);
    setView("CUSTOM_ROOM_WAITING");
  };

  const handleStartAssessmentMatch = (isStrict: boolean) => {
    const rivalSchool = school === "청계중학교" ? "대청중학교" : "청계중학교";
    const testOpponent: OpponentData = {
      nickname: "목동수학귀신",
      school: rivalSchool,
      tier: "Gold",
      lp: 45
    };
    setOpponent(testOpponent);
    setSelectedSubject("영어"); // Assessment runs English test by default
    setIsStrictAssessment(isStrict);
    setIsTeamBattle(false);
    setView("BATTLE");
  };

  const handleFinishMatch = (userHp: number, oppHp: number, log: any[]) => {
    setUserFinalHp(userHp);
    setOpponentFinalHp(oppHp);
    setAnswersLog(log);
    setView("RESULT");
  };

  const handleReturnToLobby = (newTier: string, newLp: number) => {
    setTier(newTier);
    setLp(newLp);
    setSelectedSubject(null);
    setIsFirstMatch(false); // Reset first match flag once they return to lobby
    setView("LOBBY");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      {view === "LOGIN" && (
        <LandingPage 
          onJoin={handleJoin} 
          onGoToTeacherDashboard={() => setView("TEACHER_DASHBOARD")}
        />
      )}
      {view === "LOBBY" && (
        <Lobby
          nickname={nickname}
          school={school}
          tier={tier}
          lp={lp}
          energy={energy}
          setTier={setTier}
          setLp={setLp}
          setEnergy={setEnergy}
          onStartMatch={handleStartMatch}
          onCreateRoom={handleCreateRoom}
          onEnterPin={handleEnterPin}
          onGoToTeacherDashboard={() => setView("TEACHER_DASHBOARD")}
          onJoinEventRoom={handleJoinEventRoom}
        />
      )}
      {view === "CUSTOM_ROOM_WAITING" && (
        <CustomRoomWaiting
          roomPin={roomPin}
          hostName={nickname || "대치동불주먹"}
          hostSchool={school || "청계중학교"}
          isTeamBattle={isTeamBattle}
          onStartBattle={handleStartCustomBattle}
          onBackToLobby={() => setView("LOBBY")}
        />
      )}
      {view === "TEACHER_DASHBOARD" && (
        <TeacherDashboard
          onStartAssessmentMatch={handleStartAssessmentMatch}
          onExit={() => setView(nickname ? "LOBBY" : "LOGIN")}
        />
      )}
      {view === "BATTLE" && opponent && selectedSubject && (
        <BattleArena
          userProfile={{ nickname, school, tier, lp }}
          opponent={opponent}
          subject={selectedSubject}
          onFinishMatch={handleFinishMatch}
          isStrictAssessment={isStrictAssessment}
          isTeamBattle={isTeamBattle}
        />
      )}
      {view === "RESULT" && opponent && (
        <ResultPage
          userProfile={{ nickname, school, tier, lp }}
          opponent={opponent}
          userFinalHp={userFinalHp}
          opponentFinalHp={opponentFinalHp}
          answersLog={answersLog}
          isFirstMatch={isFirstMatch}
          onReturnToLobby={handleReturnToLobby}
        />
      )}
    </div>
  );
}
